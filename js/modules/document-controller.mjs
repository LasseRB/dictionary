import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";
import * as s from "./search.mjs";

// todo: make sure to save document if app is closed
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

    // restart timer, save document after 500 ms inactivity
    saveTimer = setTimeout(saveDocument, 500);
}

export function saveDocument() {
    console.log("Save document!");

    editor.save().then(data => {
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

export function displayDocument(id) {
    // save existing first
    if (hasChanged) {
        saveDocument();
    }

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

    hasChanged = false;
    addEventListeners();
}

window.addEventListener('load', init);