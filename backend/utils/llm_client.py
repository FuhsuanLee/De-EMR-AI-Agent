from openai import AsyncOpenAI
from typing import List, Dict

class LLMClient:
    
    def __init__(self, api_key: str, model: str = "gpt-4o-mini"):

        self.client = AsyncOpenAI(api_key=api_key)
        self.model = model
    
    async def chat(
        self, 
        prompt: List[Dict[str, str]], 
        system_prompt: str,
        temperature: float = 1.0
    ) -> str:

        response = await self.client.responses.create(
            model=self.model,
            instructions=system_prompt,
            input=prompt,
            temperature=temperature,
        )
        text = response.output_text.strip()

        return text