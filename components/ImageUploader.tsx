import React, { useCallback } from 'react';
import { FileData } from '../types';

interface ImageUploaderProps {
  onImageSelected: (data: FileData) => void;
  isLoading: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({ onImageSelected, isLoading }) => {
  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const result = e.target?.result as string;
      onImageSelected({
        file,
        previewUrl: result,
        base64: result, // result includes the data url prefix
        mimeType: file.type
      });
    };
    reader.readAsDataURL(file);
  }, [onImageSelected]);

  return (
    <div className="w-full">
      <label 
        htmlFor="file-upload" 
        className={`
          relative flex flex-col items-center justify-center w-full h-64 
          border-2 border-dashed rounded-xl cursor-pointer 
          transition-all duration-300
          ${isLoading 
            ? 'border-gray-300 bg-gray-100 cursor-not-allowed opacity-50' 
            : 'border-amazon-blue/30 bg-white hover:bg-blue-50 hover:border-amazon-blue'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
          <svg className="w-10 h-10 mb-3 text-amazon-light" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
          </svg>
          <p className="mb-2 text-sm text-gray-700 font-semibold">
            <span className="font-bold text-amazon-blue">Click to upload product photo</span>
          </p>
          <p className="text-xs text-gray-500">SVG, PNG, JPG or WEBP (Max 5MB)</p>
        </div>
        <input 
          id="file-upload" 
          type="file" 
          className="hidden" 
          accept="image/*"
          onChange={handleFileChange}
          disabled={isLoading}
        />
      </label>
    </div>
  );
};

export default ImageUploader;
