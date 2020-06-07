'use strict';

let elem = {
    searchTerm: undefined,
    searchButton: undefined,
}

/**
 * Initialize the database and search event listeners.
 */
function init() {
    // respond to database changes
    g.db.changes({
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
        getDocFromTitle(elem.searchTerm.value).then(res => {
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

// init script when everything is loaded
window.onload = init;
