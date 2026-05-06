import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { useToast } from '@/hooks/use-toast';

interface TaskRestrictionModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: any;
}

const TaskRestrictionModal = ({ isOpen, onClose, task }: TaskRestrictionModalProps) => {
  const { updateTask, profiles } = useSupabaseData();
  const { toast } = useToast();

  const [selectedRestrictions, setSelectedRestrictions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Lista de responsáveis disponíveis (excluindo o próprio usuário)
  const availableUsers = profiles.filter(profile => 
    !task?.assigned_to?.includes(profile.id)
  );

  useEffect(() => {
    if (task && task.restricoes) {
      // Agora restricoes é jsonb, pode ser array direto ou string JSON
      if (Array.isArray(task.restricoes)) {
        setSelectedRestrictions(task.restricoes);
      } else if (typeof task.restricoes === 'string') {
        try {
          const parsed = JSON.parse(task.restricoes);
          if (Array.isArray(parsed)) {
            setSelectedRestrictions(parsed);
          } else {
            setSelectedRestrictions([]);
          }
        } catch {
          setSelectedRestrictions([]);
        }
      } else {
        setSelectedRestrictions([]);
      }
    } else {
      setSelectedRestrictions([]);
    }
  }, [task]);

  const handleSave = async () => {
    if (!task) return;
    
    setLoading(true);
    try {
      await updateTask(task.id, {
        restricoes: selectedRestrictions // Agora é jsonb, não precisa stringify
      });

      toast({
        title: "Restrições atualizadas",
        description: "As restrições da tarefa foram salvas com sucesso.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as restrições.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRestrictionChange = (userId: string, checked: boolean) => {
    if (checked) {
      setSelectedRestrictions(prev => [...prev, userId]);
    } else {
      setSelectedRestrictions(prev => prev.filter(id => id !== userId));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Restrições da Tarefa</DialogTitle>
          <DialogDescription>
            Selecione os usuários que precisam concluir suas dependências antes desta tarefa ser liberada.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label className="text-sm font-medium mb-3 block">
              Aguardando conclusão de:
            </Label>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {availableUsers.length > 0 ? (
                availableUsers.map((user) => (
                  <div key={user.id} className="flex items-center space-x-3">
                    <Checkbox
                      id={`restriction-${user.id}`}
                      checked={selectedRestrictions.includes(user.id)}
                      onCheckedChange={(checked) => 
                        handleRestrictionChange(user.id, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`restriction-${user.id}`}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {user.full_name || user.email}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhum usuário disponível para restrições.
                </p>
              )}
            </div>
          </div>

          {selectedRestrictions.length > 0 && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-2">
                Restrições ativas:
              </p>
              <div className="flex flex-wrap gap-1">
                {selectedRestrictions.map(userId => {
                  const user = profiles.find(p => p.id === userId);
                  return (
                    <span 
                      key={userId} 
                      className="text-xs bg-primary/10 text-primary px-2 py-1 rounded"
                    >
                      {user?.full_name || user?.email || 'Usuário'}
                    </span>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Restrições'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default TaskRestrictionModal;