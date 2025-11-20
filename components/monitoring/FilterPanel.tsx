'use client'

import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Button } from '@/components/ui/button'
import { X } from 'lucide-react'

interface Filters {
  viralScore: number
  contentType: string
  minViews: number
  timeRange: string
  hasAnalysis: string
}

interface FilterPanelProps {
  filters: Filters
  onFiltersChange: (filters: Filters) => void
}

export default function FilterPanel({ filters, onFiltersChange }: FilterPanelProps) {
  const updateFilter = (key: keyof Filters, value: any) => {
    onFiltersChange({ ...filters, [key]: value })
  }

  const resetFilters = () => {
    onFiltersChange({
      viralScore: 0,
      contentType: 'all',
      minViews: 0,
      timeRange: 'all',
      hasAnalysis: 'all',
    })
  }

  const hasActiveFilters =
    filters.viralScore > 0 ||
    filters.contentType !== 'all' ||
    filters.minViews > 0 ||
    filters.timeRange !== 'all' ||
    filters.hasAnalysis !== 'all'

  return (
    <div className="mt-4 pt-4 border-t space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium">筛选条件</h3>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            <X className="w-4 h-4 mr-1" />
            清除筛选
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* 爆款分 */}
        <div className="space-y-2">
          <Label>爆款分: {filters.viralScore}+</Label>
          <Slider
            value={[filters.viralScore]}
            onValueChange={([value]) => updateFilter('viralScore', value)}
            min={0}
            max={100}
            step={10}
          />
        </div>

        {/* 内容类型 */}
        <div className="space-y-2">
          <Label>内容类型</Label>
          <Select value={filters.contentType} onValueChange={(value) => updateFilter('contentType', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="教程">教程</SelectItem>
              <SelectItem value="评测">评测</SelectItem>
              <SelectItem value="娱乐">娱乐</SelectItem>
              <SelectItem value="开箱">开箱</SelectItem>
              <SelectItem value="知识科普">知识科普</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 最低播放量 */}
        <div className="space-y-2">
          <Label>最低播放量</Label>
          <Select value={filters.minViews.toString()} onValueChange={(value) => updateFilter('minViews', parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="0">不限</SelectItem>
              <SelectItem value="10000">1万+</SelectItem>
              <SelectItem value="50000">5万+</SelectItem>
              <SelectItem value="100000">10万+</SelectItem>
              <SelectItem value="500000">50万+</SelectItem>
              <SelectItem value="1000000">100万+</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 时间范围 */}
        <div className="space-y-2">
          <Label>时间范围</Label>
          <Select value={filters.timeRange} onValueChange={(value) => updateFilter('timeRange', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="24h">24小时内</SelectItem>
              <SelectItem value="3d">3天内</SelectItem>
              <SelectItem value="7d">7天内</SelectItem>
              <SelectItem value="30d">30天内</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* AI分析状态 */}
        <div className="space-y-2">
          <Label>AI分析</Label>
          <Select value={filters.hasAnalysis} onValueChange={(value) => updateFilter('hasAnalysis', value)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="yes">已完成</SelectItem>
              <SelectItem value="no">未完成</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  )
}
