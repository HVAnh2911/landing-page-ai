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
  const body   = await readBody<{ page: GeneratedPage }>(event)
  const { page } = body

  if (!page?.input?.brand) {
    throw createError({ statusCode: 400, message: 'Thiếu dữ liệu trang' })
  }

  const supabase = createClient(
    config.public.supabaseUrl as string,
    config.supabaseServiceKey as string,
  )

  const baseSlug = toSlug(page.input.brand)
  let slug = baseSlug
  let attempt = 0

  // Tránh trùng slug
  while (attempt < 5) {
    const { data } = await supabase
      .from('pages')
      .select('id')
      .eq('slug', slug)
      .maybeSingle()

    if (!data) break
    attempt++
    slug = `${baseSlug}-${attempt}`
  }

  const { data, error } = await supabase.from('pages').insert({
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
    is_published:  true,
  }).select('id, slug').single()

  if (error) {
    throw createError({ statusCode: 500, message: error.message })
  }

  const siteUrl = config.public.siteUrl as string
  return {
    id:  data.id,
    slug: data.slug,
    url: `${siteUrl}/p/${data.slug}`,
  }
})
