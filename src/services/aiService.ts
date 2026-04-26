import { GoogleGenAI } from "@google/genai";

export const AIService = {
  async analyzeAyah(arabicText: string, translation: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const prompt = `You are an expert Quranic scholar and linguist. Analyze the following Quranic verse.
    
    VERSE:
    Arabic: ${arabicText}
    Provided Translation: ${translation}

    TAJWEED ANALYSIS TASKS:
    Explicitly check for and list the application of these specific Tajweed rules found in this verse:
    1. Noon Sakinah & Tanween: Izhaar, Idghaam, Iqlaab, Ikhfaa.
    2. Meem Sakinah: Ikhfaa Shafawi, Idghaam Shafawi, Izhaar Shafawi.
    3. Madd (Prolongation): Madd Asli, Madd Muttasil, Madd Munfasil.
    4. Qalqalah (Echoing): Letters ق ط ب ج د when static.

    OUTPUT SPECIFICATION:
    Return ONLY a JSON object with these EXACT keys:
    - "tajweedAndPronunciation": Detailed tajweed rules applied in this verse, specifically naming the rules (e.g., "Ikhfaa on letter X because of Y").
    - "nuancedTranslation": A more refined English translation captruing deeper meaning.
    - "grammarAndContext": Linguistic nuances and grammatical insights.
    - "translationNuances": Explanation of why the suggested translation is more accurate.

    DO NOT include any text before or after the JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview", 
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });
      
      return safeJsonParse(response.text);
    } catch (error) {
      console.error("AI Analysis Error:", error);
      return { 
        error: "Failed to analyze verse",
        tajweedAndPronunciation: "Analysis unavailable",
        grammarAndContext: "Analysis unavailable",
        nuancedTranslation: translation,
        translationNuances: "Unable to reach AI services."
      };
    }
  },

  async getRecitationGuide(arabicText: string) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const prompt = `You are a professional Tajweed teacher. Analyze this Quranic text: "${arabicText}".
    
    TASKS:
    1. Identify the most common pronunciation mistakes students make with THIS specific verse.
    2. Provide specific "Practice Drills" for difficult transitions or letters in this verse.
    3. Highlight which words require extra attention to avoid skipping or merging incorrectly.
    
    OUTPUT SPECIFICATION:
    Return ONLY a JSON object with these EXACT keys:
    - "commonMistakes": [ { "pitfall": "string", "howToAvoid": "string" } ]
    - "practiceDrills": [ "string" ]
    - "focusWords": [ { "word": "string", "reason": "string" } ]

    DO NOT include any text before or after the JSON.`;

    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        }
      });

      return safeJsonParse(response.text);
    } catch (error) {
      console.error("Recitation Guide Error:", error);
      return { 
        commonMistakes: [],
        practiceDrills: ["Focus on clear pronunciation of each letter."],
        focusWords: []
      };
    }
  },

  async analyzeRecitation(audioBase64: string, arabicText: string, mimeType: string = "audio/webm") {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const prompt = `You are an expert Tajweed coach. Compare the recorded recitation (audio) with the following Quranic text: "${arabicText}".
    
    TASKS:
    1. Identify pronunciation mistakes (Makharij).
    2. Identify Tajweed rule mistakes.
    3. Identify missing or added words.
    
    OUTPUT SPECIFICATION:
    Return ONLY a JSON object with these EXACT keys:
    - "accuracyScore": (0-100)
    - "mistakes": [ { "word": "string", "type": "pronunciation/tajweed/skipping", "feedback": "string" } ]
    - "overallFeedback": "string summary"

    DO NOT include any text before or after the JSON.`;

    try {
      const audioPart = {
        inlineData: {
          mimeType: mimeType,
          data: audioBase64,
        },
      };

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
          { parts: [audioPart, { text: prompt }] }
        ],
        config: {
          responseMimeType: "application/json",
        }
      });

      return safeJsonParse(response.text);
    } catch (error) {
      console.error("Recitation Analysis Error:", error);
      return { 
        error: "Failed to analyze recitation",
        accuracyScore: 0,
        mistakes: [],
        overallFeedback: "Unable to analyze the audio at this time."
      };
    }
  }
};

function safeJsonParse(text: string | undefined) {
  if (!text) return {};
  const jsonStart = text.indexOf('{');
  if (jsonStart === -1) return {};

  let lastIndex = text.lastIndexOf('}');
  while (lastIndex > jsonStart) {
    try {
      const candidate = text.substring(jsonStart, lastIndex + 1);
      return JSON.parse(candidate);
    } catch (e) {
      // Try the previous closing brace if parsing fails
      lastIndex = text.lastIndexOf('}', lastIndex - 1);
    }
  }

  try {
    return JSON.parse(text);
  } catch (e) {
    console.error("JSON Parse Error:", e, "Original text:", text);
    return {};
  }
}
