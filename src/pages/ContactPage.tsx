import { Link } from "react-router-dom";
import { ArrowLeft, MapPin, Mail, PhoneCall } from "lucide-react";
import { Nav } from "@/components/site/Nav";
import { Footer } from "@/components/site/Footer";
import { Contact } from "@/components/site/Contact";
import { WhatsAppButton } from "@/components/site/WhatsAppButton";
import { useCompanyAddress } from "@/hooks/useCompanyAddress";
import { useSiteOptions } from "@/hooks/useSiteOptions";
import { useWhatsAppSettings } from "@/hooks/useWhatsAppSettings";

const ContactPage = () => {
  const { settings } = useWhatsAppSettings();
  const { options } = useSiteOptions();
  // First active address (Django admin → Endereços)
  const { address } = useCompanyAddress();
  const email = options['contact.email'];

  return (
    <main className="min-h-screen bg-background text-foreground">
      <Nav useHomeSectionLinks />

      <section className="relative overflow-hidden border-b border-border bg-gradient-radial pb-14 pt-28 md:pb-20 md:pt-36">
        <div className="container-x">
          <div className="max-w-4xl">
            <p className="mono-tag text-muted-foreground">Contato</p>
            <h1 className="editorial mt-6 text-[clamp(2.8rem,6vw,5.8rem)] leading-[0.95]">
              Vamos transformar o seu próximo desafio em
              <span className="editorial-italic text-primary"> um plano claro.</span>
            </h1>
            <p className="mt-6 max-w-3xl text-base text-foreground/85 md:text-lg">
              Use o formulário para briefing, fale com a equipe no WhatsApp ou venha visitar nossa localização.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/#contato"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-border bg-card/55 px-5 py-3 text-sm font-medium transition-colors hover:border-primary/40 hover:bg-card"
              >
                <ArrowLeft className="h-4 w-4" />
                Ir para o formulário
              </Link>
              <WhatsAppButton
                number={settings?.number}
                enabled={settings?.enabled}
                message={settings?.message}
                buttonContext="contact-page-hero"
                label="Falar com a gente"
              />
            </div>
          </div>
        </div>
      </section>

      <Contact />

      <section className="py-16 md:py-24">
        <div className="container-x grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-stretch">
          <div className="rounded-3xl border border-border bg-card/55 p-8 shadow-card">
            <div className="eyebrow">// Localização</div>
            <h2 className="editorial mt-4 text-4xl md:text-5xl">Onde estamos</h2>
            <p className="mt-4 max-w-lg text-sm leading-7 text-muted-foreground md:text-base">
              A base da Metricaz fica em São Paulo e atende projetos em todo o Brasil de forma remota e híbrida.
            </p>

            <div className="mt-8 space-y-4">
              {address && (
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-ink-deep/40 p-4">
                  <MapPin className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{[address.street, address.complement].filter(Boolean).join(' – ')}</p>
                    <p className="text-sm text-muted-foreground">
                      {[address.district, `${address.city}, ${address.state}`, address.postal_code].filter(Boolean).join(' · ')}
                    </p>
                  </div>
                </div>
              )}
              {email && (
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-ink-deep/40 p-4">
                  <Mail className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    <p className="text-sm font-medium">{email}</p>
                    <p className="text-sm text-muted-foreground">Retorno em até 1 dia útil</p>
                  </div>
                </div>
              )}
              {(address?.phone || address?.hours) && (
                <div className="flex items-start gap-3 rounded-2xl border border-border bg-ink-deep/40 p-4">
                  <PhoneCall className="mt-0.5 h-5 w-5 text-primary" />
                  <div>
                    {address.phone && <p className="text-sm font-medium">{address.phone}</p>}
                    {address.hours && <p className="text-sm text-muted-foreground">{address.hours}</p>}
                  </div>
                </div>
              )}
            </div>

            <div className="mt-8 rounded-3xl border border-border bg-ink-deep/55 p-5">
              <p className="eyebrow">// WhatsApp</p>
              <div className="mt-5">
                <WhatsAppButton
                  number={settings?.number}
                  enabled={settings?.enabled}
                  message={settings?.message}
                  buttonContext="contact-page-card"
                />
              </div>
            </div>
          </div>

          {address?.map_url && (
            <div className="overflow-hidden rounded-3xl border border-border bg-card/55 shadow-card">
              <iframe
                title="Localização da Metricaz"
                src={address.map_url}
                className="h-[420px] w-full border-0 md:h-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          )}
        </div>
      </section>

      <Footer useHomeSectionLinks />
    </main>
  );
};

export default ContactPage;