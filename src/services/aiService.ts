import { GoogleGenAI } from "@google/genai";

export const AIService = {
  async analyzeAyah(arabicText: string, translation: string, aspect: 'combined' | 'tajweed' | 'grammar' = 'combined', source: 'standard' | 'traditional' | 'technical' = 'standard') {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const sourceContext = {
      standard: "expert Quranic scholar and linguist, drawing from modern educational standards",
      traditional: "classical scholar, deeply rooted in the traditions of Ibn Kathir, Al-Jalalayn, and the Mu'tazilite/Ash'ari linguistic heritage",
      technical: "academic computational linguist and phonology researcher focusing on semantic structure and exact acoustics"
    }[source];

    const aspectPrompt = {
      combined: "Analyze the specific Tajweed rules AND the sentence structure/grammar of this verse in great detail.",
      tajweed: "Focus EXCLUSIVELY on a deep Tajweed analysis. Ignore complex grammar unless it affects pronunciation. Detail every single rule application.",
      grammar: "Focus EXCLUSIVELY on the linguistic breakdown (I'rab), semantic nuances, and word choice significance. Ignore Tajweed details."
    }[aspect];

    const prompt = `You are an ${sourceContext}. ${aspectPrompt}
    
    VERSE:
    Arabic: ${arabicText}
    Provided Translation: ${translation}

    TAJWEED ANALYSIS TASKS:
    Identify and explain the specific Tajweed rules found in this verse. For each rule:
    1. Identify the exact letter(s) and word where the rule applies.
    2. Explain how the rule modifies the pronunciation (e.g., merging, echoing, nasalization depth).
    Specifically check for: Noon Sakinah & Tanween, Meem Sakinah, Madd, and Qalqalah.

    GRAMMAR AND CONTEXT TASKS:
    1. Break down the sentence structure (I'rab basics).
    2. Explain the linguistic significance of specific word choices (e.g., Why this specific verb form? Why this specific word order?).
    3. Connect the grammatical structure to the overall meaning and context.

    SOURCES:
    Mention specific scholarly references (e.g., Al-Jazariyyah, Sībawayh, Al-Kashshaf) that reflect your "${source}" persona.

    OUTPUT SPECIFICATION:
    IMPORTANT: Provide all text content in Bengali (বাংলা).
    Return ONLY a JSON object with these EXACT keys:
    - "tajweedAndPronunciation": Detailed tajweed rules in Bengali, formatted as a clear list. Mention exact characters and pronunciation tips. If aspect was 'grammar', return "Not requested".
    - "nuancedTranslation": A more refined Bengali (বাংলা) translation capturing deeper meaning.
    - "grammarAndContext": Detailed linguistic breakdown and grammatical significance in Bengali. Break it down into points. If aspect was 'tajweed', return "Not requested".
    - "translationNuances": Explanation of why the suggested Bengali translation is more accurate.
    - "analysisSources": List of specific references/sources in Bengali that justify this analysis from the perspective of a ${source} source.

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
    Your goal is to provide a comprehensive "Recitation Analysis" for a student.
    
    TASKS:
    1. Identify the most common pronunciation mistakes (Makharij) students make with THIS specific verse.
    2. List all the key Tajweed rules applied in this verse (e.g., Ikhfaa, Idghaam, Qalqalah) and explain exactly how to perform them here.
    3. Identify "Potential Difficulty Areas" - words or transitions that are particularly tricky for beginners.
    4. Provide specific "Practice Drills" for this verse.
    
    OUTPUT SPECIFICATION:
    IMPORTANT: Provide all text content in Bengali (বাংলা).
    Return ONLY a JSON object with these EXACT keys:
    - "pronunciationFeedback": [ { "point": "string", "explanation": "string in BENGALI" } ]
    - "tajweedRulesApplied": [ { "rule": "string", "application": "Detailed explanation of which word/letter and how to pronounce in BENGALI" } ]
    - "difficultAreas": [ { "word": "string (arabic)", "reason": "string in BENGALI" } ]
    - "practiceDrills": [ "string in BENGALI" ]

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
        pronunciationFeedback: [],
        tajweedRulesApplied: [],
        difficultAreas: [],
        practiceDrills: ["প্রতিটি অক্ষরের স্পষ্ট উচ্চারণের দিকে মনোযোগ দিন।"]
      };
    }
  },

  async analyzeRecitation(audioBase64: string, arabicText: string, mimeType: string = "audio/webm", strict: boolean = false) {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

    const prompt = strict 
      ? `You are an ELITE Tajweed auditor. Your ONLY task is to identify errors (mistakes) in the recitation compared to: "${arabicText}".
    
    CRITICAL FOCUS: 
    - Be extremely strict. 
    - Identify every tiny slip in pronunciation, Tajweed (Ghunnah, Madd, Qalqalah), or pausing.
    - If the user skips even one small vowel sound (Harakat), flag it.
    - Focus ONLY on what was WRONG.
    
    OUTPUT SPECIFICATION:
    IMPORTANT: All text in 'feedback' and 'overallFeedback' MUST be in Bengali (বাংলা).
    Return ONLY a JSON object with these EXACT keys:
    - "accuracyScore": (0-100)
    - "mistakes": [ { "word": "string (arabic)", "type": "pronunciation/tajweed/skipping", "feedback": "Detailed explanation of why it is wrong and how to fix it in BENGALI" } ]
    - "overallFeedback": "A concise summary of ONLY the errors found in BENGALI"
    
    If there are no mistakes, return empty mistakes array.
    DO NOT include any text before or after the JSON.`
      : `You are an expert Tajweed coach. Your primary goal is to find mistakes in the recitation compared to the perfect Arabic text: "${arabicText}".
    
    TASKS:
    1. Identify pronunciation mistakes (Makharij).
    2. Identify Tajweed rule mistakes (Ghunnah, Madd, Qalqalah, etc.).
    3. Identify missing words, added words, or incorrectly substituted words.
    
    OUTPUT SPECIFICATION:
    IMPORTANT: All text in 'feedback' and 'overallFeedback' MUST be in Bengali (বাংলা).
    Return ONLY a JSON object with these EXACT keys:
    - "accuracyScore": (0-100)
    - "mistakes": [ { "word": "string (arabic)", "type": "pronunciation/tajweed/skipping", "feedback": "Detailed explanation of why it is wrong and how to fix it in BENGALI" } ]
    - "overallFeedback": "A concise summary of the performance in BENGALI"

    If there are no mistakes, the 'mistakes' array should be empty.
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
