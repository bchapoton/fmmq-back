const {Music} = require('../models/music.model');

const pickMusics = async (categoryId = null, count = 15) => {
    const sorter = getRandomSortDirection() + 'randomInt';
    const musics = await Music.find().sort(sorter).limit(count);
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

function getMusicRandomInt() {
    return getRandomInt(0, 1000000);
}

function getRandomInt(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

function getRandomSortDirection() {
    return Math.random() < 0.5 ? '-' : '';
}

exports.pickMusics = pickMusics;
exports.getMusicRandomInt = getMusicRandomInt;