
import * as s from "./search.mjs";
import * as q from "./db/db-query.mjs";
import * as dbs from "./db/db-save.mjs";
import * as db from "./db/db.mjs";

let elem = {};

function init() {
    elem.termButton = document.getElementById('button-contextToggle');
    // elem.styleButton = document.getElementById('button-style');
    elem.exportButton = document.getElementById('button-export');
    elem.exportButton.addEventListener('click', dbs.handleExport);
    elem.importButton = document.getElementById('importBtn');
    elem.importButton.addEventListener('click', dbs.handleImport);
    // elem.dictionaryView = document.getElementById('view-dictionary');
    elem.contextView = document.getElementById('view-context');
    elem.contextList = document.getElementById('context-list');
    
    elem.searchTerm = document.getElementById('search-term');
    elem.termButton.addEventListener('click', onTermButtonClicked);
    // elem.styleButton.addEventListener('click', onStyleButtonClicked);
    elem.viewBtn = document.getElementById('button-view-list');
    
    setTimeout(function (){
    updateCount();
    checkSettings();
    }, 200);
}


function onTermButtonClicked(event) {
  
        if (elem.contextView.style.display === 'none')
        {
            elem.contextView.style.removeProperty('display');
            db.settings.setItem('settings', JSON.stringify({'ctxview': 'display'}));

        }
        else
        {
            db.settings.setItem('settings', JSON.stringify({'ctxview': 'hidden'}));
            elem.contextView.style.setProperty('display', 'none');
        }
    }

function onStyleButtonClicked(){
        let style = document.getElementById('style1');
        style.setAttribute('href', "style/style1.css");
}    

function updateCount(){
 
        q.getTermList().then(res => {
            elem.dbCount = document.getElementById('dbsize');
            elem.dbCount.innerHTML = res.docs.length + " terms";
           
            // s.updateSearch(elem.searchTerm);
            // elem.searchTerm.value = "";
           // for (let i = 0; i < res.docs.length; i++) {}
        }).catch(err=>{
            console.error(err);
        });
}

function checkSettings(){
    let ctxview = JSON.parse(db.settings.getItem("settings")).ctxview;
    let docview = JSON.parse(db.settings.getItem("settings")).docview;
    
    //doc
    if(docview === 'list'){
        elem.viewBtn.children[0].src ="genericons/genericons-neue/hierarchy.svg";
    }else if(docview === 'grid'){
        elem.viewBtn.children[0].src ="genericons/hierarchy_grid.svg";
    }

    //ctx
    if(ctxview === 'display'){
        elem.contextView.style.setProperty('display', 'none');

    } else if(ctxview === 'hidden'){
        elem.contextView.style.removeProperty('display');
    }

}


window.addEventListener('load', init);