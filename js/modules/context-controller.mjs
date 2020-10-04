import * as g from "./global.mjs";
import * as dc from "./document-controller.mjs";
import * as s from "./search.mjs";
import * as q from "./db/db-query.mjs";
import * as a from "./db/db-actions.mjs";


function init(){
  // contextlist to be moved into this method call
    s.createContextList();

}

window.addEventListener('load', init);