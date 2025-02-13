const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

interface AnalyzeInput {
  type: "path" | "url";
  value: string;
}

export const analyzeCode = async (input: AnalyzeInput) => {
  console.log(`Analyzing ${input.type}:`, input.value);

  const response = await fetch(`${API_URL}/analyze-code`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    throw new Error("Failed to analyze code");
  }

  return response.json();
};

export const queryCode = async (query: string, context: string) => {
  const response = await fetch(`${API_URL}/query`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, context }),
  });

  if (!response.ok) {
    throw new Error("Failed to query code");
  }

  return response.json();
};
