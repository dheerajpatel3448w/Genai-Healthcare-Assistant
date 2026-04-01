"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { HabitAPI } from "../lib/api/habit.api";
import {
  IDailyLog,
  IHabitGoal,
  StreakDay,
  TrendDay,
  WeeklyTipResult,
  HabitKey,
} from "../type";
import { toast } from "react-hot-toast";

interface HabitTrackerContextType {
  log: IDailyLog | null;
  goals: IHabitGoal | null;
  wellnessScore: number;
  streak: StreakDay[];
  trends: TrendDay[];
  tip: WeeklyTipResult | null;
  loading: boolean;
  refreshData: () => Promise<void>;
  logHabit: (habit: HabitKey, value: number | boolean, action: "set" | "increment") => Promise<void>;
}

const HabitTrackerContext = createContext<HabitTrackerContextType | undefined>(undefined);

export const HabitTrackerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [log, setLog] = useState<IDailyLog | null>(null);
  const [goals, setGoals] = useState<IHabitGoal | null>(null);
  const [wellnessScore, setWellnessScore] = useState<number>(0);
  const [streak, setStreak] = useState<StreakDay[]>([]);
  const [trends, setTrends] = useState<TrendDay[]>([]);
  const [tip, setTip] = useState<WeeklyTipResult | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const refreshData = useCallback(async () => {
    setLoading(true);
    try {
      const [todayData, streakData, trendsData, tipData] = await Promise.all([
        HabitAPI.getTodayLog(),
        HabitAPI.getStreak(),
        HabitAPI.getTrends(),
        HabitAPI.getWeeklyTip(),
      ]);

      setLog(todayData.log);
      setGoals(todayData.goals);
      setWellnessScore(todayData.wellnessScore);
      setStreak(streakData);
      setTrends(trendsData);
      setTip(tipData);
    } catch (error) {
      console.error("Failed to load habit tracker data:", error);
      toast.error("Failed to load wellness tracker data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshData();
  }, [refreshData]);

  const logHabitAction = async (habit: HabitKey, value: number | boolean, action: "set" | "increment") => {
    try {
      // Optimistic ui update could be here, but let's just wait for API for simplicity and accuracy
      const result = await HabitAPI.logHabit(habit, value, action);
      
      // Update local state directly to be snappy
      setLog(result.log);
      setWellnessScore(result.wellnessScore);
      
      // Streak and trends should update in background
      HabitAPI.getStreak().then(setStreak);
      HabitAPI.getTrends().then(setTrends);
    } catch (error) {
      console.error(`Failed to log habit ${habit}:`, error);
      toast.error(`Failed to update ${habit}.`);
    }
  };

  return (
    <HabitTrackerContext.Provider
      value={{
        log,
        goals,
        wellnessScore,
        streak,
        trends,
        tip,
        loading,
        refreshData,
        logHabit: logHabitAction,
      }}
    >
      {children}
    </HabitTrackerContext.Provider>
  );
};

export const useHabitTracker = () => {
  const context = useContext(HabitTrackerContext);
  if (context === undefined) {
    throw new Error("useHabitTracker must be used within a HabitTrackerProvider");
  }
  return context;
};
