export const fetchGeminiInsights = async (activities: any, profile: any) => {
  const response = await fetch("/api/gemini/insights", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ activities, profile })
  });
  if (!response.ok) throw new Error("Failed to fetch insights");
  return response.json();
};

export const fetchGeminiCoach = async (message: string, history: any[], profile: any, activities: any) => {
  const response = await fetch("/api/gemini/coach", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message, history, profile, activities })
  });
  if (!response.ok) throw new Error("Failed to fetch coach response");
  return response.json();
};

export const fetchGeminiTracker = async (inputText: string) => {
  const response = await fetch("/api/gemini/tracker", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ inputText })
  });
  if (!response.ok) throw new Error("Failed to parse activity");
  return response.json();
};

export const fetchGeminiReceipt = async (base64Image: string) => {
  const response = await fetch("/api/gemini/receipt", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ image: base64Image })
  });
  if (!response.ok) throw new Error("Failed to scan receipt");
  return response.json();
};
