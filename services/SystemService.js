const getMongoDBUri = () => {
    return process.env.FMMQ_mongo_db_uri;
};

const getNodePort = () => {
    const port = process.env.FMMQ_node_port;
    if(!port) {
        return "8080"
    } else {
        return port;
    }
};

const getPrivateKey = () => {
    return process.env.FMMQ_private_key;
};

const isDebug = () => {
    return process.env.FMMQ_DEBUG_MODE === 'true' ? process.env.FMMQ_DEBUG_MODE : false ;
};

exports.getMongoDBUri = getMongoDBUri;
exports.getNodePort = getNodePort;
exports.getPrivateKey = getPrivateKey;
exports.isDebug = isDebug;