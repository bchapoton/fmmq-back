exports.validateImportMetadataFormat = function (json) {
    if (json) {
        if (!json.folder) {
            return false;
        }

        if (!Array.isArray(json.files)) {
            return false;
        }

        for (let index in json.files) {
            const current = json.files[index];
            if (!(current.artist && current.title && current.file)) {
                return false;
            }
        }

        return true;
    }
}