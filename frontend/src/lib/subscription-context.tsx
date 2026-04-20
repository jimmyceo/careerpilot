'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface FeatureAccess {
  has_access: boolean;
  tier: string;
  remaining: number;
  total: number;
  unlimited: boolean;
}

interface Subscription {
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

interface SubscriptionContextType {
  subscription: Subscription | null;
  features: Record<string, FeatureAccess>;
  isLoading: boolean;
  checkFeature: (feature: string) => FeatureAccess;
  refreshSubscription: () => Promise<void>;
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined);

export function SubscriptionProvider({ children }: { children: ReactNode }) {
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [features, setFeatures] = useState<Record<string, FeatureAccess>>({});
  const [isLoading, setIsLoading] = useState(true);

  const checkFeature = (feature: string): FeatureAccess => {
    return features[feature] || {
      has_access: false,
      tier: 'free',
      remaining: 0,
      total: 0,
      unlimited: false
    };
  };

  const refreshSubscription = async () => {
    // API call would go here
    setIsLoading(false);
  };

  return (
    <SubscriptionContext.Provider value={{
      subscription,
      features,
      isLoading,
      checkFeature,
      refreshSubscription
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
