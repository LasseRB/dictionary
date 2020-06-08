/**
 * Extensions for built-in prototypes.
 */

/**
 * Returns a search friendly version of the string.
 * Use: str.searchify()
 */
Object.assign(String.prototype, {
    searchify() {
        if (this.length === 0) {
            return this;
        }

        // could probably be optimized
        return this
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase()
            .match(/[a-z0-9 ]+/g)
            .join(' ');
    }
});