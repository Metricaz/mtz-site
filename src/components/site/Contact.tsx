import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

export const Contact = () => {
  const [loading, setLoading] = useState(false);
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    setLoading(true);

    try {
      const payload = {
        name: String(formData.get('name') || '').trim(),
        company: String(formData.get('company') || '').trim(),
        email: String(formData.get('email') || '').trim(),
        phone: String(formData.get('phone') || '').trim(),
        message: String(formData.get('message') || '').trim(),
        source_page: `${window.location.pathname}${window.location.hash}`,
        source_context: 'site-contact-form',
      };

      const { error } = await supabase.functions.invoke('contact-form', {
        body: payload,
      });

      if (error) {
        throw error;
      }

        toast.success('Mensagem recebida! Ela já foi salva no banco.');
      form.reset();
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error('Nao foi possivel enviar a mensagem agora.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contato" className="relative overflow-hidden">
      <div className="grid md:grid-cols-12 min-h-[80vh]">
        {/* left: orange editorial panel */}
        <div className="md:col-span-5 surface-orange relative p-10 md:p-16 flex flex-col justify-between">
          <div>
            <div className="mono-tag text-primary-foreground/80">{"// Contato"}</div>
            <h2 className="editorial mt-6 text-5xl md:text-7xl text-primary-foreground">
              Vamos<br />
              <span className="editorial-italic">conversar?</span>
            </h2>
            <p className="mt-8 max-w-md text-primary-foreground/90 text-lg leading-relaxed">
              Conte rapidamente sobre o desafio. Em até 1 dia útil retornamos com próximos passos.
            </p>
          </div>

          <div className="mt-12 space-y-6 text-primary-foreground/95">
            <div>
              <div className="mono-tag text-primary-foreground/70 mb-2">E-mail</div>
              <a href="mailto:contato@metricaz.com" className="editorial text-2xl md:text-3xl underline-offset-4 hover:underline">
                contato@metricaz.com
              </a>
            </div>
            <div className="grid grid-cols-2 gap-6 pt-6 border-t border-primary-foreground/20">
              <div>
                <div className="mono-tag text-primary-foreground/70 mb-2">Horário</div>
                <span className="text-base">Seg–Sex · 9h às 18h</span>
              </div>
              <div>
                <div className="mono-tag text-primary-foreground/70 mb-2">São Paulo</div>
                <span className="text-base">Av. Paulista, 1000</span>
              </div>
            </div>
          </div>
        </div>

        {/* right: form on ink */}
        <div className="md:col-span-7 bg-ink-deep p-10 md:p-16 flex items-center">
          <form onSubmit={onSubmit} className="w-full max-w-xl mx-auto space-y-7">
            <div className="grid md:grid-cols-2 gap-7">
              <Field label="Nome" name="name" />
              <Field label="Empresa" name="company" />
              <Field label="E-mail" name="email" type="email" />
              <Field label="Telefone" name="phone" />
            </div>
            <Field label="Como podemos ajudar?" name="message" textarea />
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-auto inline-flex items-center justify-center gap-2 px-8 h-14 rounded-full bg-primary text-primary-foreground font-medium hover:bg-primary-glow transition-colors disabled:opacity-60"
            >
              {loading ? "Enviando..." : "Enviar mensagem"}
              <span>→</span>
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

const Field = ({
  label,
  name,
  type = "text",
  textarea,
}: {
  label: string;
  name: string;
  type?: string;
  textarea?: boolean;
}) => (
  <label className="block group">
    <span className="mono-tag text-muted-foreground block mb-2">{label}</span>
    {textarea ? (
      <textarea
        name={name}
        rows={4}
        required
        className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-3 transition-colors resize-none text-foreground"
      />
    ) : (
      <input
        name={name}
        type={type}
        required
        className="w-full bg-transparent border-b border-border focus:border-primary outline-none py-3 transition-colors text-foreground"
      />
    )}
  </label>
);
