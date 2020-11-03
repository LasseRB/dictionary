import * as db from "./db/db.mjs";
import * as g from "./global.mjs";
import * as dc from "./document-controller.mjs";
import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";

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
async function init() {
    // respond to database changes
    db.db.changes({
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
    elem.contextList = document.getElementById('context-list-ul');
    // fire the search button click event, when enter key is pressed in search field
    elem.searchTerm.addEventListener('keyup', onSearchChange);
    // create visible list of titles, setup search array and initialize Fuse
   
        
     
        // clearContextList();
        // createContextList();
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
        threshold: 0.1,
        // distance: 100,
        // useExtendedSearch: false,
        keys: [
            "doc.title",
            "doc.abbreviation",
            "doc.dictionary",
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
    updateSearch(event.target);
    dc.displayTopDocument();
    // if (event.code === "Enter") {
    //     dc.displayTopDocument();
    // }
}
export function updateSearch(searchTerm){
    // clear array
    searchMatches.splice(0, searchMatches.length);
    let c_children = document.getElementsByClassName("li_cntx");
    let h1_children = document.getElementsByClassName("li_term_h1");
    let t_children = document.getElementsByClassName("li_term_wrapper");

    if (searchTerm.value === "") {
        for (let i = 0; i < c_children.length; i++) {
           c_children[i].style.removeProperty('display');
           t_children[i].style.removeProperty('display');


        }
    } else {
        
        searchMatches = getSearchResults(searchTerm.value);

        for (let i = 0; i < c_children.length; i++) {
           t_children[i].style.setProperty('display', 'none');
           c_children[i].style.setProperty('display', 'none');   

        }
        searchMatches.forEach(match => {
     
           document.getElementById("cntx term " + match.item.doc._id).parentElement.style.removeProperty('display');
           document.getElementById("term " + match.item.doc._id).style.removeProperty('display');

           // no reason to append the elements back
          // match.item.element.parentNode.appendChild(match.item.element);
      
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
   // 

    // todo: respond to database changes?
    if (change.deleted) {
        location.reload(); 
        // dc.onDocumentChanged(change.target);
        // note: the deleted document object is not passed completely, however _id and _rev is passed
        //
    } else {
        // modified document
    }
}

// create dictionary Map<String, Doc>
export function updateContextList() {
        clearContextList();
        createContextList();
   
}


export function clearContextList() {
    while (elem.contextList.firstChild != null || elem.contextList.firstChild != undefined) {
        elem.contextList.removeChild(elem.contextList.firstChild);
    }
}
// this to be moved into term-view-controller
export function createTermList(){
    g.createDictionaryList().then( () =>{
        let res  = g.getDictionary();
        res.forEach((value,key) =>{
            let dict = document.createElement('h1');
                    dict.innerText = key;
                    dict.className = 'li_term_title';
                elem.termList.appendChild(dict);
            for (let i = 0; i < value.length; i++) {
                
               // console.debug("term:" + value[i].title);
                let term = dc.createTermDom(value[i]);
                //console.log(term);
                    elem.termList.appendChild(term);
                    dc.setupEditor(value[i]);    
                    addSearchItem(term, value[i]);
                }
            });
        }).then(() => {
            updateFuse(); // always re-initialize Fuse after changing content
        }).catch((err) => {
            console.log(err);
        });

}

// export function createTermList(){
//     q.getTermList().then(res => {
//         for (let i = 0; i < res.docs.length; i++) {
//             console.debug("term:" + res.docs[i].title);
//             let term = dc.createTermDom(res.docs[i]);
//             //console.log(term);
//                 elem.termList.appendChild(term);
//                 dc.setupEditor(res.docs[i]);    
//                 addSearchItem(term, res.docs[i]);
//             }
//         }).then(() => {
//             updateFuse(); // always re-initialize Fuse after changing content
//         }).catch((err) => {
//             console.log(err);
//         });
// }

/**
 * Creates the list of documents that are displayed and can be searched.
 */


export function createContextList() {
   g.createDictionaryList().then( () =>{
    clearContextList();
     let res  = g.getDictionary();
      res.forEach((value,key) =>{
         // console.debug(key + " "+ value.length +" \n");
         // console.debug(value.forEach(val => console.debug(val.title)));
         let li = document.createElement('li');
             li.id = "cntx dictionary li " + key;
             
         let dictionary = document.createElement('input');
             dictionary.className= "cntx dictionary";
             dictionary.id = "cntx dictionary " + key;
 
             dictionary.setAttribute("type", "button");
             dictionary.value = key.trim();
             dictionary.addEventListener('dblclick', ()=>{
                 
                    dictionary.setAttribute("type", "input");
                    dictionary.focus();
                 
             });
             dictionary.addEventListener('blur', ()=>{
                dictionary.className= "cntx dictionary";
                dictionary.setAttribute("type", "button");

             });
     
         let ol = document.createElement('ol');
         
         
         value.forEach(val => {
             // console.debug("context "+val.title)
             ol.appendChild(contextDOM(val));
             //elem.contextList.appendChild(contextDOM(val));
         });
             li.appendChild(dictionary)
             li.appendChild(ol);
        
        
        
         elem.contextList.appendChild(li);  
         
         });
        });
     

updateFuse(); // always re-initialize Fuse after changing content
}

function contextDOM(doc){
//  create actual term text //
        let li = document.createElement('li');
        li.id = "cntx list " + doc._id;
        li.className = "li_cntx";
        
        let item = document.createElement('input');
        item.setAttribute('id', "cntx term " + doc._id);
        item.className = "cntx term";
        item.setAttribute('data-id', doc._id);
        item.setAttribute("type", "button");
        // item.setAttribute('type', 'checkbox');
        

        let title = sanitize(doc.title.trim());
        if (title === "") {
            title = "Untitled";
        }
        item.value = title;

        let deleteBtn = document.createElement('button');
        deleteBtn.id = 'cntx_delete';
        deleteBtn.addEventListener('click', onDeleteBtn)

      
        item.addEventListener('click', event => {
            console.log("clicked " + item.id);
            onTermClicked(event);
        });

        addSearchItem(item, doc);
        li.appendChild(item);
        li.appendChild(deleteBtn);
       
        return li;

}

/**
 * Updates the title of element in the document list
 * @param {string} id
 * @param {string} newTitle
 */
export function updateTermTitle(id, newTitle) {
    if (id === undefined || id === "")
        return;
    document.getElementById(id).value = sanitize(newTitle);
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
    let btn = event.target;
    let id = btn.getAttribute('data-id');
        dc.displayDocument(id);

}
function onDeleteBtn(event){
    let confirmed = false;
    console.warn("sure you want to delete?") 
    event.target.classList.toggle("confirmDelete");
    
    event.currentTarget.addEventListener('click', () =>{
        confirmed = true;
        try {        
            q.getDocFromId(event.target.previousSibling.getAttribute('data-id')).then(doc =>{
                a.removeTerm(doc, confirmed);
            });  
           
        } catch (error) {
            console.error(error);
        }
    });

    setTimeout(()=>{
        event.target.classList.toggle("confirmDelete");
        confirmed = false;
       
    },3000);
}

window.addEventListener("load", init);
//window.addEventListener("load", updateCount);
