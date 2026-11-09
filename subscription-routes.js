const crypto = require('crypto');
const { Environment, SignedDataVerifier } = require('@apple/app-store-server-library');

const DEFAULT_PRODUCTS = [
  'com.sisuapp.app.subscription.monthly',
  'com.appsisu.sisupro.monthly',
];
const DATE_FIELDS = ['expiresDate', 'purchaseDate', 'originalPurchaseDate', 'revocationDate'];

module.exports = function registerSubscriptionRoutes(app, deps) {
  const { pool, requireAuth, requireVerified, limiter } = deps;
  const verified = [requireAuth, requireVerified];

  const wrap = (fn) => async (req, res, next) => {
    try {
      await fn(req, res);
    } catch (error) {
      next(error);
    }
  };

  function getVerifiers() {
    const roots = String(process.env.APPLE_ROOT_CERTS_BASE64 || '')
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)
      .map((value) => Buffer.from(value, 'base64'));
    if (!roots.length || roots.some((root) => !root.length)) {
      const error = new Error('APPLE_ROOT_CERTS_BASE64 is not configured');
      error.status = 503;
      throw error;
    }
    const bundleId = process.env.APPLE_BUNDLE_ID || 'com.sisuapp.app';
    const verifiers = [
      { environment: Environment.SANDBOX, verifier: new SignedDataVerifier(roots, true, Environment.SANDBOX, bundleId) },
    ];
    const appAppleId = Number(process.env.APPLE_APP_ID);
    if (Number.isInteger(appAppleId) && appAppleId > 0) {
      verifiers.push({
        environment: Environment.PRODUCTION,
        verifier: new SignedDataVerifier(roots, true, Environment.PRODUCTION, bundleId, appAppleId),
      });
    }
    return verifiers;
  }

  async function verifySignedData(signed, method) {
    if (typeof signed !== 'string' || signed.length < 20 || signed.length > 50000) {
      const error = new Error('Signed Apple data is missing or too large');
      error.status = 400;
      throw error;
    }
    const verifiers = getVerifiers();
    for (const item of verifiers) {
      try {
        return { value: await item.verifier[method](signed), ...item };
      } catch (_) {
        // Apple signatures contain their environment; retry with the other configured verifier.
      }
    }
    const error = new Error('Apple signature verification failed');
    error.status = 400;
    throw error;
  }

  function parseAppleDate(value) {
    if (value === undefined || value === null) return null;
    const timestamp = Number(value);
    if (!Number.isFinite(timestamp) || timestamp <= 0) return null;
    return new Date(timestamp).toISOString().slice(0, 19).replace('T', ' ');
  }

  function subscriptionStatus(transaction) {
    if (transaction.revocationDate) return 'revoked';
    const expires = Number(transaction.expiresDate || 0);
    return expires > Date.now() ? 'active' : 'expired';
  }

  function isAutoRenewable(transaction) {
    return transaction.type === 'Auto-Renewable Subscription' ||
      transaction.productType === 'AUTO_RENEWABLE';
  }

  function allowedProducts() {
    const configured = String(process.env.APPLE_SUBSCRIPTION_PRODUCT_IDS || '').split(',').map((id) => id.trim()).filter(Boolean);
    return new Set(configured.length ? configured : DEFAULT_PRODUCTS);
  }

  async function refreshRole(userId) {
    await pool.execute(
      `UPDATE users SET role = CASE
         WHEN role = 'admin' THEN 'admin'
         WHEN EXISTS (
           SELECT 1 FROM subscriptions s
           WHERE s.user_id = users.id AND s.platform = 'apple'
             AND s.status IN ('active','grace_period','billing_retry')
             AND (s.expires_at IS NULL OR s.expires_at > NOW())
         ) THEN 'subscriber'
         ELSE 'free'
       END WHERE id = ?`,
      [userId]
    );
    const [rows] = await pool.execute('SELECT role FROM users WHERE id = ?', [userId]);
    return rows[0]?.role || 'free';
  }

  async function findSubscription(userId) {
    const [rows] = await pool.execute(
      `SELECT product_id, status, auto_renew, period_start, expires_at, offer_code
       FROM subscriptions WHERE user_id = ? AND platform = 'apple'
       ORDER BY COALESCE(expires_at, updated_at) DESC LIMIT 1`,
      [userId]
    );
    const row = rows[0];
    if (!row) return null;
    const expiresAt = row.expires_at ? new Date(row.expires_at).toISOString() : undefined;
    const effectiveStatus = row.status === 'active' && row.expires_at && new Date(row.expires_at).getTime() <= Date.now()
      ? 'expired'
      : row.status;
    return {
      status: effectiveStatus,
      productId: row.product_id,
      expiresAt,
      autoRenew: !!row.auto_renew,
      offerCode: row.offer_code || null,
    };
  }

  async function storeTransaction(userId, transaction, environment, renewalInfo) {
    if (transaction.bundleId !== (process.env.APPLE_BUNDLE_ID || 'com.sisuapp.app')) {
      const error = new Error('Transaction belongs to another app');
      error.status = 400;
      throw error;
    }
    if (!allowedProducts().has(transaction.productId) || !isAutoRenewable(transaction)) {
      const error = new Error('Unrecognized subscription product');
      error.status = 400;
      throw error;
    }
    const originalId = String(transaction.originalTransactionId || '');
    if (!originalId || originalId.length > 100) {
      const error = new Error('Invalid original transaction id');
      error.status = 400;
      throw error;
    }

    const [existing] = await pool.execute(
      'SELECT id, user_id, auto_renew FROM subscriptions WHERE platform = ? AND original_transaction_id = ?',
      ['apple', originalId]
    );
    if (existing[0] && existing[0].user_id !== userId) {
      const error = new Error('This Apple subscription is linked to another SISU account');
      error.status = 409;
      throw error;
    }

    const status = subscriptionStatus(transaction);
    const autoRenew = renewalInfo && renewalInfo.autoRenewStatus !== undefined
      ? Number(renewalInfo.autoRenewStatus) === 1
      : existing[0] ? !!existing[0].auto_renew : 1;
    const values = [
      transaction.productId,
      originalId,
      status,
      autoRenew ? 1 : 0,
      parseAppleDate(transaction.originalPurchaseDate || transaction.purchaseDate),
      parseAppleDate(transaction.expiresDate),
      transaction.offerIdentifier ? String(transaction.offerIdentifier).slice(0, 60) : null,
      environment === Environment.PRODUCTION ? 'production' : 'sandbox',
    ];
    if (existing[0]) {
      await pool.execute(
        `UPDATE subscriptions SET product_id = ?, status = ?, auto_renew = ?,
           period_start = ?, expires_at = ?, offer_code = ?, environment = ?,
           updated_at = NOW() WHERE id = ?`,
        [...values.filter((_, index) => index !== 1), existing[0].id]
      );
    } else {
      await pool.execute(
        `INSERT INTO subscriptions
         (id, user_id, platform, product_id, original_transaction_id, status, auto_renew,
          period_start, expires_at, offer_code, environment)
         VALUES (?, ?, 'apple', ?, ?, ?, ?, ?, ?, ?, ?)`,
        [crypto.randomUUID(), userId, ...values]
      );
    }
    const role = await refreshRole(userId);
    return { subscription: await findSubscription(userId), role };
  }

  app.get('/api/subscription', ...verified, wrap(async (req, res) => {
    const role = await refreshRole(req.user.id);
    res.json({ subscription: await findSubscription(req.user.id), role });
  }));

  app.post('/api/subscription/apple/verify', limiter(60 * 1000, 20), ...verified, wrap(async (req, res) => {
    const checked = await verifySignedData(req.body && req.body.signedTransaction, 'verifyAndDecodeTransaction');
    const transaction = checked.value;
    const renewalSigned = req.body && req.body.signedRenewalInfo;
    let renewalInfo;
    if (renewalSigned) {
      try {
        renewalInfo = (await checked.verifier.verifyAndDecodeRenewalInfo(renewalSigned)).value || undefined;
      } catch (error) {
        const invalid = new Error('Apple renewal signature verification failed');
        invalid.status = 400;
        throw invalid;
      }
    }
    const result = await storeTransaction(req.user.id, transaction, checked.environment, renewalInfo);
    res.json(result);
  }));

  // App Store Server Notifications V2 : configure this URL in App Store Connect.
  app.post('/api/subscription/apple/notifications', limiter(60 * 1000, 60), wrap(async (req, res) => {
    const checked = await verifySignedData(req.body && req.body.signedPayload, 'verifyAndDecodeNotification');
    const notification = checked.value;
    const uuid = String(notification.notificationUUID || '');
    if (uuid) {
      await pool.execute(
        'INSERT IGNORE INTO apple_notification_log (notification_uuid, notification_type) VALUES (?, ?)',
        [uuid, String(notification.notificationType || '').slice(0, 60) || null]
      );
    }
    const data = notification.data || {};
    if (!data.signedTransactionInfo) return res.json({ ok: true });
    const transaction = (await checked.verifier.verifyAndDecodeTransaction(data.signedTransactionInfo)).value;
    let renewalInfo;
    if (data.signedRenewalInfo) {
      try {
        renewalInfo = (await checked.verifier.verifyAndDecodeRenewalInfo(data.signedRenewalInfo)).value;
      } catch {
        renewalInfo = undefined;
      }
    }
    const [owner] = await pool.execute(
      'SELECT user_id FROM subscriptions WHERE platform = ? AND original_transaction_id = ?',
      ['apple', String(transaction.originalTransactionId || '')]
    );
    if (owner[0]) {
      await storeTransaction(owner[0].user_id, transaction, checked.environment, renewalInfo);
    }
    res.json({ ok: true });
  }));
};
