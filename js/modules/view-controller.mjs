let elem = {};

function init() {
    elem.dictionaryButton = document.getElementById('button-dictionaryToggle');
    elem.termButton = document.getElementById('button-termToggle');
    elem.dictionaryView = document.getElementById('view-dictionary');
    elem.termView = document.getElementById('view-term');

    elem.dictionaryButton.addEventListener('click', event => {
        onDictionaryButtonClicked(event);
    });

    elem.termButton.addEventListener('click', event => {
        onTermButtonClicked(event);
    })
}

function onDictionaryButtonClicked(event) {
    if (elem.dictionaryView.style.display === 'none')
    {
        elem.dictionaryView.style.removeProperty('display');
    }
    else
    {
        elem.dictionaryView.style.setProperty('display', 'none');
    }
}

function onTermButtonClicked(event) {
    if (elem.termView.style.display === 'none')
    {
        elem.termView.style.removeProperty('display');
    }
    else
    {
        elem.termView.style.setProperty('display', 'none');
    }
}

window.addEventListener('load', init);