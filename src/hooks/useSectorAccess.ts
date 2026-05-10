import { useAuth } from '@/contexts/SupabaseAuthContext';
import type { SectorFilter } from './useFinancialMetrics';

export type Sector = 'publico' | 'privado' | 'geral';

export interface SectorAccess {
  allowedSectors: Sector[];
  canViewAll: boolean;
  canViewPrivado: boolean;
  defaultSector: SectorFilter;
  isCEO: boolean;
}

const CEO_EMAILS = ['igor@visaobim.com'];
const PUBLIC_ONLY_EMAILS = ['stael@visaobim.com'];

export function useSectorAccess(): SectorAccess {
  const { profile } = useAuth();
  const email = profile?.email?.toLowerCase() || '';

  if (CEO_EMAILS.includes(email)) {
    return {
      allowedSectors: ['publico', 'privado', 'geral'],
      canViewAll: true,
      canViewPrivado: true,
      defaultSector: 'all',
      isCEO: true
    };
  }

  if (PUBLIC_ONLY_EMAILS.includes(email)) {
    return {
      allowedSectors: ['publico', 'geral'],
      canViewAll: false,
      canViewPrivado: false,
      defaultSector: 'publico',
      isCEO: false
    };
  }

  // Default: sem acesso
  return {
    allowedSectors: [],
    canViewAll: false,
    canViewPrivado: false,
    defaultSector: 'publico',
    isCEO: false
  };
}
