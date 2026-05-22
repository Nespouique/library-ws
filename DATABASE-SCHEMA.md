# Schéma de la base de données Library

Ce document décrit la structure de la base de données MySQL utilisée par l'API Library-WS.

> ⚠️ **Note importante** : Les tables sont créées automatiquement par l'application au démarrage. Il n'y a plus besoin de script SQL manuel.

## Tables

### 📚 Authors

Table des auteurs de livres.

```sql
CREATE TABLE Authors (
    id VARCHAR(36) PRIMARY KEY,
    firstName VARCHAR(255) NOT NULL,
    lastName VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_author_name (firstName, lastName)
);
```

**Contraintes :**

- Clé primaire : `id` (UUID)
- Contrainte d'unicité : `(firstName, lastName)` - Pas de doublons d'auteurs

### 🏷️ Shelves

Table des étagères pour organiser les livres.

```sql
CREATE TABLE Shelves (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

**Contraintes :**

- Clé primaire : `id` (UUID)
- Pas de contrainte d'unicité sur le nom (plusieurs étagères peuvent avoir le même nom)
- Le champ `location` est optionnel et permet de faire le lien avec un emplacement physique

### 📖 Books

Table principale des livres.

```sql
CREATE TABLE Books (
    id VARCHAR(36) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(36) NOT NULL,
    isbn VARCHAR(13) NULL UNIQUE,
    date DATE,
    description TEXT,
    jacket VARCHAR(255),
    lentTo VARCHAR(255),
    lentAt DATE,
    shelf VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX author (author),
    INDEX shelf (shelf),
    FOREIGN KEY (author) REFERENCES Authors(id),
    FOREIGN KEY (shelf) REFERENCES Shelves(id)
);
```

**Contraintes :**

- Clé primaire : `id` (UUID)
- Contrainte d'unicité : `isbn` - Chaque livre a un ISBN unique (NULL autorisé pour les livres sans ISBN)
- Clé étrangère : `author` → `Authors(id)`
- Clé étrangère : `shelf` → `Shelves(id)` (optionnelle)
- `lentTo` : Nom de la personne à qui le livre est prêté (NULL si disponible)
- `lentAt` : Date du prêt (NULL si disponible)

**Index :**

- Index sur `author` pour les requêtes de livres par auteur
- Index sur `shelf` pour les requêtes de livres par étagère

## Relations

```
Authors (1) ──────────────── (N) Books
   │                           │
   │                           │
   └─ id                       └─ author

Shelves (1) ──────────────── (N) Books
   │                           │
   │                           │
   └─ id                       └─ shelf
```

## Données d'exemple

L'application insère automatiquement des données d'exemple si les tables sont vides au premier démarrage :

### Auteurs d'exemple

- John Doe
- Jane Smith
- Bob Johnson

### Étagères d'exemple

- Étagère 1 (Kube1)
- Étagère 2 (Kube2)
- Étagère 3 (Kube3)

### Livres d'exemple

- Book 1 (John Doe, ISBN: 1234567890123)
- Book 2 (Jane Smith, ISBN: 9876543210987)

## Types de données

### UUID (VARCHAR(36))

Tous les IDs utilisent des UUIDs au format : `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`

### ISBN (VARCHAR(13))

Format ISBN-13 sans tirets : `1234567890123`

### Dates

- `created_at` : Timestamp automatique à la création
- `date` : Date de publication du livre (optionnelle)

## Gestion des images de couverture

Le champ `jacket` dans la table `Books` stocke le chemin relatif vers l'image de couverture :

- Format : `/cover1.jpg`, `/cover2.jpg`, etc.
- Les images sont gérées par l'API via les endpoints `/books/{id}/jacket`
- Plusieurs tailles disponibles : small, medium, large, original

## Migration et évolution

Pour modifier le schéma :

1. Modifier les constantes dans `services/db-init.js`
2. L'application appliquera automatiquement les changements au prochain démarrage

> 💡 **Conseil** : Pour des migrations complexes, il est recommandé de créer des scripts de migration séparés.
