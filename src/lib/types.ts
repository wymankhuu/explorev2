export interface App {
  id: string;
  name: string;
  description: string;
  url: string;
  creator: string;
  role: string;
  usage: string;
  impact: string;
  sessions: number;
  iterations: number;
  pinned: boolean;
  homepageOrder: number;
  tags: string[];
}

export interface Collection {
  id: string;
  name: string;
  description: string;
  iconName: string;
  appCount: number;
  apps: App[];
}

export interface Seed {
  id: string;
  name: string;
  description: string;
  remixUrl: string;
  tags: string[];
  creator: string;
  seedCollection: string;
}

export interface SeedCollection {
  id: string;
  name: string;
  description: string;
  color: string;
  iconName: string;
  apps: Seed[];
}
