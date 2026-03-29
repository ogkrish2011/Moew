import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { 
  LayoutDashboard, 
  Bot, 
  Server, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import { useGetMe, useGetBotStatus, useLogout } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/bot", label: "Bot Controls", icon: Bot },
  { href: "/servers", label: "Servers", icon: Server },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const [location] = useLocation();
  const { data: user } = useGetMe();
  const { data: botStatus } = useGetBotStatus({ query: { refetchInterval: 10000 }});
  const logoutMutation = useLogout();
  const queryClient = useQueryClient();

  const handleLogout = async () => {
    await logoutMutation.mutateAsync({});
    queryClient.clear();
    window.location.href = "/login";
  };

  return (
    <aside className="w-64 h-screen fixed top-0 left-0 hidden md:flex flex-col bg-background/50 backdrop-blur-2xl border-r border-border z-40">
      {/* Bot Brand Header */}
      <div className="h-20 flex items-center px-6 border-b border-border/50 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 to-transparent pointer-events-none" />
        <div className="relative flex items-center gap-3">
          <div className="relative">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-accent flex items-center justify-center text-primary-foreground font-display font-bold shadow-lg shadow-primary/20">
              {botStatus?.username?.charAt(0) || "B"}
            </div>
            {botStatus && (
              <span className={cn(
                "absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-background",
                botStatus.online ? "bg-emerald-500" : "bg-destructive"
              )} />
            )}
          </div>
          <div>
            <h2 className="font-display font-bold text-base leading-tight truncate w-32">
              {botStatus?.username || "Loading..."}
            </h2>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <span className={cn(
                "w-1.5 h-1.5 rounded-full",
                botStatus?.online ? "bg-emerald-500" : "bg-destructive"
              )} />
              {botStatus?.online ? "Online" : "Offline"}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href;
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-primary text-primary-foreground shadow-md shadow-primary/20" 
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
              )}
            >
              <item.icon className={cn("w-5 h-5", isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-primary")} />
              <span className="font-medium text-sm">{item.label}</span>
              {isActive && <ChevronRight className="w-4 h-4 ml-auto opacity-70" />}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="p-4 border-t border-border/50">
        <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/30 border border-border/50">
          <img 
            src={user?.avatar ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png` : `https://ui-avatars.com/api/?name=${user?.username || 'User'}`} 
            alt="Avatar"
            className="w-10 h-10 rounded-full border border-border/50"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.globalName || user?.username}</p>
            <p className="text-xs text-muted-foreground truncate">@{user?.username}</p>
          </div>
          <button 
            onClick={handleLogout}
            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
