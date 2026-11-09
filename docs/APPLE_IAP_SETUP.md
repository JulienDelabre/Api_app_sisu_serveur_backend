# Activation des achats Apple StoreKit

La validation est réalisée par la bibliothèque officielle App Store Server de Apple. Le serveur doit tourner sous Node.js 22 ou supérieur. Les transactions TestFlight utilisent l’environnement Sandbox ; les achats App Store utilisent Production.

1. Sur le site PKI d’Apple, téléchargez les certificats racine Apple (Apple Root CA, G2 et G3) : https://www.apple.com/certificateauthority/
2. Encodez chaque certificat DER en base64 et placez les valeurs dans `APPLE_ROOT_CERTS_BASE64`, séparées par des virgules. Ne mettez pas les certificats intermédiaires à la place des racines.
3. Configurez les variables suivantes sur l’hébergement (jamais dans le dépôt) :

```env
APPLE_BUNDLE_ID=com.sisuapp.app
APPLE_APP_ID=<identifiant numérique App Store Connect>
APPLE_ROOT_CERTS_BASE64=<racine1_base64>,<racine2_base64>,<racine3_base64>
APPLE_SUBSCRIPTION_PRODUCT_IDS=com.sisuapp.app.subscription.monthly,com.appsisu.sisupro.monthly
```

`APPLE_APP_ID` est requis pour vérifier les transactions Production. Il peut être laissé vide pour les tests Sandbox. L’identifiant de bundle doit correspondre à celui de l’application.

4. Configurez dans App Store Connect les notifications serveur V2 vers :

```
https://api.appsisu.com/api/subscription/apple/notifications
```

La route valide la signature Apple, associe une transaction à un seul compte SISU et met à jour le rôle et l’abonnement lors des notifications de renouvellement ou de révocation. La table `subscriptions` et le journal `apple_notification_log` existent déjà dans la base décrite par `table.sql`; aucune migration d’abonnement supplémentaire n’est requise.

Pour encoder un certificat sous PowerShell :

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("AppleRootCA-G3.cer"))
```

Référence de l’implémentation officielle Apple : https://github.com/apple/app-store-server-library-node
