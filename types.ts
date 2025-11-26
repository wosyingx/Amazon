export enum AssetType {
  MAIN_WHITE_BG = 'Main Image (White BG)',
  LIFESTYLE = 'Lifestyle/Scenario',
  DETAIL = 'Detail/Texture',
  ANGLE_VAR_1 = 'Alternative Angle',
  CREATIVE = 'Creative Marketing Shot'
}

export interface GeneratedAsset {
  id: string;
  type: AssetType;
  imageUrl: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  error?: string;
  promptUsed: string;
}

export interface GeneratedContent {
  title: string;
  bullets: string[];
  description: string;
  status: 'idle' | 'loading' | 'success' | 'error';
}

export interface FileData {
  file: File;
  previewUrl: string;
  base64: string;
  mimeType: string;
}
