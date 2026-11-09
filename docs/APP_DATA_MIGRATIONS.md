# Migrations des données de l’application

Exécuter les migrations sur la base MariaDB avant de déployer la version backend de la branche `feature/app-user-data-api`, dans cet ordre :

1. `migrations/2026-11-09-user-app-state.sql` — préférences et historiques skincare/bien-être conservés côté serveur.
2. `migrations/2026-11-09-community.sql` — publications, réactions, défis et inscriptions.
3. `migrations/2026-11-09-progress-photos.sql` — photos de progression et d’inspiration.

Le schéma de référence `sources/table.sql` comprend déjà les tables des comptes, mesures, repas, activités, séances de sport, abonnements Apple et appareils push. Aucune migration supplémentaire n’est nécessaire pour ces domaines.

Les migrations utilisent `CREATE TABLE IF NOT EXISTS` et le catalogue des défis utilise une insertion répétable. Elles ne recopient aucune donnée locale de l’application.
