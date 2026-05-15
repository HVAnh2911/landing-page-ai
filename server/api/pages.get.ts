import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  const url = config.public.supabaseUrl as string
  if (!url || url.includes('placeholder')) return []

  // Lấy token từ header
  const authHeader  = getHeader(event, 'authorization') ?? ''
  const accessToken = authHeader.replace('Bearer ', '').trim()

  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Bạn cần đăng nhập' })
  }

  // Xác minh user
  const supabaseUser = createClient(url, config.public.supabaseAnonKey as string, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Phiên đăng nhập không hợp lệ' })
  }

  const supabase = createClient(url, config.supabaseServiceKey as string)

  // Kiểm tra is_admin từ profiles table
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  const isAdmin = profile?.is_admin === true

  let query = supabase
    .from('pages')
    .select('id,slug,brand,industry,color_primary,view_count,is_published,created_at,user_id')
    .order('created_at', { ascending: false })
    .limit(100)

  // Admin xem tất cả, user chỉ xem của mình
  if (!isAdmin) {
    query = query.eq('user_id', user.id)
  }

  const { data } = await query
  return data ?? []
})
