import * as g from "./global.mjs";
import * as dbactions from './db/db-actions.mjs';
export function showWords() {

    g.db.allDocs({include_docs: true, descending: true}, function(err, doc) {
      redrawWordsUI(doc.rows);
    });
  }

export function redrawWordsUI(words) {
    let wordsUL = document.getElementById('word_list');
    wordsUL.innerHTML = '';

    words.forEach(function(word) {
        wordsUL.appendChild(createWordListItem(word.doc));
    });
}

export function createWordListItem(word){
    //remove button
      var remove = document.createElement('button');
      remove.className = 'destroy';
      remove.addEventListener('click', dbactions.removeWord.bind(this, word));
   
    // titel
      var wordLabel = document.createElement('label');
      var definitionLabel = document.createElement('definition');
      wordLabel.appendChild(document.createTextNode(word.title))
      definitionLabel.appendChild(document.createTextNode(word.definition))
    
    // dictionary  
      var dict = document.createElement('dictionary');
      dict.appendChild(document.createTextNode(word.dictionary));
   
    //tags 
    var tags = document.createElement('ul');
    tags.id = 'tags_' + word._id;
    tags.className = 'tags';
    for(let i = 0; i < word.tags.length; i++){
      var randomColor = Math.floor(Math.random()*16777215).toString(16);
      var li = document.createElement('li');
      var div = document.createElement('div');
      div.id = 'tag_'+[i]+'_' + word._id;
      li.id = 'li_'+[i]+'_' + word._id;
      div.className ='tag_div';
      li.appendChild(document.createTextNode(word.tags[i]));
      div.appendChild(li);
      tags.appendChild(div);
      div.style.backgroundColor = "#" + randomColor;
      div.style.right = 20+ (i*10) + 'px';
    }
    tags.addEventListener('click', ()=> {
      if(tags.className === "tags"){
        tags.className ="tags_clicked"; 
        
        for(let i = 0; i < word.tags.length; i++){
          var div_i = document.getElementById( div.id = 'tag_'+[i]+'_' + word._id);
          div_i.className = 'tag_div_clicked';
          div_i.style.right = 20+ (i*40) + 'px';
        }
      }
      else if(tags.className === "tags_clicked"){
        tags.className = "tags"; 
        for(let i = 0; i < word.tags.length; i++){
          var div_i = document.getElementById( div.id = 'tag_'+[i]+'_' + word._id);
          div_i.className ='tag_div';
          div_i.style.right = 20+ (i*10) + 'px';
        }
       
      }}); 
    

    //* input_editWord and input_editDefinition should only appear on toggle */
    //edit title 
      var input_editWord = document.createElement('input');
      input_editWord.id= 'input_title_' + word._id;
      input_editWord.className = 'edit';
      input_editWord.value = word.title;
    //edit definition
      var input_editDefinition = document.createElement('textarea');
      input_editDefinition.id= 'input_def_' + word._id;
      input_editDefinition.className = 'edit';
      input_editDefinition.value = word.definition;
    
    //edit tags
      var input_editTags = document.createElement('input');
      input_editTags.id= 'input_tag_' + word._id;
      input_editTags.className = 'tags_edit';
      input_editTags.value = word.tags; 
      
    // edit collection
      let editDiv = document.createElement('div');
      editDiv.id = 'editbox_' + word._id;
      editDiv.appendChild(input_editWord);
      editDiv.appendChild(input_editDefinition);
      editDiv.appendChild(input_editTags);
      editDiv.addEventListener('blur', dbactions.wordUpdate.bind(this, word));
      editDiv.addEventListener('keypress', dbactions.enterKeyPressed.bind(this, word));
    
    
      // list element  
      var li = document.createElement('li');
      var br = document.createElement('br');
      li.id = 'li_' + word._id;
      
      
      var divDisplay = document.createElement('div');
      divDisplay.className = 'viewBox';    
      divDisplay.addEventListener('dblclick', dbactions.wordEditFocus.bind(this, word));
      
      
      divDisplay.appendChild(wordLabel);
      divDisplay.appendChild(dict);
      divDisplay.appendChild(br);
      divDisplay.appendChild(definitionLabel);
      divDisplay.appendChild(tags);

      li.appendChild(remove);
      li.appendChild(divDisplay);
      li.appendChild(editDiv);
      
      return li;
}