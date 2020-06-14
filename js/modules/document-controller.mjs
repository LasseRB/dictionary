import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";
import * as s from "./search.mjs";

// todo: ability to delete documents
// todo: empty page instead of editor on open?
// todo: create new document when clicking plus
// todo: add "last modified date" field

let documentId = "";
let elem = {};
let saveTimer = undefined;
let sanitize = DOMPurify.sanitize;
let editor = undefined;
let hasChanged = false;

function init() {
    // get elements
    elem.article = document.getElementById('document-article');
    elem.title = document.getElementById('document-title');
    elem.abbreviation = document.getElementById('document-abbreviation');
    elem.content = document.getElementById('editorjs');

    // clear contents
    elem.title.value = "";
    elem.abbreviation.value = "";
    elem.content.innerHTML = "";

    // setup editor.js
    setupEditor();

    // setup event listeners
    addEventListeners();
}

function addEventListeners() {
    elem.title.addEventListener('input', onDocumentChanged);
    elem.abbreviation.addEventListener('input', onDocumentChanged);
    elem.content.addEventListener('input', onDocumentChanged);
    editor.onChange = onDocumentChanged;
}

function removeEventListeners() {
    elem.title.removeEventListener('input', onDocumentChanged);
    elem.abbreviation.removeEventListener('input', onDocumentChanged);
    elem.content.removeEventListener('input', onDocumentChanged);
    editor.onChange = undefined;
}

function setupEditor() {
    editor = new EditorJS({
        holder: 'editorjs',
        tools: {
            code: {
                class: CodeTool
            },
            header: {
                class: Header,
                inlineToolbar: ['link', 'Marker'],
                config: {
                    placeholder: '',
                    levels: [1, 2, 3],
                    defaultLevel: 1,
                },
            },
            inlineCode: {
                class: InlineCode,
                shortcut: 'CMD+SHIFT+C',
            },
            list: {
                class: List,
                inlineToolbar: true,
            },
            Marker: {
                class: Marker,
                shortcut: 'CMD+SHIFT+M',
            },
            quote: {
                class: Quote,
                inlineToolbar: true,
                shortcut: 'CMD+SHIFT+O',
                config: {
                    quotePlaceholder: 'Quote',
                    captionPlaceholder: 'Author',
                },
            },
        }
    });
}

function onDocumentChanged(event) {
    hasChanged = true;

    // update title in list
    if (event.target === elem.title) {
        s.updateTermTitle(documentId, elem.title.value);
    }

    if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
    }

    // restart timer, save document after 1000 ms inactivity
    saveTimer = setTimeout(saveDocument, 1000);
}

/**
 * Saves the current document to the database.
 */
export function saveDocument() {
    console.log("Save document!");

    editor.save().then(data => {
        if (elem.title.value === "") {
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toPaddedString();
            const day = date.getDate().toPaddedString();
            const hours = date.getHours().toPaddedString();
            const minutes = date.getMinutes().toPaddedString();
            const seconds = date.getSeconds().toPaddedString();

            elem.title.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        }

        // sanitize the input
        let doc = new a.Document(
            sanitize(elem.title.value),
            sanitize(elem.abbreviation.value),
            [],
            JSON.stringify(data)
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
    }).catch(err => {
        console.error(err);
    });
}

/**
 * Saves the current document and shows the document with the given id
 * @param id
 */
export function displayDocument(id) {
    // save existing first
    if (hasChanged) {
        saveDocument();
    }

    // remove event listeners to prevent firing after changing
    removeEventListeners();

    // show new document
    q.getDocFromId(id).then(doc => {
        documentId = id;
        elem.title.value = doc.title;
        elem.title.setAttribute('data-id', id);
        elem.abbreviation.value = doc.abbreviation;

        editor.clear();
        try {
            let data = JSON.parse(doc.definition);
            editor.render(data);
        } catch (err) {
            // could not parse JSON
        }
    }).catch(err => {
        console.error(err);
    });

    // re-add event listeners
    hasChanged = false;
    addEventListeners();
}

/**
 * Display the top-most document
 */
export function displayTopDocument() {
    let elem = s.getTopElement();
    if (elem === null) {
        return;
    }

    elem.click();
    displayDocument(elem.id);
}

window.addEventListener('load', init);
window.addEventListener('beforeunload', saveDocument);