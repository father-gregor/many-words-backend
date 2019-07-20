/**
 * Migrations
 */
const addSynonymsForDailyWordsMigration = require("./migrations/add-synonyms-for-daily-words.migration");

const migrations = [
    addSynonymsForDailyWordsMigration
];

async function executeMigrations () {
    console.log("\n\n////----Database Migrations----////\n"); // eslint-disable-line
    for (let migration of migrations) {
        try {
            console.log(`Executing migration: ${migration.name}`); // eslint-disable-line
            await migration.execMigration();
            console.log(`Migration "${migration.name}" succesfully finished"`); // eslint-disable-line
        } catch (err) {
            console.log(`Migration "${migration.name}" failed. Reason: ${err}`); // eslint-disable-line
        }
        finally {
            console.log("Migrations completed\n\n"); // eslint-disable-line
        }
    }
}

module.exports = {
    executeMigrations
};
