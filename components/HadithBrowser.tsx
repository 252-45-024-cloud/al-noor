import React, { useState } from 'react';
import { generateScholarResponse } from '../services/geminiService';

const HadithBrowser: React.FC = () => {
    const [query, setQuery] = useState('');
    const [content, setContent] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const searchHadith = async () => {
        if (!query.trim()) return;
        setIsLoading(true);
        try {
            const prompt = `সহীহ বুখারী থেকে '${query}' সম্পর্কিত হাদিসগুলো খুঁজে বের করো। আরবি টেক্সট এবং বাংলা অনুবাদ সহ উপস্থাপন করো। অবশ্যই হাদিস নম্বর উল্লেখ করবে।`;
            const response = await generateScholarResponse(prompt, 'gemini-2.5-flash', "তুমি সহীহ বুখারী হাদিস বিশেষজ্ঞ।");
            setContent(response.text || "দুঃখিত, কোনো হাদিস পাওয়া যায়নি।");
        } catch (e) {
            setContent("ত্রুটি হয়েছে।");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-full bg-stone-50 p-8 overflow-y-auto font-arabic">
            <div className="max-w-4xl mx-auto">
                <h2 className="text-3xl font-bold text-emerald-900 mb-6 text-center">সহীহ বুখারী শরীফ</h2>
                
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-stone-200 mb-6">
                    <div className="flex gap-4">
                        <input 
                            type="text" 
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && searchHadith()}
                            placeholder="বিষয় বা হাদিস নম্বর দিয়ে খুঁজুন (যেমন: নামায, ওযু, ঈমান)..."
                            className="flex-1 border border-stone-300 rounded-lg p-3"
                        />
                        <button 
                            onClick={searchHadith}
                            disabled={isLoading}
                            className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-3 rounded-lg font-bold"
                        >
                            {isLoading ? 'খোঁজা হচ্ছে...' : 'অনুসন্ধান'}
                        </button>
                    </div>
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

export default HadithBrowser;