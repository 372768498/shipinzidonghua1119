"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Zap, Loader2, ArrowRight, Lock, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    setTimeout(() => {
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0B0F17] text-slate-200 font-sans flex flex-col relative overflow-hidden">
      
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-20%] right-[-10%] w-[600px] h-[600px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="p-8">
        <Link href="/" className="flex items-center gap-3 w-fit">
          <div className="w-8 h-8 bg-indigo-600 rounded flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Zap size={18} className="text-white" fill="currentColor" />
          </div>
          <span className="font-bold text-lg text-white tracking-tight">Jilo.ai</span>
        </Link>
      </div>

      <div className="flex-1 flex items-center justify-center px-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md"
        >
          <div className="bg-[#0F1219] border border-white/10 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
            
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold text-white mb-2">欢迎回来</h1>
              <p className="text-slate-400 text-sm">进入您的 AI 视频生产流水线</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Email</label>
                <div className="relative">
                  <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="email" 
                    defaultValue="demo@jilo.ai"
                    className="w-full bg-[#0B0F17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="name@company.com"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1">Password</label>
                <div className="relative">
                  <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input 
                    type="password" 
                    defaultValue="password"
                    className="w-full bg-[#0B0F17] border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white placeholder-slate-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button 
                type="submit" 
                disabled={isLoading}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-900/20 group"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={20} className="animate-spin" /> 正在验证...
                  </>
                ) : (
                  <>
                    立即登录 <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-slate-500 text-sm">
                还没有账号？ 
                <Link href="#" className="text-indigo-400 hover:text-white font-bold ml-1 transition-colors">
                  联系销售团队
                </Link>
              </p>
            </div>

          </div>
          
          <div className="text-center mt-8 text-xs text-slate-600 font-mono">
            DEMO MODE: 点击登录即可直接进入
          </div>
        </motion.div>
      </div>
    </div>
  );
}