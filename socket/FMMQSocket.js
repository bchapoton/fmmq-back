const socket = require('socket.io')();

/*
socket.origins((origin, callback) => {
    /*if (origin !== 'https://foo.example.com') {
        return callback('origin not allowed', false);
    }
    callback(null, true);
});

socket.use((socket, next) => {
    let clientId = socket.handshake.headers['x-header-test'];

    return next();
    // return next(new Error('authentication error'));
});
*/

// Nothing happen on the main namespace
// each room will open dedicated namespace and listen to the events
module.exports = socket;