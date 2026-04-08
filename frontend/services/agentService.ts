
import { RecommendationResponse } from "../types";
import { API_BASE_URL } from "./apiConfig";

export const agentService = {
  async runFullAnalysis(
    phone: string,
    lat: number,
    lng: number,
    onProgress: (step: string) => void,
    skipSearch: boolean = false
  ): Promise<RecommendationResponse> {

    onProgress("Connecting to Mandi Neural Network...");

    try {
      onProgress("Resolving precise farm location...");

      const response = await fetch(`${API_BASE_URL}/api/analysis/run`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone,
          lat,
          lng,
          skipSearch
        })
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'Analysis failed' }));
        throw new Error(error.error || 'Analysis failed');
      }

      onProgress("Finalizing regional report...");

      const data = await response.json();
      return data;

    } catch (err: any) {
      throw new Error(err.message || "Expert system unreachable. Please check connection.");
    }
  }
};
