import { useContext } from "react";
import { HttpStatusContext } from "@/lib/http-status";
import { PageHead } from "@/components/PageHead";

/** Rendered by "not found" screens: the server answers them with HTTP 404 (and no canonical tag). */
export const NotFoundStatus = () => {
  const status = useContext(HttpStatusContext);
  if (status) status.code = 404;
  return <PageHead name="Página não encontrada" />;
};
