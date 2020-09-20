import * as g from "./global.mjs";
import * as dc from "./document-controller.mjs";
import * as q from "./db/db-query.mjs";

// todo: add newly created documents to term search list

let elem = {};
let sanitize = DOMPurify.sanitize;
let selected = [];
let searchList = [];
let searchMatches = [];
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
    elem.termList = document.getElementById('term-list');
    elem.contextList = document.getElementById('context-list');
    // fire the search button click event, when enter key is pressed in search field
    elem.searchTerm.addEventListener('keyup', onSearchChange);

    
    // create visible list of titles, setup search array and initialize Fuse
    createContextList();
    createTermList();

   


}


/**
 * Update Fuse. Should be done whenever a document has been changed or added.
 */
export function updateFuse() {
    // todo: update searchList when document is changed, maybe query database instead of maintaining searchList
    const options = {
        isCaseSensitive: false,
        // includeScore: false,
        // shouldSort: true,
        // includeMatches: false,
        // findAllMatches: false,
        // minMatchCharLength: 1,
        // location: 0,
        threshold: 0.4,
        // distance: 100,
        // useExtendedSearch: false,
        keys: [
            "doc.title",
            "doc.abbreviation",
            "doc.tags"
        ]
    };

    fuse = new Fuse(searchList, options);
}

/**
 * Updates the search results and orders the elements
 * @param event
 */
function onSearchChange(event) {
    // clear array
    searchMatches.splice(0, searchMatches.length);
    
    let c_children = elem.contextList.getElementsByTagName('input');
    let t_children = elem.termList.getElementsByTagName('li');
   
    if (event.target.value === "") {
        for (let i = 0; i < c_children.length; i++) {
            c_children[i].style.removeProperty('display');
            t_children[i].style.removeProperty('display');
        }
        // todo: revert order back to default
    } else {
        searchMatches = getSearchResults(event.target.value);

        for (let i = 0; i < c_children.length; i++) {
            c_children[i].style.setProperty('display', 'none');
            t_children[i].style.setProperty('display', 'none');
        }

        searchMatches.forEach(match => {
           document.getElementById("cntx " + match.item.doc._id).style.removeProperty('display');
           document.getElementById("term " + match.item.doc._id).style.removeProperty('display');
           match.item.element.parentNode.appendChild(match.item.element);
      
        });
    }

    if (event.code === "Enter") {
        dc.displayTopDocument();
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
 * @param {Element} elem
 * @param {Object} doc
 */
export function addSearchItem(elem, doc) {
    const ref = searchList.length;
    searchList.push({
        "element": elem,
        "doc": doc,
    });
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
    // todo: show list of dictionaries (or maybe tags?)
}

/**
 * Creates the list of documents that are displayed and can be searched.
 */
export function createContextList() {
    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
            let item = document.createElement('input');
            item.setAttribute('type', 'checkbox');
            item.setAttribute('id', "cntx " + res.docs[i]._id);
            item.setAttribute('data-id', res.docs[i]._id);

            let title = sanitize(res.docs[i].title);
            if (title === "") {
                title = "Untitled";
            }
            item.innerHTML = title;

            item.addEventListener('click', event => {
                onTermClicked(event)
            })

            elem.contextList.appendChild(item);
            addSearchItem(item, res.docs[i]);
        }
    }).then(() => {
        updateFuse(); // always re-initialize Fuse after changing content
    });
}

export function createTermList(){
  
    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
                let li = document.createElement('li'); 
                li.setAttribute('id', "term " + res.docs[i]._id);
                li.setAttribute('data-id', res.docs[i]._id);
                let form = document.createElement('form');
                    form.className="document-editor";
                let title = document.createElement('input');
                    title.id="document-title";
                    title.setAttribute("aria-label","term");
                    title.setAttribute("placeholder","Term");
                let title_val = sanitize(res.docs[i].title);
                    if (title_val === "") {
                        title_val = "Untitled";
                    }
                    title.value = title_val;
                let dictionaries = document.createElement('input');
                    dictionaries.id="document-dictionaries-"+res.docs[i];
                    dictionaries.setAttribute("aria-label","dictionaries");
                    dictionaries.setAttribute("placeholder","Dictionaries");
                let abbreviation = document.createElement('input');
                    abbreviation.setAttribute("aria-label","abbreviation");
                    abbreviation.setAttribute("placeholder","Abbreviation");
                let editorjs = document.createElement('div');
                    editorjs.setAttribute("aria-label","content");
                                        
                li.appendChild(form)
                    .appendChild(title);
                form.appendChild(dictionaries);
                form.appendChild(abbreviation);
                form.appendChild(editorjs);

                elem.termList.appendChild(li);
                addSearchItem(li, res.docs[i]);
            }
        }).then(() => {
            updateFuse(); // always re-initialize Fuse after changing content
        });
}

/**
 * Updates the title of element in the document list
 * @param {string} id
 * @param {string} newTitle
 */
export function updateTermTitle(id, newTitle) {
    if (id === undefined || id === "")
        return;

    document.getElementById(id).innerHTML = sanitize(newTitle);
}

/**
 * Get the id of the top-most search result
 * @returns {Element|null}
 */
export function getTopElement() {
    if (searchMatches.length === 0) {
        return null;
    }

    return searchMatches[0].item.element;
}

/**
 * Handles list selection
 * @param event
 */
function onTermClicked(event) {
    // de-select previous
    for (let i = 0; i < selected.length; i++)
    {
        selected[i].checked = false;
    }
    selected.splice(0, selected.length);

    // select new
    const checkbox = event.target;
    if (checkbox.checked === true)
    {
        let id = checkbox.getAttribute('data-id');
        selected.push(checkbox);
        dc.displayDocument(id);
    }
}

window.addEventListener("load", init);
//window.addEventListener("load", updateCount);
