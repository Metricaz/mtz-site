import { useState } from "react";
import { toast } from "sonner";
import logoMetricaz from "../../assets/logo-metricaz.webp";
import { api } from "@/lib/api";
import { OptionText } from "@/components/site/OptionText";
import { PrivacyNotice } from "@/components/site/PrivacyNotice";
import { useApiList } from "@/hooks/useApiList";
import { SocialLink } from "@/lib/api-types";
import { siteLinks } from "@/lib/site-links";
import { useServices } from "@/hooks/useServices";

interface FooterProps {
  useHomeSectionLinks?: boolean;
}

export const Footer = ({ useHomeSectionLinks = false }: FooterProps) => {
  const homeBase = import.meta.env.BASE_URL;
  // Pages get the base path; home sections (#id) too when the footer is not on the home page.
  const resolveHref = (href: string, isPage?: boolean) => {
    if (isPage) return `${homeBase}${href.replace(/^\//, "")}`;
    return useHomeSectionLinks ? `${homeBase}${href}` : href;
  };
  const [subscribing, setSubscribing] = useState(false);
  const socialLinks = useApiList<SocialLink>("/social-links/");
  const { services } = useServices();

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
          <div className="md:col-span-4">
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

          <div className="md:col-span-2">
            <div className="eyebrow mb-6">{"// Navegação"}</div>
            <ul className="space-y-3.5 text-muted-foreground">
              {siteLinks.map((link) => (
                <li key={link.href}><a href={resolveHref(link.href, link.isPage)} className="hover:text-primary transition-colors">{link.label}</a></li>
              ))}
            </ul>
          </div>

          {services.length > 0 && (
            <div className="md:col-span-2">
              <div className="eyebrow mb-6">{"// Serviços"}</div>
              <ul className="space-y-3.5 text-muted-foreground">
                {services.map((service) => (
                  <li key={service.id}>
                    <a href={resolveHref(`/servicos/${service.slug}`, true)} className="hover:text-primary transition-colors">
                      {service.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
            <PrivacyNotice className="mt-3" />
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
