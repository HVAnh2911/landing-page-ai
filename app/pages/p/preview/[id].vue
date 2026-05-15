<script setup lang="ts">
import type { GeneratedPage } from '~/stores/modules/generator/types'

definePageMeta({ layout: false, middleware: 'auth' })

const route    = useRoute()
const id       = route.params.id as string
const supabase = useSupabaseClient()

const { data: page, error } = await useAsyncData(`preview-${id}`, async () => {
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''

  const raw = await $fetch<{
    id: string; brand: string; industry: string; tagline: string; usp: string
    phone: string; address: string; color_primary: string; color_accent: string
    content: GeneratedPage['content']; unsplash_url: string
  }>(`/api/pages/${id}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  return {
    input: {
      brand:    raw.brand,
      industry: raw.industry,
      tagline:  raw.tagline,
      usp:      raw.usp,
      phone:    raw.phone,
      address:  raw.address,
      colors:   { primary: raw.color_primary, accent: raw.color_accent },
    },
    content:          raw.content,
    unsplashImageUrl: raw.unsplash_url,
  } satisfies GeneratedPage
}, { server: false })

useSeoMeta({ title: () => page.value ? `Preview — ${page.value.input.brand}` : 'Preview' })
</script>

<template>
  <div>
    <div class="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow">
      <span>👁️ Bản xem trước — chưa publish công khai</span>
      <NuxtLink to="/dashboard" class="rounded-lg bg-white/20 px-3 py-1 text-xs hover:bg-white/30 transition">
        ← Dashboard
      </NuxtLink>
    </div>

    <div v-if="error" class="flex min-h-screen items-center justify-center">
      <div class="text-center">
        <p class="text-lg font-semibold text-gray-700">Không tìm thấy trang hoặc bạn không có quyền xem</p>
        <NuxtLink to="/dashboard" class="mt-4 inline-block rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
          ← Về Dashboard
        </NuxtLink>
      </div>
    </div>

    <LandingPreview v-else-if="page" :page="page" device="desktop" />
  </div>
</template>
