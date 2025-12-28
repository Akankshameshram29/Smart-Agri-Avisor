from google import genai
from google.genai import types
from datetime import datetime
import json
import os


class GeminiService:
    """Gemini AI service for crop details, resources, and marketplace search."""
    
    def __init__(self):
        self.client = None
    
    def _get_client(self):
        """Lazy initialization of Gemini client."""
        if self.client is None:
            api_key = os.environ.get('API_KEY', '')
            self.client = genai.Client(api_key=api_key)
        return self.client
    
    def get_crop_details(self, crop_name: str, location: dict, soil: dict) -> dict:
        """Get detailed crop strategy with comprehensive price chart data."""
        client = self._get_client()
        today = datetime.now()
        today_str = today.strftime('%d %B %Y')
        current_month = today.strftime('%B %Y')
        
        district = location.get('district', 'Unknown')
        state = location.get('state', 'India')
        
        # Calculate past 4 months for historical data
        from dateutil.relativedelta import relativedelta
        past_months = []
        for i in range(4, 0, -1):
            past_date = today - relativedelta(months=i)
            past_months.append(past_date.strftime('%B %Y'))
        
        contents = f"""You are a High-Precision Indian Agricultural Market Analyst. Today is {today_str}.
        A farmer's crop {crop_name} in {district}, {state} is being analyzed for market entry.
        
        CRITICAL RECOVERY PLAN (FAILSAFE):
        - Provide 3 REAL farming steps if conditions fail. No generic advice.
        
        TIMELINE & PRICING REQUIREMENTS:
        1. CURRENT RATE: You MUST provide the exact Mandi rate for {current_month}.
        2. HISTORICAL DATA: Provide rates for the LAST 4 MONTHS: {', '.join(past_months)}.
        3. FORECAST (2026): Predict rates for the NEXT 4 MONTHS into 2026 (Jan, Feb, Mar, Apr).
        
        DATA STRUCTURE:
        - Each entry in 'price_history' MUST have:
          - 'date': Month Year format (e.g. 'December 2025')
          - 'price': High/Bullish rate in ₹
          - 'bearish_price': Lower/Risk rate (usually 10-15% lower)
          - 'type': Exactly one of 'historical', 'current', 'prediction'
        
        Ensure exactly 9 points in total: 4 past, 1 current ({current_month}), and 4 future.
        STRICT JSON ONLY."""
        
        detail_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "pricing": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "current_price_per_quintal": types.Schema(type=types.Type.NUMBER),
                        "future_price_per_quintal": types.Schema(type=types.Type.NUMBER),
                        "price_history": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "date": types.Schema(type=types.Type.STRING, description="Month Year format, e.g., 'August 2025'"),
                                    "price": types.Schema(type=types.Type.NUMBER, description="Normal/Bullish Price in ₹"),
                                    "bearish_price": types.Schema(type=types.Type.NUMBER, description="Red-line/Bearish Price if market fails"),
                                    "type": types.Schema(type=types.Type.STRING, description="One of: 'historical', 'current', 'prediction'"),
                                }
                            )
                        )
                    }
                ),
                "timeline": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "planting_date": types.Schema(type=types.Type.STRING),
                        "harvest_date": types.Schema(type=types.Type.STRING),
                        "selling_date": types.Schema(type=types.Type.STRING),
                        "days_to_harvest": types.Schema(type=types.Type.NUMBER),
                    }
                ),
                "fertilization_advice": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "summary": types.Schema(type=types.Type.STRING),
                        "recommended_types": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                        "application_steps": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                    }
                ),
                "expert_analysis": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "precautions": types.Schema(type=types.Type.ARRAY, items=types.Schema(type=types.Type.STRING)),
                        "revenue_estimation": types.Schema(type=types.Type.STRING),
                        "government_schemes": types.Schema(
                            type=types.Type.ARRAY,
                            items=types.Schema(
                                type=types.Type.OBJECT,
                                properties={
                                    "name": types.Schema(type=types.Type.STRING),
                                    "detail": types.Schema(type=types.Type.STRING),
                                }
                            )
                        ),
                        "detailed_strategy": types.Schema(type=types.Type.STRING),
                        "risk_mitigation_plan": types.Schema(type=types.Type.STRING, description="Detailed minute strategy if conditions go bad"),
                    }
                )
            }
        )
        
        # Using Gemini 3 Flash for advanced structured output
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=detail_schema
            )
        )
        
        data = json.loads(response.text or '{}')
        
        # Extract grounding sources
        sources = []
        try:
            if hasattr(response, 'candidates') and response.candidates:
                candidate = response.candidates[0]
                if hasattr(candidate, 'grounding_metadata') and candidate.grounding_metadata:
                    grounding = candidate.grounding_metadata
                    if hasattr(grounding, 'grounding_chunks') and grounding.grounding_chunks:
                        seen_urls = set()
                        for chunk in grounding.grounding_chunks:
                            if hasattr(chunk, 'web') and chunk.web:
                                url = chunk.web.uri if hasattr(chunk.web, 'uri') else None
                                title = chunk.web.title if hasattr(chunk.web, 'title') else "Official Mandi Record"
                                if url and url not in seen_urls:
                                    seen_urls.add(url)
                                    sources.append({'title': title, 'url': url})
        except Exception as e:
            print(f"Error extracting sources: {e}")
        
        pricing = data.get('pricing', {})
        current_price = pricing.get('current_price_per_quintal', 0)
        future_price = pricing.get('future_price_per_quintal', 0)
        
        # Mapping with extreme robustness for chart data
        price_history = []
        for entry in pricing.get('price_history', []):
            try:
                # Get the 'price' with multiple fallback keys
                p_val = entry.get('price') or entry.get('rate') or entry.get('value') or 0
                
                # Get 'bearish_price' or 'risk' with fallback calculation
                # Ensure it's ALWAYS logically lower or equal to normal price
                p_float = float(p_val)
                b_val = entry.get('bearish_price') or entry.get('risk') or entry.get('risk_price')
                b_float = float(b_val) if b_val is not None else (p_float * 0.85)
                
                # Preserve the type if provided, else default
                row_type = entry.get('type') or entry.get('Type') or 'historical'
                
                price_history.append({
                    'date': str(entry.get('date', 'N/A')),
                    'price': p_float,
                    'bearish_price': min(p_float, b_float), # Force it to be the "lower" bound
                    'type': str(row_type).lower()
                })
            except (ValueError, TypeError):
                continue

        # Map analysis with robust fallbacks and placeholder filtering
        exp_data = data.get('expert_analysis', {})
        def get_clean_val(key, default):
            val = exp_data.get(key)
            if not val or not str(val).strip() or "Preparing" in str(val) or "Calculating" in str(val):
                return default
            return str(val).strip()

        risk_plan = get_clean_val('risk_mitigation_plan', "IMMEDIATE ACTION PLAN: 1. Alert local cluster head. 2. Verify storage capacity at nearest Mandi-approved warehouse. 3. Monitor weather anomalies every 6 hours via local Krishi Vignan Kendra.")

        expert_analysis = {
            'precautions': exp_data.get('precautions') or ['Regular field monitoring mandatory.', 'Soil moisture tracking essential.'],
            'revenue_estimation': get_clean_val('revenue_estimation', 'Projecting robust yield based on current soil NPK health index.'),
            'government_schemes': exp_data.get('government_schemes') or [{'name': 'PM-KISAN', 'detail': 'Direct benefit transfer for small farmers.'}],
            'detailed_strategy': get_clean_val('detailed_strategy', 'Focus on optimized nutrient delivery and proactive pest management.'),
            'risk_mitigation_plan': risk_plan
        }
        
        return {
            'crop_name': crop_name,
            'pricing': {
                'current_price_per_quintal': current_price,
                'future_price_per_quintal': future_price,
                'price_per_kg': current_price / 100 if current_price else 0,
                'future_price_per_kg': future_price / 100 if future_price else 0,
                'price_history': price_history
            },
            'timeline': data.get('timeline', {'planting_date': 'N/A', 'harvest_date': 'N/A', 'selling_date': 'N/A', 'days_to_harvest': 0}),
            'fertilization_advice': data.get('fertilization_advice', {'summary': 'General fertilization recommended based on soil NPK levels.', 'recommended_types': [], 'application_steps': []}),
            'expert_analysis': expert_analysis,
            'sources': sources,
            'generated_at': today_str
        }
    
    def search_marketplace(self, query: str, category: str) -> list:
        """Search for agricultural marketplace products."""
        client = self._get_client()
        
        contents = f"Find real-time Indian agricultural products. Category: {category}, Query: {query}."
        
        item_schema = types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "id": types.Schema(type=types.Type.STRING),
                    "name": types.Schema(type=types.Type.STRING),
                    "price": types.Schema(type=types.Type.NUMBER),
                    "description": types.Schema(type=types.Type.STRING),
                    "image": types.Schema(type=types.Type.STRING),
                    "category": types.Schema(type=types.Type.STRING),
                    "unit": types.Schema(type=types.Type.STRING),
                    "website_name": types.Schema(type=types.Type.STRING),
                    "rating": types.Schema(type=types.Type.STRING),
                    "source_url": types.Schema(type=types.Type.STRING),
                },
                required=["id", "name", "price", "source_url"]
            )
        )
        
        # Using Gemini 3 Flash for advanced structured output
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=item_schema
            )
        )
        
        return json.loads(response.text or '[]')
    
    def search_resources(self, query: str, category: str) -> list:
        """Search for agricultural resources and articles."""
        client = self._get_client()
        
        contents = f"Find Indian agricultural resources. Category: {category}, Query: {query}."
        
        resource_schema = types.Schema(
            type=types.Type.ARRAY,
            items=types.Schema(
                type=types.Type.OBJECT,
                properties={
                    "id": types.Schema(type=types.Type.STRING),
                    "title": types.Schema(type=types.Type.STRING),
                    "excerpt": types.Schema(type=types.Type.STRING),
                    "source_url": types.Schema(type=types.Type.STRING),
                    "image": types.Schema(type=types.Type.STRING),
                    "category": types.Schema(type=types.Type.STRING),
                    "date": types.Schema(type=types.Type.STRING),
                },
                required=["id", "title", "excerpt", "source_url", "category"]
            )
        )
        
        # Using Gemini 3 Flash for advanced structured output
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=resource_schema
            )
        )
        
        return json.loads(response.text or '[]')
    
    def get_schemes(self) -> list:
        """Get active government schemes for farmers."""
        return self.search_resources("Active Government Schemes for Farmers in India 2025,2026", "Schemes")


gemini_service = GeminiService()
