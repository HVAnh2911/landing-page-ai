import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const slug   = getRouterParam(event, 'slug')!

  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const { data, error } = await supabase
    .from('pages')
    .select('id,slug,brand,industry,tagline,usp,phone,address,color_primary,color_accent,content,unsplash_url,is_published,user_id')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
  }

  // Nếu chưa publish — chỉ owner mới xem được
  if (!data.is_published) {
    const authHeader  = getHeader(event, 'authorization') ?? ''
    const accessToken = authHeader.replace('Bearer ', '').trim()

    if (!accessToken) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
    }

    const supabaseUser = createClient(
      config.public.supabaseUrl as string,
      config.public.supabaseAnonKey as string,
      { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
    )
    const { data: { user } } = await supabaseUser.auth.getUser()

    if (!user || user.id !== data.user_id) {
      throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
    }
  }

  // Đếm view (chỉ khi đã publish)
  if (data.is_published) {
    try { await supabase.rpc('increment_view', { page_id: data.id }) } catch { /* bỏ qua */ }
  }

  return data
})
