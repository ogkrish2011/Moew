import { GlassPanel } from "@/components/ui/glass-panel";
import { useGetStatsOverview } from "@workspace/api-client-react";
import { useBotEventsStream } from "@/hooks/use-sse";
import { Server, Users, Hash, Command, MessageSquare, Clock, Activity, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const { data: stats, isLoading } = useGetStatsOverview({ 
    query: { refetchInterval: 5000 } 
  });
  const { events, connected } = useBotEventsStream();

  const formatUptime = (seconds?: number) => {
    if (!seconds) return "0s";
    const days = Math.floor(seconds / (3600*24));
    const hrs = Math.floor(seconds % (3600*24) / 3600);
    const mins = Math.floor(seconds % 3600 / 60);
    return `${days}d ${hrs}h ${mins}m`;
  };

  const statCards = [
    { label: "Servers", value: stats?.guildCount ?? 0, icon: Server, color: "text-blue-500", bg: "bg-blue-500/10" },
    { label: "Members", value: stats?.userCount ?? 0, icon: Users, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { label: "Channels", value: stats?.channelCount ?? 0, icon: Hash, color: "text-purple-500", bg: "bg-purple-500/10" },
    { label: "Commands Run", value: stats?.commandsRun ?? 0, icon: Command, color: "text-orange-500", bg: "bg-orange-500/10" },
    { label: "Messages", value: stats?.messagesProcessed ?? 0, icon: MessageSquare, color: "text-pink-500", bg: "bg-pink-500/10" },
    { label: "Uptime", value: formatUptime(stats?.uptime), icon: Clock, color: "text-cyan-500", bg: "bg-cyan-500/10" },
    { label: "Latency", value: `${stats?.ping ?? 0}ms`, icon: Activity, color: "text-yellow-500", bg: "bg-yellow-500/10" },
    { label: "Memory", value: `${stats?.memoryUsageMb?.toFixed(1) ?? 0} MB`, icon: Zap, color: "text-red-500", bg: "bg-red-500/10" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Real-time overview of Aegis Guard's performance.</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <GlassPanel key={i} className="h-32 animate-pulse bg-muted/50" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.05 }}
            >
              <GlassPanel hoverEffect className="flex flex-col justify-between">
                <div className="flex justify-between items-start mb-4">
                  <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                  <div className={`p-2 rounded-lg ${stat.bg}`}>
                    <stat.icon className={`w-4 h-4 ${stat.color}`} />
                  </div>
                </div>
                <h3 className="text-3xl font-bold font-display tracking-tight text-foreground">
                  {stat.value.toLocaleString()}
                </h3>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <GlassPanel className="h-[400px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold font-display">System Resources</h2>
              <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium border border-primary/20">
                Polling active
              </div>
            </div>
            
            {/* Visual placeholder for a chart to make it look stunning even if simple */}
            <div className="flex-1 relative rounded-xl border border-border/50 bg-background/30 overflow-hidden flex items-end">
               <div className="absolute inset-0 bg-grid-white/[0.02] bg-[length:32px_32px]" />
               {/* Decorative pseudo-chart bars */}
               <div className="w-full flex items-end justify-between px-4 gap-2 h-full pb-4 opacity-50">
                 {[...Array(20)].map((_, i) => {
                   const height = 20 + Math.random() * 60;
                   return (
                     <div 
                       key={i} 
                       className="w-full bg-gradient-to-t from-primary/80 to-accent/80 rounded-t-sm"
                       style={{ height: `${height}%`, opacity: i === 19 ? 1 : 0.4 }}
                     />
                   )
                 })}
               </div>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center backdrop-blur-md bg-background/50 p-4 rounded-xl border border-border">
                  <p className="text-sm text-muted-foreground">CPU Usage</p>
                  <p className="text-3xl font-bold text-primary">{stats?.cpuUsagePercent?.toFixed(1) || 0}%</p>
               </div>
            </div>
          </GlassPanel>
        </div>

        <div className="lg:col-span-1">
          <GlassPanel className="h-[400px] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold font-display">Live Events</h2>
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${connected ? 'bg-emerald-500 animate-pulse' : 'bg-destructive'}`} />
                <span className="text-xs text-muted-foreground">{connected ? 'Live' : 'Offline'}</span>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4">
              {events.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-muted-foreground">
                  <Activity className="w-8 h-8 mb-2 opacity-20" />
                  <p className="text-sm">Waiting for events...</p>
                </div>
              ) : (
                events.map((event) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={event.id}
                    className="p-3 rounded-lg bg-secondary/30 border border-border/50 text-sm"
                  >
                    <div className="flex justify-between items-start mb-1">
                      <span className="font-semibold text-primary">{event.type}</span>
                      <span className="text-[10px] text-muted-foreground">
                        {formatDistanceToNow(new Date(event.timestamp), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-foreground">{event.description}</p>
                    {event.guildName && (
                      <p className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                        <Server className="w-3 h-3" /> {event.guildName}
                      </p>
                    )}
                  </motion.div>
                ))
              )}
            </div>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
