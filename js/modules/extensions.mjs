/**
 * Extensions for built-in prototypes.
 */

Object.assign(String.prototype, {
    /**
     * Returns a search friendly version of the string.
     * Use: str.searchify()
     */
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

Object.assign(Number.prototype, {
    /**
     * Returns the number with leading zeros up to 99
     */
    toPaddedString() {
        if (this < 10) {
            return "0" + this;
        }

        return this.toString();
    }
});
