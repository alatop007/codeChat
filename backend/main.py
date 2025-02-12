from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
import requests
import json

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

OLLAMA_API = "http://localhost:11434"
MODEL_NAME = "deepseek-r1:1.5b"

class CodeQuery(BaseModel):
    query: str
    context: str

def query_ollama(prompt: str) -> str:
    try:
        response = requests.post(
            f"{OLLAMA_API}/api/generate",
            json={
                "model": MODEL_NAME,
                "prompt": prompt,
                "stream": False
            }
        )
        response.raise_for_status()
        return response.json()["response"]
    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=500, detail=f"Error communicating with Ollama: {str(e)}")

@app.post("/analyze-code")
async def analyze_code(file: UploadFile = File(...)):
    try:
        # Create temp directory for uploaded files
        temp_dir = Path("temp")
        temp_dir.mkdir(exist_ok=True)
        
        file_path = temp_dir / file.filename
        with file_path.open("wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Read file content
        with file_path.open() as f:
            content = f.read()
            
        return {"content": content, "message": "File analyzed successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        # Cleanup
        if file_path.exists():
            file_path.unlink()

@app.post("/query")
async def query_code(query: CodeQuery):
    try:
        # Prepare input for the model
        prompt = f"""Code context:
{query.context}

Question: {query.query}

Please provide a clear and concise answer based on the code context above.

Answer:"""
        
        # Get response from Ollama
        response = query_ollama(prompt)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/health")
async def health_check():
    try:
        # Check if Ollama is running and model is available
        response = requests.get(f"{OLLAMA_API}/api/tags")
        response.raise_for_status()
        models = response.json().get("models", [])
        
        if not any(model["name"] == MODEL_NAME for model in models):
            return {
                "status": "warning",
                "message": f"Ollama is running but {MODEL_NAME} model is not pulled. Please run 'ollama pull {MODEL_NAME}'"
            }
            
        return {"status": "healthy", "message": "Backend is running and Ollama is available"}
    except requests.exceptions.RequestException:
        return {
            "status": "error",
            "message": "Cannot connect to Ollama. Please make sure Ollama is running on port 11434"
        }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)