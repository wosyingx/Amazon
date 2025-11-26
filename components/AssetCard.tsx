import React from 'react';
import { GeneratedAsset } from '../types';

interface AssetCardProps {
  asset: GeneratedAsset;
  onRetry: (asset: GeneratedAsset) => void;
}

const AssetCard: React.FC<AssetCardProps> = ({ asset, onRetry }) => {
  const handleDownload = () => {
    if (asset.imageUrl) {
      const link = document.createElement('a');
      link.href = asset.imageUrl;
      link.download = `amazon-${asset.type.toLowerCase().replace(/\s+/g, '-')}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-100 flex flex-col h-full">
      <div className="bg-gray-50 px-4 py-2 border-b border-gray-100 flex justify-between items-center">
        <h3 className="text-xs font-bold uppercase tracking-wider text-gray-600">{asset.type}</h3>
        {asset.status === 'success' && (
          <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">Ready</span>
        )}
      </div>

      <div className="relative aspect-square bg-gray-100 flex items-center justify-center group">
        {asset.status === 'idle' && (
           <span className="text-gray-400 text-sm">Waiting to generate...</span>
        )}
        
        {asset.status === 'loading' && (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amazon-accent mb-2"></div>
            <span className="text-xs text-gray-500 animate-pulse">Generating...</span>
          </div>
        )}

        {asset.status === 'error' && (
          <div className="p-4 text-center">
             <p className="text-red-500 text-sm mb-2">Generation Failed</p>
             <button 
               onClick={() => onRetry(asset)}
               className="text-xs text-amazon-blue hover:underline font-medium"
             >
               Try Again
             </button>
          </div>
        )}

        {asset.status === 'success' && asset.imageUrl && (
          <>
            <img 
              src={asset.imageUrl} 
              alt={asset.type} 
              className="w-full h-full object-contain p-2"
            />
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <button 
                onClick={handleDownload}
                className="bg-white text-amazon-blue px-3 py-1.5 rounded-md text-sm font-medium shadow-lg hover:bg-gray-100 transform hover:scale-105 transition-all"
              >
                Download
              </button>
              <button 
                 onClick={() => window.open(asset.imageUrl || '', '_blank')}
                 className="bg-gray-800 text-white px-3 py-1.5 rounded-md text-sm font-medium shadow-lg hover:bg-gray-700 transform hover:scale-105 transition-all"
              >
                View Full
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AssetCard;
