import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Index from "./pages/Index";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import { AuthProvider } from '@/lib/auth'
import RequireAuth from '@/lib/RequireAuth'
import { ThemeProvider } from 'next-themes'

const queryClient = new QueryClient();

const router = createBrowserRouter([
  { path: '/', element: <RequireAuth><Index /></RequireAuth> },
  { path: '/login', element: <Login /> },
  { path: '*', element: <NotFound /> },
], {
  // Opt into v7 future flags to match upcoming behavior and silence warnings
  future: {
    v7_startTransition: true,
    v7_relativeSplatPath: true,
  } as any,
})

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <RouterProvider router={router} />
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);


export default App;
