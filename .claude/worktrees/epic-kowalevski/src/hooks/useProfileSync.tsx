import { useEffect } from 'react';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';

/**
 * Hook para sincronizar dados do profile com o banco de dados
 * Força atualização dos dados quando necessário
 */
export const useProfileSync = () => {
  const { user, profile } = useAuth();
  const { profiles } = useSupabaseData();

  // Simplesmente retorna os dados mais atualizados
  const currentProfile = profiles.find(p => p.id === user?.id) || profile;

  return { profile: currentProfile, profiles };
};