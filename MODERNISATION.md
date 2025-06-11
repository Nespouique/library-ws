# Modernisation du projet Express.js

## Étapes réalisées

1. **Migration vers les modules ES**
   - Passage de `require`/`module.exports` à `import`/`export` dans tous les fichiers JS.
   - Ajout de `"type": "module"` dans `package.json`.

2. **Sécurisation de la configuration**
   - Utilisation de la librairie `dotenv`.
   - Création d’un fichier `.env` pour stocker les paramètres sensibles (base de données, port, etc).

3. **Mise à jour des dépendances**
   - Installation des dernières versions d’Express, mysql2, etc.

4. **Correction des imports nommés**
   - Utilisation des exports nommés pour les helpers.

## Commandes utiles

- Installer les dépendances :
  ```powershell
  npm install
  ```
- Lancer le serveur :
  ```powershell
  node index.js
  ```
- Tester l’API :
  ```powershell
  curl http://localhost:3000/
  curl http://localhost:3000/books
  curl http://localhost:3000/authors
  curl "http://localhost:3000/books?page=2"
  ```

## Suggestions d’amélioration
- Ajouter ESLint et Prettier pour la qualité du code.
- Ajouter des routes POST/PUT/DELETE pour la gestion complète.
- Ajouter une documentation Swagger/OpenAPI.
- Ajouter des tests automatisés.

---
Projet modernisé et fonctionnel au 11/06/2025.
