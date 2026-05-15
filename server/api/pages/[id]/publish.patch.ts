import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const id     = getRouterParam(event, 'id')
  if (!id) throw createError({ statusCode: 400, message: 'Thiếu ID trang' })

  const { is_published } = await readBody<{ is_published: boolean }>(event)

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

  // Kiểm tra quyền owner hoặc admin
  const { data: profile } = await supabase
    .from('profiles').select('is_admin').eq('id', user.id).single()
  const isAdmin = profile?.is_admin === true

  const { data: page } = await supabase
    .from('pages').select('user_id').eq('id', id).single()
  if (!page) throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
  if (!isAdmin && page.user_id !== user.id) {
    throw createError({ statusCode: 403, message: 'Bạn không có quyền thay đổi trang này' })
  }

  const { error } = await supabase
    .from('pages')
    .update({ is_published })
    .eq('id', id)
  if (error) throw createError({ statusCode: 500, message: error.message })

  return { success: true, is_published }
})
