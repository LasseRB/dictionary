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
let dictionaries = new Map();

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
    
    updateDictionaryList();
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
    
    let c_children = elem.contextList.getElementsByTagName('input');
    let t_children =document.getElementsByClassName('li_wrapper');
  
    if (searchTerm.value === "") {
        for (let i = 0; i < c_children.length; i++) {
            c_children[i].style.removeProperty('display');
            t_children[i].style.removeProperty('display');
        }
        // todo: revert order back to default
    } else {
        
        searchMatches = getSearchResults(searchTerm.value);

        for (let i = 0; i < c_children.length; i++) {
            t_children[i].style.setProperty('display', 'none');
            c_children[i].style.setProperty('display', 'none');
            
        }

        searchMatches.forEach(match => {
           document.getElementById("cntx " + match.item.doc._id).style.removeProperty('display');
           document.getElementById("term " + match.item.doc._id).style.removeProperty('display');
           match.item.element.parentNode.appendChild(match.item.element);
      
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
   // location.reload(); 

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
    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
            
            res.docs[i].tags.forEach(tag => {
               
                if(dictionaries.has(tag)){
                   let all_words;
                   all_words = dictionaries.get(tag);
                    all_words.push(res.docs[i]);
                    dictionaries.set(tag, all_words);
                } else{
           
                    dictionaries.set(tag, [res.docs[i]]);
                }
                   // let array = dictionaries.get(res.docs[i].title);
            
            });
        
               
          
        
          
        }
        // dictionaries.forEach((docarray, key)=>{
        //     let vals = [];
        //     docarray.forEach(doc => {console.debug(doc.title)});
        //     //console.debug(key+ ": " + vals);
        // })

        dictionaries.forEach((v,k) =>{
            console.debug(k + " "+ v.length +" \n");
            console.debug(v.forEach(val => console.debug(val.title)));
  
           })
       return dictionaries;

    }).catch(err =>{
        console.error(err);
    });
}

/**
 * Creates the list of documents that are displayed and can be searched.
 */
export function createContextList() {
    new Promise = ((resolve,reject) => {
        
        dictionaries.forEach((value,key)=> {
            let dictionary = document.createElement('input');
                dictionary.className= "cntx dictionary";
                dictionary.id = "cntx dictionary " + Date.now();
        //         item.setAttribute('data-id', res.docs[i]._id);
                dictionary.setAttribute("type", "button");
                dictionary.value = key;
            let ul = document.createElement('ul');
                dictionary.appendChild(ul);

                for(let i = 0; i < value.length; i++){
                    dictionary.appendChild(termContextElement(value[i]));
                    console.debug("append document: " + value[i].title)
                }
                elem.contextList.appendChild(dictionary);

    });
    
}).then(() => {
    updateFuse(); // always re-initialize Fuse after changing content
})
    
  
}

function termContextElement(doc){
    //  create actual term text //
            let item = document.createElement('input');
            item.setAttribute('id', "cntx " + res.docs._id);
            item.setAttribute('data-id', res.docs._id);
            item.setAttribute("type", "button");
            // item.setAttribute('type', 'checkbox');
            

            let title = sanitize(res.docs.title);
            if (title === "") {
                title = "Untitled";
            }
            item.value = title;
            // item.innerText = title;
            // item.innerHTML = title;
            item.addEventListener('click', event => {
                console.log("clicked " + item.id);
                onTermClicked(event)
            })

            addSearchItem(item, doc);
            return item;

}

export function createTermList(){
    
    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
            let term = dc.createTermDom(res.docs[i]);
            //console.log(term);
                elem.termList.appendChild(term);
                dc.setupEditor(res.docs[i]);    
                addSearchItem(term, res.docs[i]);
            }
        }).then(() => {
            updateFuse(); // always re-initialize Fuse after changing content
        }).catch((err) => {
            console.log(err);
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
    let btn = event.target;
    let id = btn.getAttribute('data-id');
        selected.push(btn);
        dc.displayDocument(id);
    // de-select previous
    // for (let i = 0; i < selected.length; i++)
    // {
    //     selected[i].checked = false;
    // }
    // selected.splice(0, selected.length);

    // select new
   
    // }
}

window.addEventListener("load", init);
//window.addEventListener("load", updateCount);
