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
    .select('id,slug,brand,industry,tagline,usp,phone,address,color_primary,color_accent,content,unsplash_url')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (error || !data) {
    throw createError({ statusCode: 404, message: 'Không tìm thấy trang' })
  }

  // Đếm view
  await supabase.rpc('increment_view', { page_id: data.id }).catch(() => {})

  return data
})
