type AppId = number

interface SteamAppOverview {
  appid: number;
  display_name: string;
  app_type: number;
  minutes_playtime_forever: number;
  rt_last_time_played_or_installed: number;
  rt_last_time_locally_played: number | undefined;
  rt_steam_release_date: number;
  rt_purchased_time: number | undefined;
}

interface SteamClient {
  Apps: Apps,
  Browser: any,
  BrowserView: any,
  ClientNotifications: any,
  Cloud: any,
  Console: any,
  Downloads: Downloads,
  FamilySharing: any,
  FriendSettings: any,
  Friends: any,
  GameSessions: GameSession,
  Input: any,
  InstallFolder: any,
  Installs: Installs,
  MachineStorage: any,
  Messaging: Messaging,
  Notifications: Notifications,
  OpenVR: any,
  Overlay: any,
  Parental: any,
  RegisterIFrameNavigatedCallback: any,
  RemotePlay: any,
  RoamingStorage: any,
  Screenshots: Screenshots,
  Settings: any,
  SharedConnection: any,
  Stats: any,
  Storage: any,
  Streaming: any,
  System: System,
  UI: any,
  URL: any,
  Updates: Updates,
  User: User,
  WebChat: any,
  Window: Window
}

type SteamTab = {
  title: string,
  id: string,
  content: React.ReactElement<TabContentProps>,
  footer?: {
    onOptionsActionDescription?: string,
    onOptionsButtion?: () => any,
    onSecondaryActionDescription?: any, //Returns a reactElement
    onSecondaryButton?: () => any,
    onMenuActionDescription?: string,
    onMenuButton?: (e: any) => void
  },
  renderTabAddon: () => any //Returns a reactElement
}

type TabContentComponent = React.VoidFunctionComponent<TabContentProps>
interface TabContentProps {
  collection: Collection
  eSortBy: number
  setSortBy: (e: any) => void
  showSortingContextMenu: (e: any) => void
}
