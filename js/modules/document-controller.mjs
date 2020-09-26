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
    elem.currentCrossRef =undefined;


    //
    elem.termList = document.getElementById('term-list');
    elem.contextList = document.getElementById('context-list');


    // add and search functionality
    elem.newTermButton = document.getElementById('new-term');
    elem.newTerm = document.getElementById('search-term');   

   elem.allApp = document.getElementById('app');


    // setup event listeners
    addEventListeners();
    elem.newTerm.focus();
    addBorder();

    
}

function addEventListeners(element) {
    let t_children = document.getElementsByClassName('li_term_wrapper');
    elem.newTermButton.addEventListener('click', onNewTermButton);
    elem.newTerm.addEventListener('input', clearFocusOnElement);
    elem.allApp.addEventListener('click', addBorder);
}

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
function addBorder(event){

    if(document.getElementById('search-term') === document.activeElement){
        document.getElementById('search-create-box').setAttribute("style", "border:solid 1px #00A3FF");
    }
    else{
        document.getElementById('search-create-box').setAttribute("style", "border:solid 0px #FFFFFF");
    }

}
export function assignFocusOnElement(event){

    elem.currentID = event.currentTarget.id.substring(4).trim();
    elem.currentTitle = event.currentTarget.childNodes[0][0];
    elem.currentDict = document.getElementById('doc-dictionaries-'+elem.currentID);
    elem.currentEditor = editors.get(elem.currentID);
   // elem.currentAbbriv = event.currentTarget.childNodes[0][2];
    elem.currentAbbriv = document.getElementById('doc-abbreviation-'+elem.currentID);
    elem.currentCrossRef = document.getElementById('doc-crossref-'+elem.currentID);
    console.debug("event.currentTarget.id: " + event.currentTarget.id);
    
}   
export function clearFocusOnElement(event){
    elem.currentID = undefined; 
    elem.currentTitle = undefined;
    elem.currentDict = undefined;
    elem.currentEditor =undefined;
    elem.currentAbbriv =undefined;
    elem.currentCrossRef=undefined;
}

function onDocumentChanged(event) {
    hasChanged = true;

    assignFocusOnElement(event);
   
    console.debug("id "+ elem.currentID + "\n"
                 + "title "+ elem.currentTitle.value + "\n"
                 + "dict "+ elem.currentDict.value + "\n"
                 + "abbriv "+ elem.currentAbbriv.value + "\n"
                 + "crossref"+ elem.currentCrossRef.value + "\n"
                 + "editor "+ elem.currentEditor + "\n");

   //console.debug("cntx term " + elem.currentID);
    // update title in list
    let test = "attempt at getting " + "cntx term " + elem.currentID;
    console.debug(test);
    s.updateTermTitle("cntx term " + elem.currentID, elem.currentTitle.value);
   
    if (saveTimer !== undefined) {
        clearTimeout(saveTimer);
    }
    //      term 2020-09-26T11:07:37.256Z
    // cntx term 2020-09-26T11:07:37.256Z

    // restart timer, save document after 1000 ms inactivity
    saveTimer = setTimeout(saveDocument(), 1000);
}
function onNewTermButton(){
    saveDocument();
    location.reload();
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
        elem.currentCrossRef,
    );
        // console.debug(elem.currentDict.value);
        console.debug(doc);
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
    console.debug("term " + id);
    //save existing first
    if (hasChanged) {
        saveDocument();
    }
    // remove event listeners to prevent firing after changing
    // @TODO: fix error here.. not super important
    if(document.getElementById("term " + id) != null){
        document.getElementById("term " + id).scrollIntoView({behavior: "smooth", block: "end", inline: "start"});
    } 
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
    li.className = 'li_term_wrapper';
    li.setAttribute('id', "term " + doc._id);
    li.setAttribute('data-id', doc._id);
    let form = document.createElement('form');
        form.className="document-editor";
    let date = document.createElement('div');
        date.className="doc-date";
        date.innerHTML=doc._id.substring(0,10);
    let title = document.createElement('input');
        title.className="document-title";
        title.id="doc-title-"+doc._id;
        title.setAttribute("aria-label","term");
        title.setAttribute("placeholder","Term");
    let title_val = doc.title;
        if (title_val === "") {
            title_val = "Untitled";
        }
        title.value = title_val;
    let dictionaries = document.createElement('input');
        dictionaries.id="doc-dictionaries-"+doc._id;
        dictionaries.setAttribute("aria-label","dictionaries");
        dictionaries.setAttribute("placeholder","Dictionaries");
        //dictionaries.value = doc.tags;
        doc.tags.forEach(element => {
            if(element === "Unsorted terms" || element === ["Unsorted terms"]){
                dictionaries.value += "";
            }else{
                dictionaries.value += element.trim() + ", ";
            }
           
        });;
        // remove the last comma
        dictionaries.value = dictionaries.value.substring(0,(dictionaries.value.length - 2))

    
    let editorjs = document.createElement('div');
        editorjs.id="editorjs "+ doc._id;
        editorjs.className = "editorjs-wrapper";
        editorjs.setAttribute("aria-label","content");
        //add content from database

    let abbreviation = document.createElement('input');
        abbreviation.id="doc-abbreviation-"+doc._id;
        abbreviation.className = "abbreviation-wrapper";
        abbreviation.setAttribute("aria-label","abbreviation");
        abbreviation.setAttribute("placeholder","Abbreviation");
        abbreviation.value = doc.abbreviation;
    let crossref = document.createElement('input');
        crossref.id="doc-crossref-"+doc._id;
        crossref.className = "crossref-wrapper";
        crossref.setAttribute("aria-label","crossref");
        crossref.setAttribute("placeholder","See also");
        crossref.value = doc.crossref;
        
    li.appendChild(form)
        .appendChild(date);
    form.appendChild(title);
    form.appendChild(dictionaries);
    form.appendChild(editorjs);
    form.appendChild(abbreviation);
    form.appendChild(crossref);


    li.addEventListener('input', onDocumentChanged);
    return li;
}


window.addEventListener('load', init);
// window.addEventListener('beforeunload', saveDocument);