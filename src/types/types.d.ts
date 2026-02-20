declare module "*.svg" {
  const content: string;
  export default content;
}

declare module "*.png" {
  const content: string;
  export default content;
}

declare module "*.jpg" {
  const content: string;
  export default content;
}

type Unregisterer = {
  unregister: () => void;
};

type DocPages = {
  [key: string]: string;
};

type UsersDict = {
  [userId: string]: {
    tabs: TabSettingsDictionary;
    friends: FriendEntry[];
    friendsGames: Map<number, number[]>;
  };
};

type Router = {
  WindowStore: {
    GamepadUIMainWindowInstance: {
      m_history: {
        location: {
          pathname: string;
        };
      };
    };
  };
};

type Game = {
  id: string;
  name: string;
};

declare global {
  interface LifetimeNotification {
    unAppID: number;
    nInstanceID: string;
    bRunning: boolean;
  }
}

import "@decky/api"; // replace with the actual module name

// Extend the WindowRouter interface within the module
declare module "@decky/api" {
  export interface WindowRouter {
    m_history?: {
      location: {
        pathname: string;
      };
    }; // Add the m_history property here
  }
}
