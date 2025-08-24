import Fuse from 'fuse.js';
import fs from 'fs';

class Audora {
    constructor(data = [], options = {}) {
        if (!Array.isArray(data)) {
            throw new Error("Audora requires an array of strings or objects as data.");
        }

        this.options = {
            includeScore: true,
            threshold: options.threshold || 0.4,
            keys: options.keys || []
        };

        this.data = data;
        this.history = [...data];
        this.fuse = new Fuse(data, this.options);
    }

    search(query = "", options = { format: "single" }) {
        if (!query || typeof query !== "string") return null;

        const results = this.fuse.search(query);
        if (results.length === 0) return null;

        if (options.format === "array") {
            return [...new Set(results.map(r => r.item))];
        }

        if (options.format === "single") {
            if (results.length === 1) return results[0].item;
            return results.map(r => r.item).join("\n");
        }

        return results[0].item;
    }

    update(newData = []) {
        if (!Array.isArray(newData)) {
            throw new Error("Audora update requires an array of strings or objects as data.");
        }

        this.history = [...this.data];
        this.data = newData;
        this.fuse = new Fuse(this.data, this.options);
    }

    getData() {
        return this.data;
    }

    getHistory() {
        return this.history;
    }

    loadDataFromJson(path) {
        try {
            const rawData = fs.readFileSync(path, 'utf-8');
            const jsonData = JSON.parse(rawData);

            if (!Array.isArray(jsonData)) {
                throw new Error("JSON file must contain an array of strings or objects.");
            }

            this.update(jsonData); // Fuse rebuild + history tracking
            return this.data;
        } catch (err) {
            console.error("Error loading JSON:", err.message);
            return [];
        }
    }
}

export default Audora;
