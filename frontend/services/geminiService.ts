
import { SoilData, LocationInfo, CropDetail, ResourceArticle, MarketItem } from "../types";
import { API_BASE_URL } from "./apiConfig";

export const geminiService = {
  async getCropDetails(cropName: string, location: LocationInfo, soil: SoilData, phone?: string, analysisId?: string): Promise<CropDetail> {
    const response = await fetch(`${API_BASE_URL}/crops/details`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        cropName,
        location,
        soil,
        phone,
        analysisId
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get crop details');
    }

    return await response.json();
  },

  async searchMarketplace(query: string, category: string): Promise<MarketItem[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/marketplace?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      );

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async searchResources(query: string, category: string): Promise<ResourceArticle[]> {
    try {
      const response = await fetch(
        `${API_BASE_URL}/resources?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      );

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getSchemes(): Promise<ResourceArticle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/schemes`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }
};
