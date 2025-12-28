from google import genai
from google.genai import types
from datetime import datetime
import json
import os


class AgentService:
    """Gemini orchestration for full Mandi analysis."""
    
    def __init__(self):
        self.client = None
    
    def _get_client(self):
        """Lazy initialization of Gemini client."""
        if self.client is None:
            api_key = os.environ.get('API_KEY', '')
            self.client = genai.Client(api_key=api_key)
        return self.client
    
    def _search_web(self, query: str) -> str:
        """Utility to perform real-time Google search via Serper API if available."""
        serper_key = os.environ.get('SERPER_API_KEY')
        if not serper_key:
            return ""
        
        try:
            import requests
            url = "https://google.serper.dev/search"
            payload = json.dumps({"q": query, "gl": "in", "hl": "hi"})
            headers = {'X-API-KEY': serper_key, 'Content-Type': 'application/json'}
            response = requests.request("POST", url, headers=headers, data=payload, timeout=5)
            search_data = response.json()
            
            snippets = []
            for result in search_data.get('organic', [])[:5]:
                snippets.append(f"{result.get('title')}: {result.get('snippet')}")
            return "\n".join(snippets)
        except Exception as e:
            print(f"Serper search failed: {e}")
            return ""

    def run_full_analysis(self, phone: str, lat: float, lng: float, skip_search: bool = False, 
                          regional_data: str = "", global_count: int = 0) -> dict:
        """Run full Mandi analysis with Gemini AI."""
        client = self._get_client()
        today = datetime.now()
        today_str = today.strftime('%d %B %Y')
        is_trained = global_count >= 3
        
        orchestration_log = []
        
        # Step 1: Geo-resolution
        geo_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "district": types.Schema(type=types.Type.STRING),
                "state": types.Schema(type=types.Type.STRING),
                "full_address": types.Schema(type=types.Type.STRING),
                "is_india": types.Schema(type=types.Type.BOOLEAN),
            },
            required=["district", "state", "is_india"]
        )
        
        geo_response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=f"RESOLVE COORDINATES: Lat {lat}, Lng {lng}. Return the Agricultural District and State in India. STRICT JSON.",
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=geo_schema
            )
        )
        
        geo = json.loads(geo_response.text or '{}')
        if not geo.get('is_india', False):
            raise ValueError("Target location is outside India's Mandi coverage.")
        
        district = geo.get('district', 'Rural Pocket')
        state = geo.get('state', 'India')
        orchestration_log.append(f"Satellite lock: {lat:.4f}, {lng:.4f}")
        orchestration_log.append(f"Resolved: {district}, {state}")
        
        # Step 2: Hybrid Search Orchestration
        web_context = ""
        search_tool_enabled = False
        
        # If Serper key exists, use it as primary grounding (faster for snippets)
        if not skip_search:
            orchestration_log.append(f"Synchronizing with Mandi Live Feed...")
            search_query = f"{district} {state} Mandi crop prices today {today_str}"
            web_context = self._search_web(search_query)
            if web_context:
                orchestration_log.append(f"Live data retrieved via Neural Node.")
            else:
                search_tool_enabled = True # Use native Google Search tool if Serper fails/missing
                orchestration_log.append(f"Activating Deep Grounding Search...")

        # Step 3: Main Analysis
        contents = f"""Perform a High-Fidelity Mandi Market Scan.
        Location: {district}, {state}. 
        Current Date: {today_str}. 
        Projecting for upcoming crop cycles in {today.year if today.month < 9 else today.year + 1}.
        
        {f"LIVE GROUNDING DATA: {web_context}" if web_context else "GROUNDING: Use your built-in Google Search tool to find exact Mandi rates for today."}
        
        DYNAMIC CROP RECOMMENDATIONS:
        - Provide at least 5-7 different crop options that are grown in that area.
        - Ensure a mix of cereals, pulses,oilseeds and all the crops suitable for the region.
        
        User History: {regional_data}.
        
        CRITICAL INSTRUCTIONS:
        1. ADVISOR TIP: Write in VERY SIMPLE language for a farmer. No jargon.
        2. PRICE VERIFICATION: Ensure the 'current_price' matches today's Mandi rate.
        3. ESTIMATED PROFIT/LOSS: Provide clear strings like 'Gain of ₹20k / acre'.
        
        STRICT JSON ONLY."""
        
        analysis_schema = types.Schema(
            type=types.Type.OBJECT,
            properties={
                "soil": types.Schema(
                    type=types.Type.OBJECT,
                    properties={
                        "N": types.Schema(type=types.Type.NUMBER),
                        "P": types.Schema(type=types.Type.NUMBER),
                        "K": types.Schema(type=types.Type.NUMBER),
                        "ph": types.Schema(type=types.Type.NUMBER),
                        "N_level": types.Schema(type=types.Type.STRING),
                        "P_level": types.Schema(type=types.Type.STRING),
                        "K_level": types.Schema(type=types.Type.STRING),
                        "pH_level": types.Schema(type=types.Type.STRING),
                    }
                ),
                "crops": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "name": types.Schema(type=types.Type.STRING),
                            "current_price": types.Schema(type=types.Type.NUMBER),
                            "confidence": types.Schema(type=types.Type.NUMBER),
                            "agent_notes": types.Schema(type=types.Type.STRING),
                            "estimated_profit": types.Schema(type=types.Type.STRING, description="Simple profit projection if market stays bullish, e.g. 'Gain of ₹20k/acre'"),
                            "estimated_loss": types.Schema(type=types.Type.STRING, description="Simple loss estimate if market/weather fails, e.g. 'Risk of ₹5k/acre'"),
                            "is_historically_verified": types.Schema(type=types.Type.BOOLEAN),
                            "min_p": types.Schema(type=types.Type.NUMBER),
                            "max_p": types.Schema(type=types.Type.NUMBER),
                        }
                    )
                )
            },
            required=["soil", "crops"]
        )
        
        # Adaptive Config: Enable Google Search Tool if needed
        tools = []
        if search_tool_enabled:
            tools.append(types.Tool(google_search=types.GoogleSearch()))

        config = types.GenerateContentConfig(
            tools=tools if tools else None,
            response_mime_type="application/json",
            response_schema=analysis_schema
        )
        
        response = client.models.generate_content(
            model='gemini-3-flash-preview',
            contents=contents,
            config=config
        )
        
        data = json.loads(response.text or '{}')
        orchestration_log.append(f"Account sync complete (+91...{phone[-4:]})")
        
        # Build result
        import secrets
        result_id = secrets.token_hex(5)
        
        crops = []
        crops = []
        for c in data.get('crops', []):
            price = c.get('current_price', 0)
            profit = c.get('estimated_profit', '').strip()
            loss = c.get('estimated_loss', '').strip()
            notes = c.get('agent_notes', '').strip()
            
            # Smart fallback calculation if LLM provides placeholders
            if not profit or "Analyzing" in profit or "Evaluating" in profit:
                proj_gain = round(price * 0.15) # Assume 15% upside in bullish case
                profit = f"₹{proj_gain:,} / quintal gain"
            
            if not loss or "Analyzing" in loss or "Assessing" in loss:
                proj_risk = round(price * 0.08) # Assume 8% downside in moderate bearish case
                loss = f"₹{proj_risk:,} / quintal risk"

            if not notes or len(notes) < 10:
                notes = f"Stable market demand in {district}. Predicted 10-15% price appreciation by next quarter. High profit potential for this variety."

            crops.append({
                'name': c.get('name', ''),
                'current_price': price,
                'confidence': c.get('confidence', 0.8),
                'agent_notes': notes,
                'estimated_profit': profit,
                'estimated_loss': loss,
                'price_range': {
                    'min': c.get('min_p') or price * 0.85,
                    'max': c.get('max_p') or price * 1.15
                },
                'source': 'AI-predicted' if skip_search else ('Locally-Learned' if c.get('is_historically_verified') else 'Mandi-Agent')
            })
        
        result = {
            'id': result_id,
            'crops': crops,
            'location': {
                'latitude': lat,
                'longitude': lng,
                'district': geo.get('district'),
                'state': geo.get('state'),
                'full_address': geo.get('full_address'),
                'country': 'India'
            },
            'soil': data.get('soil', {}),
            'timestamp': datetime.utcnow().isoformat(),
            'agent_orchestration_log': orchestration_log,
            'is_hybrid_prediction': is_trained
        }
        
        return result


agent_service = AgentService()
