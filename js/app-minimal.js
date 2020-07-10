import * as g from './modules/global.mjs';
import * as s from './modules/search-minimal.mjs';
import * as q from './modules/db/db-query.mjs';

'use strict';

const app = {};

app.init = function () {
    exportbtn.addEventListener('click', event =>{
        dbf.handleImport();
    });
    importbtn.addEventListener('change', dbf.handleImport);
};

window.addEventListener('load', app.init);
