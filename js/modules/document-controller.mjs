import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";
import * as s from "./search.mjs";
import * as g from "./global.mjs";
import { getDocFromId } from "./db/db-query.mjs";

// // todo: ability to delete documents
// // todo: empty page instead of editor on open?
// // todo: create new document when clicking plus
// // todo: add "last modified date" field

let documentId = "";
let elem = {};
let saveTimer = undefined;
let sanitize = DOMPurify.sanitize;
let editors = new Map();
let hasChanged = false;


function init() {
    // get elements
    

    elem.currentID = undefined; 
    elem.currentTitle = undefined;
    elem.currentDict = undefined;
    elem.currentAbbriv =undefined;
    elem.currentEditor =undefined;


    //
    elem.termList = document.getElementById('term-list');
    elem.contextList = document.getElementById('context-list');


    // add and search functionality
    elem.newTermButton = document.getElementById('new-term');
    elem.newTerm = document.getElementById('search-term');   

  
   elem.searchTerm = document.getElementById('search-term');



    // setup event listeners
    addEventListeners();

    
}

function addEventListeners(element) {
    let t_children = document.getElementsByClassName('li_wrapper');
    elem.newTermButton.addEventListener('click', onNewTermButton);
    elem.newTerm.addEventListener('input', clearFocusOnElement);

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
                        defaultLevel: 1
                    }
                },
                inlineCode: {
               
                    class: InlineCode,
                    shortcut: 'CMD+E'
                },
                list: {
                    class: List,
                    inlineToolbar: true 
                },
                Marker: {
                    class: Marker,
                    shortcut: 'CMD+SHIFT+M'
                },
                quote: {
                    class: Quote,
                    inlineToolbar: true,
                    shortcut: 'CMD+SHIFT+O',
                    config: {
                        quotePlaceholder: 'Quote',
                        captionPlaceholder: 'Author'
                    }
                }
            
            }
        });
       // console.debug(doc._id + ": " + editor);
        
        addDataFromDatabase(doc, editor);
        editors.set(doc._id, editor);
        return editor;
}



export function addDataFromDatabase(doc, editor){
    let newdef = doc.definition;
    
    if(newdef === undefined || newdef === null ||newdef === "" ) newdef = `{"blocks":[
                                                                                {"type":"paragraph",
                                                                                "data":{
                                                                                    "text":""}
                                                                                }],
                                                                            "version":"2.18.0"}`;
   // console.debug("JSON: " + newdef);
    editor.isReady.then(() => {
        editor.clear();
        try {
            let data = JSON.parse(newdef);
            console.debug(data);
            editor.render(data);
        } catch (err) {
            // could not parse JSON
            console.error("could not parse JSON: \n" +err + "\n" +
                            "JSON that couldn't be parsed " + newdef);
            
        }

    }).catch(err =>{
        console.error(err);
    })
       



}

export function assignFocusOnElement(event){
    elem.currentID = event.currentTarget.id.substring(4).trim();
    elem.currentTitle = event.currentTarget.childNodes[0][0];
    elem.currentDict = event.currentTarget.childNodes[0][1];
    elem.currentAbbriv = event.currentTarget.childNodes[0][2];
    elem.currentEditor = editors.get(elem.currentID);
 
    
}
export function clearFocusOnElement(event){
    elem.currentID = undefined; 
    elem.currentTitle = undefined;
    elem.currentDict = undefined;
    elem.currentAbbriv =undefined;
    elem.currentEditor =undefined;
}

function onDocumentChanged(event) {
    hasChanged = true;

    assignFocusOnElement(event);
   
// 
    console.debug("id "+ elem.currentID + "\n")

    console.debug("id "+ elem.currentID + "\n"
                 + "title "+ elem.currentTitle.value + "\n"
                 + "dict "+ elem.currentDict.value + "\n"
                 + "abbriv "+ elem.currentAbbriv.value + "\n"
                 + "editor "+ elem.currentEditor + "\n");


    // update title in list
    s.updateTermTitle("cntx " + elem.currentID, elem.currentTitle.value);
   
    if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
    }

    // restart timer, save document after 1000 ms inactivity
    saveTimer = setTimeout(saveDocument(), 1000);
}
function onNewTermButton(){
   location.reload();
    saveDocument();
}

/**
 * Saves the current document to the database.
 */
export function saveDocument() {
    console.log("Save document!");

     // sanitize the input
    if(elem.currentEditor === undefined){
        setNewDoc("");
    }else{
        elem.currentEditor.isReady.then(
            elem.currentEditor.save().then(data => {
            // If no title, term gets todays date
            // This I might remove in the new design with search bar
        
            // if (elem.currentTitle.value === "" && elem.newTerm.value === "") {
            //     const date = new Date();
            //     const year = date.getFullYear();
            //     const month = (date.getMonth() + 1).toPaddedString();
            //     const day = date.getDate().toPaddedString();
            //     const hours = date.getHours().toPaddedString();
            //     const minutes = date.getMinutes().toPaddedString();
            //     const seconds = date.getSeconds().toPaddedString();

            //     elem.currentTitle.value = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
            // } else if(elem.newTerm.value != "" && elem.currentTitle.value != elem.newTerm.value)
            //     {
            //     elem.currentTitle.value  = elem.newTerm.value;
            //     elem.newTerm.value = '';
            //    // updateDoc();
            //     }
            setNewDoc(data);

            }).catch((err) => {
                console.error(err);
        })).catch(err =>{
            console.error(err);
        });
    }
    // }
   
}
function setNewDoc(data) {
    console.debug(elem.newTerm.value);
    let newTitle = "";

    if (elem.currentTitle === undefined && elem.newTerm.value != "") {
        newTitle = elem.newTerm.value;
    }
    else if (elem.currentTitle.value != undefined) {
        newTitle = elem.currentTitle.value;
    }
s
    let doc = new a.Document(
        newTitle,
        elem.currentAbbriv,
        elem.currentDict,
        JSON.stringify(data),
    );

    updateDoc(doc);

}

export function updateDoc(doc){

    console.debug("updateDoc called!");
        // create new document or update existing
   let id = elem.currentID;
        if (id === null || id === ""|| id === undefined) {
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
    // remove event listeners to prevent firing after changing
    // @TODO: fix error here.. not super important
    document.getElementById("term " + id).scrollIntoView({behavior: "smooth", block: "start", inline: "nearest"});

   


    hasChanged = false;

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
    let title_val = doc.title;
        if (title_val === "") {
            title_val = "Untitled";
        }
        title.value = title_val;
    let dictionaries = document.createElement('input');
        dictionaries.id="document-dictionaries-"+Math.random;
        dictionaries.setAttribute("aria-label","dictionaries");
        dictionaries.setAttribute("placeholder","Dictionaries");
        doc.tags.forEach(element => {
            dictionaries.value += element +" ";
        });;

    let abbreviation = document.createElement('input');
        abbreviation.setAttribute("aria-label","abbreviation");
        abbreviation.setAttribute("placeholder","Abbreviation");
        abbreviation.value = doc.abbreviation;
    let editorjs = document.createElement('div');
        editorjs.id="editorjs "+ doc._id;
        editorjs.setAttribute("aria-label","content"); 
        //add content from database
        
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