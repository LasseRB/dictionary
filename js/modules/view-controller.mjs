let elem = {};

function init() {
    elem.termButton = document.getElementById('button-contextToggle');
    // elem.exportButton = document.getElementById('button-export');
    // elem.dictionaryView = document.getElementById('view-dictionary');
    elem.contextView = document.getElementById('view-context');
    elem.contextList = document.getElementById('context-list');
    elem.termButton.addEventListener('click', event => {
        onTermButtonClicked(event);
    })

    updateCount();
 
}

function onTermButtonClicked(event) {
    if (elem.contextView.style.display === 'none')
    {
        elem.contextView.style.removeProperty('display');
    }
    else
    {
        elem.contextView.style.setProperty('display', 'none');
    }

    
}
function updateCount(){
    
    setTimeout(function (){
        
            let list = elem.contextList.getElementsByTagName('input');
            elem.dbCount = document.getElementById('dbsize');
            elem.dbCount.innerHTML = list.length + " terms";
        

}, 200);
}



window.addEventListener('load', init);