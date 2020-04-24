const fs = require('fs');
const {Music} = require("../models/music.model");
const {getMusicRandomInt} = require("../services/MusicService");
const {sanitizeMusicElement} = require("../services/GameService");

async function doImport() {
    // TODO DEBUG drop collection first
    await Music.db.dropCollection('musics', function(err, result) { console.log('drop : ' + result)});
    const basePath = './importMusics/';
    const importFolder = fs.readdirSync(basePath);
    for (let i in importFolder) {
        const currentFolder = basePath + importFolder[i];
        if (fs.statSync(currentFolder).isDirectory()) {
            const metadataPath = currentFolder + '/metadata.json';
            if (fs.existsSync(metadataPath)) {
                const metadataRaw = fs.readFileSync(metadataPath, 'utf8');
                if (metadataRaw) {
                    const metadata = JSON.parse(metadataRaw);

                    /*
                    {
                        "artist": "Damien Sargue & Cécilia Cara",
                        "title": " Aimer",
                        "link": "https://www.ultratop.be/fr/song/1135/Damien-Sargue-&-Cecilia-Cara-Aimer",
                        "mp3Name": "1587366012738_241.mp3",
                        "audioSrc": "https://tools2.hitparade.ch/tools/audio/0000000/0004405.mp3"
                    },
                     */


                    for (let index in metadata) {
                        const data = metadata[index];
                        const filePath = 'music/' + findMp3NameFromAudioSrc(data.audioSrc);
                        const trimArtist = data.artist.trim();
                        const trimTitle = data.title.trim();
                        const musicDocument = {
                            artist: trimArtist,
                            title: trimTitle,
                            file: filePath,
                            artistSanitized: sanitizeMusicElement(trimArtist),
                            titleSanitized: sanitizeMusicElement(trimTitle),
                            randomInt: getMusicRandomInt()
                        };
                        const musicEntity = new Music(musicDocument);
                        musicEntity.save();
                        console.log('import : ' + index);
                    }
                }
            }
        }
    }
}

function findMp3NameFromAudioSrc(audioSrc) {
    const lastIndex = audioSrc.lastIndexOf('/');
    return audioSrc.substring(lastIndex + 1);
}

exports.doImport = doImport;