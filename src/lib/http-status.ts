import { createContext } from "react";

/** HTTP status of the page being rendered on the server (entry-server); absent in the browser. */
export type HttpStatus = { code: number };

export const HttpStatusContext = createContext<HttpStatus | null>(null);
