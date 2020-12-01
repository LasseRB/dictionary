import * as database from './db.mjs';
import * as g from '../global.mjs';
import * as dc from '../document-controller.mjs';
// const database = require('./db.mjs');
// const g = require('../global.mjs');
// const dc = require( '../document-controller.mjs');

// following code stolen from https://stackoverflow.com/questions/37229561/how-to-import-export-database-from-pouchdb
// and https://stackoverflow.com/questions/13405129/javascript-create-and-save-file/30832210#30832210


export function download(data, filename, type) {
  var file = new Blob([data], {type: type});
  if (window.navigator.msSaveOrOpenBlob) // IE10+
      window.navigator.msSaveOrOpenBlob(file, filename);
  else { // Others
      var a = document.createElement("a"),
              url = URL.createObjectURL(file);
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      setTimeout(function() {
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);  
      }, 0); 
  }
}
export function handleExport() {
    database.db.allDocs({include_docs: true}, (error, doc) => {
      if (error) console.error(error);
      else download(
        JSON.stringify(doc.rows.map(({doc}) => doc)),
        Date.now()+'_defineApp.json',
        'text/plain'
      );
    });
  }

export function handleImport () {
 const input = document.getElementById("file-import");
  
  fetch(input.files[0].path)
  .then(response => response.json())
  .then(data => {
    for(var i = 0; i < data.length; i++){
      console.log(data[i].title);
      let editorcontent = data[i].content;
      console.debug(editorcontent);
        
        // editorcontent = editorcontent.substring(1, editorcontent -1);
        
      dc.setNewDocFromImport(editorcontent, data[i].abbreviation, data[i].title, data[i].crossref, data[i].tags)
    }
    // database.db.bulkDocs(data);
    // data.forEach(doc => {
    //   database.      
    // });
      
    }).then(function () {
      
      // return database.db.allDocs({include_docs: true});
    }).catch(error =>{
      console.error(error);

    });
  
  }