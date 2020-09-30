import * as q from "./db/db-query.mjs";
// import * as a from "./db/db-actions.mjs";

let dictionaries;
export function getDictionary(){
    if(dictionaries === undefined || dictionaries === null){
        createDictionaryList();
    } 
    return dictionaries;
    
    
}
export function createDictionaryList() {
    dictionaries = new Map();
      q.getTermList().then(res => {
          for (let i = 0; i < res.docs.length; i++) {
              res.docs[i].tags.forEach(tag => {
                  if(tag.trim()!== ""){
                      // console.debug("tag is");
                      // console.debug(tag);
                      if(dictionaries.has(tag)){
                      let all_words;
                          all_words = dictionaries.get(tag);
                          all_words.push(res.docs[i]);
                          dictionaries.set(tag, all_words);
                      } else{
                              dictionaries.set(tag, [res.docs[i]]);
                      }
                  }
                     // let array = dictionaries.get(res.docs[i].title);
              });
          }
      
      
      }).then(() =>{
          return dictionaries;
      })
      .catch(error =>{
          console.error(error);
      })
}
