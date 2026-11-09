const programSessions = require('./program-catalog');

module.exports = function registerProgramCatalogRoutes(app, deps) {
  const { requireAuth, requireVerified } = deps;

  app.get('/api/program/catalog', requireAuth, requireVerified, (req, res) => {
    res.set('Cache-Control', 'private, no-store');
    res.json({ sessions: programSessions });
  });
};
