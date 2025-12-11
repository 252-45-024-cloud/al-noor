import React, { useState } from 'react';
import { analyzeMedia } from '../services/geminiService';

const MediaStudio: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'analyze' | 'video'>('analyze');

  // Analysis State
  const [analysisFile, setAnalysisFile] = useState<File | null>(null);
  const [analysisPrompt, setAnalysisPrompt] = useState('ইসলামিক দৃষ্টিকোণ থেকে এই ছবিটি বিস্তারিত বর্ণনা করুন।');
  const [analysisResult, setAnalysisResult] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          const file = e.target.files[0];
          setAnalysisFile(file);
          setPreviewUrl(URL.createObjectURL(file));
          setAnalysisResult('');
      }
  };

  const handleAnalyze = async () => {
      if (!analysisFile) return;
      setIsAnalyzing(true);
      
      const reader = new FileReader();
      reader.onloadend = async () => {
          const base64Data = (reader.result as string).split(',')[1];
          try {
              const model = 'gemini-3-pro-preview';
              const response = await analyzeMedia(analysisPrompt, analysisFile.type, base64Data, model);
              setAnalysisResult(response.text || "কোনো বিশ্লেষণ পাওয়া যায়নি।");
          } catch (e) {
              setAnalysisResult("মিডিয়া বিশ্লেষণে সমস্যা হয়েছে।");
          } finally {
              setIsAnalyzing(false);
          }
      };
      reader.readAsDataURL(analysisFile);
  };

  return (
    <div className="h-full overflow-y-auto p-8 bg-stone-50 font-arabic">
      <div className="max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-emerald-900 mb-6">মিডিয়া স্টুডিও</h2>
        
        <div className="flex space-x-1 mb-6 bg-white p-1 rounded-xl shadow-sm inline-flex">
            {['analyze', 'video'].map(tab => (
                <button
                    key={tab}
                    onClick={() => setActiveTab(tab as any)}
                    className={`px-6 py-2 rounded-lg font-medium capitalize ${activeTab === tab ? 'bg-emerald-600 text-white shadow' : 'text-stone-500 hover:bg-stone-100'}`}
                >
                    {tab === 'video' ? 'ভিডিও বিশ্লেষণ' : 'ছবি বিশ্লেষণ'}
                </button>
            ))}
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200">
             <div className="space-y-6">
                 <div className="border-2 border-dashed border-stone-300 rounded-xl p-8 text-center bg-stone-50 hover:bg-stone-100 transition-colors">
                     <input 
                        type="file" 
                        accept={activeTab === 'video' ? "video/*" : "image/*"}
                        onChange={handleFileChange}
                        className="hidden" 
                        id="file-upload"
                     />
                     <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                         <span className="text-4xl mb-2">{activeTab === 'video' ? '📹' : '📸'}</span>
                         <span className="text-stone-600 font-medium">আপলোড করতে ক্লিক করুন ({activeTab === 'video' ? 'ভিডিও' : 'ছবি'})</span>
                         <span className="text-xs text-stone-400 mt-1">সাপোর্ট করে: {activeTab === 'video' ? 'MP4, WebM' : 'JPG, PNG'}</span>
                     </label>
                 </div>

                 {previewUrl && (
                     <div className="flex flex-col md:flex-row gap-6">
                         <div className="w-full md:w-1/2">
                             {activeTab === 'video' ? (
                                 <video src={previewUrl} controls className="w-full rounded-lg shadow" />
                             ) : (
                                 <img src={previewUrl} alt="Preview" className="w-full rounded-lg shadow" />
                             )}
                         </div>
                         <div className="w-full md:w-1/2 flex flex-col">
                             <label className="block text-sm font-medium text-stone-700 mb-2">বিশ্লেষণের নির্দেশাবলী:</label>
                             <textarea 
                                value={analysisPrompt}
                                onChange={(e) => setAnalysisPrompt(e.target.value)}
                                className="w-full border border-stone-300 rounded-lg p-3 h-24 mb-3"
                                placeholder="এই মিডিয়া সম্পর্কে আপনি কী জানতে চান?"
                             />
                             <button 
                                onClick={handleAnalyze}
                                disabled={isAnalyzing}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2 rounded-lg mb-4 flex justify-center items-center gap-2"
                             >
                                {isAnalyzing ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                        <span>বিশ্লেষণ চলছে...</span>
                                    </>
                                ) : (
                                    'বিশ্লেষণ করুন'
                                )}
                             </button>
                             
                             {analysisResult && (
                                 <div className="bg-stone-50 p-4 rounded-lg border border-stone-200 flex-1 overflow-y-auto max-h-80 prose prose-sm font-arabic">
                                     <h3 className="text-emerald-800 font-bold mb-2">বিশ্লেষণ ফলাফল:</h3>
                                     <p className="whitespace-pre-wrap">{analysisResult}</p>
                                 </div>
                             )}
                         </div>
                     </div>
                 )}
             </div>
        </div>
      </div>
    </div>
  );
};

export default MediaStudio;