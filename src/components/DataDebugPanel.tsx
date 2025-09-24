import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useSupabaseData } from '@/contexts/SupabaseDataContext';
import { EyeOff, RefreshCw } from 'lucide-react';

export function DataDebugPanel() {
  const [isVisible, setIsVisible] = useState(false);
  const { user, profile, loading: authLoading } = useAuth();
  const {
    projects,
    tasks,
    proposals,
    profiles,
    projectsLoading,
    tasksLoading,
    proposalsLoading,
    profilesLoading,
    projectsError,
    tasksError,
    proposalsError,
    profilesError,
    refetchProjects,
    refetchTasks,
    refetchProposals,
    refetchProfiles
  } = useSupabaseData();

  const handleRefreshAll = () => {
    console.log('🔄 Manual refresh all data');
    refetchProjects();
    refetchTasks();
    refetchProposals();
    refetchProfiles();
  };

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={handleRefreshAll}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Atualizar Dados
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80 max-h-96 overflow-auto">
      <Card className="bg-background/95 backdrop-blur-sm border-2">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm">Painel de Atualizaçăo</CardTitle>
            <div className="flex gap-2">
              <Button
                onClick={handleRefreshAll}
                variant="outline"
                size="sm"
              >
                <RefreshCw className="h-3 w-3" />
              </Button>
              <Button
                onClick={() => setIsVisible(false)}
                variant="outline"
                size="sm"
              >
                <EyeOff className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-xs">
          {/* Auth Status */}
          <div>
            <div className="font-medium mb-1">Auth Status:</div>
            <div className="space-y-1">
              <Badge variant={user ? "default" : "destructive"}>
                User: {user ? "✅ Logged" : "❌ Not logged"}
              </Badge>
              <Badge variant={profile ? "default" : "secondary"}>
                Profile: {profile ? `✅ ${profile.full_name}` : "❌ Not loaded"}
              </Badge>
              <Badge variant={authLoading ? "secondary" : "default"}>
                Auth Loading: {authLoading ? "⏳" : "✅"}
              </Badge>
            </div>
          </div>

          {/* Data Status */}
          <div>
            <div className="font-medium mb-1">Data Status:</div>
            <div className="space-y-1">
              <Badge variant={projectsError ? "destructive" : "default"}>
                Projects: {projects.length} items {projectsLoading && "⏳"}
                {projectsError && "❌"}
              </Badge>
              <Badge variant={tasksError ? "destructive" : "default"}>
                Tasks: {tasks.length} items {tasksLoading && "⏳"}
                {tasksError && "❌"}
              </Badge>
              <Badge variant={proposalsError ? "destructive" : "default"}>
                Proposals: {proposals.length} items {proposalsLoading && "⏳"}
                {proposalsError && "❌"}
              </Badge>
              <Badge variant={profilesError ? "destructive" : "default"}>
                Profiles: {profiles.length} items {profilesLoading && "⏳"}
                {profilesError && "❌"}
              </Badge>
            </div>
          </div>

          {/* Errors */}
          {(projectsError || tasksError || proposalsError || profilesError) && (
            <div>
              <div className="font-medium mb-1 text-destructive">Errors:</div>
              <div className="space-y-1 text-destructive text-xs">
                {projectsError && <div>Projects: {projectsError}</div>}
                {tasksError && <div>Tasks: {tasksError}</div>}
                {proposalsError && <div>Proposals: {proposalsError}</div>}
                {profilesError && <div>Profiles: {profilesError}</div>}
              </div>
            </div>
          )}

          {/* User Info */}
          {user && (
            <div>
              <div className="font-medium mb-1">User Info:</div>
              <div className="text-xs space-y-1">
                <div>ID: {user.id.slice(0, 8)}...</div>
                <div>Email: {user.email}</div>
                <div>Role: {profile?.role || 'Not loaded'}</div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}