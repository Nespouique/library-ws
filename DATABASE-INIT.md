# Initialisation automatique de la base de données

## Fonctionnement

L'application Library-WS gère maintenant automatiquement l'initialisation de la base de données. Plus besoin de déposer manuellement des scripts SQL sur la machine de déploiement !

### Que fait le système d'initialisation ?

1. **Vérification de la connexion** : Au démarrage, l'application attend que la base de données MySQL soit disponible
2. **Détection des tables** : Vérifie si les tables nécessaires (`Authors`, `Shelves`, `Books`) existent
3. **Création automatique** : Si les tables n'existent pas, elles sont créées automatiquement
4. **Données d'exemple** : Si les tables sont vides, des données d'exemple sont insérées

### Avantages

- ✅ **Déploiement simplifié** : Plus besoin de gérer manuellement les scripts SQL
- ✅ **Robuste** : Gère les tentatives de reconnexion et les timeouts
- ✅ **Sécurisé** : Utilise `CREATE TABLE IF NOT EXISTS` et `INSERT IGNORE`
- ✅ **Flexible** : Fonctionne que la base soit vide ou déjà partiellement remplie

## Utilisation

### Démarrage normal

```bash
npm start
```

L'initialisation se fait automatiquement au démarrage.

### Scripts utilitaires

```bash
# Initialiser manuellement la base de données
npm run db:init

# Vérifier la connexion à la base de données
npm run db:check
```

## Logs de démarrage

Exemple de logs lors du premier démarrage :

```
🔄 Démarrage de l'application Library API...
🔌 Vérification de la connexion à la base de données...
⏳ Tentative de connexion 1/30 à la base de données...
⏳ Tentative de connexion 2/30 à la base de données...
✅ Connexion à la base de données établie
🔄 Initialisation de la base de données...
🏗️ Tables manquantes détectées, création en cours...
📋 Création des tables...
✅ Table Authors créée
✅ Table Shelves créée
✅ Table Books créée
📦 Insertion des données d'exemple...
✅ Auteurs d'exemple insérés
✅ Étagères d'exemple insérées
✅ Livres d'exemple insérés
✅ Base de données initialisée avec succès!
🚀 Library API server ready on http://localhost:3000
📚 API Documentation: http://localhost:3000/api-docs
```

## Migration depuis l'ancien système

Si vous migrez depuis l'ancienne version qui utilisait `docker-entrypoint-initdb.d` :

1. Supprimez le volume MySQL existant si vous voulez repartir à zéro :

    ```bash
    docker-compose down -v
    ```

2. Ou gardez vos données existantes, le système détectera automatiquement que les tables existent déjà

## Structure des tables créées

Le système crée automatiquement les tables suivantes :

- **Authors** : Table des auteurs avec contrainte d'unicité sur (firstName, lastName)
- **Shelves** : Table des étagères
- **Books** : Table des livres avec clés étrangères vers Authors et Shelves

Pour plus de détails sur le schéma complet, consultez [DATABASE-SCHEMA.md](DATABASE-SCHEMA.md).

## Gestion d'erreurs

- **Timeout de connexion** : 30 tentatives avec 2 secondes d'intervalle
- **Erreurs SQL** : Logs détaillés et arrêt propre de l'application
- **Tables existantes** : Détection automatique, pas de recréation

## Configuration

Les paramètres de connexion à la base de données sont définis via les variables d'environnement :

- `DB_HOST` : Hôte de la base de données
- `DB_PORT` : Port de la base de données
- `DB_USER` : Utilisateur de la base de données
- `DB_PASSWORD` : Mot de passe
- `DB_NAME` : Nom de la base de données
