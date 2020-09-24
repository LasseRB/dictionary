import * as g from '../global.mjs';
import * as q from './db-query.mjs';

/**
 * This module us used to do perform basic insert, remove, update functions
 * on the database.
 */

'use strict';


let sanitize = DOMPurify.sanitize;

export function init (){

    //leave this here for later
}

export var db = g.db;
   //respond to enter-pressed

/**
 * Document object used for updating documents in database. It creates a new id
 * @param {string} title
 * @param {string} abbreviation
 * @param {[string]} tags
 * @param {string} content
 * @param {string|undefined} _id
 */
export var Document = function(title, abbreviation, tags, content, crossref, _id = undefined) {
    if (title === undefined) title = "Untitled";
    if (abbreviation === undefined) abbreviation = "";
    if (crossref === undefined) crossref = "";    
    if (tags === undefined){
        tags = []; 
        tags.value = []; 
    }  
    if (content === undefined || content == null) content = "";
    
    if (_id === undefined) _id = createId();

    this._id = _id;
    this.title = sanitize(title);
    this.abbreviation = sanitize(abbreviation.value); 
    this.crossref = sanitize(crossref.value); // should become links eventually
    this.tags = seperateTags(tags);
    //sanitation of the content ruins inline code :S
    this.content = content;
  
   
   
    this.tags.forEach((tag, i) => {
        tags[i] = sanitize(tag);
    });
}

export function createId() {
    return new Date().toISOString();
}

/**
 * Finds words seperated by comma and return them as strings in array.
 * @param  {string} tags
 * @returns {Array<string>} tags_array
 */
export function seperateTags(tags){
    var tags_array = [];
    if(tags.value.length > 0){
      tags_array = tags.value.split(",");
    }
    return tags_array;
  }

/**
 * Removes a word from the database
 * @param {Object<word>} word
 */
export function removeWord(word){
    db.remove(word);
}

/**
 * Update word object in database
 * @param  {Object<word>} word
 * @param  {} event
 */


/**
 * Create a new document in the database using the given Document object.
 * @param {Document} doc
 */
export function createDocument(doc) {
    g.db.put(doc).then(res => {
        console.log("Created document!");
        return res;
    }).catch(err => {
        console.error(err);
        throw err;
    });
}

/**
 * Update the document title with the specified id in the database. Make sure to sanitize input!
 * @param {Document} doc
 */
export function updateDocument(doc) {
    g.db.get(doc._id).then(res => {
        console.log("Updated document!");
        res.title = doc.title;
        res.abbreviation = doc.abbreviation;
        res.crossref = doc.crossref;
        res.definition = doc.content;
        res.tags = doc.tags;
        return g.db.put(res);
    }).catch(err => {
        console.error(err);
        throw err;
    });


}

window.onload = init;