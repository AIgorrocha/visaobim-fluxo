import { createRoot } from "react-dom/client";
import { BrowserRouter } from 'react-router-dom';
import App from "./App.tsx";
import "./index.css";
import { AuthProvider } from './contexts/SupabaseAuthContext';
import { SupabaseDataProvider } from './contexts/SupabaseDataContext';
import { ThemeProvider } from './providers/ThemeProvider';
import { Toaster } from '@/components/ui/toaster';

createRoot(document.getElementById("root")!).render(
  <BrowserRouter>
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      <AuthProvider>
        <SupabaseDataProvider>
          <App />
          <Toaster />
        </SupabaseDataProvider>
      </AuthProvider>
    </ThemeProvider>
  </BrowserRouter>
);
