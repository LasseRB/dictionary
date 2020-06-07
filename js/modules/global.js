const PouchDB = require('pouchdb');
/**
 * Global variables that can be accessed from anywhere.
 */

const g = {
    db: new PouchDB('dictionary'),
}
// // Retrieve or create a new database
// const db = new PouchDB('dictionary');