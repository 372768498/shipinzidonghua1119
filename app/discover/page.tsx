"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, Filter, RefreshCw, Trash2, Play, 
  Youtube, Instagram, Video, TrendingUp, 
  Calendar, Eye, ThumbsUp, MessageCircle,
  AlertCircle, Plus, X, ChevronDown, Loader2
} from "lucide-react";

// --- 1. 类型定义 (模拟 contracts/discover.contract.ts) ---

export type Platform = 'tiktok' | 'youtube' | 'instagram';

export interface Video {
  id: string;
  platform: Platform;
  title: string;
  author: string;
  thumbnailUrl: string;
  stats: {
    views: number;
    likes: number;
    comments: number;
  };
  viralScore: number; // 0 - 100
  publishedAt: string;
  scrapedAt: string;
  url: string;
}

export interface ScrapeOptions {
  platform: Platform;
  keywords: string;
  count: number;
}

// --- 2. Mock Data & Service (模拟后端) ---

const MOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
  "https://images.unsplash.com/photo-1611605698335-8b1569810432?w=800&q=80",
  "https://images.unsplash.com/photo-1593697821252-0c9137d9fc45?w=800&q=80",
  "https://images.unsplash.com/photo-1626544827763-d516dce335ca?w=800&q=80"
];

const mockService = {
  // 模拟获取视频列表
  getVideos: async (): Promise<Video[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 'v1',
            platform: 'tiktok',
            title: 'AI Tools You Need to Try in 2024 🤖 #tech #ai',
            author: 'TechInsider',
            thumbnailUrl: MOCK_THUMBNAILS[0],
            stats: { views: 1250000, likes: 89000, comments: 1200 },
            viralScore: 95,
            publishedAt: '2024-03-10',
            scrapedAt: new Date().toISOString(),
            url: '#'
          },
          {
            id: 'v2',
            platform: 'youtube',
            title: 'How to edit like a pro (Premiere Tutorial)',
            author: 'CreativeFlow',
            thumbnailUrl: MOCK_THUMBNAILS[1],
            stats: { views: 450000, likes: 22000, comments: 800 },
            viralScore: 82,
            publishedAt: '2024-03-12',
            scrapedAt: new Date().toISOString(),
            url: '#'
          },
          {
            id: 'v3',
            platform: 'instagram',
            title: 'Morning Routine for Productivity ☕️',
            author: 'LifeHacks',
            thumbnailUrl: MOCK_THUMBNAILS[2],
            stats: { views: 890000, likes: 150000, comments: 3000 },
            viralScore: 88,
            publishedAt: '2024-03-14',
            scrapedAt: new Date().toISOString(),
            url: '#'
          },
        ]);
      }, 800);
    });
  },

  // 模拟爬取
  startScrape: async (options: ScrapeOptions): Promise<Video[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        // 生成一些假数据返回
        const newVideos: Video[] = Array.from({ length: Math.min(options.count, 3) }).map((_, i) => ({
          id: `new_${Date.now()}_${i}`,
          platform: options.platform,
          title: `New Viral Video about ${options.keywords} #${i + 1}`,
          author: `Creator_${Math.floor(Math.random() * 1000)}`,
          thumbnailUrl: MOCK_THUMBNAILS[Math.floor(Math.random() * MOCK_THUMBNAILS.length)],
          stats: {
            views: Math.floor(Math.random() * 1000000) + 50000,
            likes: Math.floor(Math.random() * 100000) + 1000,
            comments: Math.floor(Math.random() * 5000) + 100
          },
          viralScore: Math.floor(Math.random() * 30) + 70, // 70-100
          publishedAt: new Date().toISOString().split('T')[0],
          scrapedAt: new Date().toISOString(),
          url: '#'
        }));
        resolve(newVideos);
      }, 2000);
    });
  },

  // 模拟删除
  deleteVideo: async (id: string): Promise<boolean> => {
    return new Promise(resolve => setTimeout(() => resolve(true), 300));
  }
};

// --- 3. 组件实现 ---

export default function DiscoverPage() {
  // State
  const [videos, setVideos] = useState<Video[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isScraping, setIsScraping] = useState(false);
  
  // Scrape Form State
  const [scrapePlatform, setScrapePlatform] = useState<Platform>('tiktok');
  const [scrapeKeyword, setScrapeKeyword] = useState('AI Tools');
  const [scrapeCount, setScrapeCount] = useState(5);
  const [isPanelOpen, setIsPanelOpen] = useState(true);

  // Filters State
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all');
  const [filterSort, setFilterSort] = useState<'score' | 'views' | 'newest'>('score');
  const [searchQuery, setSearchQuery] = useState('');

  // 1. 初始化加载
  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    setIsLoading(true);
    try {
      const data = await mockService.getVideos();
      setVideos(data);
    } catch (err) {
      alert("加载失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  // 2. 处理爬取
  const handleScrape = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsScraping(true);
    try {
      const newVideos = await mockService.startScrape({
        platform: scrapePlatform,
        keywords: scrapeKeyword,
        count: scrapeCount
      });
      // 将新视频添加到列表头部
      setVideos(prev => [...newVideos, ...prev]);
    } catch (err) {
      alert("爬取任务启动失败");
    } finally {
      setIsScraping(false);
    }
  };

  // 3. 处理删除
  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个爆款视频吗？")) return;
    try {
      await mockService.deleteVideo(id);
      setVideos(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert("删除失败");
    }
  };

  // 4. 过滤与排序逻辑 (Local Filter)
  const filteredVideos = useMemo(() => {
    let result = [...videos];

    // Filter by Platform
    if (filterPlatform !== 'all') {
      result = result.filter(v => v.platform === filterPlatform);
    }

    // Filter by Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(v => 
        v.title.toLowerCase().includes(q) || 
        v.author.toLowerCase().includes(q)
      );
    }

    // Sort
    result.sort((a, b) => {
      if (filterSort === 'score') return b.viralScore - a.viralScore;
      if (filterSort === 'views') return b.stats.views - a.stats.views;
      if (filterSort === 'newest') return new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime();
      return 0;
    });

    return result;
  }, [videos, filterPlatform, searchQuery, filterSort]);

  // Helper: 格式化数字
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-US', { notation: "compact", compactDisplay: "short" }).format(num);
  };

  // Helper: 获取平台图标
  const getPlatformIcon = (p: Platform) => {
    switch(p) {
      case 'youtube': return <Youtube size={14} className="text-red-500" />;
      case 'instagram': return <Instagram size={14} className="text-pink-500" />;
      case 'tiktok': return <Video size={14} className="text-black dark:text-white" />; // Lucide 没有 TikTok 图标，用 Video 代替
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 p-6 md:p-8 font-sans">
      
      {/* --- Header --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white flex items-center gap-3">
            <Search className="text-indigo-500" /> 
            爆款发现
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            全网实时监控，AI 智能评分识别潜力爆款
          </p>
        </div>
        <div className="flex gap-4">
           <div className="bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Total Videos</span>
              <span className="text-xl font-bold text-white font-mono">{videos.length}</span>
           </div>
           <div className="bg-slate-900/50 border border-white/5 rounded-lg px-4 py-2 flex flex-col items-end">
              <span className="text-[10px] text-slate-500 font-mono uppercase">Avg Score</span>
              <span className="text-xl font-bold text-emerald-400 font-mono">
                {videos.length > 0 ? Math.round(videos.reduce((acc, v) => acc + v.viralScore, 0) / videos.length) : 0}
              </span>
           </div>
        </div>
      </header>

      {/* --- Scrape Panel (Collapsible) --- */}
      <div className="bg-[#0F1219] border border-indigo-500/20 rounded-xl overflow-hidden mb-8 transition-all duration-300 shadow-lg shadow-black/20">
        <div 
          className="bg-[#141822] p-4 flex justify-between items-center cursor-pointer hover:bg-[#1a1f2e] transition-colors border-b border-white/5"
          onClick={() => setIsPanelOpen(!isPanelOpen)}
        >
          <div className="flex items-center gap-2 font-bold text-white">
            <RefreshCw size={16} className={isScraping ? "animate-spin text-indigo-400" : "text-indigo-400"} />
            新建爬取任务
          </div>
          <ChevronDown size={18} className={`transition-transform ${isPanelOpen ? 'rotate-180' : ''}`} />
        </div>
        
        <AnimatePresence>
          {isPanelOpen && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
            >
              <form onSubmit={handleScrape} className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
                {/* Platform Select */}
                <div className="md:col-span-3 space-y-2">
                  <label className="text-xs font-bold text-slate-400 uppercase">目标平台</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['tiktok', 'youtube', 'instagram'] as Platform[]).map(p => (
                      <button
                        type="button"
                        key={p}
                        onClick={() => setScrapePlatform(p)}
                        className={`flex flex-col items-center justify-center py-3 rounded border transition-all ${
                          scrapePlatform === p 
                          ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_15px_rgba(79,70,229,0.3)]' 
                          : 'bg-slate-900 border-white/10 text-slate-500 hover:border-white/30'
                        }`}
                      >
                        {getPlatformIcon(p)}
                        <span className="text-[10px] mt-1 capitalize">{p}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Keyword Input */}
                <div className="md:col-span-5 space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">搜索关键词 / Hashtag</label>
                   <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                      <input 
                        type="text" 
                        value={scrapeKeyword}
                        onChange={(e) => setScrapeKeyword(e.target.value)}
                        className="w-full bg-slate-900 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        placeholder="例如: AI Tools, #TechReview..."
                        required
                      />
                   </div>
                </div>

                {/* Count & Submit */}
                <div className="md:col-span-2 space-y-2">
                   <label className="text-xs font-bold text-slate-400 uppercase">爬取数量</label>
                   <select 
                      value={scrapeCount}
                      onChange={(e) => setScrapeCount(Number(e.target.value))}
                      className="w-full bg-slate-900 border border-white/10 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500"
                   >
                      <option value={5}>5 条 (快速)</option>
                      <option value={10}>10 条</option>
                      <option value={20}>20 条</option>
                      <option value={50}>50 条 (深度)</option>
                   </select>
                </div>

                <div className="md:col-span-2">
                  <button 
                    type="submit" 
                    disabled={isScraping}
                    className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:cursor-not-allowed text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {isScraping ? (
                      <>
                        <Loader2 size={18} className="animate-spin" /> 爬取中...
                      </>
                    ) : (
                      <>
                        <RefreshCw size={18} /> 开始任务
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* --- Filter Bar --- */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
         <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
            <div className="flex bg-[#0F1219] border border-white/10 rounded-lg p-1">
               <button onClick={() => setFilterPlatform('all')} className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${filterPlatform === 'all' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>全部</button>
               <button onClick={() => setFilterPlatform('tiktok')} className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${filterPlatform === 'tiktok' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>TikTok</button>
               <button onClick={() => setFilterPlatform('youtube')} className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${filterPlatform === 'youtube' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>YouTube</button>
               <button onClick={() => setFilterPlatform('instagram')} className={`px-4 py-1.5 text-xs font-medium rounded transition-all ${filterPlatform === 'instagram' ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}>Instagram</button>
            </div>
            
            <div className="h-6 w-px bg-white/10 mx-2 hidden md:block"></div>

            <select 
              value={filterSort}
              onChange={(e) => setFilterSort(e.target.value as any)}
              className="bg-[#0F1219] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-slate-300 focus:outline-none"
            >
               <option value="score">按爆款分排序</option>
               <option value="views">按播放量排序</option>
               <option value="newest">按最新排序</option>
            </select>
         </div>

         <div className="w-full md:w-64 relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input 
              type="text" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="搜索已爬取视频..."
              className="w-full bg-[#0F1219] border border-white/10 rounded-lg pl-9 pr-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
            />
         </div>
      </div>

      {/* --- Video Grid --- */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500">
           <Loader2 size={32} className="animate-spin mb-4 text-indigo-500" />
           <p className="text-sm">正在从数据库加载爆款数据...</p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
           <AlertCircle size={48} className="mb-4 opacity-50" />
           <p className="text-lg font-medium text-white">暂无数据</p>
           <p className="text-sm mb-6">尝试更换筛选条件，或者启动新的爬取任务</p>
           <button onClick={() => setIsPanelOpen(true)} className="text-indigo-400 hover:text-indigo-300 text-sm font-bold flex items-center gap-2">
              <Plus size={16} /> 去爬取
           </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <AnimatePresence>
             {filteredVideos.map((video) => (
               <motion.div 
                 key={video.id}
                 layout
                 initial={{ opacity: 0, scale: 0.9 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.9 }}
                 className="group bg-[#0F1219] border border-white/5 hover:border-indigo-500/50 rounded-xl overflow-hidden transition-all hover:shadow-lg hover:shadow-indigo-500/10 flex flex-col"
               >
                 {/* Thumbnail Area */}
                 <div className="relative aspect-video bg-black">
                    <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                    
                    {/* Badges */}
                    <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] text-white font-medium flex items-center gap-1">
                       {getPlatformIcon(video.platform)}
                       <span className="capitalize">{video.platform}</span>
                    </div>
                    <div className="absolute top-2 right-2">
                       <div className={`px-2 py-1 rounded text-[10px] font-bold border ${
                          video.viralScore >= 90 ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_10px_rgba(79,70,229,0.5)]' :
                          video.viralScore >= 80 ? 'bg-emerald-600 border-emerald-400 text-white' :
                          'bg-slate-700 border-slate-600 text-slate-300'
                       }`}>
                          {video.viralScore} 分
                       </div>
                    </div>

                    {/* Play Overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                       <div className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center text-white">
                          <Play size={20} fill="currentColor" />
                       </div>
                    </div>
                 </div>

                 {/* Content Area */}
                 <div className="p-4 flex-1 flex flex-col">
                    <h3 className="text-sm font-bold text-white line-clamp-2 mb-2 group-hover:text-indigo-400 transition-colors">
                       {video.title}
                    </h3>
                    <div className="flex items-center gap-2 text-[10px] text-slate-400 mb-4">
                       <div className="w-5 h-5 bg-slate-700 rounded-full flex items-center justify-center text-slate-300 font-bold text-[8px]">
                          {video.author.charAt(0)}
                       </div>
                       <span>{video.author}</span>
                       <span className="mx-1">•</span>
                       <span>{video.publishedAt}</span>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-t border-white/5 border-b mb-4">
                       <div className="text-center">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5"><Eye size={10}/> Views</div>
                          <div className="text-xs font-mono font-bold text-slate-200">{formatNumber(video.stats.views)}</div>
                       </div>
                       <div className="text-center border-l border-white/5">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5"><ThumbsUp size={10}/> Likes</div>
                          <div className="text-xs font-mono font-bold text-slate-200">{formatNumber(video.stats.likes)}</div>
                       </div>
                       <div className="text-center border-l border-white/5">
                          <div className="flex items-center justify-center gap-1 text-[10px] text-slate-500 mb-0.5"><MessageCircle size={10}/> Comm</div>
                          <div className="text-xs font-mono font-bold text-slate-200">{formatNumber(video.stats.comments)}</div>
                       </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-auto flex gap-2">
                       <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded transition-colors flex items-center justify-center gap-1">
                          <Video size={12} /> 生成类似视频
                       </button>
                       <button 
                          onClick={() => handleDelete(video.id)}
                          className="px-3 py-2 bg-white/5 hover:bg-red-900/30 text-slate-400 hover:text-red-400 border border-white/5 hover:border-red-500/30 rounded transition-all"
                       >
                          <Trash2 size={14} />
                       </button>
                    </div>
                 </div>
               </motion.div>
             ))}
           </AnimatePresence>
        </div>
      )}
    </div>
  );
}