from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
import os
import shutil
from pathlib import Path
import requests
import json
import tempfile
import subprocess

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

class AnalyzeInput(BaseModel):
    type: str = Field(..., description="Type of input: 'url' or 'path'")
    value: str = Field(..., description="GitHub URL or local directory path")

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

def is_code_file(file_path: Path) -> bool:
    code_extensions = {
        '.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.scss',
        '.java', '.cpp', '.c', '.h', '.hpp', '.go', '.rs', '.php',
        '.rb', '.swift', '.kt', '.scala', '.m', '.mm', '.json', '.yaml',
        '.yml', '.toml', '.xml', '.md', '.sql'
    }
    return file_path.suffix.lower() in code_extensions

def analyze_directory(directory_path: Path) -> dict:
    print(f"Starting analysis of directory: {directory_path}")
    file_tree = []
    code_content = ""
    
    def should_ignore(path: Path) -> bool:
        ignore_patterns = {
            'node_modules', '__pycache__', '.git', '.idea', '.vscode',
            'build', 'dist', 'target', 'venv', 'env', '.env'
        }
        return any(part in ignore_patterns for part in path.parts)
    
    def process_directory(path: Path, parent_list: list):
        try:
            items = sorted(path.iterdir(), key=lambda x: (not x.is_file(), x.name))
            for item in items:
                if should_ignore(item) or item.name.startswith('.'):
                    continue
                    
                if item.is_file() and is_code_file(item):
                    try:
                        with open(item, 'r', encoding='utf-8') as f:
                            content = f.read()
                            node = {
                                "name": item.name,
                                "type": "file",
                                "content": content,
                                "path": str(item.relative_to(directory_path))
                            }
                            parent_list.append(node)
                            nonlocal code_content
                            code_content += f"\n\nFile: {item.relative_to(directory_path)}\n{content}"
                    except Exception as e:
                        print(f"Error reading file {item}: {e}")
                elif item.is_dir():
                    children = []
                    node = {
                        "name": item.name,
                        "type": "folder",
                        "children": children,
                        "path": str(item.relative_to(directory_path))
                    }
                    parent_list.append(node)
                    process_directory(item, children)
        except Exception as e:
            print(f"Error processing directory {path}: {e}")
    
    process_directory(directory_path, file_tree)
    return {"file_tree": file_tree, "code_content": code_content}

@app.post("/analyze-code")
async def analyze_code(input: AnalyzeInput):
    print(f"Analyzing {input.type}: {input.value}")
    
    try:
        if input.type == "url":
            # Create a temporary directory for git clone
            with tempfile.TemporaryDirectory() as temp_dir:
                try:
                    subprocess.run(
                        ["git", "clone", input.value, temp_dir],
                        check=True,
                        capture_output=True,
                        text=True
                    )
                except subprocess.CalledProcessError as e:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Failed to clone repository: {e.stderr}"
                    )
                
                directory_path = Path(temp_dir)
        else:  # input.type == "path"
            directory_path = Path(input.value)
            if not directory_path.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Directory not found: {input.value}"
                )
        
        # Analyze the directory
        try:
            analysis_result = analyze_directory(directory_path)
        except Exception as e:
            print(f"Error during directory analysis: {str(e)}")
            raise HTTPException(
                status_code=500,
                detail=f"Failed to analyze directory: {str(e)}"
            )
    print(f"Analyzing repository: {repo.url}")
    try:
        # Create a temporary directory
        with tempfile.TemporaryDirectory() as temp_dir:
            # Clone the repository
            try:
                subprocess.run(
                    ["git", "clone", repo.url, temp_dir], 
                    check=True,
                    capture_output=True,
                    text=True
                )
            except subprocess.CalledProcessError as e:
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to clone repository: {e.stderr}"
                )
            
            # Analyze the directory
            try:
                analysis_result = analyze_directory(Path(temp_dir))
            except Exception as e:
                print(f"Error during directory analysis: {str(e)}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to analyze directory: {str(e)}"
                )
            
            if not analysis_result["file_tree"]:
                return {
                    "file_tree": [],
                    "code_content": "",
                    "summary": "No code files found in the directory",
                    "message": "Directory analyzed but no valid code files were found"
                }
            
            # Get initial analysis from Ollama
            code_sample = analysis_result['code_content'][:3000]  # First 3000 chars for initial analysis
            prompt = f"""Please analyze this codebase and provide a brief summary of its main components and functionality:

{code_sample}

Provide a concise summary of the codebase's main components and purpose."""
            
            initial_analysis = query_ollama(prompt)
            
            return {
                "file_tree": analysis_result["file_tree"],
                "code_content": analysis_result["code_content"],
                "summary": initial_analysis,
                "message": "Code analyzed successfully"
            }
    except HTTPException:
        raise
    except Exception as e:
        print(f"Unexpected error in analyze_code: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Unexpected error: {str(e)}")

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