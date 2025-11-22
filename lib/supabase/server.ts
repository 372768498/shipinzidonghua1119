import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

/**
 * 创建服务端 Supabase 客户端
 * 用于 API Routes 和 Server Components
 */
export function createServerClient() {
  // 优先使用 service role key（绕过 RLS）
  const key = supabaseServiceKey || supabaseAnonKey
  
  if (!supabaseUrl || !key) {
    throw new Error('Missing Supabase environment variables')
  }

  return createClient(supabaseUrl, key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
}

/**
 * 创建带用户认证的服务端客户端
 * 用于需要用户上下文的操作
 */
export function createAuthenticatedClient(accessToken?: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables')
  }

  const client = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: accessToken ? {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    } : undefined,
  })

  return client
}
