'use client'

import { useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

interface CreateTaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onTaskCreated: () => void
}

export default function CreateTaskDialog({
  open,
  onOpenChange,
  onTaskCreated,
}: CreateTaskDialogProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    target_value: '',
    platform: 'tiktok',
    frequency: 'every_6_hours',
    description: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.target_value.trim()) {
      toast.error('请输入监控关键词')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/monitoring/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (data.success) {
        toast.success('监控任务创建成功！')
        onTaskCreated()
        setFormData({
          target_value: '',
          platform: 'tiktok',
          frequency: 'every_6_hours',
          description: '',
        })
      } else {
        toast.error(data.error || '创建失败')
      }
    } catch (error) {
      console.error('创建任务错误:', error)
      toast.error('创建失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>创建监控任务</DialogTitle>
          <DialogDescription>
            设置领域关键词，系统将自动监控相关视频
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="keywords">监控关键词 *</Label>
            <Input
              id="keywords"
              placeholder="例如: 水晶杯,crystalcup,创意杯子"
              value={formData.target_value}
              onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
            />
            <p className="text-xs text-muted-foreground">
              多个关键词用逗号分隔，系统会监控包含这些词的视频
            </p>
          </div>

          <div className="space-y-2">
            <Label>平台</Label>
            <Select
              value={formData.platform}
              onValueChange={(value) => setFormData({ ...formData, platform: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="tiktok">🎵 TikTok</SelectItem>
                <SelectItem value="youtube">▶️ YouTube</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>监控频率</Label>
            <Select
              value={formData.frequency}
              onValueChange={(value) => setFormData({ ...formData, frequency: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hourly">每小时（高频）</SelectItem>
                <SelectItem value="every_6_hours">每6小时（推荐）</SelectItem>
                <SelectItem value="daily">每天</SelectItem>
                <SelectItem value="weekly">每周</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              推荐每6小时，平衡数据新鲜度和API配额
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">任务描述（可选）</Label>
            <Textarea
              id="description"
              placeholder="例如: 监控水晶杯相关视频，用于电商营销"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  创建中...
                </>
              ) : (
                '创建任务'
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
