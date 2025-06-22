# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2025-06-22

### Added

- **CORS Support**: Ajout du support complet pour les requêtes cross-origin
    - Configuration CORS avec le package `cors`
    - Support pour les requêtes preflight OPTIONS
    - Headers CORS appropriés pour les contributeurs externes
    - Configuration permissive pour permettre l'utilisation par des applications tierces

### Changed

- Mise à jour de la version dans `package.json` de 1.0.0 vers 1.1.0
- Ajout de la variable d'environnement `NODE_ENV=production` dans `.env`

### Fixed

- Correction du Dockerfile : ajout de la destination manquante dans la commande `COPY`

### Technical Details

- Les contributeurs peuvent maintenant faire des appels AJAX vers `https://library-ws.hallais.bzh/books?page=1` sans erreur CORS
- Support des méthodes HTTP : GET, POST, PUT, DELETE, OPTIONS
- Headers autorisés : Content-Type, Authorization, X-Requested-With
- Support des credentials pour les requêtes authentifiées

## [1.0.0] - 2025-06-22

### Added

- Version initiale de l'API Library
- Support pour les livres, auteurs, et étagères
- Documentation Swagger
- Tests unitaires avec Jest
- Configuration ESLint et Prettier
- Support Docker avec MySQL
