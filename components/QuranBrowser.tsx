
import React, { useState } from 'react';
import { generateScholarResponse } from '../services/geminiService';

const QuranBrowser: React.FC = () => {
    const [surah, setSurah] = useState(1);
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const fetchSurah = async (surahNumber: number) => {
        setIsLoading(true);
        try {
            // Updated prompt to be more specific about "Full" content and formatting
            const prompt = `পবিত্র কুরআনের সূরা নম্বর ${surahNumber} এর সম্পূর্ণ আরবি টেক্সট, সাবলীল বাংলা উচ্চারণ এবং সঠিক বাংলা অনুবাদ প্রদান করো। 
            
            বিন্যাস (Format):
            ১. সূরার নাম ও পরিচিতি (মাক্কী/মাদানী, আয়াত সংখ্যা)
            ২. বিসমিল্লাহির রাহমানির রাহিম (আরবি ও বাংলা)
            ৩. প্রতিটি আয়াত আলাদা আলাদা প্যারাগ্রাফে:
               - আরবি আয়াত
               - বাংলা উচ্চারণ
               - বাংলা অনুবাদ
            
            কোনো আয়াত বাদ দিবে না। সম্পূর্ণ সূরা দাও।`;
            
            const response = await generateScholarResponse(prompt, 'gemini-3-pro-preview', "তুমি একজন হাফিজ এবং কুরআন বিশেষজ্ঞ। নির্ভুলভাবে সম্পূর্ণ সূরা প্রদান করো।");
            setContent(response.text || "দুঃখিত, সূরাটি লোড করা যায়নি।");
        } catch (e) {
            setContent("ত্রুটি হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।");
        } finally {
            setIsLoading(false);
        }
    };

    const handleSearch = () => {
        if (surah >= 1 && surah <= 114) {
            fetchSurah(surah);
        }
    };

    const handleNext = () => {
        if (surah < 114) {
            const next = surah + 1;
            setSurah(next);
            fetchSurah(next);
        }
    };

    const handlePrev = () => {
        if (surah > 1) {
            const prev = surah - 1;
            setSurah(prev);
            fetchSurah(prev);
        }
    };

    return (
        <div className="h-full bg-stone-50 p-8 overflow-y-auto font-arabic">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">পবিত্র আল-কুরআন</h2>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6">
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                        <button 
                            onClick={handlePrev}
                            disabled={isLoading || surah <= 1}
                            className="p-3 rounded-full hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                            <span className="material-icons text-emerald-700">arrow_back_ios</span>
                        </button>

                        <div className="flex items-center gap-2">
                            <span className="text-stone-600 font-medium">সূরা নং:</span>
                            <input 
                                type="number" 
                                min="1" 
                                max="114" 
                                value={surah}
                                onChange={(e) => setSurah(parseInt(e.target.value) || 1)}
                                className="border border-stone-300 rounded-lg p-3 w-24 text-center text-lg font-bold text-emerald-800"
                            />
                        </div>

                        <button 
                            onClick={handleSearch}
                            disabled={isLoading}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold shadow-md transition-all active:scale-95"
                        >
                            {isLoading ? 'লোড হচ্ছে...' : 'পাঠ করুন'}
                        </button>

                        <button 
                            onClick={handleNext}
                            disabled={isLoading || surah >= 114}
                            className="p-3 rounded-full hover:bg-stone-100 disabled:opacity-30 transition-colors"
                        >
                            <span className="material-icons text-emerald-700">arrow_forward_ios</span>
                        </button>
                    </div>
                </div>
                
                {content ? (
                    <div className="bg-white p-8 rounded-2xl shadow border border-stone-200 min-h-[500px]">
                        <div className="prose prose-lg max-w-none font-arabic leading-loose whitespace-pre-wrap text-stone-800 text-right" style={{ direction: 'rtl' }}>
                            <div className="text-left" style={{ direction: 'ltr' }}>
                                {content}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 text-stone-400">
                        <span className="material-icons text-6xl mb-4 opacity-50">menu_book</span>
                        <p>পড়ার জন্য একটি সূরা নির্বাচন করুন</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default QuranBrowser;
