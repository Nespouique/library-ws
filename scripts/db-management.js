#!/usr/bin/env node

/**
 * Script utilitaire pour la gestion de la base de données
 * Usage: npm run db:init ou node scripts/db-reset.js
 */

import dbInit from '../services/db-init.js';

async function main() {
    const args = process.argv.slice(2);
    const command = args[0] || 'init';

    try {
        switch (command) {
            case 'init':
                console.log('🔄 Initialisation de la base de données...');
                await dbInit.waitForDatabase();
                await dbInit.initializeDatabase();
                console.log('✅ Initialisation terminée avec succès!');
                break;

            case 'check':
                console.log('🔍 Vérification de la connexion à la base de données...');
                await dbInit.waitForDatabase();
                console.log('✅ Connexion établie avec succès!');
                break;

            default:
                console.log('Usage: node scripts/db-management.js [init|check]');
                console.log('  init  - Initialise la base de données (crée les tables si nécessaire)');
                console.log('  check - Vérifie la connexion à la base de données');
                process.exit(1);
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Erreur:', error);
        process.exit(1);
    }
}

main();
