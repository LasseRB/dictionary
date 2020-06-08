import * as g from 'js/modules/global';
import * as s from 'js/modules/search';
import * as q from 'js/modules/query';

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
