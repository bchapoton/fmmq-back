export const getMongoDBUri = () => {
  return process.env.FMMQ_mongo_db_uri;
};

export const getNodePort = () => {
  const port = process.env.FMMQ_node_port;
  if (!port) {
    return "8080";
  } else {
    return port;
  }
};

export function getPrivateKey(): string {
  // we can wildly cast with as, the server doesn't start without the env var private_key
  return process.env.FMMQ_private_key as string;
}

export const isDebug = () => {
  return process.env.FMMQ_DEBUG_MODE === "true"
    ? process.env.FMMQ_DEBUG_MODE
    : false;
};
