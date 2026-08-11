import { createContext, type PropsWithChildren, useCallback, useContext, useMemo, useState } from 'react';

export type HomeSection = 'classes' | 'tasks';

type HomeSectionState = Record<HomeSection, boolean>;

type HomeContextValue = {
  expanded: HomeSectionState;
  toggleSection: (section: HomeSection) => void;
};

const DEFAULT_EXPANDED: HomeSectionState = { classes: true, tasks: true };
const HomeContext = createContext<HomeContextValue | null>(null);

export function HomeProvider({ children }: PropsWithChildren) {
  const [expanded, setExpanded] = useState<HomeSectionState>(DEFAULT_EXPANDED);
  const toggleSection = useCallback((section: HomeSection) => {
    setExpanded((current) => ({ ...current, [section]: !current[section] }));
  }, []);
  const value = useMemo(() => ({ expanded, toggleSection }), [expanded, toggleSection]);
  return <HomeContext.Provider value={value}>{children}</HomeContext.Provider>;
}

export function useHome(): HomeContextValue {
  const context = useContext(HomeContext);
  if (!context) throw new Error('useHome must be used inside HomeProvider.');
  return context;
}
