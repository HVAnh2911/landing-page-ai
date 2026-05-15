import { createClient } from '@supabase/supabase-js'
import type { GeneratedPage } from '../../app/stores/modules/generator/types'

function toSlug(brand: string): string {
  return brand
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body   = await readBody<{ page: GeneratedPage; publish?: boolean }>(event)
  const { page, publish = false } = body

  if (!page?.input?.brand) {
    throw createError({ statusCode: 400, message: 'Thiếu dữ liệu trang' })
  }

  // Lấy user từ JWT trong Authorization header
  const authHeader = getHeader(event, 'authorization') ?? ''
  const accessToken = authHeader.replace('Bearer ', '').trim()

  if (!accessToken) {
    throw createError({ statusCode: 401, message: 'Bạn cần đăng nhập để lưu trang' })
  }

  // Dùng user client để xác minh token và lấy user_id
  const supabaseUser = createClient(
    config.public.supabaseUrl as string,
    config.public.supabaseAnonKey as string,
    { global: { headers: { Authorization: `Bearer ${accessToken}` } } },
  )
  const { data: { user }, error: authError } = await supabaseUser.auth.getUser()
  if (authError || !user) {
    throw createError({ statusCode: 401, message: 'Phiên đăng nhập không hợp lệ' })
  }

  // Dùng service key để ghi dữ liệu (bypass RLS khi insert với đúng user_id)
  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  // Đảm bảo profile tồn tại (trigger có thể chưa chạy)
  const { data: existingProfile } = await supabase
    .from('profiles').select('id').eq('id', user.id).maybeSingle()
  if (!existingProfile) {
    await supabase.from('profiles').insert({
      id:    user.id,
      email: user.email ?? '',
      full_name: user.user_metadata?.full_name ?? '',
    })
  }

  let data: { id: string; slug: string } | null = null
  let error: { message: string } | null = null

  // Nếu trang đã tồn tại trong DB → UPDATE
  if (page.id) {
    const { data: existing } = await supabase
      .from('pages').select('user_id').eq('id', page.id).single()

    if (!existing || existing.user_id !== user.id) {
      throw createError({ statusCode: 403, message: 'Bạn không có quyền publish trang này' })
    }

    const res = await supabase
      .from('pages')
      .update({ is_published: publish })
      .eq('id', page.id)
      .select('id, slug')
      .single()
    data  = res.data
    error = res.error
  } else {
    // Trang mới → tạo slug và INSERT
    const baseSlug = toSlug(page.input.brand)
    let slug = baseSlug
    let attempt = 0

    while (attempt < 5) {
      const { data: existing } = await supabase
        .from('pages').select('id').eq('slug', slug).maybeSingle()
      if (!existing) break
      attempt++
      slug = `${baseSlug}-${attempt}`
    }

    const res = await supabase.from('pages').insert({
      user_id:       user.id,
      slug,
      brand:         page.input.brand,
      industry:      page.input.industry,
      tagline:       page.input.tagline,
      usp:           page.input.usp,
      phone:         page.input.phone,
      address:       page.input.address,
      color_primary: page.input.colors.primary,
      color_accent:  page.input.colors.accent,
      content:       page.content,
      unsplash_url:  page.unsplashImageUrl,
      is_published:  publish,
    }).select('id, slug').single()
    data  = res.data
    error = res.error
  }

  if (error || !data) {
    throw createError({ statusCode: 500, message: error?.message ?? 'Lỗi khi lưu trang' })
  }

  const siteUrl = config.public.siteUrl as string
  return {
    id:   data.id,
    slug: data.slug,
    url:  `${siteUrl}/p/${data.slug}`,
  }
})
