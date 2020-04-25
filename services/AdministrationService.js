const {getMusicRandomInt} = require("./MusicService");
const {sanitizeMusicElement} = require("../services/GameService");
const {Music} = require("../models/music.model");

/**
 * Re sanitize all music in db
 * @return number handled musics
 */
exports.reSanitizeDB = async function () {
    let count = 0;
    let errorsCount = 0;
    let errors = [];
    const musics = await Music.find().exec();
    for (let index in musics) {
        const music = musics[index];
        try {
            music.artistSanitized = sanitizeMusicElement(music.artist);
            music.titleSanitized = sanitizeMusicElement(music.title);
            music.randomInt = getMusicRandomInt();
            music.save().catch(e => {
                errorsCount++;
                errors.push({
                    id: music._id.toString(),
                    artist: music.artist,
                    title: music.title,
                    error: e.toString()
                });
            });
            count++;
        } catch (e) {
            errorsCount++;
            errors.push({
                id: music._id.toString(),
                artist: music.artist,
                title: music.title,
                error: e.toString()
            });
        }
    }
    return {
        count: count,
        errorsCount: errorsCount,
        errors: errors
    };
};

async function getMusicDuplicates() {
    let musicCount = 0;
    let musicsDuplicates = [];
    const musics = await Music.find().exec();
    for (let index in musics) {
        const music = musics[index];
        musicCount++;
        if(!musicsDuplicates[music.file]) {
            const ids = [];
            ids.push(music._id.toString());
            musicsDuplicates[music.file] = {
                metadata: `${music.artist} - ${music.title}`,
                count: 1,
                ids: ids
            }
        } else {
            musicsDuplicates[music.file].count = musicsDuplicates[music.file].count + 1;
            musicsDuplicates[music.file].ids.push(music._id.toString());
        }
    }

    const duplicates = [];
    for(let index in musicsDuplicates) {
        if(musicsDuplicates[index].count > 1) {
            duplicates.push(musicsDuplicates[index]);
        }
    }

    return {
        musicOnServer: musicCount,
        duplicatesCount: duplicates.length,
        duplicates: duplicates
    };
};

exports.getMusicDuplicates = getMusicDuplicates;

exports.delMusicDuplicates = async function () {
    const results = [];
    let deletedCount = 0;
    const  duplicates = await getMusicDuplicates();
    for(let index in duplicates.duplicates) {
        const duplicate = duplicates.duplicates[index];
        if(duplicate.ids.length > 1) {
            const idsToDelete = [...duplicate.ids];
            idsToDelete.pop();
            for(let j in idsToDelete) {
                deletedCount++;
                Music.findOneAndRemove({_id: idsToDelete[j]}).exec();
            }
            results.push({
                metadata: duplicate.metadata,
                idsDeleted: idsToDelete
            });
        }
    }

    return {
        musicOnServer: duplicates.musicOnServer,
        duplicatesCount: duplicates.duplicatesCount,
        deletedCount: deletedCount,
        deleted: results
    }
};

