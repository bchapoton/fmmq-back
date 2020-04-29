const getRoomChatNamespace = (categoryId) => {
    return categoryId + '-chat-in-game';
};

const getEndGameChatNamespace = (categoryId) => {
    return categoryId + '-chat-end-game';
};

exports.getRoomChatNamespace = getRoomChatNamespace;
exports.getEndGameChatNamespace = getEndGameChatNamespace;