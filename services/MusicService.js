const {Music} = require('../models/music.model');

const pickMusics = async (categoryId = null, count = 15) => {
    const musics = await Music.find();
    const results = [];
    musics.forEach(music => {
        results.push({
           id: music._id.toString(),
           artist: music.artist,
           title: music.title
       })
    });
    return results;
};

exports.pickMusics = pickMusics;