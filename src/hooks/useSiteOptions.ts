import { createContext, useContext } from 'react';

export type SiteOptionsValue = {
  /** key → value (only keys with a non-empty value are present) */
  options: Record<string, string>;
  /** key → label, the text that goes with a value (e.g. marcasatendidas → "Marcas atendidas") */
  labels: Record<string, string>;
};

export const SiteOptionsContext = createContext<SiteOptionsValue>({ options: {}, labels: {} });

/**
 * Loose site values by key (Django admin → "Opções do site"), loaded once by <SiteOptionsProvider>.
 * A key without a value is simply absent, so `options['x']` is undefined and nothing is shown.
 */
export const useSiteOptions = () => useContext(SiteOptionsContext);
