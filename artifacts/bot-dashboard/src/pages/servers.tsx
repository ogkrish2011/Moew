import { GlassPanel } from "@/components/ui/glass-panel";
import { useGetBotGuilds } from "@workspace/api-client-react";
import { Users, Calendar, Search } from "lucide-react";
import { useState } from "react";
import { format } from "date-fns";
import { motion } from "framer-motion";

export default function Servers() {
  const { data: guilds, isLoading } = useGetBotGuilds();
  const [search, setSearch] = useState("");

  const filteredGuilds = guilds?.filter(g => 
    g.name.toLowerCase().includes(search.toLowerCase()) || 
    g.id.includes(search)
  ) || [];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-display font-bold text-foreground">Servers</h1>
          <p className="text-muted-foreground mt-1">
            Viewing {filteredGuilds.length} of {guilds?.length || 0} servers.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input 
            type="text"
            placeholder="Search servers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl bg-background/50 border border-border backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-foreground placeholder:text-muted-foreground shadow-sm"
          />
        </div>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <GlassPanel key={i} className="h-40 animate-pulse bg-muted/20" />
          ))}
        </div>
      ) : filteredGuilds.length === 0 ? (
        <div className="py-20 text-center">
          <div className="w-16 h-16 mx-auto bg-muted/30 rounded-2xl flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-xl font-bold font-display">No servers found</h3>
          <p className="text-muted-foreground">Try adjusting your search query.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredGuilds.map((guild, i) => (
            <motion.div
              key={guild.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.2, delay: i * 0.05 }}
            >
              <GlassPanel hoverEffect className="p-5 flex flex-col h-full">
                <div className="flex items-start gap-4 mb-4">
                  {guild.icon ? (
                    <img 
                      src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
                      alt={guild.name}
                      className="w-14 h-14 rounded-xl shadow-md border border-border/50 bg-background"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center text-lg font-bold font-display border border-border/50">
                      {guild.name.charAt(0)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0 pt-1">
                    <h3 className="font-bold text-foreground truncate" title={guild.name}>
                      {guild.name}
                    </h3>
                    <p className="text-xs text-muted-foreground font-mono mt-1 truncate">
                      {guild.id}
                    </p>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-border/50 grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="w-4 h-4 text-primary" />
                    <span>{guild.memberCount.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground justify-end">
                    <Calendar className="w-4 h-4 text-accent" />
                    <span>{format(new Date(guild.joinedAt), 'MMM yyyy')}</span>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
