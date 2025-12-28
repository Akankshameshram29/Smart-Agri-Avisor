from google import genai
from google.genai import types
from datetime import datetime
import json
import os


class GeminiService:
    """Gemini AI service for crop details, resources, and marketplace search."""
    
    def __init__(self):
        # Load multiple keys from environment
        keys_str = os.environ.get('GEMINI_KEYS', os.environ.get('API_KEY', ''))
        self.keys = [k.strip() for k in keys_str.split(',') if k.strip()]
        self.current_key_index = 0
        self.client = None
    
    def _get_client(self):
        """Lazy initialization of Gemini client with rotation support."""
        if self.client is None:
            if not self.keys:
                raise ValueError("No Gemini API keys found in environment variables (API_KEY or GEMINI_KEYS)")
            api_key = self.keys[self.current_key_index]
            print(f"DEBUG: Using Gemini Key {self.current_key_index + 1}/{len(self.keys)}")
            self.client = genai.Client(api_key=api_key)
        return self.client

    def _rotate_and_retry(self, func, *args, **kwargs):
        """Helper to rotate keys if a quota error occurs."""
        max_retries = len(self.keys)
        last_error = None
        
        for attempt in range(max_retries):
            try:
                client = self._get_client()
                return func(client, *args, **kwargs)
            except Exception as e:
                error_msg = str(e).lower()
                # Catch 429 Resource exhausted or other quota related errors
                if "429" in error_msg or "quota" in error_msg or "exhausted" in error_msg:
                    print(f"CRITICAL: Key {self.current_key_index + 1} exhausted. Rotating...")
                    self.current_key_index = (self.current_key_index + 1) % len(self.keys)
                    self.client = None # Force re-initialization with next key
                    last_error = e
                    continue
                else:
                    raise e
        
        raise last_error or Exception("All Gemini API keys exhausted")

    def _generate_content(self, contents, config, model='gemini-2.5-flash'):
        """Call Gemini with automatic key rotation on quota errors."""
        def _call(client):
            return client.models.generate_content(
                model=model,
                contents=contents,
                config=config
            )
        return self._rotate_and_retry(_call)

    
    def _search_web(self, query: str) -> str:
        """Utility to perform real-time Google search via Serper API."""
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
                snippets.append(f"Title: {result.get('title')}\nSnippet: {result.get('snippet')}\nURL: {result.get('link')}\n---")
            return "\n".join(snippets)
        except Exception as e:
            print(f"Serper search failed: {e}")
            return ""
    
    def get_crop_details(self, crop_name: str, location: dict, soil: dict) -> dict:
        """Get detailed crop strategy with comprehensive price chart data."""
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
        
        # Get live context via Serper
        search_query = f"{crop_name} Mandi price {district} {state} today {today_str}"
        web_context = self._search_web(search_query)
        
        contents = f"""You are a High-Precision Indian Agricultural Market Analyst. Today is {today_str}.
        A farmer's crop {crop_name} in {district}, {state} is being analyzed for market entry.
        
        LIVE MANDI GROUNDING DATA (STRICTLY USE THIS):
        {web_context}
        
        CRITICAL RECOVERY PLAN (FAILSAFE):
        - Provide 3 REAL farming steps if conditions fail. No generic advice.
        
        TIMELINE & PRICING REQUIREMENTS:
        1. CURRENT RATE: You MUST provide the exact Mandi rate for {current_month}.
        2. HISTORICAL DATA: Provide rates for the LAST 4 MONTHS: {', '.join(past_months)}.
        3. FORECAST (2026): Predict rates for the NEXT 4 MONTHS into 2026 (Jan, Feb, Mar, Apr).
        
        SOURCES REQUIREMENT:
        - Identify 2-3 real URLs from the LIVE MANDI GROUNDING DATA above.
        - Include them in the 'sources' field of the JSON. 
        - DO NOT invent URLs. If no URL is found, use 'https://agmarknet.gov.in/'.
        
        DATA STRUCTURE:
        - Each entry in 'price_history' MUST have:
          - 'date': Month Year format (e.g. 'December 2025')
          - 'price': High/Bullish rate in ₹
          - 'bearish_price': Lower/Risk rate (usually 10-15% lower)
          - 'type': Exactly one of 'historical', 'current', 'prediction'
        
        STRATEGIC REQUIREMENTS for 'detailed_strategy' field:
        - LANGUAGE: Use VERY SIMPLE, village-level language.
        - FORMAT: Use STICT MARKDOWN. Each section MUST start with '### ' on a NEW LINE.
        - CONTENT:
          ### 1. Present and Future Price
          • [Details here using ₹/kg format (Divide Mandi rate by 100). For example: ₹50/kg instead of ₹5000/quintal]
          
          ### 2. Technique for Proper Cultivation
          • [Step-by-step instructions]
          
          ### 3. Precautions
          • [What to avoid]
          
          ### 4. Fertilizer Suggestion
          • [Schedule here]
        
        CRITICAL: Use TWO NEWLINES between sections. No run-on paragraphs.
        
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
                        "detailed_strategy": types.Schema(type=types.Type.STRING, description="Must include: 1. Present and future price, 2. Technique for proper cultivation, 3. Precautions, 4. Fertilizer suggestion"),
                        "risk_mitigation_plan": types.Schema(type=types.Type.STRING, description="Detailed minute strategy if conditions go bad"),
                    }
                ),
                "sources": types.Schema(
                    type=types.Type.ARRAY,
                    items=types.Schema(
                        type=types.Type.OBJECT,
                        properties={
                            "title": types.Schema(type=types.Type.STRING),
                            "url": types.Schema(type=types.Type.STRING),
                        }
                    )
                )
            }
        )
        
        # Using Gemini 2.5 Flash with automatic key rotation
        response = self._generate_content(
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=detail_schema
            )
        )
        
        data = json.loads(response.text or '{}')
        
        data = json.loads(response.text or '{}')
        
        # Use sources from AI generated content (grounded in Serper context)
        sources = data.get('sources', [])
        if not sources:
            # Fallback to general official links if AI fails to provide specifics
            sources = [
                {'title': 'e-NAM National Agriculture Market', 'url': 'https://www.enam.gov.in/'},
                {'title': 'Agmarknet Mandi Rates', 'url': 'https://agmarknet.gov.in/'}
            ]
        
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
        """Search for agricultural marketplace products with real-time web grounding."""
        today = datetime.now().strftime('%Y')
        
        # Step 1: Live Grounding via Serper
        search_query = f"Buy agricultural {query} {category} India {today} prices store"
        web_context = self._search_web(search_query)
        
        contents = f"""Find real-time Indian agricultural products. 
        Category: {category}, Query: {query}.
        Today's Year: {today}.
        
        WEB RESEARCH CONTEXT:
        {web_context}
        
        STRICT REQUIREMENT:
        1. Only include products that are currently available and have realistic 2024/2025/2026 pricing.
        2. FAKE CONTENT CHECK: Only suggest products and links found in the WEB RESEARCH CONTEXT.
        3. URL VALIDATION: source_url must be a valid Indian e-commerce or agricultural portal.
        4. No fake reviews or ratings."""
        
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
        
        # Using Gemini 2.5 Flash with automatic key rotation
        response = self._generate_content(
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=item_schema
            )
        )
        
        return json.loads(response.text or '[]')
    
    def search_resources(self, query: str, category: str) -> list:
        """Search for agricultural resources and articles with real-time web grounding."""
        today = datetime.now().strftime('%d %B %Y')
        
        # Step 1: Live Grounding via Serper
        search_query = f"Latest Indian agricultural {query} {category} news articles {today}"
        web_context = self._search_web(search_query)
        
        contents = f"""Find Indian agricultural resources and news. 
        Category: {category}, Query: {query}.
        Today is: {today}.
        
        WEB RESEARCH CONTEXT:
        {web_context}
        
        STRICT REQUIREMENT: 
        1. Return EXACTLY 4 high-quality verified resources. No more, no less.
        2. Only return articles from late 2024 or 2025. 
        3. FAKE CONTENT CHECK: You must ONLY suggest links that you found in the WEB RESEARCH CONTEXT. Do not invent links or websites.
        4. URL VALIDATION: Ensure the source_url is a real, working agricultural or news website.
        5. LANGUAGE: Simple and helpful for farmers.
        6. NO FAKE NEWS: If you don't find a real verified source for a query, return an empty array or very few verified items."""
        
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
        
        # Using Gemini 2.5 Flash with automatic key rotation
        response = self._generate_content(
            contents=contents,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
                response_schema=resource_schema
            )
        )
        
        return json.loads(response.text or '[]')
    
    def get_schemes(self) -> list:
        """Get exactly 4 active government schemes for farmers from late 2024-2025."""
        return self.search_resources("Exactly 4 Most Important Official Government Schemes for Farmers India Dec 2024 Jan 2025", "Schemes")

    def ask_question(self, question: str, history: list = None, context: dict = None) -> str:
        """Answer agricultural questions based on context and conversation history."""
        
        system_prompt = """You are an Expert Agri-Consultant for Indian farmers. 
        Your primary goal is to provide empathetic, practical, and scientifically sound agricultural advice. 
        
        EMPATHY & FOCUS:
        - If the user expresses a problem (loss, pests, failure), ALWAYS acknowledge it first with empathy (e.g., "I'm sorry to hear about your loss...").
        - PRIORITIZE the user's specific question over general context. Do not dump soil data (N, P, K) unless the user asks about fertilization or soil.
        - Be a problem-solver, not just a data reporter.
        
        ### MANDATORY SCRIPT RULE (CRITICAL) ###
        - If the user writes in the English Alphabet (Latin characters), you MUST respond ONLY in the English Alphabet.
        - NEVER USE DEVANAGARI (HINDI SCRIPT) if the user is using English letters.
        - Match Hinglish with Hinglish. Example: "Hi" -> "Hello", "Kaise ho" -> "Main theek hoon".
        - BAN ON REPETITIVE GREETINGS: Do not start with "Namaste" or "Kisan bhai" every time. Be direct.
        
        EMPATHY & FOCUS:
        - If the user expresses a problem (loss, pests), acknowledge it first with empathy.
        - Be a problem-solver, not just a data reporter.
        
        If local context is provided, make your advice specific to their climate.
        
        STRICT FORMATTING:
        - Use **bold** only for highlighting specific critical values or terms inside sentences.
        - DO NOT use bold markers (**) for titles or headers.
        - Use Bullet points (•) for steps.
        - PRICING: ALWAYS use ₹/kg format (e.g., ₹45/kg).
        - Keep output clean and free of unnecessary markdown symbols. """
        
        contents = []
        
        # Add history if available
        if history:
            for msg in history:
                role = "user" if msg['role'] == 'user' else "model"
                contents.append(types.Content(role=role, parts=[types.Part.from_text(text=msg['content'])]))
        
        # Add the current question with context
        current_text = f"QUESTION: {question}"
        if context:
            current_text += f"\nBACKGROUND CONTEXT (Farmer Info): {json.dumps(context)}"
            
        contents.append(types.Content(role="user", parts=[types.Part.from_text(text=current_text)]))

        # SCRIPT DETECTION & ENFORCEMENT
        is_latin = all(ord(c) < 128 or c in "₹₹" for c in question)
        if is_latin:
            system_prompt += "\n\nREQUIRED: User is typing in Latin characters. You MUST respond in Latin script (Hinglish/English). Do NOT use Devanagari characters today."
        
        # Using Gemini 2.5 Flash for instruction compliance
        def _call(client):
            return client.models.generate_content(
                model='gemini-2.5-flash',
                contents=contents,
                config=types.GenerateContentConfig(
                    system_instruction=system_prompt
                )
            )
        
        response = self._rotate_and_retry(_call)
        return response.text or "I apologize, but I am unable to answer that right now."


gemini_service = GeminiService()
