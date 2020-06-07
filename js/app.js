(function(){
    'use strict';

    // var ENTER_KEY = 13;
    var newWordDom = document.getElementById('new_word');
    var newDefDom = document.getElementById('new_definition');
    var newDicDom = document.getElementById('dictionaries');
    var newTagDom = document.getElementById('tags');

    var db = new PouchDB('dictionary');
    // to-set up later:
    var remoteCouch = false;

    // updates the window on changes to database
    db.changes({
        since: 'now',
        live: true
      }).on('change', showWords);
      
      function seperateTags(tags){
        var tags_array = [];
        if(tags.length > 0){
          tags_array = tags.split(",");
        }
        return tags_array; 
      }
      function addWord(text, definition, dictionary, tags){
     
          var word = {
              _id:new Date().toISOString(),
              title: text,
              abbreviation: '', // todo: get from input
              searchTitle: '', // todo: use searchify() on title
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
      function removeWord(word){
          db.remove(word);
      }

      //respond to enter-pressed
      function enterWord(event){
          if(event.code === "Enter"){
              if(newWordDom.value !== ""){
              addWord(newWordDom.value, newDefDom.value, newDicDom.value, newTagDom.value);
              newWordDom.value = '';
              newDefDom.value = '';
              newTagDom.value = '';
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
        var inputWord = document.getElementById('input_title_' + word._id).value.trim();
        var inputDef = document.getElementById('input_def_' + word._id).value.trim();
         var inputTag = document.getElementById('input_tag_' + word._id).value.trim();
        if(!inputWord){
          db.remove(word);
        } else{
          word.title = inputWord;
          word.definition = inputDef;
          word.tags = seperateTags(inputTag);
          db.put(word);
        }
      }
      function enterKeyPressed(word, event) {
        if (event.code === "Enter") {
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
        let wordsUL = document.getElementById('word_list');
        // let dictUL = document.getElementById('dictionaries_list');
        wordsUL.innerHTML = '';
        // dictUL.innerHTML = '';

        words.forEach(function(word) {
          wordsUL.appendChild(createWordListItem(word.doc));
        });
      }
      //if we want to have a sepereate dictionary list to be generated from the words
      function createDictionaryList(word){
        let li = document.createElement('li');
        let dict = document.createElement('dictionaryItem');
        dict.className = 'dictionaries';
        li.id = 'li_' + word._id;
        dict.id = 'dict_' + word._id;
        dict.appendChild(document.createTextNode(word.dictionary));
        li.appendChild(dict);

        return li;
      }
      function createWordListItem(word){
          
            var remove = document.createElement('button');
            remove.className = 'destroy';
            remove.addEventListener('click', removeWord.bind(this, word));

            var wordLabel = document.createElement('label');
            var definitionLabel = document.createElement('definition');
            wordLabel.appendChild(document.createTextNode(word.title))
            
            definitionLabel.appendChild(document.createTextNode(word.definition))
            var dict = document.createElement('dictionary');
            dict.appendChild(document.createTextNode(word.dictionary));
            
            //* input_editWord and input_editDefinition should only appear on toggle */
            var input_editWord = document.createElement('input');
            input_editWord.id= 'input_title_' + word._id;
            input_editWord.className = 'edit';
            input_editWord.value = word.title;
  
            var input_editDefinition = document.createElement('textarea');
            input_editDefinition.id= 'input_def_' + word._id;
            input_editDefinition.className = 'edit';
            input_editDefinition.value = word.definition;

            var input_editTags = document.createElement('input');
            input_editTags.id= 'input_tag_' + word._id;
            input_editTags.className = 'edit';
            input_editTags.value = word.tags; 
            
          
            let editDiv = document.createElement('div');
            editDiv.id = 'editbox_' + word._id;
            editDiv.appendChild(input_editWord);
            editDiv.appendChild(input_editDefinition);
            editDiv.appendChild(input_editTags);
            editDiv.addEventListener('blur', wordUpdate.bind(this, word));
            editDiv.addEventListener('keypress', enterKeyPressed.bind(this, word));
            
            var li = document.createElement('li');
            var br = document.createElement('br');
            li.id = 'li_' + word._id;
            
            
            var divDisplay = document.createElement('div');
            divDisplay.className = 'viewBox';    
            divDisplay.addEventListener('dblclick', wordEditFocus.bind(this, word));
            
            // divDisplay.style.backgroundColor = "#" + randomColor;
            
            divDisplay.appendChild(wordLabel);
            divDisplay.appendChild(dict);
            divDisplay.appendChild(br);
            divDisplay.appendChild(definitionLabel);

            li.appendChild(remove);
            li.appendChild(divDisplay);
            li.appendChild(editDiv);
            
            return li;
      }
      function addEventListeners() {
            newWordDom.addEventListener('keypress', enterWord, false);
            newDefDom.addEventListener('keypress', enterWord, false);
      }

      addEventListeners();
      showWords();

    function sync() {
        // todo: implement remote sync
    }

    if (remoteCouch) {
        sync();
      }
})();