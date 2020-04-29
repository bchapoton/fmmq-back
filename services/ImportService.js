const {UnauthorizedException} = require("../exceptions/UnauthorizedException");
const {ServerErrorException} = require("../exceptions/ServerErrorException");
const {BadRequestException} = require("../exceptions/BadRequestException");
const {validateImportMetadataFormat} = require("./ValidationService");
const {Music} = require("../models/music.model");
const {ObjectNotFoundException} = require("../exceptions/ObjectNotFoundException");
const {MissingParametersException} = require("../exceptions/MissingParametersException");
const {deleteMusicByImportId} = require("../services/MusicService");
const {getMusicRandomInt} = require("../services/MusicService");
const {sanitizeMusicElement} = require("../services/GameService");
const {Import} = require("../models/import.model");
const cacheService = require('./CacheService');

async function doImport(errorHandler, user, id, contributorUser = null) {
    const importEntity = await findImportByIdSync(errorHandler, id);
    if (!checkContributorAuthorized(errorHandler, contributorUser, importEntity)) {
        return;
    }
    cacheService.clearCategoryMusicsCount();
    const userField = createImportByFromUser(errorHandler, user);
    if (importEntity) {
        await deleteMusicByImportId(id);
        const start = new Date().getTime();
        const importId = importEntity._id.toString();
        const metadata = JSON.parse(importEntity.metadata);
        const errors = [];
        const folder = metadata.folder;
        const files = metadata.files;
        let importedMusicCount = 0;
        for (let index in files) {
            const file = files[index];

            const trimArtist = file.artist.trim();
            const trimTitle = file.title.trim();
            const musicDocument = {
                artist: trimArtist,
                title: trimTitle,
                file: folder + '/' + file.file,
                artistSanitized: sanitizeArtist(trimArtist),
                titleSanitized: sanitizeTitle(trimTitle),
                randomInt: getMusicRandomInt(),
                importObjectId: importId,
                ownerId: userField.id,
                ownerNickname: userField.nickname,
            };

            if (!(musicDocument.artistSanitized && musicDocument.titleSanitized)) {
                errors.push(musicDocument);
                continue;
            }

            const musicEntity = new Music(musicDocument);
            musicEntity.save();
            importedMusicCount++;
        }

        importEntity.imported = true;
        importEntity.lastImported = new Date();
        importEntity.lastImportedBy = JSON.stringify(userField);
        await importEntity.save();

        const duration = new Date().getTime() - start;
        return {
            duration: duration,
            importedMusicCount: importedMusicCount,
            errorsCount: errors.length,
            documentsInError: errors
        };
    } else {
        errorHandler(new ObjectNotFoundException());
    }
}

function sanitizeArtist(artist) {
    if (!artist)
        return artist;
    return splitArtistWithFeatArray(sanitizeMusicElement(artist.trim()))
}

function sanitizeTitle(title) {
    if (!title)
        return title;
    return sanitizeMusicElement(title.trim())
}

/**
 * Handle artist with ID3Tag array separated by ;
 * If we detect this case, split on the ; and take only the first array value
 *
 * @param value
 * @return {*|string}
 */
function splitArtistWithFeatArray(value) {
    if (value.indexOf(';') > -1) {
        return value.split(';')[0];
    }
    return value;
}

function findImportById(errorHandler, id, success) {
    if (id) {
        Import.findById(id).exec((error, importEntity) => {
            if (error) {
                errorHandler(new ObjectNotFoundException("Can't find import with id : " + id));
            }
            success(importEntity);
        });
    } else {
        errorHandler(new MissingParametersException('Missing Import id'));
    }
}

async function findImportByIdSync(errorHandler, id) {
    if (id) {
        try {
            return await Import.findById(id);
        } catch (e) {
            errorHandler(new ObjectNotFoundException("Can't find import with id : " + id));
        }
    } else {
        errorHandler(new MissingParametersException('Missing Import id'));
    }
}

async function createImport(errorHandler, user, payload) {
    if (validateImportMetadataFormat(payload.metadata)) {
        const userField = createImportByFromUser(errorHandler, user);
        const importEntity = new Import({
            metadata: JSON.stringify(payload.metadata),
            imported: false,
            ownerId: userField.id,
            ownerNickname: userField.nickname,
            creationDate: new Date()
        });
        try {
            await importEntity.save();
        } catch (e) {
            errorHandler(new ServerErrorException("Can't save import object"));
        }
    } else {
        errorHandler(new BadRequestException("Can't save import object"));
    }
}

function createImportByFromUser(errorHandler, user) {
    if (!user) {
        errorHandler(new MissingParametersException('Missing user for import'));
    }

    return {
        id: user._id,
        nickname: user.nickname
    };
}

async function deleteImport(errorHandler, id, contributorUser = null) {
    const importEntity = await findImportByIdSync(errorHandler, id);
    if (!importEntity) {
        errorHandler(new ObjectNotFoundException("Can't find import with id " + id))
    } else {
        if (checkContributorAuthorized(errorHandler, contributorUser, importEntity)) {
            await deleteMusicByImportId(id);
            try {
                importEntity.delete();
            } catch (e) {
                errorHandler(new ServerErrorException("Can't delete import"))
            }
        }
    }
}

function checkContributorAuthorized(errorHandler, contributorUser, importEntity) {
    if (!contributorUser) {
        return true;
    }

    if (importEntity.ownerId === contributorUser._id) {
        return true;
    }
    errorHandler(new UnauthorizedException());
    return false;
}

exports.doImport = doImport;
exports.createImport = createImport;
exports.deleteImport = deleteImport;
exports.findImportById = findImportById;
exports.findImportByIdSync = findImportByIdSync;
exports.sanitizeArtist = sanitizeArtist;
exports.sanitizeTitle = sanitizeTitle;