import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";
import * as s from "./search.mjs";
import * as g from "./global.mjs";

// // todo: ability to delete documents
// // todo: empty page instead of editor on open?
// // todo: create new document when clicking plus
// // todo: add "last modified date" field

let documentId = "";
let elem = {};
let saveTimer = undefined;
let sanitize = DOMPurify.sanitize;
// let editor = undefined;
let hasChanged = false;


function init() {
    // get elements
    // elem.article = document.getElementById('document-article');
    // 
    // elem.abbreviation = document.getElementById('document-abbreviation');
    // 
    elem.termList = document.getElementById('term-list');
    elem.contextList = document.getElementById('context-list');
    // add from search functionality
    elem.newTermButton = document.getElementById('new-term');
    elem.newTerm = document.getElementById('search-term');   
   // elem.newTermButton.addEventListener('click', saveDocument);
  
   elem.searchTerm = document.getElementById('search-term');


    // clear contents
    // elem.title.value = "";
    // elem.abbreviation.value = "";
    // elem.content.innerHTML = "";



    // setup event listeners
    addEventListeners();
}

function addEventListeners(element) {
    let t_children = document.getElementsByClassName('li_wrapper');
    elem.newTermButton.addEventListener('click', saveDocument);

    console.debug('eventListener started');;
    //loop over all docs
   
       
    
}

// function removeEventListeners() {
//     let t_children = elem.termList.getElementsByTagName('li');
//     for (let i = 0; i < t_children.length; i++) {
//         t_children[i].title.removeEventListener('input', onDocumentChanged);
//         t_children[i].dictionary.removeEventListener('input', onDocumentChanged);
//         t_children[i].abbreviation.removeEventListener('input', onDocumentChanged);
//         t_children[i].content.removeEventListener('input', onDocumentChanged);
//     }
//     //editor.onChange = undefined;
// }

export function setupEditor(doc) {
       const editor = new EditorJS({
            holder: 'editorjs '+ doc._id,
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
                    shortcut: 'CMD+E',
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
        return editor;
}

function onDocumentChanged(event) {
    hasChanged = true;

    let currentID = event.currentTarget.id.substring(4);
    
    let currentTitle = event.currentTarget.childNodes[0][0].value;
    let currentDict = event.currentTarget.childNodes[0][1].value;
    let currentAbbriv = event.currentTarget.childNodes[0][2].value;
    let currentEditor = event.currentTarget.childNodes[0][3].value;
    console.debug("id "+ currentID + "\n"
                 + "title "+ currentTitle + "\n"
                 + "dict "+ currentDict + "\n"
                 + "abbriv "+ currentAbbriv + "\n"
                 + "editor "+ currentEditor + "\n");



    console.debug(currentEditor);

    s.updateTermTitle("cntx" + currentID, event.target.value);

    // update title in list
    if (event.target.title === elem.title) {
    }

    if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
    }

    // // restart timer, save document after 1000 ms inactivity
    // saveTimer = setTimeout(saveDocument(event.target), 1000);
}


/**
 * Saves the current document to the database.
 */
export function saveDocument(doc) {
    console.log("Save document!");

    if(s.getSearchResults(event.target.value).length === 0){
        let doc = new a.Document(
            sanitize(elem.newTerm.value),
            sanitize(elem.newTerm.value),
          //  sanitize(elem.abbreviation.value),
            [],
            //JSON.stringify(data)
        );
    
        updateDoc(doc);

    }
     // sanitize the input
    
    else{
         //get the editor in quesion.. unlike now:
    editor.save().then(data => {
        // If no title, term gets todays date
        // This I might remove in the new design with search bar
       
        if (elem.title.value === "" && elem.newTerm.value === "") {
            const date = new Date();
            const year = date.getFullYear();
            const month = (date.getMonth() + 1).toPaddedString();
            const day = date.getDate().toPaddedString();
            const hours = date.getHours().toPaddedString();
            const minutes = date.getMinutes().toPaddedString();
            const seconds = date.getSeconds().toPaddedString();

            elem.title.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
        } else if(elem.newTerm.value != "" && elem.title.value != elem.newTerm.value)
            {
            elem.title.value = elem.newTerm.value;
            elem.newTerm.value = '';
            updateDoc();
            }
    
        let doc = new a.Document(
            sanitize(elem.newTerm.value),
            //  sanitize(elem.abbreviation.value),
            //[],
            JSON.stringify(data)
        );
    
        updateDoc(doc);

       
    }).catch((err) => {
        console.error(err);
    });

    }
   
}

export function updateDoc(doc){
        // create new document or update existing
        let id = elem.newTerm.getAttribute('data-id');
        console.log(id);
        if (id === null || id === "") {
            a.createDocument(doc);
            //elem.title.setAttribute('data-id', doc._id);
            console.log('Creating new document: ' + doc._id);
        } else {
            doc._id = id;
            a.updateDocument(doc);
        }

        documentId = id;
}

/**
 * Saves the current document and shows the document with the given id
 * @param id
 */
export function displayDocument(id) {
    //save existing first
    if (hasChanged) {
        saveDocument();
    }
    console.log(id);

    // remove event listeners to prevent firing after changing
    // removeEventListeners();
    document.getElementById("term " + id).scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});

    
// // @TODO: find element with correct content instead of populating the one and only element
    
// // show new document
//     q.getDocFromId(id).then(doc => {
//         console.log(doc);
//         documentId = id;
//         elem.title.value = doc.title;
//         elem.title.setAttribute('data-id', id);
//         elem.abbreviation.value = doc.abbreviation;
//         editor.clear();
//         try {
//             let data = JSON.parse(doc.definition);
//             editor.render(data);
//         } catch (err) {
//             // could not parse JSON
//         }
//     }).catch(err => {
//         console.error(err);
//     });

//     // re-add event listeners
//     hasChanged = false;
//     addEventListeners();
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

export function createTermDom(doc){

    let li = document.createElement('li'); 
    li.className = 'li_wrapper';
    li.setAttribute('id', "term " + doc._id);
    li.setAttribute('data-id', doc._id);
    let form = document.createElement('form');
        form.className="document-editor";
    let date = document.createElement('div');
        date.id="doc_date";
        date.innerHTML=doc._id.substring(0,10);
    let title = document.createElement('input');
        title.id="document-title";
        title.setAttribute("aria-label","term");
        title.setAttribute("placeholder","Term");
    let title_val = sanitize(doc.title);
        if (title_val === "") {
            title_val = "Untitled";
        }
        title.value = title_val;
    let dictionaries = document.createElement('input');
        dictionaries.id="document-dictionaries-"+Math.random;
        dictionaries.setAttribute("aria-label","dictionaries");
        dictionaries.setAttribute("placeholder","Dictionaries");
    let abbreviation = document.createElement('input');
        abbreviation.setAttribute("aria-label","abbreviation");
        abbreviation.setAttribute("placeholder","Abbreviation");
    let editorjs = document.createElement('div');
        editorjs.id="editorjs "+ doc._id;
        editorjs.setAttribute("aria-label","content"); 
                            
    li.appendChild(form)
        .appendChild(date);
    form.appendChild(title);
    form.appendChild(dictionaries);
    form.appendChild(abbreviation);
    form.appendChild(editorjs);


    li.addEventListener('input', onDocumentChanged);
    return li;
}

window.addEventListener('load', init);
// window.addEventListener('beforeunload', saveDocument);