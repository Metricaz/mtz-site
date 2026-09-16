import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { WhatsAppClick } from '@/lib/types';
import { isMissingSupabaseTableError } from '@/lib/supabase-errors';

type CountItem = { label: string; count: number };

type WhatsAppAnalyticsSummary = {
  today: number;
  week: number;
  month: number;
  topPages: CountItem[];
  topContexts: CountItem[];
  topHours: CountItem[];
};

const emptySummary: WhatsAppAnalyticsSummary = {
  today: 0,
  week: 0,
  month: 0,
  topPages: [],
  topContexts: [],
  topHours: [],
};

export const useWhatsAppAnalytics = () => {
  const [clicks, setClicks] = useState<WhatsAppClick[]>([]);
  const [loading, setLoading] = useState(true);
  const [available, setAvailable] = useState(true);

  useEffect(() => {
    const fetchClicks = async () => {
      try {
        setLoading(true);

        const since = new Date();
        since.setDate(since.getDate() - 90);

        const { data, error } = await supabase
          .from('s_whatsapp_clicks')
          .select('*')
          .gte('clicked_at', since.toISOString())
          .order('clicked_at', { ascending: false });

        if (error) {
          if (isMissingSupabaseTableError(error)) {
            setAvailable(false);
            setClicks([]);
            return;
          }

          throw error;
        }

        setAvailable(true);
        setClicks((data || []) as WhatsAppClick[]);
      } catch (error) {
        console.error('Error fetching WhatsApp analytics:', error);
        setClicks([]);
        setAvailable(false);
      } finally {
        setLoading(false);
      }
    };

    fetchClicks();
  }, []);

  const summary = useMemo<WhatsAppAnalyticsSummary>(() => {
    if (clicks.length === 0) {
      return emptySummary;
    }

    const now = new Date();
    const startOfDay = new Date(now);
    startOfDay.setHours(0, 0, 0, 0);

    const startOfWeek = new Date(now);
    const day = startOfWeek.getDay();
    const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
    startOfWeek.setDate(diff);
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const counts = clicks.reduce(
      (acc, click) => {
        const clickedAt = new Date(click.clicked_at);

        if (clickedAt >= startOfDay) acc.today += 1;
        if (clickedAt >= startOfWeek) acc.week += 1;
        if (clickedAt >= startOfMonth) acc.month += 1;

        acc.pages.set(click.page_path, (acc.pages.get(click.page_path) || 0) + 1);
        acc.contexts.set(click.button_context, (acc.contexts.get(click.button_context) || 0) + 1);
        const hourLabel = `${String(clickedAt.getHours()).padStart(2, '0')}:00`;
        acc.hours.set(hourLabel, (acc.hours.get(hourLabel) || 0) + 1);

        return acc;
      },
      {
        today: 0,
        week: 0,
        month: 0,
        pages: new Map<string, number>(),
        contexts: new Map<string, number>(),
        hours: new Map<string, number>(),
      },
    );

    const toSortedItems = (entries: Map<string, number>) =>
      Array.from(entries.entries())
        .map(([label, count]) => ({ label, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return {
      today: counts.today,
      week: counts.week,
      month: counts.month,
      topPages: toSortedItems(counts.pages),
      topContexts: toSortedItems(counts.contexts),
      topHours: toSortedItems(counts.hours),
    };
  }, [clicks]);

  return { loading, available, summary };
};