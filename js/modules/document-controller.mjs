// const config = require('config');
import * as a from "./db/db-actions.mjs";
import * as db from "./db/db.mjs";
import * as g from "./global.mjs";
import * as s from "./search.mjs";
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
let dictionaryHistory = [];


function init() {
    // get elements

    elem.currentID = undefined; 
    elem.currentTitle = undefined;
    elem.currentDict = undefined;
    elem.currentAbbriv =undefined;
    elem.currentEditor =undefined;
    elem.editorWrapper = undefined;
    elem.currentCrossRef =undefined;



    //
    elem.termList = document.getElementById('term-list');
    elem.contextList = document.getElementById('context-list');

    // add and search functionality
    elem.newTermButton = document.getElementById('new-term');
    elem.newTerm = document.getElementById('search-term');
    elem.viewSettings = document.getElementById('button-view-list');
    elem.allApp = document.getElementById('app');

    // setup event listeners
    addEventListeners();
    elem.newTerm.focus();
    setTimeout(function (){
        toggleViews();
    },200);
}

function addEventListeners() {
   // let t_children = document.getElementsByClassName('li_term_wrapper');
    elem.newTermButton.addEventListener('click', onNewTermButton);
    elem.newTerm.addEventListener('input', clearFocusOnElement);
    elem.viewSettings.addEventListener('click', onViewSettings)
}
function onViewSettings(event){
    let dropdown = document.querySelector('.view-dropdown ul');
    if(window.getComputedStyle(dropdown).getPropertyValue('display') == 'none'){
        dropdown.style.display = "block";
        let list = document.getElementById('aslist');
        let grid = document.getElementById('asgrid');
        list.addEventListener('click', ()=>{
            db.settings.setItem('settings', JSON.stringify({'docview': 'list'}));
            toggleViews();
            dropdown.style.display = "none";
        });
        grid.addEventListener('click', ()=>{
            db.settings.setItem('settings', JSON.stringify({'docview': 'grid'}));
            toggleViews();
            dropdown.style.display = "none";
        });
        // make buttons clickable
       
    } else{
        dropdown.style.display = "none";
    }
    
}
function toggleViews(){
    let termlist = document.querySelector('ul#term-list');
    let termlist_elem =document.getElementsByClassName('li_term_wrapper');
    
    let view = JSON.parse(db.settings.getItem("settings")).docview;
    if(view == 'list'){
        termlist.style.display = "inline-block";
        elem.viewSettings.children[0].src ="genericons/genericons-neue/hierarchy.svg";
        for(let i = 0; i < termlist_elem.length; i++){
            termlist_elem[i].style.margin= "0px auto";
            termlist_elem[i].style.width = "500px";
            termlist_elem[i].firstChild.children[1].style.fontSize= "35px";
        }
    }
    if(view == 'grid'){
        termlist.style.display = "flex";
        elem.viewSettings.children[0].src ="genericons/hierarchy_grid.svg";

        for(let i = 0; i < termlist_elem.length; i++){
            termlist_elem[i].style.margin= "20px auto";
            termlist_elem[i].style.width = "30%";
            termlist_elem[i].firstChild.children[1].style.fontSize= "30px";
        }

    }
}
function getOldVersions(){
 
        console.debug("old version:");
        a.getPrevVersion(elem.currentID);
}

export function setupEditor(doc) {
    console.log(doc.definition);
       const editor = new EditorJS({
            holder: 'editorjs '+ doc._id,

            tools: { 
                paragraph: {
                config: {
                  placeholder: 'Define ' + doc.title
                }
            },
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
            
            },
            data:((doc.definition === undefined) ? JSON.parse(doc.content) : JSON.parse(doc.definition))
            // autofocus: true
        });
        // addDataFromDatabase(doc, editor);
        editors.set(doc._id, editor);
    
        return editor;
}



export function addDataFromDatabase(doc){
    let newdef = doc.content;
    
    // if(newdef === undefined || newdef === null ||newdef === "" ){
    //     newdef = doc.definition;
    // }
    if(newdef === undefined || newdef === null ||newdef === "" )
    { newdef = `{"blocks":[
                        {"type":"paragraph",
                        "data":{
                            "text":""}
                        }],
                    "version":"2.18.0"}`;}
   console.debug("JSON: " + newdef);
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
    // return newdef;
}

function updateHistory(event){
    dictionaryHistory.push(event.target.value);
    console.debug("dictionary History:")
    console.debug(...dictionaryHistory);
}
export function assignFocusOnElement(event){
    console.debug('editorjs ' + elem.currentID);
    elem.currentID = event.currentTarget.id.substring(4).trim();
    elem.currentTitle = event.currentTarget.childNodes[0][0];
    elem.currentDict = document.getElementById('doc-dictionaries-'+elem.currentID);
    elem.currentEditor = editors.get(elem.currentID);
    elem.editorWrapper = document.getElementById('editorjs ' + elem.currentID);
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
    elem.editorWrapper = undefined;
    elem.currentAbbriv =undefined;
    elem.currentCrossRef=undefined;
}


export async function onDocumentChanged(event) {
    console.debug('has changed!');
    hasChanged = true;

    assignFocusOnElement(event);
   // getOldVersions();
   
    console.debug("id "+ elem.currentID + "\n"
                 + "title "+ elem.currentTitle.value + "\n"
                 + "dict "+ elem.currentDict.value + "\n"
                 + "abbriv "+ elem.currentAbbriv.value + "\n"
                 + "crossref"+ elem.currentCrossRef.value + "\n"
                 + "editor "+ elem.currentEditor + "\n");

    
    //s.updateTermTitle("cntx term " + elem.currentID, elem.currentTitle.value);
   // await g.createDictionaryList();
   
    s.createContextList();
    // document.getElementById(("cntx dictionary " + dictionaryHistory[dictionaryHistory.length-1]).id = "cntx dictionary " +elem.currentDict.value)
    //s.updateTermTitle("cntx dictionary " + dictionaryHistory[dictionaryHistory.length-1], elem.currentDict.value);
   
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
function setNewDoc(data){
    console.debug(elem.newTerm.value);
    let newTitle = "";

    if (elem.currentTitle === undefined && elem.newTerm.value != "") {
        newTitle = elem.newTerm.value;
    }
    else if (elem.currentTitle.value != undefined) {
        newTitle = elem.currentTitle.value;
    }

    let doc = new a.Document(
        newTitle,
        elem.currentAbbriv,
        elem.currentDict,
        JSON.stringify(data),
        elem.currentCrossRef,
    );
        // console.debug(elem.currentDict.value);
        //console.debug(doc);
    updateDoc(doc);
    
}
export function setNewDocFromImport(data, abbriv, title, crossref, dictionary) {
   
    let doc = new a.Document(
        title,
        abbriv,
        dictionary,
        JSON.stringify(data),
        crossref,
    );
        // console.debug(elem.currentDict.value);
        //console.debug(doc);
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
    
    if(document.getElementById("term " + id) != null){
        let target = document.getElementById("term " + id);
            // target.parentNode.scrollTop = target.offsetTop;
        // animation is nice, but it moves page to the left in 
        // an incorrect way
        target.scrollIntoView({behavior: "smooth", block: "end", inline: "center"});
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
    let dictionariesTitle = document.createElement('h3');
        dictionariesTitle.innerHTML = 'Dictionaries';
        dictionariesTitle.className = 'term-headers';
    let dictionaries = document.createElement('input');
        dictionaries.id="doc-dictionaries-"+doc._id;;
        dictionaries.className ="doc-dictionary"
        dictionaries.setAttribute("aria-label","dictionaries");
        dictionaries.setAttribute("placeholder","Unsorted terms");
        dictionaries.addEventListener('beforeinput', updateHistory);
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

    let editorJSTitle = document.createElement('h3');
        // editorJSTitle.innerHTML = 'Definition';
        editorJSTitle.className = 'term-headers';
    
    let editorjs = document.createElement('div');
        editorjs.id="editorjs "+ doc._id;
        editorjs.className = "editorjs-wrapper";
        editorjs.setAttribute("aria-label","content");
  
        //add content from database
    let abbreviationTitle = document.createElement('h3');
        abbreviationTitle.innerHTML = 'Abbreviation';
        abbreviationTitle.className = 'term-headers';
    let abbreviation = document.createElement('input');
        abbreviation.id="doc-abbreviation-"+doc._id;
        abbreviation.className = "abbreviation-wrapper";
        abbreviation.setAttribute("aria-label","abbreviation");
        abbreviation.setAttribute("placeholder","");
        abbreviation.value = doc.abbreviation;
    let crossrefTitle = document.createElement('h3');
    crossrefTitle.innerHTML = 'Cross reference';
    crossrefTitle.className = 'term-headers';
    let crossref = document.createElement('input');
        crossref.id="doc-crossref-"+doc._id;
        crossref.className = "crossref-wrapper";
        crossref.setAttribute("aria-label","crossref");
        crossref.setAttribute("placeholder","See also");
        crossref.value = doc.crossref;
        
    li.appendChild(form)
        .appendChild(date);
    form.appendChild(title);
    form.appendChild(dictionariesTitle);
    form.appendChild(dictionaries);
    form.appendChild(editorJSTitle);
    form.appendChild(editorjs);
    form.appendChild(abbreviationTitle);
    form.appendChild(abbreviation);
    form.appendChild(crossrefTitle);
    form.appendChild(crossref);
    li.addEventListener('click', assignFocusOnElement)
    li.addEventListener('input', onDocumentChanged);

    return li;
}


window.addEventListener('load', init);

// window.addEventListener('beforeunload', saveDocument);