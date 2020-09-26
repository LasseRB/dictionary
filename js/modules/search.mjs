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
    elem.contextList = document.getElementById('context-list-ul');
    // fire the search button click event, when enter key is pressed in search field
    elem.searchTerm.addEventListener('keyup', onSearchChange);
   
    
    // create visible list of titles, setup search array and initialize Fuse
    
    createDictionaryList();
    
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
        shouldSort: true,
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
    
    let c_children = document.getElementsByClassName('cntx term');
    let t_children = document.getElementsByClassName('li_term_wrapper');
    if (searchTerm.value === "") {
        for (let i = 0; i < t_children.length; i++) {
            
           
            c_children[i].parentElement.style.removeProperty('display');
            t_children[i].style.removeProperty('display');
        }
        // todo: revert order back to default
    } else {
        
        searchMatches = getSearchResults(searchTerm.value);

        for (let i = 0; i < t_children.length; i++) {
            t_children[i].style.setProperty('display', 'none');
            c_children[i].parentElement.style.setProperty('display', 'none');
            
        }

        searchMatches.forEach(match => {
           document.getElementById("cntx term " + match.item.doc._id).parentElement.style.removeProperty('display');
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

// create dictionary Map<String, Doc>
export function createDictionaryList() {

    q.getTermList().then(res => {
        for (let i = 0; i < res.docs.length; i++) {
            console.debug(res.docs[i]);
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
    
    }).then(() => {
        console.warn("Dictionary Map created:")
        console.debug([...dictionaries]);
        //run here for 
        createContextList();
    }).catch(err =>{
        console.error(err);
    });
}

/**
 * Creates the list of documents that are displayed and can be searched.
 */
export function createContextList() {
  
    // let y = document.createElement('div');
    // y.value = dictionaries.get("HTML");
    // elem.contextList.appendChild(y);


//    console.debug(y.value);
//    dictionaries.forEach((value,key) =>{
    // console.debug(key + " "+ value.length +" \n");
    // console.debug(value.forEach(val => console.debug(val.title)));});


        dictionaries.forEach((value,key) =>{
            // console.debug(key + " "+ value.length +" \n");
            // console.debug(value.forEach(val => console.debug(val.title)));
            let li = document.createElement('li');
                li.id = "cntx dictionary li " + Date.now();
                
            let dictionary = document.createElement('input');
                dictionary.className= "cntx dictionary";
                dictionary.id = "cntx dictionary " + Date.now();

                dictionary.setAttribute("type", "button");
                dictionary.value = key.trim();
            let ol = document.createElement('ol');
                
            
               
            value.forEach(val => {
                // console.debug("context "+val.title)
                ol.appendChild(contextDOM(val))
                //elem.contextList.appendChild(contextDOM(val));
            });

            li.appendChild(dictionary);
            li.appendChild(ol);

    
   
    elem.contextList.appendChild(li);  
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
            // item.innerText = title;
            // item.innerHTML = title;
            item.addEventListener('click', event => {
                console.log("clicked " + item.id);
                onTermClicked(event);
            });

            addSearchItem(item, doc);
            li.appendChild(item);
            return li;

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
       // selected.push(btn);
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
