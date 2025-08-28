"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "../useAuth";

export interface DailyStat {
  date: string;
  readingTime: number; // en secondes
  sessions: number;
  pagesRead: number;
}

export interface WeeklyStat {
  week: string;
  readingTime: number;
  sessions: number;
  pagesRead: number;
}

export interface MonthlyStat {
  month: string;
  readingTime: number;
  sessions: number;
  pagesRead: number;
  booksCompleted: number;
}

export interface YearlyStat {
  year: string;
  readingTime: number;
  sessions: number;
  pagesRead: number;
  booksCompleted: number;
}

export interface TopBook {
  id: string;
  title: string;
  author: string;
  coverUrl?: string;
  totalReadingTime: number;
  totalSessions: number;
  averageSessionTime: number;
  completionDate?: Date;
}

export interface RecentSession {
  id: string;
  bookId: string;
  bookTitle: string;
  startTime: Date;
  duration: number;
  pagesRead?: number;
}

export interface GlobalStats {
  totalReadingTime: number; // en secondes
  totalSessions: number;
  activeDays: number;
  averageDailyTime: number; // en secondes
  averageSessionTime: number; // en secondes
  longestStreak: number; // jours consécutifs
  currentStreak: number; // jours consécutifs actuels
}

export function useReadingAnalytics() {
  const [dailyStats, setDailyStats] = useState<DailyStat[]>([]);
  const [weeklyStats, setWeeklyStats] = useState<WeeklyStat[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStat[]>([]);
  const [yearlyStats, setYearlyStat] = useState<YearlyStat[]>([]);
  const [topBooks, setTopBooks] = useState<TopBook[]>([]);
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalReadingTime: 0,
    totalSessions: 0,
    activeDays: 0,
    averageDailyTime: 0,
    averageSessionTime: 0,
    longestStreak: 0,
    currentStreak: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Fonction pour formater une date en string YYYY-MM-DD
  const formatDate = (date: Date): string => {
    return date.toISOString().split("T")[0];
  };

  // Fonction pour obtenir le début de la semaine
  const getWeekStart = (date: Date): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Lundi comme premier jour
    return new Date(d.setDate(diff));
  };

  // Charger les statistiques quotidiennes
  const loadDailyStats = useCallback(async () => {
    if (!user) return;

    try {
      // Récupérer les sessions des 365 derniers jours
      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 365);

      const { data: sessions, error } = await supabase
        .from("reading_sessions")
        .select(`
          id,
          start_time,
          duration,
          pages_read,
          is_active
        `)
        .eq("user_id", user.id)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .eq("is_active", false)
        .order("start_time", { ascending: true });

      if (error) throw error;

      // Grouper par jour
      const dailyMap = new Map<string, DailyStat>();

      sessions?.forEach((session) => {
        const date = formatDate(new Date(session.start_time));
        
        if (!dailyMap.has(date)) {
          dailyMap.set(date, {
            date,
            readingTime: 0,
            sessions: 0,
            pagesRead: 0,
          });
        }

        const stat = dailyMap.get(date)!;
        stat.readingTime += session.duration;
        stat.sessions += 1;
        stat.pagesRead += session.pages_read || 0;
      });

      // Remplir les jours manquants avec des valeurs nulles
      const dailyStatsArray: DailyStat[] = [];
      const currentDate = new Date(startDate);

      while (currentDate <= endDate) {
        const dateStr = formatDate(currentDate);
        const stat = dailyMap.get(dateStr) || {
          date: dateStr,
          readingTime: 0,
          sessions: 0,
          pagesRead: 0,
        };
        dailyStatsArray.push(stat);
        currentDate.setDate(currentDate.getDate() + 1);
      }

      setDailyStats(dailyStatsArray);
    } catch (err) {
      console.error("Erreur lors du chargement des stats quotidiennes:", err);
    }
  }, [user]);

  // Charger les statistiques mensuelles
  const loadMonthlyStats = useCallback(async () => {
    if (!user) return;

    try {
      // Récupérer les sessions des 24 derniers mois
      const endDate = new Date();
      const startDate = new Date();
      startDate.setMonth(startDate.getMonth() - 24);

      const { data: sessions, error } = await supabase
        .from("reading_sessions")
        .select(`
          start_time,
          duration,
          pages_read,
          is_active
        `)
        .eq("user_id", user.id)
        .gte("start_time", startDate.toISOString())
        .lte("start_time", endDate.toISOString())
        .eq("is_active", false);

      if (error) throw error;

      // Récupérer les livres complétés par mois
      const { data: books, error: booksError } = await supabase
        .from("books")
        .select("date_completed")
        .eq("user_id", user.id)
        .eq("status", "completed")
        .not("date_completed", "is", null)
        .gte("date_completed", startDate.toISOString())
        .lte("date_completed", endDate.toISOString());

      if (booksError) throw booksError;

      // Grouper par mois
      const monthlyMap = new Map<string, MonthlyStat>();

      sessions?.forEach((session) => {
        const date = new Date(session.start_time);
        const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, {
            month,
            readingTime: 0,
            sessions: 0,
            pagesRead: 0,
            booksCompleted: 0,
          });
        }

        const stat = monthlyMap.get(month)!;
        stat.readingTime += session.duration;
        stat.sessions += 1;
        stat.pagesRead += session.pages_read || 0;
      });

      // Ajouter les livres complétés
      books?.forEach((book) => {
        if (book.date_completed) {
          const date = new Date(book.date_completed);
          const month = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
          
          if (monthlyMap.has(month)) {
            monthlyMap.get(month)!.booksCompleted += 1;
          }
        }
      });

      const monthlyStatsArray = Array.from(monthlyMap.values()).sort(
        (a, b) => a.month.localeCompare(b.month)
      );

      setMonthlyStats(monthlyStatsArray);
    } catch (err) {
      console.error("Erreur lors du chargement des stats mensuelles:", err);
    }
  }, [user]);

  // Charger les livres les plus lus
  const loadTopBooks = useCallback(async () => {
    if (!user) return;

    try {
      const { data: booksWithSessions, error } = await supabase
        .from("reading_sessions")
        .select(`
          book_id,
          duration,
          books (
            id,
            title,
            author,
            cover_url,
            date_completed
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", false);

      if (error) throw error;

      // Grouper par livre
      const bookStatsMap = new Map<string, {
        book: any;
        totalReadingTime: number;
        totalSessions: number;
      }>();

      booksWithSessions?.forEach((session) => {
        if (!session.books) return;
        
        const bookId = session.book_id;
        if (!bookStatsMap.has(bookId)) {
          bookStatsMap.set(bookId, {
            book: session.books,
            totalReadingTime: 0,
            totalSessions: 0,
          });
        }

        const stats = bookStatsMap.get(bookId)!;
        stats.totalReadingTime += session.duration;
        stats.totalSessions += 1;
      });

      // Convertir en array et trier par temps de lecture
      const topBooksArray: TopBook[] = Array.from(bookStatsMap.values())
        .map(({ book, totalReadingTime, totalSessions }) => ({
          id: book.id,
          title: book.title,
          author: book.author,
          coverUrl: book.cover_url,
          totalReadingTime,
          totalSessions,
          averageSessionTime: totalSessions > 0 ? totalReadingTime / totalSessions : 0,
          completionDate: book.date_completed ? new Date(book.date_completed) : undefined,
        }))
        .sort((a, b) => b.totalReadingTime - a.totalReadingTime);

      setTopBooks(topBooksArray);
    } catch (err) {
      console.error("Erreur lors du chargement des top livres:", err);
    }
  }, [user]);

  // Charger les sessions récentes
  const loadRecentSessions = useCallback(async () => {
    if (!user) return;

    try {
      const { data: sessions, error } = await supabase
        .from("reading_sessions")
        .select(`
          id,
          book_id,
          start_time,
          duration,
          pages_read,
          books (
            title
          )
        `)
        .eq("user_id", user.id)
        .eq("is_active", false)
        .order("start_time", { ascending: false })
        .limit(20);

      if (error) throw error;

      const recentSessionsArray: RecentSession[] = sessions?.map((session) => ({
        id: session.id,
        bookId: session.book_id,
        bookTitle: session.books?.title || "Livre inconnu",
        startTime: new Date(session.start_time),
        duration: session.duration,
        pagesRead: session.pages_read || undefined,
      })) || [];

      setRecentSessions(recentSessionsArray);
    } catch (err) {
      console.error("Erreur lors du chargement des sessions récentes:", err);
    }
  }, [user]);

  // Calculer les statistiques globales
  const calculateGlobalStats = useCallback(() => {
    if (dailyStats.length === 0) return;

    const totalReadingTime = dailyStats.reduce((acc, day) => acc + day.readingTime, 0);
    const totalSessions = dailyStats.reduce((acc, day) => acc + day.sessions, 0);
    const activeDays = dailyStats.filter((day) => day.readingTime > 0).length;
    const averageDailyTime = activeDays > 0 ? totalReadingTime / activeDays : 0;
    const averageSessionTime = totalSessions > 0 ? totalReadingTime / totalSessions : 0;

    // Calculer les streaks
    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 0;

    // Parcourir du plus récent au plus ancien pour le streak actuel
    for (let i = dailyStats.length - 1; i >= 0; i--) {
      if (dailyStats[i].readingTime > 0) {
        if (i === dailyStats.length - 1) {
          currentStreak = 1;
        } else {
          // Vérifier si c'est consécutif avec le jour suivant
          const currentDate = new Date(dailyStats[i].date);
          const nextDate = new Date(dailyStats[i + 1].date);
          const dayDiff = (nextDate.getTime() - currentDate.getTime()) / (1000 * 60 * 60 * 24);
          
          if (dayDiff === 1) {
            currentStreak++;
          } else if (currentStreak === 0) {
            // Si on était pas encore dans un streak, on commence
            currentStreak = 1;
          } else {
            // Fin du streak actuel
            break;
          }
        }
      } else if (currentStreak > 0) {
        // Fin du streak actuel
        break;
      }
    }

    // Calculer le streak le plus long
    for (let i = 0; i < dailyStats.length; i++) {
      if (dailyStats[i].readingTime > 0) {
        tempStreak++;
        longestStreak = Math.max(longestStreak, tempStreak);
      } else {
        tempStreak = 0;
      }
    }

    setGlobalStats({
      totalReadingTime,
      totalSessions,
      activeDays,
      averageDailyTime,
      averageSessionTime,
      longestStreak,
      currentStreak,
    });
  }, [dailyStats]);

  // Charger toutes les données
  const loadAllData = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setError(null);
      setLoading(true);

      await Promise.all([
        loadDailyStats(),
        loadMonthlyStats(),
        loadTopBooks(),
        loadRecentSessions(),
      ]);
    } catch (err) {
      console.error("Erreur lors du chargement des données:", err);
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setLoading(false);
    }
  }, [user, loadDailyStats, loadMonthlyStats, loadTopBooks, loadRecentSessions]);

  // Recalculer les stats globales quand les données quotidiennes changent
  useEffect(() => {
    calculateGlobalStats();
  }, [calculateGlobalStats]);

  // Charger les données au montage
  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  return {
    dailyStats,
    weeklyStats,
    monthlyStats,
    yearlyStats,
    topBooks,
    recentSessions,
    globalStats,
    loading,
    error,
    refreshData: loadAllData,
  };
}
