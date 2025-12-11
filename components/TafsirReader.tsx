import React, { useState } from 'react';
import { generateScholarResponse } from '../services/geminiService';

const TafsirReader: React.FC = () => {
    const [surah, setSurah] = useState('');
    const [ayah, setAyah] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getTafsir = async () => {
        if (!surah || !ayah) return;
        setIsLoading(true);
        try {
            const prompt = `সূরা ${surah}, আয়াত ${ayah} এর তাফসীর প্রদান করো। তাফসীর ইবনে কাসির বা নির্ভরযোগ্য উৎস থেকে হতে হবে। প্রথমে আরবি আয়াত, তারপর বাংলা অনুবাদ এবং শেষে বিস্তারিত তাফসীর দাও।`;
            const response = await generateScholarResponse(prompt, 'gemini-3-pro-preview', "তুমি একজন মুফাসসির। বিস্তারিত তাফসীর প্রদান করো।");
            setContent(response.text || "দুঃখিত, তাফসীর পাওয়া যায়নি।");
        } catch (e) {
            setContent("ত্রুটি হয়েছে।");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-stone-50 p-8 overflow-y-auto font-arabic">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">তাফসীরুল কুরআন</h2>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6 flex flex-col md:flex-row gap-4 justify-center items-center">
                    <input 
                        type="number" 
                        value={surah}
                        onChange={(e) => setSurah(e.target.value)}
                        placeholder="সূরা নম্বর"
                        className="border border-stone-300 rounded-lg p-3 w-32 text-center"
                    />
                    <span className="text-xl font-bold">:</span>
                    <input 
                        type="number" 
                        value={ayah}
                        onChange={(e) => setAyah(e.target.value)}
                        placeholder="আয়াত নম্বর"
                        className="border border-stone-300 rounded-lg p-3 w-32 text-center"
                    />
                    <button 
                        onClick={getTafsir}
                        disabled={isLoading}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-lg font-bold"
                    >
                        {isLoading ? 'গবেষণা চলছে...' : 'তাফসীর দেখুন'}
                    </button>
                </div>
                
                {content && (
                    <div className="bg-white p-8 rounded-2xl shadow border border-stone-200">
                        <div className="prose prose-lg max-w-none font-arabic leading-loose whitespace-pre-wrap text-stone-800">
                            {content}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TafsirReader;