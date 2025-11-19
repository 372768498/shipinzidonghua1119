export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-24">
      <main className="flex flex-col items-center gap-8">
        <h1 className="text-6xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Jilo.ai
        </h1>
        <p className="text-xl text-muted-foreground text-center max-w-2xl">
          AI视频内容自动化工厂
        </p>
        <p className="text-muted-foreground text-center max-w-2xl">
          通过AI技术自动发现爆款视频、生成原创内容并自动发布到YouTube
        </p>
        
        <div className="flex gap-4 mt-8">
          <a
            href="/auth/signin"
            className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            开始使用
          </a>
          <a
            href="/docs"
            className="px-6 py-3 border border-border rounded-lg hover:bg-accent transition-colors"
          >
            查看文档
          </a>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl">
          <div className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🔍 爆款发现</h3>
            <p className="text-sm text-muted-foreground">
              AI自动分析TikTok、YouTube等平台的热门视频
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">🎬 智能生成</h3>
            <p className="text-sm text-muted-foreground">
              基于爆款创意，使用AI模型生成原创视频内容
            </p>
          </div>
          <div className="p-6 border border-border rounded-lg">
            <h3 className="font-semibold text-lg mb-2">📤 自动发布</h3>
            <p className="text-sm text-muted-foreground">
              一键发布到YouTube，自动优化标题和描述
            </p>
          </div>
        </div>
      </main>

      <footer className="mt-24 text-sm text-muted-foreground">
        <p>© 2024 Jilo.ai. All rights reserved.</p>
      </footer>
    </div>
  )
}
