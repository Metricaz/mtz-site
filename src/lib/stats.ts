// Numbers are SiteOption keys holding only the number (e.g. receitaorganica = 312); each place
// decides the formatting ("+", "%", "×", "anos"). The text next to it is the option's label.
// Hidden for now (the data stays in the admin): the company numbers (home and About) are not confirmed
// yet and the way case results are shown is still being decided. Set to true to show them again.
export const SHOW_COMPANY_NUMBERS = false;
export const SHOW_CASE_NUMBERS = false;

export type StatSpec = { key: string; prefix?: string; suffix?: string };

export const buildStats = (specs: StatSpec[], options: Record<string, string>, labels: Record<string, string>) =>
  specs
    .filter(({ key }) => options[key])
    .map(({ key, prefix = '', suffix = '' }) => ({ key, value: `${prefix}${options[key]}${suffix}`, label: labels[key] || '' }));
