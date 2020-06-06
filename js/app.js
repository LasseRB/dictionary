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
        var randomColor = Math.floor(Math.random()*16777215).toString(16);

            var remove = document.createElement('button');
            remove.className = 'destroy';
            remove.addEventListener('click', removeWord.bind(this, word));

            var wordLabel = document.createElement('label');
            var definitionLabel = document.createElement('definition');
            wordLabel.appendChild(document.createTextNode(word.title))
            definitionLabel.appendChild(document.createTextNode(word.definition))

        
            var li = document.createElement('li');
            var br = document.createElement('br');
            li.id = 'li_' + word._id;
            
            var divDisplay = document.createElement('div');
            divDisplay.className = 'viewBox';    
            
            // divDisplay.style.backgroundColor = "#" + randomColor;
            
            divDisplay.appendChild(wordLabel);
            divDisplay.appendChild(br);
            divDisplay.appendChild(definitionLabel);

            li.appendChild(remove);
            li.appendChild(divDisplay);
            
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