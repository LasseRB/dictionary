import * as g from './modules/global.mjs';
import * as s from './modules/search.mjs';
import * as q from './modules/db/db-query.mjs';
import * as ui from './modules/drawUI.mjs';
import * as dbaction from './modules/db/db-actions.mjs';
import * as dbexport from './modules/db/db-save.mjs';

'use strict';

const app = {};

app.inputs = {};

/**
 * App initialisation 
 */
app.init = function () {
    /**
     * HTML ELEMENTS
     */
    
    app.inputs.searchTerm = document.getElementById('search-term');
    app.inputs.wordDom = document.getElementById('new_word');
    app.inputs.defDom = document.getElementById('new_definition');
 
    var searchDictionary = app.inputs.searchDictionary;
    var searchTerm = app.inputs.searchTerm;
    var wordDom = app.inputs.wordDom;
    var defDom = app.inputs.defDom;

    
    /**
     * EVENT LISTENERS
     */
        wordDom.addEventListener('keypress', dbaction.enterWord, false);
        defDom.addEventListener('keypress', dbaction.enterWord, false);
       
        searchTerm.addEventListener('keyup', event => {
            app.onSearchChange(event, app.inputs.searchTerm);
            });
     
            dbexport.handleExport();
        
            // updates the window on changes to database
    g.db.changes({
        since: 'now',
        live: true
    }).on('change', ui.showWords);
    
    ui.showWords();
    sync();
};
/**
 * Mortens WIP searching functionality. 
 * Logs what user types in search bar actively.
 * @param  {} event
 * @param  {} elem
 */
app.onSearchChange = function (event, elem) {
    if (event.code === 'Enter') {
        // todo: select top result
    } else {
        let str = elem.value.searchify();
        console.log(str);
    }
};



function sync() {
    // todo: implement remote sync
}

if (g.remoteDb) {
    sync();
  }

window.onload = app.init;
