import * as g from '../global.mjs';
import * as q from './db-query.mjs';

/**
 * This module us used to do perform basic insert, remove, update functions
 * on the database.
 */

'use strict';

let elem = {
    wordDom: document.getElementById('new_word'),
    defDom: document.getElementById('new_definition'),
    dicDom:  document.getElementById('dictionaries'),
    tagDom: document.getElementById('tags')
};

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
export var Document = function(title, abbreviation, tags, content, _id = undefined) {
    if (title === undefined) title = "Untitled";
    if (abbreviation === undefined) abbreviation = "";
    if (tags === undefined) tags = [];
    if (content === undefined || content == null) content = "";
    if (_id === undefined) _id = createId();

    tags.forEach((tag, i) => {
        tags[i] = sanitize(tag);
    });

    this._id = _id;
    this.title = sanitize(title);
    this.abbreviation = sanitize(abbreviation);
    this.tags = tags;
    this.content = sanitize(content);
}

export function createId() {
    return new Date().toISOString();
}
/**
 * On enter key, this function takes DOM values and pass them to addWord.
 * If the input for word is empty, an error alert is shown.
 * @param  {} event
 */
export function enterWord(event){
if(event.code === "Enter"){
    if(elem.wordDom.value !== ""){
    addWord(elem.wordDom.value, elem.defDom.value, elem.dicDom.value, elem.tagDom.value);
    elem.wordDom.value = '';
    elem.defDom.value = '';
    elem.tagDom.value = '';
    } else{
            alert('please fill out word box');
         }
    }
}
/**
 * Finds words seperated by comma and return them as strings in array.
 * @param  {string} tags
 * @returns {Array<string>} tags_array
 */
export function seperateTags(tags){
    var tags_array = [];
    if(tags.length > 0){
      tags_array = tags.split(",");
    }
    return tags_array;
  }
/**
 * Adds (puts) a word-object to the database
 * @param  {string} text
 * @param  {string} definition
 * @param  {string} dictionary
 * @param  {Array<string>} tags
 */
export function addWord(text, definition, dictionary, tags) {
    var word = {
        _id: createId(),
        title: text,
        abbreviation: '', // todo: get from input
        searchTitle: text.searchify(),
        searchAbbreviation: '', // todo: use searchify() on abbreviation
        definition: definition,
        dictionary: dictionary,
        tags: seperateTags(tags)
    }
    db.put(word).then(function (result){
        console.log(word);
       
    }).catch(function(error){
        console.log(error);
    });
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
export function wordUpdate(word, event){
    let inputWord = document.getElementById('input_title_' + word._id).value.trim();
    let inputDef = document.getElementById('input_def_' + word._id).value.trim();
    let inputTag = document.getElementById('input_tag_' + word._id).value.trim();
    if(!inputWord){
        db.remove(word);
    } else{
        word.title = inputWord;
        word.definition = inputDef;
        word.tags = seperateTags(inputTag);
        word.abbreviation = ''; // todo: get from input
        word.searchTitle = inputWord.searchify();
        word.searchAbbreviation = ''; // todo: use searchify() on abbreviation
        db.put(word);
    }
}

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
        res.definition = doc.content;
        res.tags = doc.tags;
        return g.db.put(res);
    }).catch(err => {
        console.error(err);
        throw err;
    });


}

window.onload = init;