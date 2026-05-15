import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id     = getRouterParam(event, 'id')

  if (!id) throw createError({ statusCode: 400, message: 'Thiếu ID trang' })

  const authHeader  = getHeader(event, 'authorization') ?? ''
  const accessToken = authHeader.replace('Bearer ', '').trim()
  if (!accessToken) throw createError({ statusCode: 401, message: 'Bạn cần đăng nhập' })

  const url = config.public.supabaseUrl as string
  const supabaseUser = createClient(url, config.public.supabaseAnonKey as string, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) throw createError({ statusCode: 401, message: 'Phiên không hợp lệ' })

  const supabase = createClient(url, config.supabaseServiceKey as string)

  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  const isAdmin = profile?.is_admin === true

  const { data: page, error } = await supabase
    .from('pages')
    .select('id,slug,brand,industry,tagline,usp,phone,address,color_primary,color_accent,content,unsplash_url,created_at,user_id')
    .eq('id', id)
    .single()

  if (error || !page) throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
  if (!isAdmin && page.user_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Bạn không có quyền xem trang này' })
  }

  return page
})
