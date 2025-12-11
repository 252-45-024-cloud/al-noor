import React, { useState } from 'react';
import { generateSpeech, transcribeAudio } from '../services/geminiService';

const AudioTools: React.FC = () => {
    const [ttsText, setTtsText] = useState('');
    const [isSpeaking, setIsSpeaking] = useState(false);
    
    const [isRecording, setIsRecording] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [isTranscribing, setIsTranscribing] = useState(false);
    
    // TTS Handler
    const handleTTS = async () => {
        if (!ttsText) return;
        setIsSpeaking(true);
        try {
            const base64Audio = await generateSpeech(ttsText);
            if (base64Audio) {
                const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
                audio.play();
                audio.onended = () => setIsSpeaking(false);
            }
        } catch (e) {
            console.error(e);
            setIsSpeaking(false);
        }
    };

    // Transcription Handler
    const mediaRecorderRef = React.useRef<MediaRecorder | null>(null);
    const chunksRef = React.useRef<Blob[]>([]);

    const toggleRecording = async () => {
        if (isRecording) {
            mediaRecorderRef.current?.stop();
            setIsRecording(false);
        } else {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                const recorder = new MediaRecorder(stream);
                mediaRecorderRef.current = recorder;
                chunksRef.current = [];

                recorder.ondataavailable = (e) => {
                    if (e.data.size > 0) chunksRef.current.push(e.data);
                };

                recorder.onstop = async () => {
                    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
                    // Convert to base64
                    const reader = new FileReader();
                    reader.onloadend = async () => {
                        const base64String = (reader.result as string).split(',')[1];
                        setIsTranscribing(true);
                        try {
                            const text = await transcribeAudio(base64String, 'audio/webm');
                            setTranscription(text || "কোনো কথা শনাক্ত হয়নি।");
                        } catch(e) {
                            setTranscription("অডিও ট্রান্সক্রিপশনে ত্রুটি হয়েছে।");
                        } finally {
                            setIsTranscribing(false);
                        }
                    };
                    reader.readAsDataURL(blob);
                    
                    // Stop tracks
                    stream.getTracks().forEach(track => track.stop());
                };

                recorder.start();
                setIsRecording(true);
            } catch (e) {
                alert("মাইক্রোফোন অ্যাক্সেস দেওয়া হয়নি।");
            }
        }
    };

    return (
        <div className="h-full bg-stone-50 p-8 overflow-y-auto font-arabic">
            <div className="max-w-4xl mx-auto space-y-8">
                <h2 className="text-3xl font-bold text-emerald-900">অডিও টুলস</h2>

                {/* TTS Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span>🔊</span> টেক্সট থেকে স্পিচ
                    </h3>
                    <textarea 
                        value={ttsText}
                        onChange={(e) => setTtsText(e.target.value)}
                        placeholder="এখানে টেক্সট লিখুন যা আপনি শুনতে চান..."
                        className="w-full border border-stone-300 rounded-lg p-3 h-32 mb-4 bg-stone-50"
                    />
                    <button 
                        onClick={handleTTS}
                        disabled={isSpeaking || !ttsText}
                        className={`px-6 py-2 rounded-lg font-bold text-white transition-colors ${isSpeaking ? 'bg-stone-400' : 'bg-amber-500 hover:bg-amber-600'}`}
                    >
                        {isSpeaking ? 'বলা হচ্ছে...' : 'শুনুন'}
                    </button>
                </div>

                {/* Transcription Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-stone-200 p-6">
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                        <span>🎙️</span> অডিও ট্রান্সক্রিপশন
                    </h3>
                    
                    <div className="flex flex-col items-center justify-center p-8 bg-stone-50 rounded-xl border-2 border-dashed border-stone-300 mb-6">
                        <button 
                            onClick={toggleRecording}
                            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-lg transition-all transform hover:scale-105 ${isRecording ? 'bg-red-500 animate-pulse' : 'bg-emerald-600'}`}
                        >
                            <span className="material-icons text-white text-3xl">
                                {isRecording ? 'stop' : 'mic'}
                            </span>
                        </button>
                        <p className="mt-4 text-sm text-stone-500 font-medium">
                            {isRecording ? 'রেকর্ডিং চলছে... থামতে ক্লিক করুন' : 'রেকর্ড করতে মাইক্রোফোনে ক্লিক করুন'}
                        </p>
                    </div>

                    {isTranscribing && (
                        <div className="text-center text-emerald-600 animate-pulse mb-4">অডিও প্রক্রিয়া করা হচ্ছে...</div>
                    )}

                    {transcription && (
                        <div className="bg-stone-100 p-4 rounded-lg border border-stone-200">
                            <h4 className="text-xs font-bold text-stone-400 uppercase mb-2">ফলাফল</h4>
                            <p className="text-stone-800 whitespace-pre-wrap">{transcription}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AudioTools;