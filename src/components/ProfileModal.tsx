import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Profile } from '@/types';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  profile?: Profile | null;
  mode: 'create' | 'edit' | 'view';
}

const ProfileModal = ({ isOpen, onClose, profile, mode }: ProfileModalProps) => {
  const { createProfile, updateProfileData } = useSupabaseData();
  const { user, profile: currentUserProfile } = useAuth();

  const isAdmin = currentUserProfile?.role === 'admin';
  const isOwnProfile = profile?.id === user?.id;
  const canEdit = isAdmin || (mode === 'edit' && isOwnProfile);
  const isReadOnly = mode === 'view' || (!canEdit && mode !== 'create');

  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    role: 'user' as 'admin' | 'user',
    avatar_url: '',
    points: 0,
    level: 1
  });

  useEffect(() => {
    if (profile && (mode === 'edit' || mode === 'view')) {
      setFormData({
        full_name: profile.full_name || '',
        email: profile.email || '',
        role: profile.role || 'user',
        avatar_url: profile.avatar_url || '',
        points: profile.points || 0,
        level: profile.level || 1
      });
    } else if (mode === 'create') {
      setFormData({
        full_name: '',
        email: '',
        role: 'user',
        avatar_url: '',
        points: 0,
        level: 1
      });
    }
  }, [profile, mode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (mode === 'create') {
        await createProfile(formData);
      } else if (mode === 'edit' && profile) {
        await updateProfileData(profile.id, formData);
      }
      onClose();
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case 'create': return 'Novo Membro';
      case 'edit': return 'Editar Perfil';
      case 'view': return 'Visualizar Perfil';
      default: return 'Perfil';
    }
  };

  const getLevelName = (level: number) => {
    const levels = [
      'Iniciante', 'Aprendiz', 'Profissional', 'Especialista', 'Mestre',
      'Expert', 'Sênior', 'Líder', 'Campeão', 'Lenda'
    ];
    return levels[level - 1] || 'Iniciante';
  };

  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getTitle()}</DialogTitle>
          <DialogDescription>
            {mode === 'create' && 'Preencha as informações para criar um novo membro da equipe.'}
            {mode === 'edit' && 'Edite as informações do perfil.'}
            {mode === 'view' && 'Visualize as informações do perfil.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar Section */}
          <div className="flex items-center space-x-4">
            <Avatar className="h-20 w-20">
              <AvatarImage src={formData.avatar_url} alt={formData.full_name} />
              <AvatarFallback className="bg-primary text-primary-foreground text-lg">
                {getInitials(formData.full_name)}
              </AvatarFallback>
            </Avatar>
            <div className="space-y-2 flex-1">
              <Label htmlFor="avatar_url">URL do Avatar (opcional)</Label>
              <Input
                id="avatar_url"
                type="url"
                value={formData.avatar_url}
                onChange={(e) => setFormData(prev => ({ ...prev, avatar_url: e.target.value }))}
                placeholder="https://exemplo.com/avatar.jpg"
                readOnly={isReadOnly}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nome Completo</Label>
              <Input
                id="full_name"
                value={formData.full_name}
                onChange={(e) => setFormData(prev => ({ ...prev, full_name: e.target.value }))}
                placeholder="Nome completo do usuário"
                required
                readOnly={isReadOnly}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                placeholder="usuario@exemplo.com"
                required
                readOnly={isReadOnly || mode === 'edit'} // E-mail não pode ser editado após criação
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Função</Label>
              <Select
                value={formData.role}
                onValueChange={(value: 'admin' | 'user') =>
                  setFormData(prev => ({ ...prev, role: value }))
                }
                disabled={isReadOnly || !isAdmin} // Apenas admin pode alterar funções
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="user">Usuário</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="level">Nível</Label>
              <div className="flex items-center space-x-2">
                <Input
                  id="level"
                  type="number"
                  min="1"
                  max="10"
                  value={formData.level}
                  onChange={(e) => setFormData(prev => ({ ...prev, level: parseInt(e.target.value) || 1 }))}
                  readOnly={isReadOnly || (!isAdmin && !isOwnProfile)} // Admin pode editar qualquer, user só o próprio
                  className="w-20"
                />
                <Badge variant="secondary">
                  {getLevelName(formData.level)}
                </Badge>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="points">Pontos</Label>
              <Input
                id="points"
                type="number"
                min="0"
                value={formData.points}
                onChange={(e) => setFormData(prev => ({ ...prev, points: parseInt(e.target.value) || 0 }))}
                readOnly={isReadOnly || !isAdmin} // Apenas admin pode alterar pontos
              />
            </div>
          </div>

          {/* Informações Adicionais - Visível em modo visualização */}
          {mode === 'view' && profile && (
            <div className="space-y-4 pt-4 border-t">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Membro desde</Label>
                  <div className="text-sm text-muted-foreground">
                    {profile.created_at ? new Date(profile.created_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Não informado'}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Última atualização</Label>
                  <div className="text-sm text-muted-foreground">
                    {profile.updated_at ? new Date(profile.updated_at).toLocaleDateString('pt-BR', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Nunca'}
                  </div>
                </div>
              </div>

              {/* Status e badges */}
              <div className="space-y-2">
                <Label>Status</Label>
                <div className="flex items-center space-x-2">
                  <Badge className="bg-accent text-accent-foreground">
                    {formData.points} pontos
                  </Badge>
                  <Badge variant="secondary">
                    Nível {formData.level} - {getLevelName(formData.level)}
                  </Badge>
                  <Badge variant={formData.role === 'admin' ? 'default' : 'outline'}>
                    {formData.role === 'admin' ? 'Administrador' : 'Usuário'}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              {mode === 'view' ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReadOnly && canEdit && (
              <Button type="submit">
                {mode === 'create' ? 'Criar Perfil' : 'Salvar Alterações'}
              </Button>
            )}
            {!canEdit && mode !== 'view' && (
              <div className="text-xs text-muted-foreground">
                {!isAdmin && !isOwnProfile ? 'Apenas administradores podem editar outros perfis' : ''}
              </div>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProfileModal;