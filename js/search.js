'use strict';

let db;
let elem = {
    searchTerm: undefined,
    searchButton: undefined,
}

/**
 * Initialize the database and search event listeners.
 */
function init() {
    // create or retrieve database
    db = new PouchDB('dictionary');

    // respond to database changes
    db.changes({
        since: 'now',
        live: true,
        include_docs: true
    }).on('change', change => {
        // one event per changed document
        databaseUpdated(change);
    }).on('error', err => {
        console.error(err);
    });

    // setup document elements
    elem.searchTerm = document.getElementById('search-term');
    elem.searchButton = document.getElementById('search-button');

    // fire the search button click event, when enter key is pressed in search field
    elem.searchTerm.addEventListener('keyup', event => {
        if (event.code === 'Enter') {
            event.preventDefault();
            elem.searchButton.click();
        }
    });

    // respond to search button click event
    elem.searchButton.addEventListener('click', event => {
        tryFindTitle(elem.searchTerm.value).then(res => {
            console.log(res);
        });
    })
}

/**
 * Respond to the database change event
 * @param {Object} change: The document object that has changed
 */
function databaseUpdated(change) {
    // todo
    if (change.deleted) {
        // note: the deleted document object is not passed completely, however _id and _rev is passed
        console.log(`change (deleted): ${change.doc._id}`);
    } else {
        console.log(`change (added/modified): ${change.doc._id}`);
    }
}

/**
 * Tries to find all matches to by term (title)
 * @param {string} title
 * @returns {Promise<Object>}
 */
function tryFindTitle(title) {
    // remove trailing white space
    title = title.trim();

    // an index must be created first, if it already then exists nothing is done
    return new Promise((resolve, reject) => {
        db.createIndex({
            index: {fields: ['title']}
        }).then(() => {
            db.find({
                selector: {title: title},
                limit: 10
            }).then(res => {
                resolve(res);
            });
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
}

/**
 * Returns an array of all titles
 * @returns {Promise<[]>}
 */
function getAllTitles() {
    // an index must be created first, if it already then exists nothing is done
    return new Promise((resolve, reject) => {
        db.createIndex({
            index: {fields: ['title']}
        }).then(() => {
            db.find({
                selector: {title: {$gt: null}},
                fields: ['title'],
                sort: ['title']
            }).then(res => {
                let titles = [];
                res.docs.forEach(doc => {
                    titles.push(doc.title);
                })
                resolve(titles);
            });
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
}

// init script when everything is loaded
window.onload = init;
