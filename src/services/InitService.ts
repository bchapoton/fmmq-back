import { serverConfig } from "../config/server";
import { logError, logInfo } from "../logger/Logger";
import { Category } from "../models/category.model";
import { ServerConfig } from "../models/serverConfig.model";

export const initServerData = async () => {
  const serverConfigEntity = await ServerConfig.findOne();
  if (!serverConfigEntity) {
    logInfo("FMMQInit initialize server in version " + serverConfig.version);
    initServerConfig();
    initCategory();
  } else {
    const serverConfigEntityVersion = serverConfigEntity.version;
    if (serverConfigEntityVersion === serverConfig.version) {
      logInfo("FMMQInit server v" + serverConfigEntityVersion);
    } else if (serverConfigEntityVersion < serverConfig.version) {
      logInfo(
        `FMMQInit server db v${serverConfigEntityVersion} vs code v${serverConfig.version}`,
      );
      logInfo(`FMMQInit start migration to v${serverConfig.version}`);
      // for now no need migration to nothing except updating version in DB
      serverConfigEntity.version = serverConfig.version;
      serverConfigEntity.updateDate = new Date();
      await serverConfigEntity.save();
      logInfo(`FMMQInit migration to v${serverConfig.version} is over`);
    } else {
      logError(
        `FMMQInit server db v${serverConfigEntityVersion} is higher than code v${serverConfig.version}`,
      );
      logError(
        `FMMQInit can't backward migration start in v${serverConfigEntityVersion}`,
      );
    }
  }
};

const initServerConfig = () => {
  const serverConfigEntity = new ServerConfig({
    version: serverConfig.version,
    creationDate: new Date(),
  });
  serverConfigEntity.save();
};

const initCategory = () => {
  const category = new Category({
    label: "Tout",
    description: "Toutes les musiques du serveur dans une salle",
    order: 1,
    allMusicsOnServer: true,
  });
  category.save();
};
