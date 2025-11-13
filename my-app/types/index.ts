export interface FlightSearchParams {
  origin: string;      // "EZE" o "BUE" (todos los aeropuertos)
  destination: string; // "SFO" o "anywhere" para explorar
  departDate: Date;
  returnDate?: Date;
  flexDays?: number;   // ±3 días flexibilidad
  passengers?: number;
  class?: 'economy' | 'business' | 'first';
}

export interface PricePoint {
  date: Date;
  price: number;
  currency: string;
}

export interface FlightResult {
  id: string;
  price: number;
  currency: string;
  airline: string;
  duration: number;
  stops: number;
  departTime: Date;
  arriveTime: Date;
  bookingUrl: string;
  source: 'google' | 'kayak' | 'skyscanner';
  scoreValue: number; // 0-100, qué tan buena es la oferta
  priceHistory?: PricePoint[];
  route: string; // "EZE-SFO"
}

export interface PriceAnalysis {
  currentPrice: number;
  avgPrice30Days: number;
  minPrice30Days: number;
  maxPrice30Days: number;
  percentageVsAvg: number;
  trend: 'rising' | 'falling' | 'stable';
  prediction7Days: 'likely_drop' | 'likely_rise' | 'stable';
  isGoodDeal: boolean;
  dealScore: number; // 0-100
  alertTrigger: boolean;
}

export interface Alert {
  id: string;
  userId?: string;
  route: string;
  origin: string;
  destination: string;
  targetPrice: number;
  currentPrice?: number;
  flexDays: number;
  departDate?: Date;
  returnDate?: Date;
  isActive: boolean;
  notificationSettings: {
    email?: boolean;
    telegram?: boolean;
    browser?: boolean;
  };
  createdAt: Date;
  lastChecked?: Date;
}

export interface NotificationSent {
  id: string;
  alertId: string;
  priceFound: number;
  sentAt: Date;
  channel: 'email' | 'telegram' | 'browser';
}

export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
}

export interface RouteStats {
  route: string;
  currentPrice: number;
  lowestPrice30Days: number;
  avgPrice30Days: number;
  trend: 'rising' | 'falling' | 'stable';
  lastUpdated: Date;
  priceHistory: PricePoint[];
}

export interface DashboardStats {
  totalAlerts: number;
  activeAlerts: number;
  bestDealToday?: FlightResult;
  averagePrice: number;
  routesMonitored: number;
  recentSearches: FlightSearchParams[];
}
