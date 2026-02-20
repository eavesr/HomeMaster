import {
  LifetimeNotification,
} from "decky-frontend-lib";
import { TbLayoutNavbarExpand } from "react-icons/tb";

import { Settings } from "./app/settings";
import { LocatorProvider } from "./components/locator";
import { Backend } from "./app/backend";
import { patchHome } from "./patches/HomePatch";
import { Main } from "./pages/main";
import { RoutePatch, definePlugin, routerHook } from "@decky/api";
import { awaitGameInfo, logger } from "./utils";

declare global {
  let collectionStore: CollectionStore;
  let appStore: AppStore;
  let loginStore: LoginStore;
  let friendStore: FriendStore;
  let securitystore: SecurityStore;
  let settingsStore: SettingsStore;
}


export default definePlugin(() => {
  let homePatch: RoutePatch;
  const settings = new Settings();
  const backend = new Backend(settings);

  settings.get().then(async (currentSettings) => {
    backend.currentSettings = currentSettings;
    backend.SetCache(null);

    const loadedFromLive = backend.LoadGamesFromCollection();
    if (!loadedFromLive) {
      logger.info("Collection not ready on boot, falling back to persistent cache");
      await backend.TryLoadFromPersistentCache();
    }

    homePatch = patchHome(backend);
  });

  const AppOverviewChangesRegistration =
    SteamClient.Apps.RegisterForAppOverviewChanges(() => {
      const wasUsingCachedGames = backend.IsUsingCachedGames();
      if (wasUsingCachedGames || backend.IsCollectionChanged()) {
        backend.SetCache(null);
        const loadedFromLive = backend.LoadGamesFromCollection();
        if (loadedFromLive && wasUsingCachedGames) {
          // Transition from boot cache to live data – refresh the home screen
          logger.info("Live collection now available, refreshing home screen");
          try {
            (window as any).Navigation?.Navigate("/library/home");
          } catch (e) {
            logger.error("Failed to navigate to home after boot refresh:", e);
          }
        }
      }
    });

  const GameStartedOrStoppedRegistration =
    SteamClient.GameSessions.RegisterForAppLifetimeNotifications(
      async (data: LifetimeNotification) => {
        let game = await awaitGameInfo();
        if (game == null || game == undefined) {
          game = {
            id: data.unAppID.toString(),
            name: "",
          };
        }
        if (data.bRunning || !data.bRunning) {
          backend.SetCache(null);
          backend.LoadGamesFromCollection();
        }
      }
    );

  return {
    name: "HomeMaster",
    title: <>HomeMaster</>,
    content: (
      <LocatorProvider settings={settings}>
        <Main backend={backend} />
      </LocatorProvider>
    ),
    icon: <TbLayoutNavbarExpand />,
    onDismount: () => {
      routerHook.removePatch("/library/home", homePatch);
      AppOverviewChangesRegistration.unregister();
      GameStartedOrStoppedRegistration.unregister();
    },
  };
});
