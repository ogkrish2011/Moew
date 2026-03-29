import { useState, useEffect } from 'react';
import type { BotEvent } from '@workspace/api-client-react';

export function useBotEventsStream() {
  const [events, setEvents] = useState<BotEvent[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const es = new EventSource('/api/sse/events');
    
    es.onopen = () => setConnected(true);
    
    es.onmessage = (e) => {
      try {
        const newEvent = JSON.parse(e.data) as BotEvent;
        setEvents((prev) => {
          // Keep last 50 events to avoid memory bloat
          const updated = [newEvent, ...prev];
          return updated.slice(0, 50);
        });
      } catch (err) {
        console.error('Failed to parse SSE event', err);
      }
    };
    
    es.onerror = () => {
      setConnected(false);
      es.close();
    };

    return () => {
      es.close();
    };
  }, []);

  return { events, connected };
}
