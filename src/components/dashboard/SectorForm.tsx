import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Sector } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface SectorFormProps {
  sector?: Sector | null;
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const SectorForm = ({ sector, userId, onClose, onSuccess }: SectorFormProps) => {
  const [name, setName] = useState(sector?.name || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim()) {
        throw new Error('Preencha o nome do setor');
      }

      if (sector) {
        // Update
        const { error: updateError } = await supabase
          .from('s_sectors')
          .update({
            name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', sector.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        if (!userId) throw new Error('User ID não encontrado');

        const { error: insertError } = await supabase
          .from('s_sectors')
          .insert([
            {
              name,
              order_position: 0,
              is_active: true,
              created_by: userId,
            },
          ]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar setor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {sector ? 'Editar Setor' : 'Adicionar Setor'}
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
              Nome do Setor *
            </label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: SEO Técnico, CRO & Testes A/B, etc"
              required
              disabled={loading}
              autoFocus
            />
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
