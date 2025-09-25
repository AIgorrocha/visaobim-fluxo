import { useToast } from "@/hooks/use-toast";

/**
 * Hook para mostrar notificações de atualização de tarefas
 */
export const useTaskUpdateToast = () => {
  const { toast } = useToast();

  const showTaskCompleted = (taskTitle: string) => {
    toast({
      title: "Tarefa Concluída! ✅",
      description: `${taskTitle} foi marcada como concluída.`,
      duration: 5000,
    });
  };

  const showTaskUpdated = (taskTitle: string) => {
    toast({
      title: "Tarefa Atualizada",
      description: `${taskTitle} foi atualizada com sucesso.`,
      duration: 3000,
    });
  };

  const showTaskCreated = (taskTitle: string) => {
    toast({
      title: "Nova Tarefa Criada",
      description: `${taskTitle} foi criada com sucesso.`,
      duration: 3000,
    });
  };

  return {
    showTaskCompleted,
    showTaskUpdated,
    showTaskCreated,
  };
};