import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { TeamMember } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { X } from 'lucide-react';

interface TeamFormProps {
  member?: TeamMember | null;
  userId?: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const TeamForm = ({ member, userId, onClose, onSuccess }: TeamFormProps) => {
  const [name, setName] = useState(member?.name || '');
  const [role, setRole] = useState(member?.role || '');
  const [bio, setBio] = useState(member?.bio || '');
  const [imageUrl, setImageUrl] = useState(member?.image_url || '');
  const [imageAlt, setImageAlt] = useState(member?.image_alt || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!name.trim() || !role.trim() || !imageUrl.trim()) {
        throw new Error('Preencha todos os campos obrigatórios');
      }

      if (member) {
        // Update
        const { error: updateError } = await supabase
          .from('s_team')
          .update({
            name,
            role,
            bio,
            image_url: imageUrl,
            image_alt: imageAlt || name,
            updated_at: new Date().toISOString(),
          })
          .eq('id', member.id);

        if (updateError) throw updateError;
      } else {
        // Insert
        if (!userId) throw new Error('User ID não encontrado');

        const { error: insertError } = await supabase
          .from('s_team')
          .insert([
            {
              name,
              role,
              bio,
              image_url: imageUrl,
              image_alt: imageAlt || name,
              order_position: 0,
              is_active: true,
              created_by: userId,
            },
          ]);

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao salvar membro');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50 overflow-auto">
      <Card className="w-full max-w-md p-6 my-8">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            {member ? 'Editar Membro' : 'Adicionar Membro'}
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
              Nome Completo *
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
              placeholder="Ex: Founder · Head of Analytics"
              required
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium mb-2">
              Bio (Opcional)
            </label>
            <textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Breve descrição sobre o membro"
              className="w-full px-3 py-2 border border-input rounded-md"
              rows={3}
              disabled={loading}
            />
          </div>

          <div>
            <label htmlFor="imageUrl" className="block text-sm font-medium mb-2">
              URL da Foto *
            </label>
            <Input
              id="imageUrl"
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://exemplo.com/foto.jpg"
              required
              disabled={loading}
            />
            {imageUrl && (
              <div className="mt-2 p-2 bg-muted rounded flex items-center justify-center h-32">
                <img 
                  src={imageUrl} 
                  alt="Preview" 
                  className="max-h-28 max-w-xs object-cover rounded"
                  onError={() => setError('URL da imagem inválida')}
                />
              </div>
            )}
          </div>

          <div>
            <label htmlFor="imageAlt" className="block text-sm font-medium mb-2">
              Texto Alternativo
            </label>
            <Input
              id="imageAlt"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Descrição para acessibilidade"
              disabled={loading}
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
