
import { SoilData, LocationInfo, CropDetail, ResourceArticle, MarketItem } from "../types";
import { API_BASE_URL } from "./apiConfig";

export const geminiService = {
  async getCropDetails(cropName: string, location: LocationInfo, soil: SoilData, phone?: string, analysisId?: string): Promise<CropDetail> {
    const response = await fetch(`${API_BASE_URL}/api/crops/details`, {
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
        `${API_BASE_URL}/api/marketplace?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
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
        `${API_BASE_URL}/api/resources?query=${encodeURIComponent(query)}&category=${encodeURIComponent(category)}`
      );

      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async getSchemes(): Promise<ResourceArticle[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/api/schemes`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  },

  async askQuestion(phone: string, question: string, context?: any, history?: { role: string, content: string }[]): Promise<string> {
    const response = await fetch(`${API_BASE_URL}/api/chat/ask`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        question,
        context,
        history
      })
    });

    if (!response.ok) {
      throw new Error('Failed to get answer');
    }

    const data = await response.json();
    return data.answer;
  },

  async getChatHistory(phone: string): Promise<{ role: 'user' | 'assistant', content: string }[]> {
    const response = await fetch(`${API_BASE_URL}/api/chat/history?phone=${encodeURIComponent(phone)}`);
    if (!response.ok) return [];
    return await response.json();
  }
};
