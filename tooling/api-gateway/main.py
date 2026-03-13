from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Optional
import httpx
import os

app = FastAPI(title="Eburon AI Gateway")

OLLAMA_HOST = os.getenv("OLLAMA_HOST", "http://localhost:11434")

# Mapping of Eburon Aliases to actual repository models
MODEL_WHITELIST = {
    "eburon-apo:ultimate": "llama3:latest",
    "eburon-buntun:vision": "llava:latest",
    "eburon-callao:flash": "phi3:latest",
    "eburon-itawit:heritage": "mistral:latest",
}


class GenerateRequest(BaseModel):
    model: str
    prompt: str
    system: Optional[str] = None
    stream: bool = False


@app.get("/health")
async def health():
    return {"status": "ok", "ollama_host": OLLAMA_HOST}


@app.post("/generate")
async def generate(request: GenerateRequest):
    # Resolve alias
    actual_model = MODEL_WHITELIST.get(request.model, request.model)

    # Proxy to Ollama
    async with httpx.AsyncClient() as client:
        try:
            payload = {
                "model": actual_model,
                "prompt": request.prompt,
                "stream": request.stream,
            }
            if request.system:
                payload["system"] = request.system

            response = await client.post(
                f"{OLLAMA_HOST}/api/generate", json=payload, timeout=None
            )

            if response.status_code != 200:
                raise HTTPException(
                    status_code=response.status_code, detail=response.text
                )

            return response.json()
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))


@app.get("/models")
async def list_models():
    return {"eburon_models": list(MODEL_WHITELIST.keys()), "mapping": MODEL_WHITELIST}


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
