import * as g from './modules/global.mjs';
import * as s from './modules/search.mjs';
import * as q from './modules/query.mjs';

'use strict';

const app = {};

app.inputs = {};

app.init = function () {
    // get elements
    app.inputs.searchDictionary = document.getElementById('search-dictionary');
    app.inputs.searchTerm = document.getElementById('search-term');

    // setup event listeners
    app.inputs.searchDictionary.addEventListener('keyup', event => {
        app.onSearchChange(event, app.inputs.searchDictionary);
    });

    app.inputs.searchTerm.addEventListener('keyup', event => {
        app.onSearchChange(event, app.inputs.searchTerm);
    });
};

app.onSearchChange = function (event, elem) {
    if (event.code === 'Enter') {
        // todo: select top result
    } else {
        let str = elem.value.searchify();
        console.log(str);
    }
};

window.onload = app.init;
