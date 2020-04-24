const getRoomChatNamespace = (categoryId) => {
    return categoryId + '-chat';
};

exports.getRoomChatNamespace = getRoomChatNamespace;