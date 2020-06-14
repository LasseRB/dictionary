import * as g from "./global.mjs";
import * as dc from "./document-controller.mjs";
import * as q from "./db/db-query.mjs";

// todo: add newly created documents to term search list

let elem = {};
let sanitize = DOMPurify.sanitize;

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
    // elem.searchButton = document.getElementById('search-button');
    elem.dictionaryList = document.getElementById('dictionary-list');
    elem.termList = document.getElementById('term-list');

    // fire the search button click event, when enter key is pressed in search field
    elem.searchTerm.addEventListener('keyup', event => {
        if (event.code === 'Enter') {
            event.preventDefault();
            // elem.searchButton.click();
        } else {

        }
    });

    // // respond to search button click event
    // elem.searchButton.addEventListener('click', event => {
    //     getDocFromTitle(elem.searchTerm.value).then(res => {
    //         console.log(res);
    //     });
    // })

    createTermList();
}

/**
 * Respond to the database change event
 * @param {Object} change: The document object that has changed
 */
export function databaseUpdated(change) {
    // todo
    if (change.deleted) {
        // note: the deleted document object is not passed completely, however _id and _rev is passed
        //
    } else {
        // modified document
    }
}

export function updateDictionaryList() {
    // todo
}

export function createTermList() {
    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
            let item = document.createElement('li');
            item.setAttribute('id', res.docs[i]._id);
            item.setAttribute('data-id', res.docs[i]._id);
            let title = sanitize(res.docs[i].title);
            if (title === "") {
                title = "Untitled";
            }
            item.innerHTML = title;
            item.addEventListener('click', event => {
                onTermClicked(event)
            })
            elem.termList.appendChild(item);
        }
    });
}

export function updateTermTitle(id, title) {
    if (id === null || id === "")
        return;

    document.getElementById(id).innerHTML = sanitize(title);
}

function onTermClicked(event) {
    let id = event.target.getAttribute('data-id');
    dc.displayDocument(id);
}

window.addEventListener("load", init);
