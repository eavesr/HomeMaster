import { DEFAULTS, HomeMasterSettings, Settings } from "./settings";
import {
  compareByLastPlayedDate,
  compareByLastTimePlayedLocally,
  compareByName,
  compareByPlaytime,
  compareByPurchasedTime,
  compareBySteamReleaseDate,
} from "./sorting_types";
import { logger } from "../utils";

export class Backend {
  public settings: Settings;
  public currentSettings: HomeMasterSettings = DEFAULTS;
  private games: number[] = [];
  private cache: any = null;
  private collectionCachedLength: number = 0;
  private usingCachedGames: boolean = false;

  constructor(settings: Settings) {
    this.settings = settings;
  }

  public LoadSettings(newSettings: HomeMasterSettings) {
    this.SetCache(null);

    const previousCollectionId =
      this.currentSettings.collectionData.collectionId;

    const previousSortingType = this.currentSettings.sortingType;

    this.currentSettings = newSettings;

    if (
      previousCollectionId !== newSettings.collectionData.collectionId ||
      previousSortingType !== newSettings.sortingType
    ) {
      this.LoadGamesFromCollection();
    }
  }

  public async InitSettings() {
    this.settings.get().then((newSettings) => {
      this.currentSettings = newSettings;
    });
  }

  /**
   * Attempts to load games from the live collectionStore.
   * Returns true on success, false if the collection is not yet available (e.g. on boot).
   * On success the game IDs are persisted to storage for next boot.
   */
  public LoadGamesFromCollection(): boolean {
    try {
      if (this.currentSettings.collectionData.collectionId) {
        const collection = collectionStore.GetCollection(
          this.currentSettings.collectionData.collectionId
        );
        this.games = collection.allApps
          .sort(this.getSortFunction())
          .map((app) => app.appid)
          .slice(0, 20);

        this.collectionCachedLength = collection.allApps.length;
      } else {
        const recentApps = collectionStore.recentAppCollections[0].allApps;
        this.games = recentApps
          .filter((app) => app.app_type === 1)
          .sort(this.getSortFunction())
          .map((app) => app.appid)
          .slice(0, 20);

        this.collectionCachedLength = recentApps.length;
      }

      this.usingCachedGames = false;
      // Persist the freshly loaded game IDs for the next boot (fire-and-forget)
      this.settings.saveGameCache(this.games);
      return true;
    } catch (e) {
      logger.error(
        "Failed to load games from collection, it may not be ready yet:",
        e
      );
      return false;
    }
  }

  /**
   * Loads game IDs from the persistent storage cache written on the previous session.
   * Should only be called as a fallback when LoadGamesFromCollection fails.
   */
  public async TryLoadFromPersistentCache(): Promise<void> {
    const cachedGames = await this.settings.getGameCache();
    if (cachedGames.length > 0) {
      this.games = cachedGames;
      this.usingCachedGames = true;
      logger.info(
        "Collection not ready on boot – loaded",
        cachedGames.length,
        "games from persistent cache"
      );
    }
  }

  public IsUsingCachedGames(): boolean {
    return this.usingCachedGames;
  }

  public GetGames() {
    return this.games;
  }

  public GetCollectionName() {
    if (this.currentSettings.hideCollectionName) {
      return "";
    } else {
      return this.currentSettings.collectionData.collectionName;
    }
  }

  public SetCache(cache: any) {
    this.cache = cache;
  }

  public GetCache() {
    return this.cache;
  }

  public IsCollectionChanged(): boolean {
    try {
      if (this.currentSettings.collectionData.collectionId === "") {
        const currentLength =
          collectionStore.recentAppCollections[0]?.allApps?.length ?? 0;
        if (this.collectionCachedLength !== currentLength) {
          this.collectionCachedLength = currentLength;
          return true;
        }
        return false;
      }

      const collection = collectionStore.GetCollection(
        this.currentSettings.collectionData.collectionId
      );
      const currentLength = collection?.allApps?.length ?? 0;
      if (this.collectionCachedLength !== currentLength) {
        this.collectionCachedLength = currentLength;
        return true;
      }
      return false;
    } catch (e) {
      return false;
    }
  }

  private getSortFunction(): (
    a: SteamAppOverview,
    b: SteamAppOverview
  ) => number {
    logger.info(this.currentSettings.sortingType);
    switch (this.currentSettings.sortingType) {
      case "Last Played":
        return compareByLastPlayedDate;
      case "Last Played Locally":
        return compareByLastTimePlayedLocally;
      case "Alphabetical":
        return compareByName;
      case "Release Date":
        return compareBySteamReleaseDate;
      case "Purchase Date":
        return compareByPurchasedTime;
      case "Hours Played":
        return compareByPlaytime;
      default:
        return compareByLastPlayedDate;
    }
  }
}
