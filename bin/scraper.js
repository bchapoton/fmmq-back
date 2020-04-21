const compilationPages = ["https://www.ultratop.be//fr/compilation/11c79/Hit-Connection-Best-Of-1999",
    "https://www.ultratop.be//fr/compilation/11c73/Hit-Connection-Best-Of-2000",
    "https://www.ultratop.be//fr/compilation/11c74/Hit-Connection-Best-Of-2001",
    "https://www.ultratop.be//fr/compilation/11c75/Hit-Connection-Best-Of-2002",
    "https://www.ultratop.be//fr/compilation/11c76/Hit-Connection-Best-Of-2003",
    "https://www.ultratop.be//fr/compilation/11c77/Hit-Connection-Best-Of-2004",
    "https://www.ultratop.be//fr/compilation/11480/Hit-Connection-Best-Of-2005",
    "https://www.ultratop.be//fr/compilation/11c78/Hit-Connection-Best-Of-2006",
    "https://www.ultratop.be//fr/compilation/13112/Hit-Connection-Best-Of-2007",
    "https://www.ultratop.be//fr/compilation/18f31/Hit-Connection-Best-Of-2008",
    "https://www.ultratop.be//fr/compilation/1e1c5/Hit-Connection-Best-Of-2009",
    "https://www.ultratop.be//fr/compilation/23d77/Hit-Connection-Best-Of-2010",
    "https://www.ultratop.be//fr/compilation/2cdab/Hit-Connection-Best-Of-2011",
    "https://www.ultratop.be//fr/compilation/33253/Hit-Connection-Best-Of-2012",
    "https://www.ultratop.be//fr/compilation/3901d/Hit-Connection-Best-Of-2013",
    "https://www.ultratop.be//fr/compilation/11c7b/Hit-Connection-2000-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c7c/Hit-Connection-2000-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c7d/Hit-Connection-2000-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c7e/Hit-Connection-2000-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c80/Hit-Connection-2001-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c81/Hit-Connection-2001-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c82/Hit-Connection-2001-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c83/Hit-Connection-2001-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c84/Hit-Connection-2002-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c86/Hit-Connection-2002-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c87/Hit-Connection-2002-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c88/Hit-Connection-2002-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c89/Hit-Connection-2003-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c8a/Hit-Connection-2003-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c8b/Hit-Connection-2003-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c8c/Hit-Connection-2003-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c8d/Hit-Connection-2004-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c8e/Hit-Connection-2004-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c8f/Hit-Connection-2004-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c90/Hit-Connection-2004-Vol.-4",
    "https://www.ultratop.be//fr/compilation/1764e/Hit-Connection-2005-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11481/Hit-Connection-2005-Vol.-2",
    "https://www.ultratop.be//fr/compilation/1194e/Hit-Connection-2005-Vol.-3",
    "https://www.ultratop.be//fr/compilation/1194f/Hit-Connection-2005-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c91/Hit-Connection-2006-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c92/Hit-Connection-2006-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c93/Hit-Connection-2006-Vol.-3",
    "https://www.ultratop.be//fr/compilation/11c94/Hit-Connection-2006-Vol.-4",
    "https://www.ultratop.be//fr/compilation/11c96/Hit-Connection-2007-Vol.-1",
    "https://www.ultratop.be//fr/compilation/11c98/Hit-Connection-2007-Vol.-2",
    "https://www.ultratop.be//fr/compilation/11c99/Hit-Connection-2007-Vol.-3",
    "https://www.ultratop.be//fr/compilation/13215/Hit-Connection-2007-Vol.-4",
    "https://www.ultratop.be//fr/compilation/15138/Hit-Connection-2008-Vol.-1",
    "https://www.ultratop.be//fr/compilation/16506/Hit-Connection-2008-Vol.-2",
    "https://www.ultratop.be//fr/compilation/17989/Hit-Connection-2008-Vol.-3",
    "https://www.ultratop.be//fr/compilation/188ec/Hit-Connection-2008-Vol.-4",
    "https://www.ultratop.be//fr/compilation/1a610/Hit-Connection-2009.1",
    "https://www.ultratop.be//fr/compilation/1b978/Hit-Connection-2009.2",
    "https://www.ultratop.be//fr/compilation/1d24c/Hit-Connection-2009.3",
    "https://www.ultratop.be//fr/compilation/1fe2e/Hit-Connection-2010.1",
    "https://www.ultratop.be//fr/compilation/211a4/Hit-Connection-2010.2",
    "https://www.ultratop.be//fr/compilation/22d30/Hit-Connection-2010.3",
    "https://www.ultratop.be//fr/compilation/26329/Hit-Connection-2011.1",
    "https://www.ultratop.be//fr/compilation/2871d/Hit-Connection-2011.2",
    "https://www.ultratop.be//fr/compilation/2b4b7/Hit-Connection-2011.3",
    "https://www.ultratop.be//fr/compilation/2f7ab/Hit-Connection-2012.1",
    "https://www.ultratop.be//fr/compilation/3106f/Hit-Connection-2012.2",
    "https://www.ultratop.be//fr/compilation/324b6/Hit-Connection-2012.3",
    "https://www.ultratop.be//fr/compilation/34b99/Hit-Connection-2013.1",
    "https://www.ultratop.be//fr/compilation/35e5c/Hit-Connection-2013.2",
    "https://www.ultratop.be//fr/compilation/37903/Hit-Connection-2013.3",
    "https://www.ultratop.be//fr/compilation/3ae15/Hit-Connection-2014.1",
    "https://www.ultratop.be//fr/compilation/3c85f/Hit-Connection-2014.2",
    "https://www.ultratop.be//fr/compilation/3e631/Hit-Connection-2014.3",
    "https://www.ultratop.be//fr/compilation/62273/Hit-Connection-2020.1"];

const https = require('https');
const fs = require('fs');
const URL = require('url');
const jsdom = require("jsdom");
const {JSDOM} = jsdom;

const tempPath = './bin/temp/';
const dataPath = 'data2/';
const individualMusicPath = 'individual/';
const metadataFileName = '/metadatas.json';

function createBaseFolder() {
    if (!fs.existsSync(tempPath)) {
        fs.mkdirSync(tempPath);
    }

    if (!fs.existsSync(tempPath + dataPath)) {
        fs.mkdirSync(tempPath + dataPath);
    }

    if (!fs.existsSync(tempPath + individualMusicPath)) {
        fs.mkdirSync(tempPath + individualMusicPath);
    }
}


//////////////////////////////////////
async function downloadTest(url, fileName) {
    return new Promise((resolve, reject) => {
        let parsedUrl = URL.parse(url);

        let url_options = {
            hostname: parsedUrl.hostname,
            path: parsedUrl.path,
            method: "GET"
        };

        let ws = fs.createWriteStream(fileName);
        ws.on('finish', () => {
            console.log('downloaded : ' + fileName);
            resolve(true);
        });
        ws.on('error', error => {
            console.error('filestream error on file : ' + url + ' / ' + fileName);
            resolve(false);
        });

        https.request(url_options, res => {
            res.pipe(ws)
        }).end();
    });


    /*
      https://gist.github.com/JBarna/d8e122cc902d4a98c0f3a9469742b40d
     */
}

function downloadInMemory(url, downloadedHandler) {
    let parsedUrl = URL.parse(url);

    let url_options = {
        hostname: parsedUrl.hostname,
        path: parsedUrl.path,
        method: "GET"
    };

    https.request(url_options, res => {

        let data = "";
        res.setEncoding('utf8');
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            downloadedHandler(data);
        });
    }).end();
}

//////////////////////////////////////

const findFolderName = (url) => {
    const lastIndex = url.lastIndexOf('/');
    return url.substring(lastIndex + 1);
};

const findPath = (url) => {
    return tempPath + findFolderName(url);
};

const downloadPage = (url) => {
    const file = fs.createWriteStream(findPath(url), {encoding: 'utf8'});
    const request = https.get(url, function (response) {
        response.pipe(file);
    });
};

const readCompilationPage = async (url) => {
    const path = tempPath + dataPath + findFolderName(url);
    if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
    }

    const metadatas = [];
    const file = await fs.readFileSync(findPath(url), 'utf8');

    const dom = new JSDOM(file);

    const links = dom.window.document.getElementsByTagName('a');
    let counter = 0;
    for (let link in links) {
        const href = links[link].href;
        if (href && href.startsWith('/fr/song/')) {
            const linkText = links[link].text;
            const index = linkText.indexOf('-');
            const metaData = {
                artist: linkText.substring(0, index - 1),
                title: linkText.substring(index + 1),
                link: encodeURI('https://www.ultratop.be' + href),
                mp3Name: new Date().getTime() + '_' + counter + '.mp3'
            };
            metadatas.push(metaData);
        }
        counter++;
    }
    return {rootPath: path, metadatas: metadatas};
};

async function test(link, path) {
    const file = fs.createWriteStream(path);
    const request = await https.get(link, function (response) {
        response.pipe(file);
    });
}

const downloadMusic = async (rootPath, metadata) => {
    console.log(metadata);
    // await test(metadata.link, path);
    // await downloadTestSync(metadata.link, path);

    // const file = await fs.readFileSync(path, 'utf8');

    downloadInMemory(metadata.link, async (data) => {
        const dom = new JSDOM(data);

        const audios = dom.window.document.getElementsByTagName('audio');
        for (let index in audios) {
            const audioSrc = audios[index].src;
            if (audioSrc) {
                console.log(audioSrc);
                const mp3name = metadata.mp3Name;
                const mp3Path = rootPath + '/' + mp3name;
                await downloadTest(audioSrc, mp3Path);
            }
        }
    });
};

const getMusicLink = async (rootPath, metadata) => {
    const mp3name = metadata.mp3Name;
    const individualPath = tempPath + individualMusicPath + '/' + mp3name + '.json';

    if(fs.existsSync(individualPath)) {
        console.log('already handled');
        return;
    }

    downloadInMemory(metadata.link, async (data) => {
        const dom = new JSDOM(data);

        const audios = dom.window.document.getElementsByTagName('audio');
        for (let index in audios) {
            const audioSrc = audios[index].src;
            if (audioSrc) {
                console.log(audioSrc);
                const newMetadata = Object.assign({}, metadata);
                newMetadata.audioSrc = audioSrc;
                fs.writeFileSync(individualPath, JSON.stringify(newMetadata));
            }
        }
    });
};


function downloadCompilationPages() {
    for (let index = 1; index < compilationPages.length; index++) {
        downloadPage(compilationPages[index]);
    }
}

function createMetadata() {
    for (let index = 1; index < compilationPages.length; index++) {
        readCompilationPage(compilationPages[index]).then(metadatas => {
            const rootPath = metadatas.rootPath;
            console.log('root path : ' + rootPath);
            fs.writeFileSync(rootPath + metadataFileName, JSON.stringify(metadatas.metadatas));
        });
    }
}

async function parseMetadata() {
    let totalMusicLength = 0;
    const basePath = tempPath + dataPath;
    const baseFolders = fs.readdirSync(basePath);
    for (let i in baseFolders) {
        const currentFolder = basePath + baseFolders[i];
        if (fs.statSync(currentFolder).isDirectory()) {
            console.log('handle folder : ' + currentFolder);
            const metadataPath = currentFolder + metadataFileName;
            if (fs.existsSync(metadataPath)) {
                console.log('metadata found');
                let metaDataArray;
                try {
                    metaDataArray = JSON.parse(fs.readFileSync(metadataPath, 'utf8'));
                } catch (e) {
                    console.error("can't read metadata : " + e);
                    continue;
                }
                if (metaDataArray && metaDataArray.length > 0) {
                    console.log('metadata has ' + metaDataArray.length + ' musics');
                    totalMusicLength += metaDataArray.length;
                    for(let i in metaDataArray) {
                        await getMusicLink(currentFolder, metaDataArray[i]);
                    }
                } else {
                    console.log('empty metadata');
                }
            } else {
                console.error('no metadata found');
            }
        }
    }
    console.log(totalMusicLength + ' to download');
}

function readIndividual() {
    const links = [];
    const basePath = tempPath + individualMusicPath;
    const files = fs.readdirSync(basePath);
    for (let i in files) {
        const currentFile = basePath + files[i];
        if (!fs.statSync(currentFile).isDirectory()) {
            console.log('handle file : ' + currentFile);
            try {
                const fileContent = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
                console.log(fileContent.audioSrc);
                links.push(fileContent.audioSrc);
            } catch (e) {
                console.error("can't read file : " + e);
                continue;
            }
        }
    }

    let buffer = '';
    for(let i in links) {
        buffer += links[i]+'\n';
    }
    fs.writeFileSync(tempPath + 'links.txt', buffer);
}

function unitIndividual() {
    const links = [];
    const basePath = tempPath + individualMusicPath;
    const files = fs.readdirSync(basePath);
    for (let i in files) {
        const currentFile = basePath + files[i];
        if (!fs.statSync(currentFile).isDirectory()) {
            console.log('handle file : ' + currentFile);
            try {
                const fileContent = JSON.parse(fs.readFileSync(currentFile, 'utf8'));
                links.push(fileContent);
            } catch (e) {
                console.error("can't read file : " + e);
                continue;
            }
        }
    }
    fs.writeFileSync(tempPath + 'metadata-final.json', JSON.stringify(links, null, 4));
}

createBaseFolder();
// downloadCompilationPages();
// createMetadata();
// parseMetadata();
// readIndividual();
unitIndividual();



/*
for (let index in allMetaData) {
    const metaDataObject = allMetaData[index];
    for (let j in metaDataObject.metadata) {
        getMusicLink(metaDataObject.currentFolder, metaDataObject.metadata[j]);
    }
}

/*
readCompilationPage(compilationPages[0]).then(metadatas => {
    const rootPath = metadatas.rootPath;
    console.log('root path : ' + rootPath);
    for (let index in metadatas.metadatas) {
        downloadMusic(rootPath, metadatas.metadatas[index]);
    }
    fs.writeFileSync(rootPath + metadataFileName, JSON.stringify(metadatas.metadatas));
});
*/

