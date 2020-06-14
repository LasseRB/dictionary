import * as g from '../global.mjs';

/**
 * Returns a document based on its _id
 * @param id
 * @returns {Promise<Object>}
 */
export function getDocFromId(id) {
    return new Promise((resolve, reject) => {
        g.db.get(id).then(res => {
            resolve(res);
        }).catch(err => {
            reject(err);
        });
    });
}

/**
 * Tries to find all matches to by term (title)
 * @param {string} title
 * @returns {Promise<Object>}
 */
export function getDocFromTitle(title) {
    // remove trailing white space
    title = title.trim();

    // an index must be created first, if it already then exists nothing is done
    return new Promise((resolve, reject) => {
        g.db.createIndex({
            index: {fields: ['title']}
        }).then(() => {
            g.db.find({
                selector: {title: title},
                limit: 10
            }).then(res => {
                resolve(res);
            });
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
}

/**
 * Returns an object with documents objects with the fields: _id, title, abbreviation, searchTitle and searchAbbreviation
 * @returns {Promise<Object>}
 */
export function getTermList() {
    // an index must be created first, if it already exists then nothing is done
    return new Promise((resolve, reject) => {
        g.db.createIndex({
            index: {fields: ['title']}
        }).then(() => {
            g.db.find({
                selector: {title: {$gt: null}},
                fields: ['_id', '_rev', 'title', 'abbreviation', 'searchTitle', 'searchAbbreviation'],
                sort: [{'_id': 'desc'}]
            }).then(res => {
                resolve(res);
            });
        }).catch(err => {
            console.error(err);
            reject(err);
        });
    });
}
