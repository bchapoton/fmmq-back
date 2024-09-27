export const getRoomChatNamespace = (categoryId: string) => {
  return categoryId + "-chat-in-game";
};

export const getEndGameChatNamespace = (categoryId: string) => {
  return categoryId + "-chat-end-game";
};
