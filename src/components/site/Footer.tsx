import { useState } from "react";
import { toast } from "sonner";
import logoMetricaz from "../../assets/logo-metricaz.webp";
import { api } from "@/lib/api";
import { OptionText } from "@/components/site/OptionText";
import { useApiList } from "@/hooks/useApiList";
import { SocialLink } from "@/lib/api-types";

interface FooterProps {
  useHomeSectionLinks?: boolean;
}

const navLinks = [
  { href: "#servicos", label: "Serviços" },
  { href: "#metodo", label: "Método" },
  { href: "#cases", label: "Cases" },
  { href: "#conteudo", label: "Conteúdo" },
  { href: "#contato", label: "Contato" },
];

export const Footer = ({ useHomeSectionLinks = false }: FooterProps) => {
  const homeBase = import.meta.env.BASE_URL;
  const resolveHref = (hash: string) => (useHomeSectionLinks ? `${homeBase}${hash}` : hash);
  const [subscribing, setSubscribing] = useState(false);
  const socialLinks = useApiList<SocialLink>("/social-links/");

  // Newsletter: only stores the e-mail (sending is done later, outside the site).
  const onSubscribe = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "").trim();

    setSubscribing(true);
    try {
      await api.post("/newsletter/", { email, source_page: `${window.location.pathname}${window.location.hash}` });
      form.reset();
      toast.success("Inscrição confirmada!");
    } catch (error) {
      console.error("Error subscribing to newsletter:", error);
      toast.error("Nao foi possivel assinar agora.");
    } finally {
      setSubscribing(false);
    }
  };

  return (
    <footer className="relative bg-ink-deep border-t border-border pt-20 pb-10">
      <div className="container-x">
        <div className="grid md:grid-cols-12 gap-12 pb-16 border-b border-border">
          <div className="md:col-span-5">
            <a href={resolveHref("#top")} className="flex items-center gap-2.5">
              <img src={logoMetricaz} alt="Metricaz" width={394} height={103} className="h-8 w-auto" />
            </a>
            <OptionText
              k="footer.tagline"
              as="p"
              className="editorial text-3xl md:text-5xl mt-10 max-w-md leading-tight"
              accentClassName="editorial-italic text-primary"
            />
          </div>

          <div className="md:col-span-3">
            <div className="eyebrow mb-6">{"// Navegação"}</div>
            <ul className="space-y-3.5 text-muted-foreground">
              {navLinks.map((link) => (
                <li key={link.href}><a href={resolveHref(link.href)} className="hover:text-primary transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <OptionText k="footer.newsletter_eyebrow" as="div" className="eyebrow mb-6" />
            <OptionText k="footer.newsletter_text" as="p" className="text-muted-foreground mb-5 text-sm leading-relaxed" />
            <form onSubmit={onSubscribe} className="flex border border-border rounded-full overflow-hidden p-1 bg-ink">
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none px-4 text-sm text-foreground"
                required
              />
              <button
                type="submit"
                disabled={subscribing}
                className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors disabled:opacity-60"
              >
                Assinar
              </button>
            </form>
          </div>
        </div>

        <div className="pt-8 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mono-tag text-muted-foreground">
          <OptionText k="footer.copyright" />
          {socialLinks.length > 0 && (
            <div className="flex gap-6">
              {socialLinks.map((link) => {
                // External links (https://…) open in a new tab; site paths stay in the same tab.
                const external = /^https?:\/\//.test(link.url);
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    className="hover:text-primary transition-colors"
                    {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </footer>
  );
};
