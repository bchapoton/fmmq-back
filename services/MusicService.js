const {Music} = require('../models/music.model');
const categoryService = require('./CategoryService');
const {ServerErrorException} = require("../exceptions/ServerErrorException");

const musicPickStep = 3;

const pickMusics = async (categoryId = null, count = 15) => {
    const musics = await pickRangedMusic(count);
    const results = [];
    musics.forEach(music => {
        results.push({
            id: music._id.toString(),
            artist: music.artist,
            artistSanitized: music.artistSanitized,
            title: music.title,
            titleSanitized: music.titleSanitized,
            file: music.file
        });
        music.randomInt = getMusicRandomInt();
        music.save();
    });
    return results;
};

async function pickRangedMusic(count) {
    const totalMusicCount = await Music.countDocuments();
    const sorter = getRandomSortDirection() + 'randomInt';
    let picked = [];
    while(picked.length < count) {
        const skip = getRandomInt(0, totalMusicCount - musicPickStep);
        const musics = await Music.find().sort(sorter).skip(skip).limit(musicPickStep);
        picked = addIfNotAlreadyPicked(picked, musics, count);
    }
    return picked;
}

function addIfNotAlreadyPicked(array, values, count) {
    const results = [...array];
    for(let index in values) {
        const value = values[index];
        if(array.filter(music => music._id.toString() === value._id.toString()).length === 0) {
            if(results.length < count) {
                results.push(value);
            } else {
                break;
            }
        }
    }
    return results;
}

function getMusicRandomInt() {
    return getRandomInt(0, 10000);
}

function getRandomInt(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function getRandomSortDirection() {
    return Math.random() < 0.5 ? '-' : '';
}

async function deleteMusicByImportId(importEntityId) {
    const musics = await Music.find({importObjectId: importEntityId});
    for(let index in musics) {
        const music = musics[index];
        music.delete();
    }
}

function countMusicsByCategoryId(errorHandlers, categoryId, success) {
    categoryService.findCategoryById(errorHandlers, categoryId, category => {
        if(category.allMusicsOnServer) {
            Music.countDocuments({}, (error, count) => {
                if (error) {
                    errorHandlers(new ServerErrorException(error.toString()));
                } else {
                    success(count);
                }
            });
        } else {
            Music.countDocuments({categoryId: categoryId},  (error, count) => {
                if (error) {
                    errorHandlers(new ServerErrorException(error.toString()));
                } else {
                    success(count);
                }
            });
        }
    });
}

exports.pickMusics = pickMusics;
exports.getMusicRandomInt = getMusicRandomInt;
exports.deleteMusicByImportId = deleteMusicByImportId;
exports.countMusicsByCategoryId = countMusicsByCategoryId;