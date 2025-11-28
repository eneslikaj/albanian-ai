import { GoogleGenAI, Type, Schema } from "@google/genai";
import { PromptDetails } from "../types";

const ALBANIAN_TRANSLATOR_SYSTEM_INSTRUCTION = `
You are the real-time image-generation engine for an Albanian-only application. Your purpose is to receive user descriptions written strictly in the Albanian language and transform them into complete, detailed, professionally structured image-generation prompts in English. Although the final prompt is in English for maximum compatibility and quality, the image must ALWAYS reflect Albanian culture, Albanian environments, Albanian people, Albanian objects, Albanian clothing, Albanian energy, Albanian surroundings, and Albanian context unless the user specifically requests something else.

CORE RULES:
1. All user prompts are in Albanian.
2. You must understand and interpret Albanian perfectly.
3. The visuals MUST look Albanian by default unless the user mentions another nationality.
4. You NEVER output Albanian text.
5. You NEVER output explanations or commentary.
6. You ALWAYS expand the scene into a full cinematic description even if the user's prompt is short.

ALBANIAN CULTURAL ADAPTATION RULES:
- PEOPLE: Mediterranean skin tones, dark/brown hair, natural Balkan facial features.
- LOCATIONS: Beaches (Dhërmi, Ksamil), Streets (Tirana, Shkodër), Mountains (Theth), Balkan cafes.
- OBJECTS: Albanian coffee, Red/Black themes, Balkan household items.
- ATMOSPHERE: Mediterranean light, Balkan urban realism.

You must return the result in JSON format matching the schema provided.
`;

// Initialize API Client
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    throw new Error("API Key not found in environment");
  }
  return new GoogleGenAI({ apiKey });
};

const promptSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sceneOverview: { type: Type.STRING, description: "A detailed, 3–5 sentence cinematic description of the entire moment." },
    subjectDetails: { type: Type.STRING, description: "Description of primary subject(s): Age, Gender, Clothing, Expression, Pose, etc." },
    environment: { type: Type.STRING, description: "Environment description. MUST be Albanian-themed unless specified otherwise." },
    cameraComposition: { type: Type.STRING, description: "Camera angle, shot type, focal length, depth of field." },
    lightingAtmosphere: { type: Type.STRING, description: "Light source, shadow type, color temperature, mood." },
    styleParameters: { type: Type.STRING, description: "One specific style: e.g., Ultra-photorealistic, Cinematic, etc." },
    finalGenerationPrompt: { type: Type.STRING, description: "A single fluent paragraph of English with NO formatting, ready for the image generator." },
  },
  required: ["sceneOverview", "subjectDetails", "environment", "cameraComposition", "lightingAtmosphere", "styleParameters", "finalGenerationPrompt"],
};

export const transformAlbanianPrompt = async (albanianText: string): Promise<PromptDetails> => {
  const ai = getAiClient();
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: `Transform this Albanian description into a cinematic English prompt: "${albanianText}"`,
    config: {
      systemInstruction: ALBANIAN_TRANSLATOR_SYSTEM_INSTRUCTION,
      responseMimeType: "application/json",
      responseSchema: promptSchema,
      temperature: 0.7,
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from translator model");
  
  return JSON.parse(text) as PromptDetails;
};

export const generateImagesFromPrompt = async (englishPrompt: string, count: number = 3): Promise<string[]> => {
  const ai = getAiClient();
  
  // Create an array of promises to run in parallel, but with a slight stagger to avoid instant rate limits
  const imagePromises = Array(count).fill(null).map(async (_, index) => {
    // Stagger requests by 300ms each to prevent 429 errors
    await new Promise(resolve => setTimeout(resolve, index * 300));

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash-image',
        contents: {
          parts: [
            { text: `Generate a photorealistic image of: ${englishPrompt}` }
          ]
        },
        config: {
            imageConfig: {
              aspectRatio: '1:1',
            }
        }
      });

      const parts = response.candidates?.[0]?.content?.parts;
      if (!parts) {
        console.warn(`Attempt ${index + 1}: No parts in response`);
        return null;
      }

      for (const part of parts) {
        if (part.inlineData && part.inlineData.data) {
          return `data:${part.inlineData.mimeType || 'image/png'};base64,${part.inlineData.data}`;
        }
      }
      console.warn(`Attempt ${index + 1}: No inlineData found in response`);
      return null;
    } catch (e) {
      console.error(`Attempt ${index + 1}: Image generation failed`, e);
      return null;
    }
  });

  const results = await Promise.all(imagePromises);
  const validImages = results.filter((img): img is string => img !== null);

  if (validImages.length === 0) {
    throw new Error("No images generated successfully. Please try again or adjust your prompt.");
  }

  return validImages;
};

export const generateVideoFromImage = async (imageDataUri: string, prompt: string): Promise<string> => {
  const ai = getAiClient();

  // Extract base64 and mimeType
  const match = imageDataUri.match(/^data:(.+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data URI");
  const mimeType = match[1];
  const imageBytes = match[2];

  let operation = await ai.models.generateVideos({
    model: 'veo-3.1-fast-generate-preview',
    prompt: `Cinematic movement, ${prompt}`,
    image: {
      imageBytes: imageBytes,
      mimeType: mimeType,
    },
    config: {
      numberOfVideos: 1,
      resolution: '720p',
      aspectRatio: '16:9' 
    }
  });

  // Poll for completion
  while (!operation.done) {
    await new Promise(resolve => setTimeout(resolve, 3000)); // Poll every 3 seconds
    operation = await ai.operations.getVideosOperation({operation: operation});
  }

  const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
  if (!downloadLink) throw new Error("Video generation failed or no URI returned");

  // Fetch the video bytes using the API Key
  const videoResponse = await fetch(`${downloadLink}&key=${process.env.API_KEY}`);
  if (!videoResponse.ok) throw new Error("Failed to download generated video");
  
  const videoBlob = await videoResponse.blob();
  return URL.createObjectURL(videoBlob);
};
