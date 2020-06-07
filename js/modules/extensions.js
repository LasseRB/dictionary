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

        return this.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();
    }
});