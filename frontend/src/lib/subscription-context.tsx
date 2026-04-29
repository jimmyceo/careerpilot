'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiClient } from './api';

export interface FeatureAccess {
  has_access: boolean;
  tier: string;
  remaining: number;
  total: number;
  unlimited: boolean;
}

export interface Subscription {
  id: string;
  user_id: string;
  status: string;
  plan?: {
    tier: string;
    name: string;
    price_monthly_cents: number;
    features: string[];
    limits: Record<string, number>;
  };
  current_period_end: string | null;
}

export interface UsageSummary {
  tier: string;
  plan_name: string;
  features: {
    feature: string;
    display_name: string;
    used: number;
    total: number;
    remaining: number;
    unlimited: boolean;
    reset_date: string | null;
  }[];
}

interface SubscriptionContextType {
  subscription: Subscription | null;
  usage: UsageSummary | null;
  isLoading: boolean;
  checkFeature: (feature: string) => Promise<FeatureAccess>;
  consumeFeature: (feature: string, amount?: number) => Promise<{ success: boolean; remaining: number; unlimited: boolean }>;
  refreshUsage: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [usage, setUsage] = useState<UsageSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUsage = async () => {
    try {
      const usageData = await apiClient.getUsageSummary();
      if (usageData.status === 'success' && usageData.usage) {
        setUsage(usageData.usage);
      }
      const subData = await apiClient.getCurrentSubscription();
      if (subData.status === 'success' && subData.subscription) {
        setSubscription(subData.subscription);
      }
    } catch (e) {
      console.error('Failed to load subscription:', e);
    } finally {
      setIsLoading(false);
    }
  };

  const checkFeature = async (feature: string): Promise<FeatureAccess> => {
    try {
      const user = await apiClient.getCurrentUser();
      if (!user?.id) {
        return { has_access: false, tier: 'free', remaining: 0, total: 0, unlimited: false };
      }
      const data = await apiClient.checkFeature(user.id, feature);
      if (data.status === 'success' && data.access) {
        return {
          has_access: data.access.has_access ?? false,
          tier: data.access.tier || 'free',
          remaining: data.access.remaining ?? 0,
          total: data.access.total ?? 0,
          unlimited: data.access.unlimited ?? false,
        };
      }
    } catch (e) {
      console.error('Feature check failed:', e);
    }
    return { has_access: false, tier: 'free', remaining: 0, total: 0, unlimited: false };
  };

  const consumeFeature = async (feature: string, amount: number = 1) => {
    try {
      const user = await apiClient.getCurrentUser();
      if (!user?.id) {
        return { success: false, remaining: 0, unlimited: false };
      }
      const data = await apiClient.consumeFeature(user.id, feature, amount);
      if (data.status === 'success' && data.result) {
        // Refresh usage after consuming
        await refreshUsage();
        return {
          success: data.result.success ?? false,
          remaining: data.result.remaining ?? 0,
          unlimited: data.result.unlimited ?? false,
        };
      }
    } catch (e) {
      console.error('Feature consume failed:', e);
    }
    return { success: false, remaining: 0, unlimited: false };
  };

  useEffect(() => {
    refreshUsage();
  }, []);

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      usage,
      isLoading,
      checkFeature,
      consumeFeature,
      refreshUsage,
    }}>
      {children}
    </SubscriptionContext.Provider>
  );
}

export function useSubscription() {
  const context = useContext(SubscriptionContext);
  if (context === undefined) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
}
