import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Testimonial } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TestimonialFormProps {
  testimonial?: Testimonial | null;
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TestimonialForm = ({ testimonial, userId, onClose, onSuccess }: TestimonialFormProps) => {
  const [name, setName] = useState(testimonial?.name || '');
  const [role, setRole] = useState(testimonial?.role || '');
  const [company, setCompany] = useState(testimonial?.company || '');
  const [testimonialText, setTestimonialText] = useState(testimonial?.testimonial || '');
  const [section, setSection] = useState<'clients' | 'testimonials'>(testimonial?.section || 'clients');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim() || !role.trim() || !company.trim() || !testimonialText.trim()) {
        throw new Error('Preencha todos os campos');
      }

      if (testimonial) {
        // Update
        const { error: updateError } = await supabase
          .from('s_testimonials')
          .update({
            name,
            role,
            company,
            testimonial: testimonialText,
            section,
            updated_at: new Date().toISOString(),
          })
          .eq('id', testimonial.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        if (!userId) throw new Error('User ID não encontrado');

        const { error: insertError } = await supabase
          .from('s_testimonials')
          .insert([
            {
              name,
              role,
              company,
              testimonial: testimonialText,
              section,
              order_position: 0,
              is_active: true,
              created_by: userId,
            },
          ]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar depoimento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
      <Card className="w-full max-w-2xl p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {testimonial ? 'Editar Depoimento' : 'Adicionar Depoimento'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nome da Pessoa *
              </label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ex: João Silva"
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <div>
              <label htmlFor="role" className="block text-sm font-medium mb-2">
                Cargo *
              </label>
              <Input
                id="role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                placeholder="Ex: Diretor de Marketing"
                required
                disabled={loading}
              />
            </div>
          </div>

          <div>
            <label htmlFor="company" className="block text-sm font-medium mb-2">
              Empresa *
            </label>
            <Input
              id="company"
              value={company}
              onChange={(e) => setCompany(e.target.value)}
              placeholder="Ex: Empresa XYZ"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="testimonialText" className="block text-sm font-medium mb-2">
              Depoimento *
            </label>
            <textarea
              id="testimonialText"
              value={testimonialText}
              onChange={(e) => setTestimonialText(e.target.value)}
              placeholder="Escreva o depoimento aqui..."
              className="w-full px-3 py-2 border border-input rounded-md"
              rows={5}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="section" className="block text-sm font-medium mb-2">
              Seção de Exibição *
            </label>
            <select
              id="section"
              value={section}
              onChange={(e) => setSection(e.target.value as 'clients' | 'testimonials')}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
              disabled={loading}
            >
              <option value="clients">
                //clientes (Slider ao lado de "//em números")
              </option>
              <option value="testimonials">
                //Depoimentos (Seção de depoimentos)
              </option>
            </select>
          </div>

          {error && (
            <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading}
              className="flex-1"
            >
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
