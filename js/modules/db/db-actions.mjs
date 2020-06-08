import * as g from '../global.mjs';

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
   export function enterWord(event){
    if(event.code === "Enter"){
        if(elem.wordDom.value !== ""){
        addWord(elem.wordDom.value, elem.defDom.value, elem.dicDom.value, elem.tagDom.value);
        elem.wordDom.value = '';
        elem.defDom.value = '';
        elem.tagDom.value = '';
      }else{
          alert('please fill out word box');
      }
    }
}
export function seperateTags(tags){
    var tags_array = [];
    if(tags.length > 0){
      tags_array = tags.split(",");
    }
    return tags_array; 
  }
  
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
export function removeWord(word){
    db.remove(word);
}

   

export function wordEditFocus(word){
    var div = document.getElementById('li_' + word._id);
    var inputEditWord = document.getElementById('input_title_' + word._id);
    div.className = 'editing';
    inputEditWord.focus();
}

export function wordUpdate(word, event){
    var inputWord = document.getElementById('input_title_' + word._id).value.trim();
    var inputDef = document.getElementById('input_def_' + word._id).value.trim();
    var inputTag = document.getElementById('input_tag_' + word._id).value.trim();
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
export function enterKeyPressed(word, event) {
    if (event.code === "Enter") {
    var inputEditWord = document.getElementById('input_title_' + word._id);
    inputEditWord.blur();
    wordUpdate(word,event);
    }
}

window.onload = init;