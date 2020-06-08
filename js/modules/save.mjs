import * as g from './global.mjs';

export function init () {
    g.db.changes({
        since: 'now',
        live: true
    }).on('change', log);

    function log(){
        console.log("hej");
    }
}
window.onload = init;

