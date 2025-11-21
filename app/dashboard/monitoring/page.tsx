'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Plus, Search, Filter, Grid3x3, List, Table, Eye, Play, TrendingUp } from 'lucide-react'
import VideoListView from '@/components/monitoring/VideoListView'
import VideoCardView from '@/components/monitoring/VideoCardView'
import VideoTableView from '@/components/monitoring/VideoTableView'
import VideoDetailModal from '@/components/monitoring/VideoDetailModal'
import CreateTaskDialog from '@/components/monitoring/CreateTaskDialog'
import FilterPanel from '@/components/monitoring/FilterPanel'

interface MonitoringTask {
  id: string
  task_type: string
  target_value: string
  platform: string
  frequency: string
  is_active: boolean
  total_runs: number
  videos_tracked: number
  created_at: string
}

interface Video {
  id: string
  title: string
  thumbnail_url: string
  video_url: string
  views: number
  likes: number
  comments: number
  shares: number
  viral_score: number
  author_name: string
  platform: string
  created_at: string
  ai_analysis?: any
}

export default function MonitoringCenter() {
  const [tasks, setTasks] = useState<MonitoringTask[]>([])
  const [videos, setVideos] = useState<Video[]>([])
  const [selectedTask, setSelectedTask] = useState<string>('all')
  const [viewMode, setViewMode] = useState<'list' | 'card' | 'table'>('list')
  const [loading, setLoading] = useState(false)
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [filters, setFilters] = useState({
    viralScore: 0,
    contentType: 'all',
    minViews: 0,
    timeRange: 'all',
    hasAnalysis: 'all',
  })
  const [sortBy, setSortBy] = useState('viral_score')
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    loadTasks()
  }, [])

  useEffect(() => {
    loadVideos()
  }, [selectedTask, filters, sortBy])

  const loadTasks = async () => {
    try {
      const response = await fetch('/api/monitoring/tasks')
      const data = await response.json()
      if (data.success) {
        setTasks(data.tasks)
      }
    } catch (error) {
      console.error('加载任务失败:', error)
      toast.error('加载监控任务失败')
    }
  }

  const loadVideos = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        task: selectedTask,
        sort: sortBy,
        minViralScore: filters.viralScore.toString(),
        minViews: filters.minViews.toString(),
        ...(searchQuery && { search: searchQuery }),
      })

      const response = await fetch(`/api/viral-videos?${params}`)
      const data = await response.json()
      if (data.success) {
        setVideos(data.videos)
      }
    } catch (error) {
      console.error('加载视频失败:', error)
      toast.error('加载视频失败')
    } finally {
      setLoading(false)
    }
  }

  const handleTaskCreated = () => {
    loadTasks()
    setShowCreateDialog(false)
    toast.success('监控任务创建成功！')
  }

  const handleVideoClick = (video: Video) => {
    setSelectedVideo(video)
    setShowDetailModal(true)
  }

  const activeTasksCount = tasks.filter((t) => t.is_active).length
  const totalVideos = videos.length
  const avgViralScore =
    videos.length > 0
      ? Math.round(videos.reduce((sum, v) => sum + v.viral_score, 0) / videos.length)
      : 0

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">🎯 监控中心</h1>
          <p className="text-muted-foreground mt-2">特定领域爆款视频自动监控与分析</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)} size="lg">
          <Plus className="w-4 h-4 mr-2" />
          新建监控任务
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              活跃任务
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{activeTasksCount}</div>
            <p className="text-xs text-muted-foreground mt-1">总共 {tasks.length} 个任务</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              监控视频
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalVideos}</div>
            <p className="text-xs text-muted-foreground mt-1">已分析并存储</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              平均爆款分
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{avgViralScore}</div>
            <p className="text-xs text-muted-foreground mt-1">当前筛选结果</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              超级爆款
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {videos.filter((v) => v.viral_score >= 90).length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">爆款分 ≥ 90</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>监控任务</CardTitle>
            <CardDescription>选择要查看的监控领域</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button
              variant={selectedTask === 'all' ? 'default' : 'ghost'}
              className="w-full justify-start"
              onClick={() => setSelectedTask('all')}
            >
              <TrendingUp className="w-4 h-4 mr-2" />
              所有视频 ({totalVideos})
            </Button>

            {tasks.map((task) => (
              <Button
                key={task.id}
                variant={selectedTask === task.id ? 'default' : 'ghost'}
                className="w-full justify-start"
                onClick={() => setSelectedTask(task.id)}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="truncate">{task.target_value}</span>
                  <Badge variant="secondary" className="ml-2">
                    {task.videos_tracked}
                  </Badge>
                </div>
              </Button>
            ))}

            {tasks.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <p>还没有监控任务</p>
                <Button
                  variant="link"
                  className="mt-2"
                  onClick={() => setShowCreateDialog(true)}
                >
                  创建第一个任务
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-3 space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      placeholder="搜索视频标题、作者..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="viral_score">🔥 爆款分</SelectItem>
                    <SelectItem value="views">📊 播放量</SelectItem>
                    <SelectItem value="likes">❤️ 点赞数</SelectItem>
                    <SelectItem value="engagement">💬 互动率</SelectItem>
                    <SelectItem value="created_at">⏰ 发布时间</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex gap-1 border rounded-md p-1">
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'card' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('card')}
                  >
                    <Grid3x3 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    <Table className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <FilterPanel filters={filters} onFiltersChange={setFilters} />
            </CardContent>
          </Card>

          {loading ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4" />
                <p className="text-muted-foreground">加载中...</p>
              </CardContent>
            </Card>
          ) : videos.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground mb-2">暂无视频</p>
                <p className="text-sm text-muted-foreground">
                  请创建监控任务或调整筛选条件
                </p>
              </CardContent>
            </Card>
          ) : (
            <>
              {viewMode === 'list' && (
                <VideoListView videos={videos} onVideoClick={handleVideoClick} />
              )}
              {viewMode === 'card' && (
                <VideoCardView videos={videos} onVideoClick={handleVideoClick} />
              )}
              {viewMode === 'table' && (
                <VideoTableView videos={videos} onVideoClick={handleVideoClick} />
              )}
            </>
          )}
        </div>
      </div>

      <CreateTaskDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        onTaskCreated={handleTaskCreated}
      />

      {selectedVideo && (
        <VideoDetailModal
          video={selectedVideo}
          open={showDetailModal}
          onOpenChange={setShowDetailModal}
        />
      )}
    </div>
  )
}
