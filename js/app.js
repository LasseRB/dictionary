import * as g from './modules/global.mjs';
import * as s from './modules/search.mjs';
import * as q from './modules/db/db-query.mjs';
import * as dbf from './modules/db/db-save.mjs'



'use strict';

const app = {};

app.init = function () {
    //hvorfor kan jeg ikke gøre dette i et af modulerne? For disallowed mime-type errors. 
    // const exportbtn = document.getElementById('button-export');
    // const importbtn = document.getElementById('file-import');
    // exportbtn.addEventListener('click', event =>{
    //     dbf.handleImport();
    // });
    // importbtn.addEventListener('change', dbf.handleImport);

  
};

window.addEventListener('load', app.init);
