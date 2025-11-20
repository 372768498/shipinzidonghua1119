'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

type Platform = 'tiktok' | 'youtube_shorts';
type Mode = 'growth' | 'shorts' | 'combined';

interface Job {
  id: string;
  platform: Platform;
  status: string;
  progress: number;
  viralVideosCount: number;
  avgViralScore: number;
}

interface ViralVideo {
  id: string;
  title: string;
  thumbnail_url: string;
  video_url: string;
  viral_score: number;
  viral_grade: string;
  views: number;
  likes: number;
  channel_name: string;
}

export default function DiscoverPage() {
  const [platform, setPlatform] = useState<Platform>('youtube_shorts');
  const [mode, setMode] = useState<Mode>('combined');
  const [keywords, setKeywords] = useState('');
  const [channels, setChannels] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [viralVideos, setViralVideos] = useState<ViralVideo[]>([]);

  const supabase = createClientComponentClient();

  // 实时监听任务状态更新
  useEffect(() => {
    if (!currentJob) return;

    const channel = supabase
      .channel('crawl_jobs_changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'crawl_jobs',
          filter: `id=eq.${currentJob.id}`,
        },
        (payload) => {
          const updatedJob = payload.new as any;
          setCurrentJob({
            id: updatedJob.id,
            platform: updatedJob.source_platform,
            status: updatedJob.status,
            progress: updatedJob.progress_percent || 0,
            viralVideosCount: updatedJob.viral_videos_count || 0,
            avgViralScore: updatedJob.avg_viral_score || 0,
          });

          // 如果任务完成，获取爆款视频
          if (updatedJob.status === 'completed') {
            fetchViralVideos(updatedJob.id);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [currentJob?.id]);

  const fetchViralVideos = async (jobId: string) => {
    const response = await fetch(`/api/viral-discovery?jobId=${jobId}`);
    const data = await response.json();
    if (data.success) {
      setViralVideos(data.viralVideos);
    }
  };

  const handleStartDiscovery = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/viral-discovery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          platform,
          mode,
          searchKeywords: keywords.split(',').map(k => k.trim()).filter(Boolean),
          monitoredChannels: channels.split('\n').map(c => c.trim()).filter(Boolean),
          maxResults: 100,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setCurrentJob({
          id: data.job.id,
          platform: data.job.platform,
          status: data.job.status,
          progress: 0,
          viralVideosCount: 0,
          avgViralScore: 0,
        });
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Error starting discovery:', error);
      alert('Failed to start discovery');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <h1 className="text-3xl font-bold mb-6">爆款视频发现</h1>

      {/* 配置表单 */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">配置发现任务</h2>

        {/* 平台选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">选择平台 *</label>
          <div className="flex gap-4">
            <button
              onClick={() => setPlatform('youtube_shorts')}
              className={`flex-1 p-4 rounded-lg border-2 transition ${
                platform === 'youtube_shorts'
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">▶️</div>
                <div className="font-semibold">YouTube Shorts</div>
                <div className="text-xs text-gray-600 mt-1">
                  价值导向 | SEO优化 | 订阅转化
                </div>
              </div>
            </button>

            <button
              onClick={() => setPlatform('tiktok')}
              className={`flex-1 p-4 rounded-lg border-2 transition ${
                platform === 'tiktok'
                  ? 'border-pink-500 bg-pink-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🎵</div>
                <div className="font-semibold">TikTok</div>
                <div className="text-xs text-gray-600 mt-1">
                  娱乐导向 | 音乐节奏 | 社交传播
                </div>
              </div>
            </button>
          </div>
        </div>

        {/* 平台差异提示 */}
        <div className={`mb-4 p-3 rounded-lg ${
          platform === 'youtube_shorts' ? 'bg-blue-50' : 'bg-pink-50'
        }`}>
          <div className="text-sm">
            {platform === 'youtube_shorts' ? (
              <>
                <strong>YouTube Shorts 特性：</strong>
                <ul className="list-disc ml-5 mt-1">
                  <li>重视知识型和教程类内容</li>
                  <li>SEO和可搜索性至关重要</li>
                  <li>爆款阈值：50万+播放</li>
                  <li>订阅转化率是关键指标</li>
                </ul>
              </>
            ) : (
              <>
                <strong>TikTok 特性：</strong>
                <ul className="list-disc ml-5 mt-1">
                  <li>注重娱乐性和情绪共鸣</li>
                  <li>前3秒钩子决定成败</li>
                  <li>爆款阈值：100万+播放</li>
                  <li>音乐和热门挑战很重要</li>
                </ul>
              </>
            )}
          </div>
        </div>

        {/* 模式选择 */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">发现模式</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as Mode)}
            className="w-full p-2 border rounded-lg"
          >
            <option value="combined">全面发现（推荐）</option>
            <option value="growth">仅关键词搜索</option>
            <option value="shorts">仅监控频道</option>
          </select>
        </div>

        {/* 关键词输入 */}
        {(mode === 'growth' || mode === 'combined') && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              搜索关键词（用逗号分隔）
            </label>
            <input
              type="text"
              value={keywords}
              onChange={(e) => setKeywords(e.target.value)}
              placeholder={
                platform === 'youtube_shorts'
                  ? '例如: AI教程, React开发, 编程技巧'
                  : '例如: 搞笑, 美食, 舞蹈挑战'
              }
              className="w-full p-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              {platform === 'youtube_shorts'
                ? '建议使用具体、可搜索的关键词'
                : '建议使用热门标签和话题'}
            </p>
          </div>
        )}

        {/* 频道输入 */}
        {(mode === 'shorts' || mode === 'combined') && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">
              监控频道URL（每行一个）
            </label>
            <textarea
              value={channels}
              onChange={(e) => setChannels(e.target.value)}
              placeholder={
                platform === 'youtube_shorts'
                  ? 'https://youtube.com/@channel1\nhttps://youtube.com/@channel2'
                  : 'https://tiktok.com/@user1\nhttps://tiktok.com/@user2'
              }
              rows={4}
              className="w-full p-2 border rounded-lg font-mono text-sm"
            />
          </div>
        )}

        {/* 启动按钮 */}
        <button
          onClick={handleStartDiscovery}
          disabled={loading || !!currentJob}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-lg font-semibold hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? '启动中...' : currentJob ? '任务进行中' : '🚀 开始发现爆款'}
        </button>
      </div>

      {/* 任务状态 */}
      {currentJob && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">任务状态</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">平台</span>
              <span className="font-medium">
                {currentJob.platform === 'youtube_shorts' ? '▶️ YouTube Shorts' : '🎵 TikTok'}
              </span>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">状态</span>
              <span className={`px-3 py-1 rounded-full text-sm ${
                currentJob.status === 'completed' ? 'bg-green-100 text-green-700' :
                currentJob.status === 'failed' ? 'bg-red-100 text-red-700' :
                'bg-blue-100 text-blue-700'
              }`}>
                {currentJob.status === 'completed' ? '✅ 完成' :
                 currentJob.status === 'failed' ? '❌ 失败' :
                 '⏳ 处理中'}
              </span>
            </div>

            {currentJob.status === 'processing' && (
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-gray-600">进度</span>
                  <span>{currentJob.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all"
                    style={{ width: `${currentJob.progress}%` }}
                  />
                </div>
              </div>
            )}

            {currentJob.status === 'completed' && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">发现爆款数</span>
                  <span className="font-bold text-lg text-green-600">
                    {currentJob.viralVideosCount}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">平均评分</span>
                  <span className="font-semibold">{currentJob.avgViralScore}/100</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* 爆款视频列表 */}
      {viralVideos.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">
            发现的爆款视频 ({viralVideos.length})
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {viralVideos.map((video) => (
              <a
                key={video.id}
                href={video.video_url}
                target="_blank"
                rel="noopener noreferrer"
                className="block border rounded-lg overflow-hidden hover:shadow-lg transition"
              >
                {/* 缩略图 */}
                <div className="relative aspect-video bg-gray-200">
                  {video.thumbnail_url && (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {/* 评分徽章 */}
                  <div className="absolute top-2 right-2 bg-black/70 text-white px-2 py-1 rounded-full text-xs font-bold">
                    {video.viral_grade}
                  </div>
                </div>

                {/* 信息 */}
                <div className="p-3">
                  <h3 className="font-medium text-sm line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  
                  <div className="text-xs text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>👁️ {video.views.toLocaleString()}</span>
                      <span>❤️ {video.likes.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="truncate">{video.channel_name}</span>
                      <span className="font-semibold text-blue-600">
                        {video.viral_score}/100
                      </span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
