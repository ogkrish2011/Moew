import { GlassPanel } from "@/components/ui/glass-panel";
import { useGetBotStatus, useSetBotActivity, useReconnectBot, BotStatusStatus, BotStatusActivityType } from "@workspace/api-client-react";
import { Power, Settings2, RefreshCw, CircleDot } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function BotManagement() {
  const { data: bot, isLoading } = useGetBotStatus({ query: { refetchInterval: 10000 }});
  const updateActivity = useSetBotActivity();
  const reconnect = useReconnectBot();
  const { toast } = useToast();

  const [status, setStatus] = useState<BotStatusStatus>("online");
  const [activityType, setActivityType] = useState<BotStatusActivityType | "">("");
  const [activityName, setActivityName] = useState("");

  // Sync initial state
  useEffect(() => {
    if (bot) {
      setStatus(bot.status);
      setActivityType(bot.activityType || "");
      setActivityName(bot.activityName || "");
    }
  }, [bot]);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateActivity.mutateAsync({
        data: {
          status,
          activityType: activityType === "" ? null : activityType as BotStatusActivityType,
          activityName: activityName || null
        }
      });
      toast({ title: "Bot Updated", description: "Activity settings have been applied." });
    } catch (err) {
      toast({ variant: "destructive", title: "Update Failed", description: "Could not update bot status." });
    }
  };

  const handleReconnect = async () => {
    try {
      await reconnect.mutateAsync({});
      toast({ title: "Reconnecting", description: "Bot is reconnecting to Discord." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to initiate reconnect." });
    }
  };

  if (isLoading) return <div className="animate-pulse h-96 bg-muted/20 rounded-2xl" />;

  const statusColors = {
    online: "bg-emerald-500",
    idle: "bg-yellow-500",
    dnd: "bg-red-500",
    invisible: "bg-gray-500"
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Bot Management</h1>
        <p className="text-muted-foreground mt-1">Control Aegis Guard's presence and connection.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Status Card */}
        <div className="md:col-span-1 space-y-6">
          <GlassPanel className="text-center py-10 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
            
            <div className="relative inline-block mb-6">
              {bot?.avatar ? (
                <img 
                  src={`https://cdn.discordapp.com/avatars/${bot.id}/${bot.avatar}.png?size=256`}
                  className="w-32 h-32 rounded-3xl shadow-2xl shadow-black/50 border-4 border-background"
                  alt="Bot Avatar"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl shadow-2xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-4xl font-bold text-white border-4 border-background">
                  {bot?.username?.charAt(0)}
                </div>
              )}
              <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full border-4 border-background ${bot?.online ? statusColors[bot.status as keyof typeof statusColors] || 'bg-emerald-500' : 'bg-destructive'}`} />
            </div>

            <h2 className="text-2xl font-bold font-display">{bot?.username}</h2>
            <p className="text-muted-foreground mb-6">#{bot?.discriminator}</p>

            <div className="grid grid-cols-2 gap-4 text-left">
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Ping</p>
                <p className="font-semibold">{bot?.ping}ms</p>
              </div>
              <div className="bg-secondary/30 rounded-xl p-3 border border-border/50">
                <p className="text-xs text-muted-foreground mb-1">Status</p>
                <p className="font-semibold capitalize">{bot?.status}</p>
              </div>
            </div>

            <button
              onClick={handleReconnect}
              disabled={reconnect.isPending}
              className="mt-6 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-secondary hover:bg-secondary/80 text-foreground transition-colors font-medium border border-border"
            >
              <RefreshCw className={`w-4 h-4 ${reconnect.isPending ? 'animate-spin' : ''}`} />
              {reconnect.isPending ? 'Reconnecting...' : 'Force Reconnect'}
            </button>
          </GlassPanel>
        </div>

        {/* Controls Form */}
        <div className="md:col-span-2">
          <GlassPanel>
            <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-6">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Settings2 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold font-display">Presence Settings</h2>
            </div>

            <form onSubmit={handleUpdate} className="space-y-6">
              <div className="space-y-3">
                <label className="text-sm font-medium">Online Status</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {(['online', 'idle', 'dnd', 'invisible'] as const).map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setStatus(s)}
                      className={`flex items-center justify-center gap-2 py-3 rounded-xl border transition-all ${
                        status === s 
                          ? 'border-primary bg-primary/10 text-foreground shadow-sm' 
                          : 'border-border/50 bg-background/50 text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      <CircleDot className={`w-4 h-4 ${statusColors[s] && status === s ? statusColors[s].replace('bg-', 'text-') : ''}`} />
                      <span className="capitalize">{s}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Activity Type</label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value as any)}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all appearance-none"
                  >
                    <option value="">None</option>
                    <option value="playing">Playing</option>
                    <option value="streaming">Streaming</option>
                    <option value="listening">Listening to</option>
                    <option value="watching">Watching</option>
                    <option value="competing">Competing in</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-2">
                  <label className="text-sm font-medium">Activity Name</label>
                  <input
                    type="text"
                    value={activityName}
                    onChange={(e) => setActivityName(e.target.value)}
                    placeholder="e.g. Call of Duty, Spotify, etc."
                    disabled={!activityType}
                    className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all disabled:opacity-50"
                  />
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={updateActivity.isPending}
                  className="px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
                >
                  {updateActivity.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </GlassPanel>
        </div>
      </div>
    </div>
  );
}
