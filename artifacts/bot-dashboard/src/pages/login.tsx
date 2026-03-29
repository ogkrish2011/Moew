import { GlassPanel } from "@/components/ui/glass-panel";
import { motion } from "framer-motion";
import { LogIn } from "lucide-react";
import { useGetMe } from "@workspace/api-client-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

export default function Login() {
  const [, setLocation] = useLocation();
  const { data: user, isLoading } = useGetMe({ query: { retry: false }});

  useEffect(() => {
    if (user && !isLoading) {
      setLocation("/");
    }
  }, [user, isLoading, setLocation]);

  const handleLogin = () => {
    // Escape any iframe context (e.g. preview panes) so Discord OAuth works
    if (window.top && window.top !== window.self) {
      window.top.location.href = "/api/auth/discord";
    } else {
      window.location.href = "/api/auth/discord";
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-background">
      {/* Background Image & Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={`${import.meta.env.BASE_URL}images/login-bg.png`}
          alt="Login Background"
          className="w-full h-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px]" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md px-4"
      >
        <GlassPanel className="p-10 text-center border-white/10 shadow-2xl shadow-black/50">
          <div className="w-20 h-20 mx-auto bg-gradient-to-tr from-primary to-accent rounded-2xl flex items-center justify-center mb-8 shadow-lg shadow-primary/20">
            <BotIcon className="w-10 h-10 text-primary-foreground" />
          </div>
          
          <h1 className="text-3xl font-display font-bold text-foreground mb-3 tracking-tight">
            Aegis Guard
          </h1>
          <p className="text-muted-foreground mb-10 leading-relaxed">
            Manage Aegis Guard, view real-time statistics, and configure settings from one beautiful interface.
          </p>

          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="w-full relative group overflow-hidden rounded-xl p-[1px]"
          >
            <span className="absolute inset-0 bg-gradient-to-r from-[#5865F2] to-[#7289da] rounded-xl opacity-80 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative flex items-center justify-center gap-3 bg-background/20 backdrop-blur-sm px-6 py-4 rounded-xl text-white font-semibold transition-all duration-300 group-hover:bg-transparent">
              <DiscordLogo className="w-5 h-5" />
              <span>Login with Discord</span>
              <LogIn className="w-4 h-4 ml-2 opacity-70 group-hover:translate-x-1 transition-transform" />
            </div>
          </button>
        </GlassPanel>
      </motion.div>
    </div>
  );
}

function BotIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8" />
      <rect width="16" height="12" x="4" y="8" rx="2" />
      <path d="M2 14h2" />
      <path d="M20 14h2" />
      <path d="M15 13v2" />
      <path d="M9 13v2" />
    </svg>
  );
}

function DiscordLogo(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z" />
    </svg>
  );
}
