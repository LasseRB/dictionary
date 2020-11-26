/**
 * Global variables that can be accessed from anywhere.
 */

export const db = new PouchDB('dictionary');
export const remoteDB = false;

export const settings = localStorage;

// settings.setItem('settings', JSON.stringify({'view': 'list'}));
