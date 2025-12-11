
import React, { useEffect, useRef, useState } from 'react';
import { connectLiveSession, createPcmBlob, decode, decodeAudioData } from '../services/geminiService';
import { LiveServerMessage } from '@google/genai';

const LiveConversation: React.FC = () => {
  const [isActive, setIsActive] = useState(false);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'error'>('disconnected');
  
  // Audio Refs
  const audioContextRef = useRef<AudioContext | null>(null);
  const inputContextRef = useRef<AudioContext | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const sessionPromiseRef = useRef<Promise<any> | null>(null);
  
  // Cleanup function
  const stopSession = async () => {
    if (sessionPromiseRef.current) {
        try {
            const session = await sessionPromiseRef.current;
            session.close();
        } catch(e) { console.error("Error closing session", e)}
    }
    
    // Stop audio sources
    sourcesRef.current.forEach(source => source.stop());
    sourcesRef.current.clear();
    
    // Close contexts
    if (audioContextRef.current) audioContextRef.current.close();
    if (inputContextRef.current) inputContextRef.current.close();
    
    setIsActive(false);
    setStatus('disconnected');
    nextStartTimeRef.current = 0;
  };

  const startSession = async () => {
    setStatus('connecting');
    setIsActive(true);

    try {
        const outputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        const inputCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        
        audioContextRef.current = outputCtx;
        inputContextRef.current = inputCtx;
        
        const outputNode = outputCtx.createGain();
        outputNode.connect(outputCtx.destination);
        
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        // Shortened system instruction for Latency/Context management in Live API
        const liveSystemInstruction = `
        আপনি একজন ইসলামিক তুলনামূলক ধর্মতত্ত্বের এআই, ডা. জাকির নায়েকের শৈলীতে প্রশিক্ষিত।
        বাংলা ভাষায় কথা বলুন।
        কুরআন, সহীহ হাদিস, যুক্তি এবং বিজ্ঞানের আলোকে প্রশ্নের উত্তর দিন।
        তুলনামূলক ধর্মের আলোচনায় শ্রদ্ধাশীল ও যৌক্তিক হোন।
        উত্তরগুলো সংক্ষিপ্ত এবং কথোপকথনমূলক রাখুন।
        `;
        
        const sessionPromise = connectLiveSession({
            onopen: () => {
                setStatus('connected');
                // Setup Input Stream
                const source = inputCtx.createMediaStreamSource(stream);
                const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
                
                scriptProcessor.onaudioprocess = (e) => {
                    const inputData = e.inputBuffer.getChannelData(0);
                    const pcmBlob = createPcmBlob(inputData);
                    
                    sessionPromise.then(session => {
                        session.sendRealtimeInput({ media: pcmBlob });
                    });
                };
                
                source.connect(scriptProcessor);
                scriptProcessor.connect(inputCtx.destination);
            },
            onmessage: async (message: LiveServerMessage) => {
                // Handle Audio Output
                const base64Audio = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
                if (base64Audio && outputCtx) {
                    nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputCtx.currentTime);
                    
                    const audioBuffer = await decodeAudioData(
                        decode(base64Audio),
                        outputCtx,
                        24000,
                        1
                    );
                    
                    const source = outputCtx.createBufferSource();
                    source.buffer = audioBuffer;
                    source.connect(outputNode);
                    source.addEventListener('ended', () => {
                        sourcesRef.current.delete(source);
                    });
                    
                    source.start(nextStartTimeRef.current);
                    nextStartTimeRef.current += audioBuffer.duration;
                    sourcesRef.current.add(source);
                }
                
                // Handle Interruption
                if (message.serverContent?.interrupted) {
                    sourcesRef.current.forEach(s => {
                        s.stop();
                        sourcesRef.current.delete(s);
                    });
                    nextStartTimeRef.current = 0;
                }
            },
            onclose: () => {
                setStatus('disconnected');
                setIsActive(false);
            },
            onerror: (e) => {
                console.error("Live API Error", e);
                setStatus('error');
            }
        }, liveSystemInstruction);
        
        sessionPromiseRef.current = sessionPromise;

    } catch (error) {
        console.error("Failed to start session", error);
        setStatus('error');
        setIsActive(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
        if (isActive) stopSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isActive]);

  return (
    <div className="h-full flex flex-col items-center justify-center bg-stone-50 p-6 font-arabic">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 text-center border border-stone-200">
        <div className="mb-8 relative">
           <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center transition-all duration-500 ${
               status === 'connected' ? 'bg-emerald-100 ring-4 ring-emerald-400 ring-opacity-50' : 'bg-stone-100'
           }`}>
             <span className={`material-icons text-5xl ${status === 'connected' ? 'text-emerald-600 animate-pulse' : 'text-stone-400'}`}>
                {status === 'connected' ? 'graphic_eq' : 'mic_off'}
             </span>
           </div>
           {status === 'connected' && (
               <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-red-500 text-white text-xs px-2 py-0.5 rounded-full animate-pulse">
                   লাইভ
               </div>
           )}
        </div>

        <h2 className="text-2xl font-bold text-stone-800 mb-2">ভয়েস কথোপকথন</h2>
        <p className="text-stone-500 mb-8">
            এআই স্কলারের (তুলনামূলক ধর্মতত্ত্ব বিশেষজ্ঞ) সাথে কথা বলুন।
        </p>

        {status === 'error' && (
            <div className="mb-4 text-red-500 text-sm bg-red-50 p-2 rounded">
                সংযোগ ব্যর্থ হয়েছে। অনুগ্রহ করে মাইক্রোফোন অনুমতি পরীক্ষা করুন এবং আবার চেষ্টা করুন।
            </div>
        )}

        {!isActive ? (
            <button
                onClick={startSession}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-4 rounded-xl shadow-lg transition-all transform hover:scale-[1.02]"
            >
                কথোপকথন শুরু করুন
            </button>
        ) : (
            <button
                onClick={stopSession}
                className="w-full bg-red-500 hover:bg-red-600 text-white font-semibold py-4 rounded-xl shadow-lg transition-all"
            >
                শেষ করুন
            </button>
        )}
        
        <div className="mt-6 text-xs text-stone-400">
            পাওয়ার্ড বাই জেমিনি লাইভ এপিআই (নেটিভ অডিও)
        </div>
      </div>
    </div>
  );
};

export default LiveConversation;
