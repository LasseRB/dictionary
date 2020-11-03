
import * as s from "./search.mjs";
import * as q from "./db/db-query.mjs";

let elem = {};

function init() {
    elem.termButton = document.getElementById('button-contextToggle');
    // elem.styleButton = document.getElementById('button-style');
    // elem.exportButton = document.getElementById('button-export');
    // elem.dictionaryView = document.getElementById('view-dictionary');
    elem.contextView = document.getElementById('view-context');
    elem.contextList = document.getElementById('context-list');
    
    elem.searchTerm = document.getElementById('search-term');
    elem.termButton.addEventListener('click', onTermButtonClicked);
    // elem.styleButton.addEventListener('click', onStyleButtonClicked);
    
    
   
    updateCount();
 
}

function onTermButtonClicked(event) {
  
        if (elem.contextView.style.display === 'none')
        {
            elem.contextView.style.removeProperty('display');
        }
        else
        {
            elem.contextView.style.setProperty('display', 'none');
        }
    }

function onStyleButtonClicked(){
        let style = document.getElementById('style1');
        style.setAttribute('href', "style/style1.css");
}    

function updateCount(){
    setTimeout(function (){
        q.getTermList().then(res => {
            elem.dbCount = document.getElementById('dbsize');
            elem.dbCount.innerHTML = res.docs.length + " terms";
            s.updateSearch(elem.searchTerm);
            elem.searchTerm.value = "";
           // for (let i = 0; i < res.docs.length; i++) {}
        }).catch(err=>{
            console.error(err);
        });
        

       

}, 200);
}



window.addEventListener('load', init);