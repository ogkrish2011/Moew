import { ReactNode, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";

export function AppLayout({ children }: { children: ReactNode }) {
  const { data: user, isLoading, isError } = useGetMe({ 
    query: { retry: false } 
  });
  const [, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && (isError || !user)) {
      setLocation("/login");
    }
  }, [isLoading, isError, user, setLocation]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      </div>
    );
  }

  if (isError || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/30">
      <Sidebar />
      <main className="md:ml-64 min-h-screen relative overflow-hidden">
        {/* Decorative background glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/5 blur-[120px] pointer-events-none" />
        
        <div className="p-4 md:p-8 max-w-7xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={window.location.pathname}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
