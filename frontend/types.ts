
export interface SoilData {
  N: number;
  P: number;
  K: number;
  ph: number;
  N_level: string;
  P_level: string;
  K_level: string;
  pH_level: string;
}

export interface LocationInfo {
  latitude: number;
  longitude: number;
  district?: string;
  state?: string;
  country?: string;
  full_address?: string;
}

export interface CropPriceInfo {
  name: string;
  source: 'ML-Engine' | 'Mandi-Agent' | 'AI-predicted' | 'Locally-Learned';
  current_price: number;
  price_range: { min: number; max: number };
  confidence: number;
  agent_notes?: string;
  estimated_profit?: string;
  estimated_loss?: string;
}

export interface RecommendationResponse {
  id: string;
  crops: CropPriceInfo[];
  location: LocationInfo;
  soil: SoilData;
  timestamp: string;
  agent_orchestration_log: string[];
  is_hybrid_prediction?: boolean;
  crop_details?: Record<string, CropDetail>; // Store searched detailed reports
}

export interface FarmerRecord {
  id: string;
  lat: number;
  lng: number;
  district: string;
  timestamp: string;
  data: RecommendationResponse;
}

export interface User {
  phone: string;
  name: string;
  joinedAt: string;
}

export type AppTab = 'dashboard' | 'resources' | 'history' | 'history_view';

export interface ResourceArticle {
  id: string;
  title: string;
  excerpt: string;
  source_url: string;
  image?: string;
  category: string;
  date?: string;
}

export interface MarketItem {
  id: string;
  name: string;
  price: number;
  description?: string;
  image?: string;
  category?: string;
  unit?: string;
  website_name?: string;
  rating?: number | string;
  source_url: string;
}

export interface CropDetail {
  crop_name: string;
  pricing: {
    current_price_per_quintal: number;
    future_price_per_quintal: number;
    price_per_kg: number;
    future_price_per_kg: number;
    price_history: Array<{
      date: string;
      price: number;
      bearish_price?: number;
      type?: string
    }>;
  };
  timeline: {
    planting_date: string;
    harvest_date: string;
    selling_date: string;
    days_to_harvest: number;
  };
  fertilization_advice: {
    summary: string;
    recommended_types: string[];
    application_steps: string[];
  };
  expert_analysis: {
    precautions: string[];
    revenue_estimation: string;
    government_schemes: Array<{ name: string; detail: string }>;
    detailed_strategy: string;
    risk_mitigation_plan: string;
  };
  sources: Array<{ title: string; url: string }>;
  generated_at: string;
}
