import { useContext } from "react";
import { HttpStatusContext } from "@/lib/http-status";

/** Rendered by "not found" screens: the server answers them with HTTP 404. No effect in the browser. */
export const NotFoundStatus = () => {
  const status = useContext(HttpStatusContext);
  if (status) status.code = 404;
  return null;
};
