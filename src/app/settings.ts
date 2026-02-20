// credits to https://github.com/ma3a/SDH-PlayTime

import { logger } from "../utils";

declare global {
  // @ts-ignore
  let SteamClient: SteamClient;
}

export const sortingTypes = [
  "Last Played Locally",
  "Last Played",
  "Alphabetical",
  "Release Date",
  "Purchase Date",
  "Hours Played",
] as const;

export interface HomeMasterSettings {
  showPatchedHome: boolean;
  hideCollectionName: boolean;
  collectionData: {
    collectionId: string;
    collectionName: string;
  };
  sortingType: (typeof sortingTypes)[number];
}

let HOME_MASTER_SETTINGS_KEY = "decky-home-master";
let GAME_CACHE_KEY = "decky-home-master-game-cache";
export let DEFAULTS: HomeMasterSettings = {
  showPatchedHome: false,
  hideCollectionName: false,
  collectionData: { collectionId: "", collectionName: "" },
  sortingType: "Last Played Locally",
};

export class Settings {
  constructor() {
    SteamClient.Storage.GetJSON(HOME_MASTER_SETTINGS_KEY).catch((e: any) => {
      if ((e.message = "Not found")) {
        logger.error("Unable to get settings, saving defaults", e);
        SteamClient.Storage.SetObject(HOME_MASTER_SETTINGS_KEY, DEFAULTS);
      } else {
        logger.error("Unable to get settings", e);
      }
    });
  }

  async get(): Promise<HomeMasterSettings> {
    let settings = await SteamClient.Storage.GetJSON(HOME_MASTER_SETTINGS_KEY);
    if (settings == undefined) {
      return DEFAULTS;
    }
    return JSON.parse(settings) as HomeMasterSettings;
  }

  async save(data: HomeMasterSettings) {
    await SteamClient.Storage.SetObject(HOME_MASTER_SETTINGS_KEY, data);
  }

  async saveGameCache(gameIds: number[]): Promise<void> {
    await SteamClient.Storage.SetObject(GAME_CACHE_KEY, gameIds);
  }

  async getGameCache(): Promise<number[]> {
    try {
      const cached = await SteamClient.Storage.GetJSON(GAME_CACHE_KEY);
      if (cached == undefined) {
        return [];
      }
      return JSON.parse(cached) as number[];
    } catch (e) {
      logger.error("Failed to read game cache:", e);
      return [];
    }
  }
}
