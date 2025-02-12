from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import shutil
from pathlib import Path
from typing import List, Dict
import torch
from transformers import AutoModelForCausalLM, AutoTokenizer

app = FastAPI()

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize model and tokenizer
model_name = "deepseek-ai/deepseek-coder-6.7b-base"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name)

class CodeQuery(BaseModel):
    query: str
    context: str

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
        prompt = f"Code context:\n{query.context}\n\nQuestion: {query.query}\n\nAnswer:"
        
        # Generate response
        inputs = tokenizer(prompt, return_tensors="pt", max_length=2048, truncation=True)
        outputs = model.generate(
            inputs.input_ids,
            max_length=512,
            temperature=0.7,
            num_return_sequences=1,
        )
        
        response = tokenizer.decode(outputs[0], skip_special_tokens=True)
        
        return {"response": response}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)