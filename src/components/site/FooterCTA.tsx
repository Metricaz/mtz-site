import { useState } from "react";
import { toast } from "sonner";
import mSymbol from "@/assets/m-metricaz.webp";
import { api } from "@/lib/api";
import { OptionText } from "@/components/site/OptionText";

export const FooterCTA = () => {
  const [loading, setLoading] = useState(false);

  // Saves the e-mail as a Lead, then takes the visitor to the contact form (as the link did before).
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = String(new FormData(form).get("email") || "").trim();

    setLoading(true);
    try {
      await api.post("/leads/", { email, source_page: `${window.location.pathname}${window.location.hash}` });
      form.reset();
      toast.success("Recebemos seu e-mail! Conte um pouco mais abaixo.");
      document.getElementById("contato")?.scrollIntoView({ behavior: "smooth" });
    } catch (error) {
      console.error("Error saving lead:", error);
      toast.error("Nao foi possivel enviar agora.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="relative bg-ink-deep overflow-hidden">
      {/* faixa colorida no topo */}
      <div className="h-1 w-full bg-gradient-to-r from-primary via-primary-glow to-ink" />

      {/* símbolo M sutil */}
      <img
        src={mSymbol}
        alt=""
        aria-hidden
        width={917}
        height={960}
        loading="lazy"
        decoding="async"
        className="pointer-events-none select-none absolute -right-20 top-1/2 -translate-y-1/2 h-[120%] w-auto opacity-[0.04] object-contain object-right"
      />

      <div className="container-x relative py-24 md:py-36">
        <div className="grid md:grid-cols-12 gap-10 items-end">
          <div className="md:col-span-8">
            <OptionText k="footercta.eyebrow" as="div" className="eyebrow" />
            <OptionText
              k="footercta.title"
              as="h2"
              className="editorial mt-6 text-5xl md:text-8xl leading-[0.95]"
              accentClassName="editorial-italic"
            />
          </div>
          <div className="md:col-span-4">
            <OptionText k="footercta.description" as="p" className="text-muted-foreground text-lg leading-relaxed mb-6" />
            <form onSubmit={onSubmit} className="flex border border-border rounded-full overflow-hidden p-1 bg-ink">
              <input
                type="email"
                name="email"
                placeholder="seu@email.com"
                className="flex-1 bg-transparent outline-none px-4 text-sm text-foreground"
                required
              />
              <button
                type="submit"
                disabled={loading}
                className="px-5 h-11 rounded-full bg-primary text-primary-foreground text-sm font-medium hover:bg-primary-glow transition-colors inline-flex items-center disabled:opacity-60"
              >
                Começar →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
