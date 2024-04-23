export interface AuthContextProps {
  authUser: boolean;
  login: () => void;
  logout: () => void;
}

export interface AuthProviderProps {
  children: React.ReactNode
}