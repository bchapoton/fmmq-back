var express = require('express');
var router = express.Router();

const socket = require('../socket/FMMQSocket');
const {createSocketRoom} = require("../socket/SocketHelper");
const gameCache = require('../services/CacheService');

router.get('/test', function (req, res, next) {
    socket.emit('try', 'from endpoint');
    socket.of('currentroom').emit('try', 'current room event');
    socket.of('room1').emit('try', 'room1 event');
    socket.of('room2').emit('try', 'room2 event');
    res.send();
});

router.get('/game/:categoryId/delete', function (req, res, next) {
    const categoryId = req.params.categoryId;
    gameCache.delete(categoryId);
    res.send();
});

router.get('/init2', function (req, res, next) {
    createSocketRoom(socket, 'room2');
    res.send();
});

const accents = require('remove-accents');

const testRemove = (str) => {
    let start = new Date().getTime();
    const removed = accents.remove(str);
    logDebug('time : ' + (new Date().getTime() - start));
    logDebug('original :' + str);
    logDebug('removed  :' + removed);
}

router.get('/accents', function (req, res, next) {
    testRemove("éèàùëêîïôöuûü");
    testRemove("u tést à voïrÔ IÎïÏ");
    testRemove("un texte sans accents pour voir comment ça se passe");
    testRemove("ÀÁÂÃÄÅàáâãäåÒÓÔÕÕÖØòóôõöøÈÉÊËèéêëðÇçÐÌÍÎÏìíîïÙÚÛÜùúûüÑñŠšŸÿýŽž");
});

const compareAlgo = require("damerau-levenshtein-js");
const {logDebug} = require("../logger/Logger");
const {enterRoom} = require("../services/GameService");
const {getPlayerFromUserContext} = require("../services/GameService");

const compare = (str1, str2) => {
    let start = new Date().getTime();
    /*
    const str1Split = str1.split(' ');
    const str2Split = str2.split(' ');
    */

    const distance = compareAlgo.distance(str1, str2);
    logDebug('time : ' + (new Date().getTime() - start));
    logDebug('string : ' + str1);
    logDebug('string : ' + str2);
    logDebug('distance : ' + distance);
};


const compare2 = (originalString, guessTryStr) => {
    logDebug('------------------------------------------')
    let start = new Date().getTime();
    // allow more error in long word
    const smallWordAllowedDistance = [0, 1];
    const longWordAllowedDistance = [0, 1, 2];

    // clean the strings remove accent and set to lower case
    const sanitizedOriginalStr = accents.remove(originalString).toLowerCase();
    const sanitizedGuessTry = accents.remove(guessTryStr).toLowerCase();

    // split each words in the strings to compare word to word
    const originalStrSplit = sanitizedOriginalStr.split(' ');
    const guessTrySplit = sanitizedGuessTry.split(' ');
    const found = [];

    // copy original array, we will remove on each searched all found elements
    let internalGuessTrySplit = [...guessTrySplit];
    originalStrSplit.forEach(originalWord => {
        const internalOriginalFound = [];
        const internalGuessFound = [];
        internalGuessTrySplit.forEach(guessWord => {
            const distance = compareAlgo.distance(originalWord, guessWord);
            let isFound;
            if (originalWord.length < 5) {
                isFound = smallWordAllowedDistance.includes(distance)
            } else {
                isFound = longWordAllowedDistance.includes(distance);
            }
            if (isFound) {
                internalOriginalFound.push(originalWord);
                internalGuessFound.push(guessWord);
            }
        });
        found.push(internalOriginalFound);
        // remove all the found words in this iteration
        internalGuessTrySplit = internalGuessTrySplit.filter(item => !internalGuessFound.includes(item));
        logDebug('iteration guess try split : ' + internalGuessTrySplit);
    });
    logDebug('time : ' + (new Date().getTime() - start));
    logDebug('string : ' + originalString);
    logDebug('san    : ' + sanitizedOriginalStr);
    logDebug('string : ' + guessTryStr);
    logDebug('san    : ' + sanitizedGuessTry);
    logDebug('found : ' + found);
};

router.get('/compare', function (req, res, next) {
    /*
    compare('oops','ops');
    compare('oops','ooops');
    compare('oops','opos');
    compare('oops','op');
    compare('oops','y');
    */
    compare2('oops i did it again', 'ops i dit it agen');
    compare2('oops i did it again', 'oops i did it agai');
    compare2('oops i did it again', 'op did it again');
    compare2('oops i did it again', 'op did aga');

    compare2('La vallée de Dana', 'la valee de dan');

    res.send();
});

module.exports = router;
