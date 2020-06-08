import * as g from '../global.mjs';
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
export function init (){
    //leave this here for later
}

export var db = g.db;
   //respond to enter-pressed

   
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
export function addWord(text, definition, dictionary, tags){

    var word = {
        _id: new Date().toISOString(),
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


window.onload = init;