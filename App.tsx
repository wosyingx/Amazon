import React, { useState } from 'react';
import ImageUploader from './components/ImageUploader';
import AssetCard from './components/AssetCard';
import ContentPanel from './components/ContentPanel';
import { AssetType, FileData, GeneratedAsset, GeneratedContent } from './types';
import { generateProductImage, generateListingCopy } from './services/geminiService';

const INITIAL_ASSETS: GeneratedAsset[] = [
  { id: '1', type: AssetType.MAIN_WHITE_BG, imageUrl: null, status: 'idle', promptUsed: '' },
  { id: '2', type: AssetType.LIFESTYLE, imageUrl: null, status: 'idle', promptUsed: '' },
  { id: '3', type: AssetType.DETAIL, imageUrl: null, status: 'idle', promptUsed: '' },
  { id: '4', type: AssetType.ANGLE_VAR_1, imageUrl: null, status: 'idle', promptUsed: '' },
  { id: '5', type: AssetType.CREATIVE, imageUrl: null, status: 'idle', promptUsed: '' },
];

const INITIAL_CONTENT: GeneratedContent = {
  title: '',
  bullets: [],
  description: '',
  status: 'idle'
};

const App: React.FC = () => {
  const [sourceImage, setSourceImage] = useState<FileData | null>(null);
  const [assets, setAssets] = useState<GeneratedAsset[]>(INITIAL_ASSETS);
  const [content, setContent] = useState<GeneratedContent>(INITIAL_CONTENT);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleImageSelected = async (data: FileData) => {
    setSourceImage(data);
    setAssets(INITIAL_ASSETS.map(a => ({ ...a, status: 'loading' })));
    setContent({ ...INITIAL_CONTENT, status: 'loading' });
    setIsProcessing(true);

    // Start text generation
    generateListingCopy(data.base64, data.mimeType)
      .then(result => {
        setContent({
          ...result,
          status: 'success'
        });
      })
      .catch(() => {
        setContent(prev => ({ ...prev, status: 'error' }));
      });

    // Start image generation (sequentially to be kind to rate limits, or parallel)
    // We will do parallel but independently managed.
    const assetPromises = INITIAL_ASSETS.map(async (asset) => {
      try {
        const imageUrl = await generateProductImage(data.base64, data.mimeType, asset.type);
        setAssets(prev => prev.map(p => p.id === asset.id ? { ...p, status: 'success', imageUrl } : p));
      } catch (e) {
        setAssets(prev => prev.map(p => p.id === asset.id ? { ...p, status: 'error' } : p));
      }
    });

    await Promise.allSettled(assetPromises);
    setIsProcessing(false);
  };

  const handleRetryAsset = async (assetToRetry: GeneratedAsset) => {
    if (!sourceImage) return;

    setAssets(prev => prev.map(p => p.id === assetToRetry.id ? { ...p, status: 'loading' } : p));
    try {
      const imageUrl = await generateProductImage(sourceImage.base64, sourceImage.mimeType, assetToRetry.type);
      setAssets(prev => prev.map(p => p.id === assetToRetry.id ? { ...p, status: 'success', imageUrl } : p));
    } catch (e) {
      setAssets(prev => prev.map(p => p.id === assetToRetry.id ? { ...p, status: 'error' } : p));
    }
  };

  const handleRetryContent = async () => {
    if (!sourceImage) return;
    setContent(prev => ({ ...prev, status: 'loading' }));
    try {
      const result = await generateListingCopy(sourceImage.base64, sourceImage.mimeType);
      setContent({ ...result, status: 'success' });
    } catch (e) {
      setContent(prev => ({ ...prev, status: 'error' }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-amazon text-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
             <div className="bg-white p-1 rounded">
               <svg className="w-6 h-6 text-amazon" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/></svg>
             </div>
             <div>
               <h1 className="text-xl font-bold tracking-tight">Amazon Listing Generator</h1>
               <p className="text-xs text-gray-300">Powered by Gemini AI</p>
             </div>
          </div>
          <div className="hidden md:block">
            <span className="text-sm bg-amazon-light px-3 py-1 rounded-full text-gray-200 border border-gray-600">
               {isProcessing ? 'Processing Images...' : 'Ready'}
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Upload & Source */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <h2 className="text-lg font-bold text-gray-900 mb-4">1. Upload Product Photo</h2>
              <ImageUploader onImageSelected={handleImageSelected} isLoading={isProcessing} />
              
              {sourceImage && (
                <div className="mt-6">
                  <p className="text-sm font-medium text-gray-700 mb-2">Source Image:</p>
                  <div className="rounded-lg overflow-hidden border border-gray-200 bg-gray-50 aspect-square flex items-center justify-center">
                    <img 
                      src={sourceImage.previewUrl} 
                      alt="Source" 
                      className="max-w-full max-h-full object-contain" 
                    />
                  </div>
                </div>
              )}
            </div>

            {/* A+ Content Panel Mobile/Desktop shared */}
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
               <h2 className="text-lg font-bold text-gray-900 mb-4">3. A+ Content & SEO</h2>
               <ContentPanel content={content} onRetry={handleRetryContent} />
            </div>
          </div>

          {/* Right Column: Generated Visuals */}
          <div className="lg:col-span-8 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-xl font-bold text-gray-900">2. Generated Visual Assets (5 Images)</h2>
              <span className="text-sm text-gray-500">
                {assets.filter(a => a.status === 'success').length} / 5 Generated
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
               {assets.map((asset) => (
                 <div key={asset.id} className={asset.type === AssetType.MAIN_WHITE_BG ? 'col-span-2 md:col-span-2 row-span-2' : ''}>
                   <AssetCard 
                      asset={asset} 
                      onRetry={handleRetryAsset}
                   />
                 </div>
               ))}
            </div>

            {/* Instruction Tip */}
            <div className="bg-blue-50 border border-blue-100 rounded-md p-4 flex gap-3">
              <svg className="w-5 h-5 text-amazon-blue mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
              <div>
                <h4 className="text-sm font-bold text-amazon-blue">Pro Tip</h4>
                <p className="text-sm text-blue-800">
                  The "Main Image" must be on a pure white background to comply with Amazon guidelines. 
                  The generated text is optimized for SEO but should be reviewed for accuracy before publishing.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
