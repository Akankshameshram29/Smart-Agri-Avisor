
import { FarmerRecord, RecommendationResponse, CropDetail } from "../types";
import { apiRequest, API_BASE_URL } from "./apiConfig";

class DatabaseService {
  /**
   * Login or register user in the backend
   */
  async login(phone: string, name: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ phone, name }),
    });

    if (!response.ok) {
      throw new Error('Failed to register/login in database');
    }

    return await response.json();
  }

  /**
   * Save analysis to backend database
   */
  async saveAnalysis(phone: string, record: RecommendationResponse): Promise<void> {
    // Analysis is saved automatically by the backend during /api/analysis/run
    // This method is kept for compatibility but does nothing
  }

  /**
   * Update crop detail in backend database
   */
  async updateCropDetail(phone: string, analysisId: string, cropName: string, detail: CropDetail): Promise<void> {
    // Crop details are saved automatically by the backend during /api/crops/details
    // This method is kept for compatibility but does nothing
  }

  /**
   * Get history from backend
   */
  async getHistory(phone: string): Promise<FarmerRecord[]> {
    if (!phone) return [];

    try {
      const response = await fetch(`${API_BASE_URL}/history?phone=${encodeURIComponent(phone)}`);
      if (!response.ok) return [];
      return await response.json();
    } catch {
      return [];
    }
  }

  /**
   * Get regional patterns from backend
   */
  async getRegionalPatterns(phone: string, district: string): Promise<string> {
    // This is now handled internally by the backend
    return "";
  }

  /**
   * Get global search count from backend
   */
  async getGlobalSearchCount(phone: string): Promise<number> {
    if (!phone) return 0;

    try {
      const response = await fetch(`${API_BASE_URL}/stats?phone=${encodeURIComponent(phone)}`);
      if (!response.ok) return 0;
      const data = await response.json();
      return data.trainingCount || 0;
    } catch {
      return 0;
    }
  }

  /**
   * Delete record from backend
   */
  async deleteRecord(phone: string, id: string): Promise<void> {
    try {
      await fetch(`${API_BASE_URL}/history/${id}?phone=${encodeURIComponent(phone)}`, {
        method: 'DELETE'
      });
    } catch {
      // Silently fail
    }
  }
}

export const dbService = new DatabaseService();
