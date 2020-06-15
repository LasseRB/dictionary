import {db} from '../global.mjs';
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
    db.allDocs({include_docs: true}, (error, doc) => {
      if (error) console.error(error);
      else download(
        JSON.stringify(doc.rows.map(({doc}) => doc)),
        'tracker.db',
        'text/plain'
      );
    });
  }

export function handleImport ({target: {files: [file]}}) {
    if (file) {
      const reader = new FileReader();
      reader.onload = ({target: {result}}) => {
        db.bulkDocs(
          JSON.parse(result),
          {new_edits: false}, // not change revision
          (...args) => console.log('DONE', args)
        );
      };
      reader.readAsText(file);
    }
  }