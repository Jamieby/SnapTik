/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Loader2, AlertCircle, Video, Music, Download, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface TikTokData {
  title: string;
  cover: string;
  play: string;
  wmplay: string;
  hdplay: string;
  music: string;
  author: {
    nickname: string;
    avatar: string;
    unique_id: string;
  };
}

export default function App() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<TikTokData | null>(null);

  const handleFetch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) {
      setError('Please enter a valid TikTok URL');
      return;
    }

    try {
      new URL(url);
    } catch {
      setError('Please enter a valid URL (e.g., https://www.tiktok.com/@user/video/123456789)');
      return;
    }

    setLoading(true);
    setError('');
    setData(null);

    try {
      // We use the public tikwm API. hd=1 specifies we'd like the HD link if available
      const res = await fetch(`https://www.tikwm.com/api/?url=${encodeURIComponent(url)}&hd=1`);
      const json = await res.json();

      if (json.code === 0 && json.data) {
        setData(json.data);
      } else {
        setError(json.msg || 'Failed to fetch video. The video might be private or the URL is incorrect.');
      }
    } catch (err) {
      setError('Network error. Rate limit might be reached, please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async (downloadUrl: string, filename: string) => {
    try {
      // First, try to fetch the video as a blob to force download directly in the browser
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      // Fallback: If CORS blocks the fetch, open in a new tab
      // The user can hold/right-click to save
      window.open(downloadUrl, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F5F5] font-['Inter',_sans-serif] relative overflow-x-hidden flex flex-col py-10 px-4 md:px-10">
      
      {/* Atmospheric Background Glows */}
      <div className="absolute top-[-150px] left-[-150px] w-[500px] h-[500px] bg-[#FE2C55]/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-150px] right-[-150px] w-[500px] h-[500px] bg-[#25F4EE]/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="w-full flex-col flex items-center justify-center max-w-5xl mx-auto flex-1 z-10 w-full">
        
        {/* Header Section */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="z-10 flex flex-col items-center gap-2 mb-12 w-full"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#FE2C55] to-[#25F4EE] rounded-xl flex items-center justify-center shadow-[0_0_20px_rgba(37,244,238,0.3)]">
              <Download className="text-black w-6 h-6" />
            </div>
            <h1 className="text-3xl font-black tracking-tighter uppercase italic">TokSave</h1>
          </div>
          <p className="text-sm text-gray-400 font-medium tracking-widest uppercase text-center">Pure HD • No Watermark • Instant</p>
        </motion.header>

        {/* Input Area */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="col-span-12 w-full max-w-3xl z-10"
        >
          <form className="relative group" onSubmit={handleFetch}>
            <div className="absolute -inset-1 bg-gradient-to-r from-[#FE2C55] via-[#25F4EE] to-[#FE2C55] rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
            <div className="relative bg-[#111] rounded-2xl flex flex-col md:flex-row items-center p-2 border border-white/10 gap-2 md:gap-0">
              <input 
                type="text" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                placeholder="Paste TikTok video link here..."
                className="bg-transparent w-full px-6 py-4 text-lg outline-none text-white placeholder:text-gray-600 disabled:opacity-50"
              />
              <button 
                type="submit"
                disabled={loading || !url}
                className="bg-white text-black px-10 py-4 w-full md:w-auto rounded-xl font-bold hover:bg-[#25F4EE] transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shrink-0"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  'FETCH'
                )}
              </button>
            </div>
          </form>
        </motion.div>

        {/* Error Handling */}
        <AnimatePresence>
          {error && (
            <motion.div 
              initial={{ opacity: 0, height: 0, mt: 0 }}
              animate={{ opacity: 1, height: 'auto', mt: 24 }}
              exit={{ opacity: 0, height: 0, mt: 0 }}
              className="w-full max-w-3xl bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl p-4 flex items-start gap-3 overflow-hidden backdrop-blur-md relative z-10"
            >
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Interface / Results */}
        <AnimatePresence>
          {data && (
            <motion.main 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-12 gap-8 items-start mt-12"
            >
              {/* Video Preview Card */}
              <div className="col-span-1 md:col-span-5 relative">
                <div className="bg-white/5 rounded-3xl border border-white/10 p-4 backdrop-blur-md">
                  <div className="aspect-[9/16] bg-black rounded-2xl overflow-hidden relative shadow-2xl">
                    <img 
                      src={data.cover} 
                      alt="Video Cover" 
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/80"></div>
                    <div className="absolute inset-x-4 bottom-4 flex items-center gap-3">
                      <img 
                        src={data.author.avatar} 
                        className="w-12 h-12 rounded-full border border-white/30 backdrop-blur-sm shrink-0" 
                        alt={data.author.nickname}
                        referrerPolicy="no-referrer" 
                      />
                      <div className="overflow-hidden">
                        <p className="text-sm font-bold truncate text-white">{data.author.nickname}</p>
                        <p className="text-xs text-gray-300 line-clamp-1">@{data.author.unique_id}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Download Options */}
              <div className="col-span-1 md:col-span-7 space-y-4">
                <div className="p-6 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md">
                  <h3 className="text-lg font-bold mb-6 flex items-start gap-3 line-clamp-3 leading-relaxed">
                    <span className="w-1.5 h-6 bg-[#25F4EE] rounded-full shrink-0 flex mt-0.5"></span>
                    {data.title || 'Untitled TikTok Video'}
                  </h3>
                  
                  <div className="grid gap-3">
                    <button 
                      onClick={() => handleDownload(data.hdplay || data.play, 'video_hd.mp4')}
                      className="group flex items-center justify-between w-full p-4 rounded-2xl bg-gradient-to-r from-[#FE2C55] to-[#FE2C55]/80 hover:scale-[1.01] transition-all text-left"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-black/20 rounded-lg font-bold text-xs">HD</div>
                        <span className="font-bold text-lg">No Watermark <span className="font-normal text-sm opacity-80">(MP4)</span></span>
                      </div>
                      <Download className="w-6 h-6" />
                    </button>

                    {data.wmplay && (
                      <button 
                        onClick={() => handleDownload(data.wmplay, 'video_watermark.mp4')}
                        className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
                      >
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-white/10 rounded-lg text-xs font-bold uppercase">STD</div>
                          <span className="font-semibold text-[#F5F5F5]">With Watermark</span>
                        </div>
                        <Download className="w-5 h-5 opacity-60 text-white group-hover:opacity-100 transition-opacity" />
                      </button>
                    )}

                    <button 
                      onClick={() => handleDownload(data.music, 'audio.mp3')}
                      className="flex items-center justify-between w-full p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all text-left group"
                    >
                      <div className="flex items-center gap-4">
                        <div className="p-2 bg-[#25F4EE]/20 text-[#25F4EE] rounded-lg text-xs font-bold uppercase">HQ</div>
                        <span className="font-semibold text-[#F5F5F5]">Audio Only (MP3)</span>
                      </div>
                      <Download className="w-5 h-5 text-[#25F4EE]" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.main>
          )}
        </AnimatePresence>

      </div>
      
      {/* Footer & Disclaimer */}
      <footer className="z-10 w-full flex flex-col items-center gap-4 opacity-60 mt-20 relative">
        <div className="h-[1px] w-48 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
        <p className="text-[10px] max-w-lg text-center leading-relaxed font-medium">
          DISCLAIMER: This tool is intended for personal use and archiving purposes only. Users are responsible for ensuring they have the rights to download content and must respect the intellectual property of creators.
        </p>
        <div className="flex gap-6 text-[10px] font-bold tracking-widest mt-2">
          <span className="hover:text-white cursor-pointer transition-colors">PRIVACY</span>
          <span className="hover:text-white cursor-pointer transition-colors">TERMS</span>
          <span className="hover:text-white cursor-pointer transition-colors">API STATUS: ONLINE</span>
        </div>
      </footer>
    </div>
  );
}
