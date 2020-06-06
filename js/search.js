/**
 * Try to find an exact term in the database
 * @param {string} term
 * @returns {undefined}
 */

'use strict';

let db;
let elem = {
    searchTerm: undefined,
    searchButton: undefined,
}

/**
 * Initializes the database and search event listeners.
 */
function init() {
    // create or retrieve database
    db = new PouchDB('dictionary');

    // setup document elements
    elem.searchTerm = document.getElementById('search-term');
    elem.searchButton = document.getElementById('search-button');

    // add event listeners
    elem.searchTerm.addEventListener('keyup', event => {
        if (event.code === 'Enter') {
            event.preventDefault();
            elem.searchButton.click();
        }
    });

    elem.searchButton.addEventListener('click', event => {
        // todo: search for the term
        tryFindTerm(elem.searchTerm.value).then(res => {
            console.log(res);
        });
    })
}

/**
 * Tries to find all matches to by term (title)
 * @param {string} term
 * @returns {Promise<Object>}
 */
function tryFindTerm(term) {
    // remove trailing white space
    term = term.trim();

    // an index must be created first, if it already then exists nothing is done
    return new Promise((resolve, reject) => {
        db.createIndex({
            index: {fields: ['title']}
        }).then(() => {
            db.find({
                selector: {title: term},
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

// init script when everything is loaded
window.onload = init;