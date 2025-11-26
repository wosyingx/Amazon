import React, { useState } from 'react';
import { GeneratedContent } from '../types';

interface ContentPanelProps {
  content: GeneratedContent;
  onRetry: () => void;
}

const ContentPanel: React.FC<ContentPanelProps> = ({ content, onRetry }) => {
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const copyToClipboard = (text: string, section: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(section);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  if (content.status === 'idle') {
    return (
      <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm text-center">
        <p className="text-gray-400">Upload an image to generate A+ content.</p>
      </div>
    );
  }

  if (content.status === 'loading') {
    return (
      <div className="bg-white rounded-lg p-8 border border-gray-200 shadow-sm text-center flex flex-col items-center justify-center min-h-[300px]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-amazon-accent mb-4"></div>
        <h3 className="text-lg font-medium text-gray-800">Analyzing Product...</h3>
        <p className="text-gray-500 text-sm mt-1">Writing optimized titles and bullets.</p>
      </div>
    );
  }

  if (content.status === 'error') {
    return (
      <div className="bg-red-50 rounded-lg p-6 border border-red-100 text-center">
        <p className="text-red-600 mb-4">Failed to generate content.</p>
        <button 
          onClick={onRetry}
          className="px-4 py-2 bg-white border border-red-200 text-red-600 rounded-md hover:bg-red-50 transition-colors shadow-sm"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amazon-accent"></span>
            Product Title
          </h3>
          <button 
            onClick={() => copyToClipboard(content.title, 'title')}
            className="text-xs text-amazon-blue font-medium hover:underline"
          >
            {copiedSection === 'title' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 text-sm text-gray-700 leading-relaxed">
          {content.title}
        </div>
      </div>

      {/* Bullets Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amazon-accent"></span>
            Key Features (Bullets)
          </h3>
          <button 
            onClick={() => copyToClipboard(content.bullets.join('\n'), 'bullets')}
            className="text-xs text-amazon-blue font-medium hover:underline"
          >
             {copiedSection === 'bullets' ? 'Copied!' : 'Copy All'}
          </button>
        </div>
        <ul className="p-4 list-disc list-inside space-y-2 text-sm text-gray-700">
          {content.bullets.map((bullet, idx) => (
            <li key={idx} className="leading-snug">{bullet}</li>
          ))}
        </ul>
      </div>

      {/* Description Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amazon-accent"></span>
            Product Description
          </h3>
          <button 
            onClick={() => copyToClipboard(content.description, 'desc')}
            className="text-xs text-amazon-blue font-medium hover:underline"
          >
             {copiedSection === 'desc' ? 'Copied!' : 'Copy'}
          </button>
        </div>
        <div className="p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">
          {content.description}
        </div>
      </div>
    </div>
  );
};

export default ContentPanel;
