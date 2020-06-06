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

function tryFindTerm(term) {
    // todo: attempt to find term
    console.log('searching for term');

    db.createIndex({
        index: {fields: ['']}
    });

    return undefined;
}

function init() {
    console.log('Search is loaded.');

    // create or retrieve database
    db = new PouchDB('dictionary');

    db.allDocs({include_docs: true, descending: true}, (err, res) => {
        res.rows.forEach(row => {
            console.log(row.doc.title);
        })
    });

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
        tryFindTerm();
    })
}

// init script when everything is loaded
window.onload = init;