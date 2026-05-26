// Tipos compartilhados da aplicação

export type User = {
  id: string;
  name: string;
  email: string;
  createdAt: string;
};

export type Condition = 'Sealed' | 'CompleteInBox' | 'Loose' | 'Digital';

export type Region = 'NTSC' | 'PAL' | 'NTSC-J' | 'RegionFree';

export type Game = {
  id: string;
  userId: string;
  title: string;
  platform: string;
  condition: Condition;
  region: Region;
  notes?: string;
  createdAt: string;
};

export type AuthResponse = {
  token: string;
  user: User;
};

export type CreateGamePayload = {
  title: string;
  platform: string;
  condition: Condition;
  region?: Region;
  notes?: string;
};
