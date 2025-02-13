# Code Analysis Tool

A full-stack application that allows users to analyze code from both GitHub repositories and local directories. Built with React, TypeScript, Vite, FastAPI, and AI integration.

## Features

- Analyze GitHub repositories by URL
- Analyze local directories
- Interactive file explorer
- AI-powered code analysis
- Real-time chat interface for code queries
- Syntax-highlighted code previews

## Prerequisites

- Node.js (v16 or higher)
- Python (v3.8 or higher)
- Git

## Setup

### Frontend Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd <repository-name>
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:8000
```

4. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create and activate a Python virtual environment:
```bash
# On Windows
python -m venv venv
.\venv\Scripts\activate

# On macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Start the FastAPI server:
```bash
uvicorn main:app --reload --port 8000
```

The backend API will be available at `http://localhost:8000`

## Usage

### Analyzing a GitHub Repository

1. Open the application in your browser
2. In the GitHub Repository section, enter a valid GitHub repository URL
3. Click "Analyze Repository"
4. Wait for the analysis to complete
5. Explore the file tree and initial AI analysis
6. Ask questions about the code in the chat interface

### Analyzing a Local Directory

1. Open the application in your browser
2. In the Local Directory section, either:
   - Enter the full path to your directory
   - Click "Select Directory" to use the file picker
   - Drag & drop a folder onto the drop zone
3. Click "Analyze Directory"
4. Wait for the analysis to complete
5. Explore the file tree and initial AI analysis
6. Ask questions about the code in the chat interface

## API Endpoints

### POST /analyze-code
Analyze a GitHub repository or local directory

Request body:
```json
{
  "type": "url" | "path",
  "value": "string"
}
```

### POST /query
Query the analyzed codebase

Request body:
```json
{
  "query": "string",
  "context": "string"
}
```

## Development

### Frontend Structure

- `src/components/` - React components
- `src/lib/` - Utility functions and API calls
- `src/types/` - TypeScript type definitions

### Backend Structure

- `main.py` - FastAPI application and routes
- `requirements.txt` - Python dependencies

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## License

MIT
