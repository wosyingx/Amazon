import { GoogleGenAI, Type } from "@google/genai";
import { AssetType } from "../types";

// Helper to remove data URL prefix for API usage
const stripBase64Prefix = (base64: string): string => {
  return base64.replace(/^data:image\/(png|jpeg|jpg|webp);base64,/, '');
};

const getPromptForAssetType = (type: AssetType): string => {
  switch (type) {
    case AssetType.MAIN_WHITE_BG:
      return "Generate a professional e-commerce product photography shot of this exact object on a pure solid white background (#FFFFFF). Ensure the entire product is visible, perfectly lit with soft studio lighting, no shadows on the edges. High resolution, clean cut.";
    case AssetType.LIFESTYLE:
      return "Place this product in a realistic, high-quality lifestyle setting where it would naturally be used. Ensure the lighting matches the environment. Make it look like a professional advertisement photo.";
    case AssetType.DETAIL:
      return "Generate a macro close-up shot of this product, focusing on its texture, material quality, and fine details. Shallow depth of field to highlight craftsmanship.";
    case AssetType.ANGLE_VAR_1:
      return "Show this product from a slightly different angle (e.g., 45-degree side view) to reveal depth. maintain professional studio lighting on a neutral grey background.";
    case AssetType.CREATIVE:
      return "Create a creative, eye-catching marketing image for this product. Use dramatic lighting, or a colored background that complements the product colors. Make it pop for a social media ad.";
    default:
      return "A professional product image.";
  }
};

export const generateProductImage = async (
  base64Image: string,
  mimeType: string,
  assetType: AssetType
): Promise<string> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const prompt = getPromptForAssetType(assetType);

    // Using gemini-2.5-flash-image for image editing/generation
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: stripBase64Prefix(base64Image),
            },
          },
          {
            text: prompt,
          },
        ],
      },
    });

    // Check for inlineData (image) in response
    const imagePart = response.candidates?.[0]?.content?.parts?.find(p => p.inlineData);

    if (imagePart && imagePart.inlineData && imagePart.inlineData.data) {
      return `data:image/png;base64,${imagePart.inlineData.data}`;
    }

    throw new Error("No image data returned from Gemini.");

  } catch (error) {
    console.error(`Error generating ${assetType}:`, error);
    throw error;
  }
};

export const generateListingCopy = async (
  base64Image: string,
  mimeType: string
): Promise<{ title: string; bullets: string[]; description: string }> => {
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const prompt = `
      Act as an expert Amazon FBA Copywriter. Analyze the provided product image and write high-converting listing content.
      Return the result in JSON format with the following schema:
      {
        "title": "SEO optimized product title (max 200 chars)",
        "bullets": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4", "Benefit 5"],
        "description": "A compelling product description (approx 150 words) suitable for A+ content."
      }
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: stripBase64Prefix(base64Image),
            },
          },
          { text: prompt },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            bullets: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            description: { type: Type.STRING }
          },
          required: ["title", "bullets", "description"]
        }
      }
    });

    const text = response.text;
    if (!text) throw new Error("No text returned");
    
    return JSON.parse(text);

  } catch (error) {
    console.error("Error generating text content:", error);
    throw error;
  }
};
