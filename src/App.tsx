import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/SupabaseAuthContext";
import { SupabaseDataProvider } from "@/contexts/SupabaseDataContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { Layout } from "@/components/layout/Layout";
import { DataDebugPanel } from "@/components/DataDebugPanel";
import { TaskNotificationSystem } from "@/components/TaskNotificationSystem";

// Pages
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Projetos from "./pages/Projetos";
import MinhasTarefas from "./pages/MinhasTarefas";
import Equipe from "./pages/Equipe";
import Conquistas from "./pages/Conquistas";
import Financeiro from "./pages/Financeiro";
import Propostas from "./pages/Propostas";
import Relatorios from "./pages/Relatorios";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <SupabaseDataProvider>
        <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/projetos" element={
              <ProtectedRoute>
                <Layout>
                  <Projetos />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/minhas-tarefas" element={
              <ProtectedRoute>
                <Layout>
                  <MinhasTarefas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/equipe" element={
              <ProtectedRoute>
                <Layout>
                  <Equipe />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/conquistas" element={
              <ProtectedRoute>
                <Layout>
                  <Conquistas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/financeiro" element={
              <ProtectedRoute>
                <Layout>
                  <Financeiro />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/propostas" element={
              <ProtectedRoute adminOnly>
                <Layout>
                  <Propostas />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/relatorios" element={
              <ProtectedRoute>
                <Layout>
                  <Relatorios />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="/configuracoes" element={
              <ProtectedRoute>
                <Layout>
                  <Configuracoes />
                </Layout>
              </ProtectedRoute>
            } />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
        <DataDebugPanel />
        <TaskNotificationSystem />
        </TooltipProvider>
      </SupabaseDataProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
