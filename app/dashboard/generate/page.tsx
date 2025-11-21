"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Sparkles, Play, Clock, AlertCircle, CheckCircle2, 
  Settings2, RefreshCw, Download, Trash2, Wand2, 
  Layers, MoreHorizontal, Video, Film, Search,
  Maximize2, Loader2, UploadCloud
} from "lucide-react";

// --- 1. 契约定义 (模拟 contracts/generate.contract.ts) ---

export type GenerateStatus = 'queued' | 'processing' | 'success' | 'failed';
export type AiModel = 'minimax' | 'runway' | 'kling';
export type AspectRatio = '16:9' | '9:16' | '1:1';

export interface GenerateRequest {
  prompt: string;
  model: AiModel;
  ratio: AspectRatio;
  duration: number; // seconds
  enhancePrompt: boolean;
}

export interface GenerateTask {
  id: string;
  status: GenerateStatus;
  request: GenerateRequest;
  progress: number; // 0-100
  videoUrl?: string;
  thumbnailUrl?: string;
  errorMsg?: string;
  createdAt: string;
  completedAt?: string;
}

// --- 2. Mock Data & Service ---

const MOCK_THUMBNAILS = [
  "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
  "https://images.unsplash.com/photo-1626544827763-d516dce335ca?w=800&q=80",
  "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?w=800&q=80"
];

const mockService = {
  // 获取任务列表
  getTasks: async (): Promise<GenerateTask[]> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            id: 't1',
            status: 'success',
            request: { prompt: "Cyberpunk city raining neon lights", model: "runway", ratio: "16:9", duration: 5, enhancePrompt: true },
            progress: 100,
            thumbnailUrl: MOCK_THUMBNAILS[0],
            createdAt: new Date(Date.now() - 3600000).toISOString(),
            completedAt: new Date(Date.now() - 3500000).toISOString()
          },
          {
            id: 't2',
            status: 'processing',
            request: { prompt: "Cute cat astronaut floating in space", model: "minimax", ratio: "9:16", duration: 10, enhancePrompt: false },
            progress: 45,
            createdAt: new Date(Date.now() - 300000).toISOString()
          },
          {
            id: 't3',
            status: 'failed',
            request: { prompt: "Complex fractals expanding forever", model: "kling", ratio: "1:1", duration: 5, enhancePrompt: true },
            progress: 0,
            errorMsg: "Content policy violation",
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]);
      }, 800);
    });
  },

  // 创建任务
  createTask: async (req: GenerateRequest): Promise<GenerateTask> => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          id: `gen_${Date.now()}`,
          status: 'queued',
          request: req,
          progress: 0,
          createdAt: new Date().toISOString()
        });
      }, 1000);
    });
  }
};

// --- 3. UI 组件 ---

// 模型选择卡片
const ModelCard = ({ id, name, desc, selected, onClick }: any) => (
  <div 
    onClick={() => onClick(id)}
    className={`cursor-pointer p-3 rounded-lg border transition-all relative overflow-hidden group ${
      selected 
      ? 'bg-indigo-600/20 border-indigo-500 ring-1 ring-indigo-500' 
      : 'bg-slate-900/50 border-white/10 hover:border-white/30'
    }`}
  >
    <div className="flex justify-between items-center mb-1">
      <span className={`font-bold text-sm ${selected ? 'text-white' : 'text-slate-300'}`}>{name}</span>
      {selected && <CheckCircle2 size={14} className="text-indigo-400" />}
    </div>
    <p className="text-[10px] text-slate-500 leading-tight">{desc}</p>
  </div>
);

// 状态徽章
const StatusBadge = ({ status, progress }: { status: GenerateStatus, progress: number }) => {
  if (status === 'processing') {
    return (
      <div className="flex items-center gap-2 px-2 py-1 bg-blue-500/10 border border-blue-500/20 rounded text-[10px] text-blue-400">
        <Loader2 size={10} className="animate-spin" />
        <span>{(progress || 0)}%</span>
      </div>
    );
  }
  if (status === 'success') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded text-[10px] text-emerald-400">
        <CheckCircle2 size={10} /> Done
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="flex items-center gap-1 px-2 py-1 bg-red-500/10 border border-red-500/20 rounded text-[10px] text-red-400">
        <AlertCircle size={10} /> Failed
      </div>
    );
  }
  return (
    <div className="flex items-center gap-1 px-2 py-1 bg-slate-700/30 border border-slate-600 rounded text-[10px] text-slate-400">
      <Clock size={10} /> Queued
    </div>
  );
};

// 主页面
export default function GeneratePage() {
  // Data State
  const [tasks, setTasks] = useState<GenerateTask[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [prompt, setPrompt] = useState("");
  const [model, setModel] = useState<AiModel>("minimax");
  const [ratio, setRatio] = useState<AspectRatio>("9:16");
  const [duration, setDuration] = useState(5);
  const [enhancePrompt, setEnhancePrompt] = useState(true);

  // Filter State
  const [filterStatus, setFilterStatus] = useState<'all' | GenerateStatus>('all');
  const [searchQuery, setSearchQuery] = useState("");

  // Init Load
  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setIsLoading(true);
    const data = await mockService.getTasks();
    setTasks(data);
    setIsLoading(false);
  };

  // Handle Submit
  const handleSubmit = async () => {
    if (!prompt.trim()) return;
    setIsSubmitting(true);
    try {
      const newTask = await mockService.createTask({
        prompt,
        model,
        ratio,
        duration,
        enhancePrompt
      });
      setTasks(prev => [newTask, ...prev]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 过滤任务
  const filteredTasks = tasks.filter(t => {
    if (filterStatus !== 'all' && t.status !== filterStatus) return false;
    if (searchQuery && !t.request.prompt.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 p-6 lg:p-8 font-sans">
      
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <Video className="text-purple-500" /> 
          AI 视频生成
        </h1>
        <p className="text-slate-500 text-sm mt-1">
          配置参数，一键生成。支持多模型混合调度。
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Panel: Create Task (4 Cols) --- */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0F1219] border border-white/10 rounded-xl p-6 sticky top-6 shadow-xl shadow-black/20">
            <div className="flex items-center gap-2 text-white font-bold mb-6 border-b border-white/5 pb-4">
              <Wand2 size={18} className="text-indigo-500" />
              创建新任务
            </div>

            {/* 1. Prompt Input */}
            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-400 uppercase">提示词 (Prompt)</label>
                <button 
                  onClick={() => setEnhancePrompt(!enhancePrompt)}
                  className={`text-[10px] flex items-center gap-1 px-2 py-0.5 rounded transition-colors ${enhancePrompt ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  <Sparkles size={10} /> Magic Enhance {enhancePrompt ? 'ON' : 'OFF'}
                </button>
              </div>
              <div className="relative">
                <textarea 
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="描述你想要生成的视频画面..."
                  className="w-full h-32 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all resize-none"
                />
                {enhancePrompt && (
                  <div className="absolute bottom-2 right-2 text-[10px] text-indigo-400 flex items-center gap-1 bg-indigo-900/30 px-1.5 py-0.5 rounded">
                    <Sparkles size={8} /> Auto-Optimized
                  </div>
                )}
              </div>
            </div>

            {/* 2. Model Selection */}
            <div className="space-y-3 mb-6">
              <label className="text-xs font-bold text-slate-400 uppercase">AI 模型</label>
              <div className="grid grid-cols-1 gap-2">
                <ModelCard 
                  id="minimax" name="Minimax Video-01" desc="高速生成，适合短视频节奏" 
                  selected={model === 'minimax'} onClick={setModel} 
                />
                <ModelCard 
                  id="runway" name="Runway Gen-3" desc="电影级画质，光影效果极佳" 
                  selected={model === 'runway'} onClick={setModel} 
                />
                <ModelCard 
                  id="kling" name="Kling AI" desc="物理模拟真实，中文理解强" 
                  selected={model === 'kling'} onClick={setModel} 
                />
              </div>
            </div>

            {/* 3. Settings (Ratio & Duration) */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">画面比例</label>
                <select 
                  value={ratio} 
                  onChange={(e) => setRatio(e.target.value as AspectRatio)}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value="9:16">9:16 (Shorts)</option>
                  <option value="16:9">16:9 (Landscape)</option>
                  <option value="1:1">1:1 (Square)</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-400 uppercase">时长</label>
                <select 
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-white/10 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                >
                  <option value={5}>5 秒 (Standard)</option>
                  <option value={10}>10 秒 (Extended)</option>
                </select>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              onClick={handleSubmit}
              disabled={isSubmitting || !prompt.trim()}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold py-3 rounded-lg transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 size={18} className="animate-spin"/> : <Sparkles size={18} />}
              立即生成
            </button>
            <p className="text-center text-[10px] text-slate-600 mt-3">
              消耗: 1 额度/次 · 预计耗时: 2-5 分钟
            </p>
          </div>
        </div>

        {/* --- Right Panel: Task List (8 Cols) --- */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-[#0F1219] p-2 rounded-xl border border-white/5">
             <div className="flex gap-1 bg-black/20 p-1 rounded-lg w-full sm:w-auto overflow-x-auto">
                {['all', 'processing', 'success', 'failed'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status as any)}
                    className={`px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all ${
                      filterStatus === status 
                      ? 'bg-slate-700 text-white shadow' 
                      : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {status}
                  </button>
                ))}
             </div>
             
             <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input 
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索 Prompt..."
                  className="w-full bg-slate-900 border border-white/10 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                />
             </div>
          </div>

          {/* Task Grid */}
          {isLoading ? (
            <div className="h-64 flex items-center justify-center text-slate-500">
              <Loader2 size={32} className="animate-spin text-indigo-500 mb-2" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-xl bg-white/5">
               <Film size={48} className="opacity-20 mb-4" />
               <p className="text-sm">暂无相关任务</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
               <AnimatePresence>
                 {filteredTasks.map(task => (
                   <motion.div 
                      key={task.id}
                      layout
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-[#0F1219] border border-white/5 rounded-xl overflow-hidden hover:border-white/20 transition-all group"
                   >
                      {/* Top Section: Preview or Placeholder */}
                      <div className="aspect-video bg-black relative group/preview">
                         {task.status === 'success' && task.thumbnailUrl ? (
                           <>
                            <img src={task.thumbnailUrl} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/preview:opacity-100 transition-opacity bg-black/40 cursor-pointer">
                               <Play size={32} className="text-white fill-white" />
                            </div>
                           </>
                         ) : (
                           <div className="w-full h-full flex items-center justify-center bg-slate-900/50">
                              {task.status === 'processing' ? (
                                 <div className="text-center">
                                    <div className="w-12 h-12 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                                    <p className="text-xs text-indigo-400 font-mono animate-pulse">RENDERING...</p>
                                 </div>
                              ) : (
                                 <AlertCircle className="text-red-500/50" size={32} />
                              )}
                           </div>
                         )}
                         
                         {/* Badges */}
                         <div className="absolute top-2 right-2">
                            <StatusBadge status={task.status} progress={task.progress} />
                         </div>
                         <div className="absolute bottom-2 right-2 bg-black/60 backdrop-blur text-white text-[10px] px-1.5 py-0.5 rounded border border-white/10">
                            {task.request.ratio} • {task.request.duration}s
                         </div>
                      </div>

                      {/* Bottom Section: Info */}
                      <div className="p-4">
                         <div className="flex justify-between items-start mb-2">
                            <div className="flex items-center gap-2">
                               <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${
                                  task.request.model === 'runway' ? 'bg-purple-900/30 text-purple-400' : 
                                  task.request.model === 'minimax' ? 'bg-blue-900/30 text-blue-400' : 
                                  'bg-slate-800 text-slate-400'
                               }`}>
                                  {task.request.model}
                               </span>
                               <span className="text-[10px] text-slate-500">
                                  {new Date(task.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                               </span>
                            </div>
                            
                            {/* Actions Menu (Placeholder) */}
                            <button className="text-slate-500 hover:text-white">
                               <MoreHorizontal size={16} />
                            </button>
                         </div>

                         <p className="text-xs text-slate-300 line-clamp-2 mb-4 h-8 leading-relaxed">
                            {task.request.prompt}
                         </p>

                         {/* Action Buttons */}
                         <div className="flex gap-2 pt-3 border-t border-white/5">
                            <button 
                               disabled={task.status !== 'success'}
                               className="flex-1 py-1.5 bg-white/5 hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                               <Download size={12} /> 下载
                            </button>
                            <button 
                               disabled={task.status !== 'success'}
                               className="flex-1 py-1.5 bg-white/5 hover:bg-indigo-500/20 hover:text-indigo-400 disabled:opacity-30 disabled:cursor-not-allowed text-slate-300 text-xs rounded flex items-center justify-center gap-1.5 transition-colors"
                            >
                               <UploadCloud size={12} /> 发布
                            </button>
                         </div>
                         
                         {task.errorMsg && (
                            <div className="mt-3 text-[10px] text-red-400 bg-red-900/10 border border-red-500/20 p-2 rounded">
                               Error: {task.errorMsg}
                            </div>
                         )}
                      </div>
                   </motion.div>
                 ))}
               </AnimatePresence>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}