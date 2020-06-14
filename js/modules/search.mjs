import * as g from "./global.mjs";
import * as dc from "./document-controller.mjs";
import * as q from "./db/db-query.mjs";

// todo: add newly created documents to term search list

let elem = {};
let sanitize = DOMPurify.sanitize;
let searchList = [];
let fuse = undefined;

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
    elem.searchTerm.addEventListener('keyup', onSearchChange);

    // // respond to search button click event
    // elem.searchButton.addEventListener('click', event => {
    //     getDocFromTitle(elem.searchTerm.value).then(res => {
    //         console.log(res);
    //     });
    // })

    // create visible list of titles, setup search array and initialize Fuse
    createTermList();
}

/**
 * Initialize Fuse. Should be done whenever a document has been changed or added.
 */
function initFuse() {
    const options = {
        isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        // threshold: 0.6,
        // distance: 100,
        // useExtendedSearch: false,
        keys: [
            "title",
            "abbreviation"
        ]
    };

    fuse = new Fuse(searchList, options);
}

function onSearchChange(event) {
    if (event.code === "Enter") {
        // for reference
    }

    // todo: not best way to filter, and doesn't sort results
    if (event.target.value === "") {
        let children = elem.termList.getElementsByTagName('li')
        for (let i = 0; i < children.length; i++) {
            children[i].style.removeProperty('display');
        }
    } else {
        // todo: reflect the matches in the term list
        const matches = getSearchResults(event.target.value);

        let children = elem.termList.getElementsByTagName('li')
        for (let i = 0; i < children.length; i++) {
            children[i].style.setProperty('display', 'none');
        }

        matches.forEach(match => {
            document.getElementById(match.item._id).style.removeProperty('display');
        });
    }
}

/**
 * Search for a specific pattern and return the result
 * @param {string} pattern
 * @returns {*}
 */
export function getSearchResults(pattern) {
    return fuse.search(pattern);
}

/**
 * Add a new item to the search array
 * @param {Object} doc
 */
export function addSearchItem(doc) {
    const ref = searchList.length;
    searchList.push(doc);
}

/**
 * Respond to the database change event
 * @param {Object} change: The document object that has changed
 */
export function databaseUpdated(change) {
    // todo: respond to database changes?
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

            addSearchItem(res.docs[i]);
        }
    }).then(() => {
        initFuse();
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
