import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()

  // Trả về mảng rỗng nếu Supabase chưa được cấu hình
  const url = config.public.supabaseUrl as string
  if (!url || url.includes('placeholder')) return []

  const supabase = createClient(url, config.supabaseServiceKey as string)

  const { data } = await supabase
    .from('pages')
    .select('id,slug,brand,industry,color_primary,view_count,is_published,created_at')
    .order('created_at', { ascending: false })
    .limit(50)

  return data ?? []
})
