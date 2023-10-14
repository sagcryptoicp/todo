import {
  AuthClient,
  AuthClientCreateOptions,
  AuthClientLoginOptions,
} from '@dfinity/auth-client';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from 'react';
import { canisterId, createActor } from './declarations/backend';

interface AuthContextType {
  isAuthenticated: boolean;
  login: () => void;
  logout: () => void;
  authClient: AuthClient | null;
  identity: any; // Replace with the correct type for identity
  principal: any; // Replace with the correct type for principal
  actor: any; // Replace with the correct type for actor
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultOptions: {
  createOptions: AuthClientCreateOptions;
  loginOptions: AuthClientLoginOptions;
} = {
  createOptions: {
    idleOptions: {
      // Set to true if you do not want idle functionality
      disableIdle: true,
    },
  },
  loginOptions: {
    identityProvider:
      process.env.DFX_NETWORK === 'ic'
        ? 'https://identity.ic0.app/#authorize'
        : `http://127.0.0.1:8080/?canisterId=be2us-64aaa-aaaaa-qaabq-cai`,
  },
};

export const useAuthClient = (options = defaultOptions) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authClient, setAuthClient] = useState<AuthClient | null>(null);
  const [identity, setIdentity] = useState<any | null>(null);
  const [principal, setPrincipal] = useState<any | null>(null);
  const [actor, setActor] = useState<any | null>(null);

  useEffect(() => {
    // Initialize AuthClient
    AuthClient.create(options.createOptions).then(async (client) => {
      updateClient(client);
    });
  }, []);

  const login = () => {
    authClient!.login({
      ...options.loginOptions,
      onSuccess: () => {
        updateClient(authClient!);
      },
    });
  };

  async function updateClient(client: AuthClient) {
    const isAuthenticated = await client.isAuthenticated();
    setIsAuthenticated(isAuthenticated);

    const identity = client.getIdentity();
    setIdentity(identity);

    const principal = identity.getPrincipal();
    setPrincipal(principal);

    setAuthClient(client);

    const actor = createActor('rrkah-fqaaa-aaaaa-aaaaq-cai', {
      agentOptions: {
        identity,
      },
    });

    setActor(actor);
  }

  async function logout() {
    await authClient?.logout();
    await updateClient(authClient!);
  }

  return {
    isAuthenticated,
    login,
    logout,
    authClient,
    identity,
    principal,
    actor,
  };
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuthClient();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
