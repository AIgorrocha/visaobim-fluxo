import { supabase } from '@/integrations/supabase/client';

export const createAllUsers = async () => {
  try {
    console.log('Iniciando criação de usuários...');
    
    // Call the edge function to create users
    const { data, error } = await supabase.functions.invoke('create-users', {
      body: {}
    });

    if (error) {
      console.error('Erro ao executar função:', error);
      throw error;
    }

    console.log('Resultado da criação:', data);
    return data;
    
  } catch (error) {
    console.error('Erro no processo:', error);
    throw error;
  }
};

// Execute if called directly
if (typeof window !== 'undefined') {
  (window as any).createUsers = createAllUsers;
}