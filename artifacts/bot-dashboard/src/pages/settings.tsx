import { GlassPanel } from "@/components/ui/glass-panel";
import { useGetSettings, useUpdateSettings, DashboardSettingsTheme } from "@workspace/api-client-react";
import { useTheme } from "@/hooks/use-theme";
import { Palette, ShieldAlert, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

const THEMES: { id: DashboardSettingsTheme, name: string, colors: string[] }[] = [
  { id: "dark", name: "Dark (Default)", colors: ["#1a1a1a", "#ffffff", "#4a4a4a"] },
  { id: "light", name: "Light", colors: ["#ffffff", "#1a1a1a", "#e5e5e5"] },
  { id: "midnight", name: "Midnight", colors: ["#0f172a", "#8b5cf6", "#1e293b"] },
  { id: "ocean", name: "Ocean", colors: ["#083344", "#0ea5e9", "#164e63"] },
  { id: "forest", name: "Forest", colors: ["#052e16", "#22c55e", "#064e3b"] },
  { id: "sunset", name: "Sunset", colors: ["#450a0a", "#f97316", "#7f1d1d"] },
];

export default function Settings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const { theme, setTheme } = useTheme();
  const { toast } = useToast();

  const [allowedUsers, setAllowedUsers] = useState<string>("");

  useEffect(() => {
    if (settings) {
      setTheme(settings.theme);
      setAllowedUsers(settings.allowedUserIds?.join(", ") || "");
    }
  }, [settings, setTheme]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        data: {
          theme,
          allowedUserIds: allowedUsers.split(",").map(s => s.trim()).filter(Boolean),
          ownerId: settings?.ownerId
        }
      });
      toast({ title: "Settings Saved", description: "Dashboard configuration updated." });
    } catch (err) {
      toast({ variant: "destructive", title: "Error", description: "Failed to save settings." });
    }
  };

  if (isLoading) return <div className="animate-pulse h-96 bg-muted/20 rounded-2xl" />;

  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-display font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">Configure your dashboard experience.</p>
      </div>

      <GlassPanel>
        <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-6">
          <div className="p-2 rounded-lg bg-primary/10 text-primary">
            <Palette className="w-5 h-5" />
          </div>
          <h2 className="text-xl font-bold font-display">Appearance</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {THEMES.map((t) => (
            <button
              key={t.id}
              onClick={() => setTheme(t.id)}
              className={`p-4 rounded-xl border text-left transition-all ${
                theme === t.id 
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20" 
                  : "border-border/50 hover:border-border hover:bg-secondary/30"
              }`}
            >
              <div className="flex gap-2 mb-3">
                {t.colors.map((c, i) => (
                  <div key={i} className="w-6 h-6 rounded-full border border-black/10 shadow-sm" style={{ backgroundColor: c }} />
                ))}
              </div>
              <p className="font-medium text-sm">{t.name}</p>
            </button>
          ))}
        </div>
      </GlassPanel>

      <GlassPanel>
        <div className="flex items-center gap-3 mb-6 border-b border-border/50 pb-6">
          <div className="p-2 rounded-lg bg-destructive/10 text-destructive">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-display">Access Control</h2>
            <p className="text-sm text-muted-foreground">Manage who can view this dashboard</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2">Owner ID (Immutable)</label>
            <input 
              type="text" 
              disabled 
              value={settings?.ownerId || "Not set"} 
              className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-muted-foreground cursor-not-allowed font-mono text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Allowed User IDs</label>
            <p className="text-xs text-muted-foreground mb-3">Comma-separated list of Discord User IDs allowed to login.</p>
            <textarea 
              value={allowedUsers}
              onChange={(e) => setAllowedUsers(e.target.value)}
              rows={3}
              placeholder="123456789, 987654321"
              className="w-full px-4 py-3 rounded-xl bg-background border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all font-mono text-sm resize-none"
            />
          </div>
        </div>
      </GlassPanel>

      <div className="flex justify-end pt-4">
        <button
          onClick={handleSave}
          disabled={updateSettings.isPending}
          className="flex items-center gap-2 px-8 py-3 rounded-xl font-semibold bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all duration-200 disabled:opacity-50"
        >
          <Save className="w-5 h-5" />
          {updateSettings.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>
    </div>
  );
}
