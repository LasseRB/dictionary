(function(){
    'use strict';

    var ENTER_KEY = 13;
    var newWordDom = document.getElementById('new_word');
    var newDefDom = document.getElementById('new_definition');
    

    var db = new PouchDB('dictionary');
    // to-set up later:
    var remoteCouch = false;

    // updates the window on changes to database
    db.changes({
        since: 'now',
        live: true
      }).on('change', showWords);
      
    
      function addWord(text, definition){
          var word = {
              _id:new Date().toISOString(),
              title: text,
              definition: definition
          }
          db.put(word).then(function (result){
              console.log(word);
          }).catch(function(error){
              console.log(error);
          });
      }
      function removeWord(word){
          db.remove(word);
      }

      //respond to enter-pressed
      function enterWord(event){
          if(event.keyCode === ENTER_KEY){
              if(newWordDom.value != ""){
              addWord(newWordDom.value, newDefDom.value);
              newWordDom.value = '';
              newDefDom.value = '';
            }else{
                alert('please fill out word box');
            }
          }
      }

      function wordEditFocus(word){
        var div = document.getElementById('li_' + word._id);
        var inputEditWord = document.getElementById('input_title_' + word._id);
        div.className = 'editing';
        inputEditWord.focus();
      }

      function wordUpdate(word, event){
        console.log(event.target.className);
        var value = event.target.value.trim();
        if(!value){
          db.remove(word);
        } else{
        //how to update both fields?
          word.title = value;
          db.put(word);
        }
      }
      function enterKeyPressed(word, event) {
        if (event.keyCode === ENTER_KEY) {
          var inputEditWord = document.getElementById('input_title_' + word._id);
          inputEditWord.blur();
          wordUpdate(word,event);
        }
      }

      function showWords() {
        db.allDocs({include_docs: true, descending: true}, function(err, doc) {
          redrawTodosUI(doc.rows);
        });
      }

      function redrawTodosUI(words) {
        var ul = document.getElementById('word_list');
        ul.innerHTML = '';
        words.forEach(function(word) {
          ul.appendChild(createWordListItem(word.doc));
        });
      }

      function createWordListItem(word){
        
            var remove = document.createElement('button');
            remove.className = 'destroy';
            remove.addEventListener('click', removeWord.bind(this, word));

            var wordLabel = document.createElement('label');
            var definitionLabel = document.createElement('definition');
            wordLabel.appendChild(document.createTextNode(word.title))
            
            definitionLabel.appendChild(document.createTextNode(word.definition))
            
            //* input_editWord and input_editDefinition should only appear on toggle */
            var input_editWord = document.createElement('input');
            input_editWord.id= 'input_title_' + word._id;
            input_editWord.className = 'edit';
            input_editWord.value = word.title;
            input_editWord.addEventListener('keypress', enterKeyPressed.bind(this, word));
            // input_editWord.addEventListener('blur', wordUpdate.bind(this, word));
        

            var input_editDefinition = document.createElement('input');
            input_editDefinition.id= 'input_def_' + word._id;
            input_editDefinition.className = 'edit';
            input_editDefinition.value = word.definition;
          
            
            var li = document.createElement('li');
            var br = document.createElement('br');
            li.id = 'li_' + word._id;
            
            
            var divDisplay = document.createElement('div');
            divDisplay.className = 'viewBox';    
            divDisplay.addEventListener('dblclick', wordEditFocus.bind(this, word));
            
            // divDisplay.style.backgroundColor = "#" + randomColor;
            
            divDisplay.appendChild(wordLabel);
            divDisplay.appendChild(br);
            divDisplay.appendChild(definitionLabel);

            li.appendChild(remove);
            li.appendChild(divDisplay);
            li.appendChild(input_editWord);
            li.appendChild(input_editDefinition);
            
            return li;
      }
      function addEventListeners() {
            newWordDom.addEventListener('keypress', enterWord, false);
            newDefDom.addEventListener('keypress', enterWord, false);
      }

      addEventListeners();
      showWords();
      if (remoteCouch) {
        sync();
      }
})();