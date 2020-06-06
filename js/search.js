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
    term = term.trim();
    console.log(`searching for term: ${term}`);

    return new Promise((resolve, reject) => {
        db.createIndex({
            index: {
                fields: ['title']
            }
        }).then(res => {
            // created or already exists
        }).catch(err => {
            reject(err);
        });

        db.find({
            selector: {title: term},
            fields: ['title'],
        }).then(res => {
            resolve(res);
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    })
}

function init() {
    console.log('Search is loaded.');

    // create or retrieve database
    db = new PouchDB('dictionary');

    // db.allDocs({include_docs: true, descending: true}, (err, res) => {
    //     res.rows.forEach(row => {
    //         console.log(row.doc.title);
    //     })
    // });

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

// init script when everything is loaded
window.onload = init;