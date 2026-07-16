import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { AssetToken, TokenizeInput } from '../types/token';
import {
  createTokenizedAsset,
  deleteToken,
  ensureDemoTokens,
  issueAndAttachHashCodCert,
  loadTokens,
  registryStats,
  runValidation,
  sealValidatedToken,
  upsertToken,
} from '../store/tokenStore';
import type { ValidateOptions } from '../core/validate';
import type { RegistryStats } from '../types/token';

type TokenContextValue = {
  tokens: AssetToken[];
  stats: RegistryStats;
  loading: boolean;
  getToken: (id: string) => AssetToken | undefined;
  tokenize: (input: TokenizeInput) => Promise<AssetToken>;
  validate: (id: string, opts?: ValidateOptions) => Promise<AssetToken>;
  seal: (id: string) => Promise<AssetToken>;
  issueHashCodCert: (
    id: string,
    opts?: { subject?: string; issuedBy?: string },
  ) => Promise<AssetToken>;
  remove: (id: string) => void;
  save: (token: AssetToken) => void;
  refresh: () => void;
};

const TokenContext = createContext<TokenContextValue | null>(null);

export function TokenProvider({ children }: { children: ReactNode }) {
  const [tokens, setTokens] = useState<AssetToken[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(() => {
    setTokens(loadTokens());
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      let list = loadTokens();
      list = await ensureDemoTokens(list);
      if (!cancelled) {
        setTokens(list);
        setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const tokenize = useCallback(async (input: TokenizeInput) => {
    const { tokens: next, token } = await createTokenizedAsset(loadTokens(), input);
    setTokens(next);
    return token;
  }, []);

  const validate = useCallback(async (id: string, opts?: ValidateOptions) => {
    const { tokens: next, token } = await runValidation(loadTokens(), id, opts);
    setTokens(next);
    return token;
  }, []);

  const seal = useCallback(async (id: string) => {
    const { tokens: next, token } = await sealValidatedToken(loadTokens(), id);
    setTokens(next);
    return token;
  }, []);

  const issueHashCodCert = useCallback(
    async (id: string, opts?: { subject?: string; issuedBy?: string }) => {
      const { tokens: next, token } = await issueAndAttachHashCodCert(loadTokens(), id, opts);
      setTokens(next);
      return token;
    },
    [],
  );

  const remove = useCallback((id: string) => {
    setTokens((prev) => deleteToken(prev, id));
  }, []);

  const save = useCallback((token: AssetToken) => {
    setTokens((prev) => upsertToken(prev, { ...token, updatedAt: new Date().toISOString() }));
  }, []);

  const getToken = useCallback(
    (id: string) => tokens.find((t) => t.id === id),
    [tokens],
  );

  const stats = useMemo(() => registryStats(tokens), [tokens]);

  const value = useMemo(
    () => ({
      tokens,
      stats,
      loading,
      getToken,
      tokenize,
      validate,
      seal,
      issueHashCodCert,
      remove,
      save,
      refresh,
    }),
    [
      tokens,
      stats,
      loading,
      getToken,
      tokenize,
      validate,
      seal,
      issueHashCodCert,
      remove,
      save,
      refresh,
    ],
  );

  return <TokenContext.Provider value={value}>{children}</TokenContext.Provider>;
}

export function useTokens() {
  const ctx = useContext(TokenContext);
  if (!ctx) throw new Error('useTokens must be used within TokenProvider');
  return ctx;
}
