import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";
import * as s from "./search.mjs";

// todo: make sure to save document if app is closed

let documentId = "";
let elem = {};
let saveTimer = undefined;
let sanitize = DOMPurify.sanitize;

function init() {
    // get elements
    elem.article = document.getElementById('document-article');
    elem.title = document.getElementById('document-title');
    elem.abbreviation = document.getElementById('document-abbreviation');
    elem.content = document.getElementById('document-content');

    // clear contents
    elem.title.value = "";
    elem.abbreviation.value = "";
    elem.content.innerHTML = "";

    // setup event listeners
    elem.title.addEventListener('input', onDocumentChanged);
    elem.abbreviation.addEventListener('input', onDocumentChanged);
    elem.content.addEventListener('input', onDocumentChanged);
}

function onDocumentChanged(event) {
    // update title in list
    if (event.target === elem.title) {
        s.updateTermTitle(documentId, elem.title.value);
    }

    if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
    }

    // restart timer, save document after 500 ms inactivity
    saveTimer = setTimeout(saveDocument, 500);
}

export function saveDocument() {
    console.log("Save document!");

    // sanitize the input
    let doc = new a.Document(
        sanitize(elem.title.value),
        sanitize(elem.abbreviation.value),
        [],
        sanitize(elem.content.innerHTML)
    );

    // create new document or update existing
    let id = elem.title.getAttribute('data-id');

    if (id === null || id === "") {
        a.createDocument(doc);
        elem.title.setAttribute('data-id', doc._id);
        console.log('Creating new document: ' + doc._id);
    } else {
        doc._id = id;
        a.updateDocument(doc);
    }

    documentId = id;
}

export function displayDocument(id) {
    // save existing first
    saveDocument();

    // show new document
    q.getDocFromId(id).then(doc => {
        documentId = id;
        elem.title.value = doc.title;
        elem.title.setAttribute('data-id', id);
        elem.abbreviation.value = doc.abbreviation;
        elem.content.innerHTML = doc.definition;
        console.log(doc.definition);
    }).catch(err => {
        console.error(err);
    });
}

window.addEventListener('load', init);