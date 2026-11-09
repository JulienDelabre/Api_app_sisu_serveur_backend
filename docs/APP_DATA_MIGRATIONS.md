# Migrations des données de l’application

Exécuter les migrations sur la base MariaDB avant de déployer la version backend de la branche `feature/app-user-data-api`, dans cet ordre :

1. `migrations/2026-11-09-user-app-state.sql` — préférences et historiques skincare/bien-être conservés côté serveur.
2. `migrations/2026-11-09-community.sql` — publications, réactions, défis et inscriptions.
3. `migrations/2026-11-09-progress-photos.sql` — photos de progression et d’inspiration.
4. `migrations/2026-11-09-notification-log.sql` — journal anti-doublon des rappels push.

Le schéma déjà installé sur votre base comprend les tables des comptes, mesures, repas, activités, séances de sport, réglages de notifications, abonnements Apple et appareils push. Le journal des rappels push est créé par la quatrième migration. Aucune migration supplémentaire n’est nécessaire pour ces domaines.

Les migrations utilisent `CREATE TABLE IF NOT EXISTS` et le catalogue des défis utilise une insertion répétable. Elles ne recopient aucune donnée locale de l’application.
