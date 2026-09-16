import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Company } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface CompanyFormProps {
  company?: Company | null;
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const CompanyForm = ({ company, userId, onClose, onSuccess }: CompanyFormProps) => {
  const [name, setName] = useState(company?.name || '');
  const [logoUrl, setLogoUrl] = useState(company?.logo_url || '');
  const [logoAlt, setLogoAlt] = useState(company?.logo_alt || '');
  const [websiteUrl, setWebsiteUrl] = useState(company?.website_url || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name || !logoUrl) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (company) {
        // Update
        const { error: updateError } = await supabase
          .from('s_companies')
          .update({
            name,
            logo_url: logoUrl,
            logo_alt: logoAlt,
            website_url: websiteUrl || null,
            updated_at: new Date().toISOString(),
          })
          .eq('id', company.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        if (!userId) throw new Error('User ID não encontrado');

        const { error: insertError } = await supabase
          .from('s_companies')
          .insert([
            {
              name,
              logo_url: logoUrl,
              logo_alt: logoAlt || name,
              website_url: websiteUrl || null,
              order_position: 0,
              is_active: true,
              created_by: userId,
            },
          ]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {company ? 'Editar Empresa' : 'Adicionar Empresa'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 hover:bg-muted rounded"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-2">
              Nome da Empresa *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Google, Meta, etc"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="logoUrl" className="block text-sm font-medium mb-2">
              URL da Logo *
            </label>
            <Input
              id="logoUrl"
              type="url"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://exemplo.com/logo.png"
              required
              disabled={loading}
            />
            {logoUrl && (
              <div className="mt-2 p-2 bg-muted rounded flex items-center justify-center h-16">
                <img 
                  src={logoUrl} 
                  alt="Preview" 
                  className="max-h-14 max-w-xs object-contain"
                  onError={() => setError('URL da imagem inválida')}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="logoAlt" className="block text-sm font-medium mb-2">
              Texto Alternativo
            </label>
            <Input
              id="logoAlt"
              value={logoAlt}
              onChange={(e) => setLogoAlt(e.target.value)}
              placeholder="Descrição para acessibilidade"
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium mb-2">
              Site do cliente
            </label>
            <Input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://cliente.com"
              disabled={loading}
            />
            <p className="mt-2 text-xs text-muted-foreground">
              Se preenchido, o logo abre em nova aba com `target="_blank"`.
            </p>
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
