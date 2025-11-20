'use client'

import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import {
  Eye,
  ThumbsUp,
  MessageCircle,
  Share2,
  Play,
  Copy,
  ExternalLink,
  Star,
  AlertCircle,
  TrendingUp,
  Lightbulb,
  Film,
  Hash,
  Target,
  Shield,
} from 'lucide-react'
import Image from 'next/image'
import { toast } from 'sonner'

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

interface VideoDetailModalProps {
  video: Video
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function VideoDetailModal({ video, open, onOpenChange }: VideoDetailModalProps) {
  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`
    return num.toString()
  }

  const getEngagementRate = () => {
    const total = video.likes + video.comments + video.shares
    return ((total / video.views) * 100).toFixed(2)
  }

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${label}已复制到剪贴板`)
  }

  const analysis = video.ai_analysis || {}

  // 渲染星级
  const renderStars = (count: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${i < count ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <ScrollArea className="h-[90vh]">
          <div className="p-6 space-y-6">
            {/* 头部：视频基本信息 */}
            <div className="flex gap-6">
              {/* 缩略图 */}
              <div className="relative w-80 aspect-video flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                {video.thumbnail_url ? (
                  <Image src={video.thumbnail_url} alt={video.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Play className="w-16 h-16 text-muted-foreground" />
                  </div>
                )}
              </div>

              {/* 基本信息 */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <h2 className="text-2xl font-bold flex-1">{video.title}</h2>
                    <Badge className="ml-2 text-lg px-3 py-1 bg-red-500">
                      🔥 {video.viral_score}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>
                      {video.platform === 'tiktok' ? '🎵' : '▶️'} {video.platform}
                    </span>
                    <span>@{video.author_name}</span>
                  </div>
                </div>

                {/* 数据面板 */}
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Eye className="w-5 h-5 text-blue-500" />
                          <span className="text-sm text-muted-foreground">播放量</span>
                        </div>
                        <span className="text-2xl font-bold">{formatNumber(video.views)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <ThumbsUp className="w-5 h-5 text-red-500" />
                          <span className="text-sm text-muted-foreground">点赞数</span>
                        </div>
                        <span className="text-2xl font-bold">{formatNumber(video.likes)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <MessageCircle className="w-5 h-5 text-green-500" />
                          <span className="text-sm text-muted-foreground">评论数</span>
                        </div>
                        <span className="text-2xl font-bold">{formatNumber(video.comments)}</span>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="pt-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Share2 className="w-5 h-5 text-purple-500" />
                          <span className="text-sm text-muted-foreground">互动率</span>
                        </div>
                        <span className="text-2xl font-bold">{getEngagementRate()}%</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* 操作按钮 */}
                <div className="flex gap-2">
                  <Button className="flex-1" size="lg">
                    <Play className="w-4 h-4 mr-2" />
                    用这个生成视频
                  </Button>
                  <Button variant="outline" size="lg" asChild>
                    <a href={video.video_url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="w-4 h-4 mr-2" />
                      查看原视频
                    </a>
                  </Button>
                </div>
              </div>
            </div>

            <Separator />

            {/* 详细分析 */}
            {analysis && Object.keys(analysis).length > 0 ? (
              <Tabs defaultValue="overview" className="w-full">
                <TabsList className="grid w-full grid-cols-5">
                  <TabsTrigger value="overview">📊 概览</TabsTrigger>
                  <TabsTrigger value="viral">🔥 爆款分析</TabsTrigger>
                  <TabsTrigger value="production">🎬 制作技巧</TabsTrigger>
                  <TabsTrigger value="guide">📖 创作指导</TabsTrigger>
                  <TabsTrigger value="prompt">🎨 AI提示词</TabsTrigger>
                </TabsList>

                {/* 概览标签 */}
                <TabsContent value="overview" className="space-y-4 mt-4">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5" />
                        内容分析
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-2">内容摘要</h4>
                        <p className="text-muted-foreground">{analysis.summary || '暂无分析'}</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-2">内容类型</h4>
                          <Badge variant="secondary" className="text-base px-3 py-1">
                            {analysis.content_type || '待分析'}
                          </Badge>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-2">目标受众</h4>
                          <p className="text-muted-foreground">{analysis.target_audience || '待分析'}</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {analysis.content_structure && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Film className="w-5 h-5" />
                          内容结构
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <div>
                          <h4 className="font-semibold mb-1">开场方式</h4>
                          <p className="text-sm text-muted-foreground">
                            {analysis.content_structure.opening}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">中间展开</h4>
                          <p className="text-sm text-muted-foreground">
                            {analysis.content_structure.middle}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">结尾方式</h4>
                          <p className="text-sm text-muted-foreground">
                            {analysis.content_structure.ending}
                          </p>
                        </div>
                        <div>
                          <h4 className="font-semibold mb-1">预估时长</h4>
                          <Badge>{analysis.content_structure.duration_estimate}</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* 爆款分析标签 */}
                <TabsContent value="viral" className="space-y-4 mt-4">
                  {analysis.viral_factors && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <TrendingUp className="w-5 h-5" />
                          爆款因素（6个维度）
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        {Object.entries(analysis.viral_factors).map(([key, value]: [string, any]) => {
                          const labels: Record<string, string> = {
                            hook: '开头钩子',
                            storytelling: '叙事结构',
                            visual_style: '视觉风格',
                            pacing: '节奏把控',
                            emotion: '情绪调动',
                            uniqueness: '独特卖点',
                          }
                          // 根据描述长度和关键词评分
                          const score = value.length > 50 ? 5 : value.length > 30 ? 4 : 3
                          return (
                            <div key={key} className="border-l-4 border-primary pl-4">
                              <div className="flex items-center justify-between mb-2">
                                <h4 className="font-semibold">{labels[key]}</h4>
                                <div className="flex gap-1">{renderStars(score)}</div>
                              </div>
                              <p className="text-sm text-muted-foreground">{value}</p>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )}

                  {analysis.replicable_elements && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Lightbulb className="w-5 h-5" />
                          可直接复制的元素
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {analysis.replicable_elements.map((element: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm">
                                {index + 1}
                              </span>
                              <span className="text-sm">{element}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* 制作技巧标签 */}
                <TabsContent value="production" className="space-y-4 mt-4">
                  {analysis.production_techniques && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <Film className="w-5 h-5" />
                          制作技巧（5个维度）
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.entries(analysis.production_techniques).map(([key, value]: [string, any]) => {
                          const labels: Record<string, { title: string; icon: string }> = {
                            camera_work: { title: '镜头运用', icon: '🎥' },
                            editing: { title: '剪辑手法', icon: '✂️' },
                            music: { title: '音乐选择', icon: '🎵' },
                            text_overlay: { title: '文字使用', icon: '📝' },
                            special_effects: { title: '特效应用', icon: '✨' },
                          }
                          return (
                            <div key={key} className="border rounded-lg p-4">
                              <h4 className="font-semibold mb-2 flex items-center gap-2">
                                <span>{labels[key].icon}</span>
                                {labels[key].title}
                              </h4>
                              <p className="text-sm text-muted-foreground">{value}</p>
                            </div>
                          )
                        })}
                      </CardContent>
                    </Card>
                  )}
                </TabsContent>

                {/* 创作指导标签 */}
                <TabsContent value="guide" className="space-y-4 mt-4">
                  {analysis.creation_guide && (
                    <>
                      <Card>
                        <CardHeader>
                          <CardTitle>核心创意概念</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-muted-foreground">{analysis.creation_guide.concept}</p>
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle>脚本大纲</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {analysis.creation_guide.script_outline}
                          </p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>拍摄要点</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.creation_guide.shooting_tips?.map((tip: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>剪辑要点</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {analysis.creation_guide.editing_tips?.map((tip: string, index: number) => (
                                <li key={index} className="flex items-start gap-2 text-sm">
                                  <span className="text-primary">•</span>
                                  <span>{tip}</span>
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>关键时刻</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-2">
                            {analysis.creation_guide.key_moments?.map((moment: string, index: number) => (
                              <div key={index} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                                <Badge variant="outline">时刻 {index + 1}</Badge>
                                <span className="text-sm">{moment}</span>
                              </div>
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </>
                  )}
                </TabsContent>

                {/* AI提示词标签 */}
                <TabsContent value="prompt" className="space-y-4 mt-4">
                  {analysis.ai_video_prompt && (
                    <>
                      <Card>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle>主提示词（英文）</CardTitle>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() =>
                                copyToClipboard(analysis.ai_video_prompt.main_prompt, '主提示词')
                              }
                            >
                              <Copy className="w-4 h-4 mr-1" />
                              复制
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap font-mono bg-muted p-4 rounded">
                            {analysis.ai_video_prompt.main_prompt}
                          </p>
                        </CardContent>
                      </Card>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card>
                          <CardHeader>
                            <CardTitle>风格提示词</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary" className="text-base">
                              {analysis.ai_video_prompt.style_prompt}
                            </Badge>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader>
                            <CardTitle>建议时长</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <Badge variant="secondary" className="text-base">
                              {analysis.ai_video_prompt.duration}
                            </Badge>
                          </CardContent>
                        </Card>
                      </div>

                      <Card>
                        <CardHeader>
                          <CardTitle>场景分解</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          {analysis.ai_video_prompt.scene_breakdown?.map((scene: string, index: number) => (
                            <div key={index} className="border-l-4 border-primary pl-4">
                              <h4 className="font-semibold mb-1">Scene {index + 1}</h4>
                              <p className="text-sm text-muted-foreground font-mono">{scene}</p>
                            </div>
                          ))}
                        </CardContent>
                      </Card>

                      {analysis.hashtag_analysis && (
                        <Card>
                          <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                              <Hash className="w-5 h-5" />
                              话题标签建议
                            </CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">核心标签</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.hashtag_analysis.primary_tags?.map((tag: string) => (
                                  <Badge key={tag} className="bg-red-500">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">热门标签</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.hashtag_analysis.trending_tags?.map((tag: string) => (
                                  <Badge key={tag} className="bg-orange-500">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                            <div>
                              <h4 className="font-semibold mb-2 text-sm">细分标签</h4>
                              <div className="flex flex-wrap gap-2">
                                {analysis.hashtag_analysis.niche_tags?.map((tag: string) => (
                                  <Badge key={tag} variant="secondary">
                                    #{tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </>
                  )}
                </TabsContent>
              </Tabs>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <AlertCircle className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">暂无AI分析</p>
                  <Button size="sm">开始分析</Button>
                </CardContent>
              </Card>
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  )
}
