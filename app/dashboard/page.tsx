"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Zap, Search, Video, UploadCloud, BarChart3, 
  Activity, Clock, CheckCircle2, AlertCircle, 
  Play, TrendingUp, Layers, ArrowRight, Bell
} from "lucide-react";

// --- 1. 契约定义 & Mock 数据 (模拟 contracts/dashboard.contract.ts) ---

export interface DashboardStats {
  totalVideos: number;
  avgViralScore: number;
  generatedVideos: number;
  publishedVideos: number;
}

export interface RecentActivity {
  id: string;
  type: 'discover' | 'generate' | 'publish';
  title: string;
  timestamp: string;
  status: 'success' | 'processing' | 'failed';
}

const mockStats: DashboardStats = {
  totalVideos: 127,
  avgViralScore: 88,
  generatedVideos: 45,
  publishedVideos: 32
};

const mockActivities: RecentActivity[] = [
  {
    id: '1',
    type: 'discover',
    title: '发现 25 个 TikTok 爆款视频',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    status: 'success'
  },
  {
    id: '2',
    type: 'generate',
    title: '生成视频：AI 编程教程系列 #04',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    status: 'processing'
  },
  {
    id: '3',
    type: 'publish',
    title: '自动发布到 YouTube Shorts',
    timestamp: new Date(Date.now() - 10800000).toISOString(),
    status: 'success'
  },
  {
    id: '4',
    type: 'publish',
    title: '发布任务失败：Token 过期',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    status: 'failed'
  }
];

// --- 2. 辅助组件 ---

const StatusBadge = ({ status }: { status: RecentActivity['status'] }) => {
  const styles = {
    success: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    processing: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    failed: "bg-red-500/10 text-red-400 border-red-500/20"
  };
  
  const icons = {
    success: <CheckCircle2 size={12} />,
    processing: <Clock size={12} className="animate-spin" />,
    failed: <AlertCircle size={12} />
  };

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-medium border ${styles[status]}`}>
      {icons[status]}
      <span className="capitalize">{status}</span>
    </div>
  );
};

// --- 3. 主页面组件 ---

export default function DashboardHome() {
  
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good Morning";
    if (hour < 18) return "Good Afternoon";
    return "Good Evening";
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans selection:bg-indigo-500/30">
      
      {/* --- 顶部导航栏 --- */}
      <nav className="sticky top-0 z-50 w-full border-b border-white/5 bg-[#0B0F17]/80 backdrop-blur-xl">
        <div className="flex h-16 items-center justify-between px-6 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight text-white">
              <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Zap size={18} className="text-white" fill="currentColor" />
              </div>
              Jilo.ai
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5">
              <Link href="/dashboard" className="px-4 py-1.5 text-xs font-medium text-white bg-white/10 rounded-full transition-all">
                首页
              </Link>
              <Link href="/dashboard/discover" className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                发现爆款
              </Link>
              <Link href="/dashboard/generate" className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                生成视频
              </Link>
              <Link href="/dashboard/publish" className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                自动发布
              </Link>
              <Link href="/dashboard/monitoring" className="px-4 py-1.5 text-xs font-medium text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-all">
                数据监控
              </Link>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-400 hover:text-white hover:bg-white/5 rounded-full transition-colors">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-[#0B0F17]"></span>
            </button>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 border border-white/10"></div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto px-6 py-8 space-y-8">
        
        {/* --- 1. 欢迎标语 --- */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-end border-b border-white/5 pb-6"
        >
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              {getGreeting()}, Creator.
            </h1>
            <p className="text-slate-500 flex items-center gap-2 text-sm">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
              System Operational. Ready to scale your content.
            </p>
          </div>
          <div className="hidden md:block text-right">
             <div className="text-xs text-slate-500 font-mono uppercase tracking-wider">Current Cycle</div>
             <div className="text-sm text-indigo-400 font-bold">V2.5.0 PRO</div>
          </div>
        </motion.div>

        {/* --- 2. 统计卡片 --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard 
            label="Total Scraped" 
            value={mockStats.totalVideos} 
            icon={<Layers className="text-blue-400" />} 
            trend="+12% vs last week"
            delay={0.1}
          />
          <StatCard 
            label="Avg Viral Score" 
            value={mockStats.avgViralScore} 
            icon={<TrendingUp className="text-emerald-400" />} 
            trend="High Quality"
            delay={0.2}
          />
          <StatCard 
            label="Videos Generated" 
            value={mockStats.generatedVideos} 
            icon={<Video className="text-purple-400" />} 
            trend="4 processing"
            delay={0.3}
          />
          <StatCard 
            label="Published" 
            value={mockStats.publishedVideos} 
            icon={<UploadCloud className="text-pink-400" />} 
            trend="100% Success Rate"
            delay={0.4}
          />
        </div>

        {/* --- 3. 快捷操作 & 最近活动 --- */}
        <div className="grid lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-7 space-y-6">
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Zap size={18} className="text-yellow-400" /> 快捷操作
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ActionCard 
                title="发现爆款" 
                desc="爬取 TikTok/YouTube 趋势" 
                icon={<Search size={24} />} 
                href="/dashboard/discover"
                color="bg-blue-500"
              />
              <ActionCard 
                title="生成视频" 
                desc="AI 脚本重写与混剪" 
                icon={<Play size={24} fill="currentColor" />} 
                href="/dashboard/generate"
                color="bg-purple-500"
              />
              <ActionCard 
                title="自动发布" 
                desc="SEO 优化与排期" 
                icon={<UploadCloud size={24} />} 
                href="/dashboard/publish"
                color="bg-pink-500"
              />
              <ActionCard 
                title="数据监控" 
                desc="查看 ROI 与完播率" 
                icon={<BarChart3 size={24} />} 
                href="/dashboard/monitoring"
                color="bg-emerald-500"
              />
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Activity size={18} className="text-slate-400" /> 最近活动
              </h2>
              <button className="text-xs text-indigo-400 hover:text-indigo-300">View All</button>
            </div>
            
            <div className="bg-[#0F1219] border border-white/5 rounded-xl p-6 h-full min-h-[300px]">
              <div className="space-y-6 relative">
                <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/5"></div>

                {mockActivities.map((activity, i) => (
                  <motion.div 
                    key={activity.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.5 + i * 0.1 }}
                    className="relative pl-10"
                  >
                    <div className={`absolute left-0 top-1 w-8 h-8 rounded-full border border-[#0F1219] flex items-center justify-center z-10 ${
                      activity.type === 'discover' ? 'bg-blue-500/20 text-blue-400' :
                      activity.type === 'generate' ? 'bg-purple-500/20 text-purple-400' :
                      'bg-pink-500/20 text-pink-400'
                    }`}>
                      {activity.type === 'discover' && <Search size={14} />}
                      {activity.type === 'generate' && <Video size={14} />}
                      {activity.type === 'publish' && <UploadCloud size={14} />}
                    </div>

                    <div className="flex flex-col gap-1">
                      <span className="text-sm font-medium text-slate-200 line-clamp-1">
                        {activity.title}
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-slate-500 font-mono">
                          {new Date(activity.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                        </span>
                        <StatusBadge status={activity.status} />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

function StatCard({ label, value, icon, trend, delay }: any) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="bg-[#0F1219] border border-white/5 p-6 rounded-xl hover:border-indigo-500/30 transition-all group"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="p-2 bg-white/5 rounded-lg group-hover:bg-white/10 transition-colors">
          {icon}
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-black/40 px-2 py-1 rounded border border-white/5">
          {trend}
        </span>
      </div>
      <div className="text-3xl font-bold text-white font-mono mb-1">
        {value}
      </div>
      <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">
        {label}
      </div>
    </motion.div>
  );
}

function ActionCard({ title, desc, icon, href, color }: any) {
  return (
    <Link href={href} className="group relative overflow-hidden p-6 bg-[#0F1219] border border-white/5 rounded-xl hover:border-white/10 transition-all">
      <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/5 to-transparent rounded-full blur-3xl group-hover:bg-white/10 transition-colors translate-x-10 -translate-y-10`}></div>
      
      <div className="relative z-10 flex items-start justify-between">
        <div>
          <div className={`w-12 h-12 rounded-lg ${color} bg-opacity-10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
            {React.cloneElement(icon, { className: `text-white opacity-90` })}
          </div>
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-indigo-400 transition-colors">{title}</h3>
          <p className="text-xs text-slate-500">{desc}</p>
        </div>
        <ArrowRight size={18} className="text-slate-600 group-hover:text-white group-hover:translate-x-1 transition-all" />
      </div>
    </Link>
  );
}