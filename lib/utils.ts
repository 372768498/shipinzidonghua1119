import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * 格式化数字为可读格式
 * @param num - 要格式化的数字
 * @returns 格式化后的字符串 (例如: 1.2M, 850K, 1234)
 */
export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}K`
  }
  return num.toString()
}

/**
 * 计算互动率
 * @param likes - 点赞数
 * @param comments - 评论数
 * @param shares - 分享数
 * @param views - 播放量
 * @returns 互动率百分比字符串
 */
export function calculateEngagementRate(
  likes: number,
  comments: number,
  shares: number,
  views: number
): string {
  if (views === 0) return '0.00'
  const total = likes + comments + shares
  return ((total / views) * 100).toFixed(2)
}

/**
 * 获取时间距离现在的描述
 * @param dateString - ISO日期字符串
 * @returns 时间描述 (例如: 3小时前, 2天前)
 */
export function getTimeAgo(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(hours / 24)
  const weeks = Math.floor(days / 7)
  const months = Math.floor(days / 30)

  if (months > 0) return `${months}个月前`
  if (weeks > 0) return `${weeks}周前`
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  return '刚刚'
}
