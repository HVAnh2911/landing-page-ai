<script setup lang="ts">
import type { GeneratedPage } from '~/stores/modules/generator/types'

definePageMeta({ layout: false })

const route    = useRoute()
const slug     = route.params.slug as string
const supabase = useSupabaseClient()

type PageRaw = {
  id: string; slug: string; brand: string; industry: string; tagline: string
  usp: string; phone: string; address: string; color_primary: string; color_accent: string
  content: GeneratedPage['content']; unsplash_url: string; is_published: boolean
}

const pageData  = ref<PageRaw | null>(null)
const loading   = ref(true)

onMounted(async () => {
  // Thử fetch không cần token trước (trang public)
  try {
    pageData.value = await $fetch<PageRaw>(`/api/page/${slug}`)
    loading.value = false
    return
  } catch { /* trang chưa public, thử với token */ }

  // Retry với token (owner xem trang chưa public)
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token ?? ''
  if (token) {
    try {
      pageData.value = await $fetch<PageRaw>(`/api/page/${slug}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
    } catch { /* không có quyền */ }
  }
  loading.value = false
})

const page = computed<GeneratedPage | null>(() => {
  if (!pageData.value) return null
  return {
    input: {
      brand:    pageData.value.brand,
      industry: pageData.value.industry,
      tagline:  pageData.value.tagline,
      usp:      pageData.value.usp,
      phone:    pageData.value.phone,
      address:  pageData.value.address,
      colors:   { primary: pageData.value.color_primary, accent: pageData.value.color_accent },
    },
    content:          pageData.value.content,
    unsplashImageUrl: pageData.value.unsplash_url,
  }
})

useSeoMeta({
  title:       () => pageData.value?.content.seo.title ?? pageData.value?.brand ?? slug,
  description: () => pageData.value?.content.seo.description ?? '',
})
</script>

<template>
  <div>
    <!-- Banner chỉ hiện khi chưa publish -->
    <div
      v-if="pageData && !pageData.is_published"
      class="sticky top-0 z-50 flex items-center justify-between bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow"
    >
      <span>👁️ Bản xem trước — trang chưa được publish công khai</span>
      <NuxtLink to="/dashboard" class="rounded-lg bg-white/20 px-3 py-1 text-xs hover:bg-white/30 transition">
        ← Dashboard
      </NuxtLink>
    </div>

    <!-- Loading -->
    <div v-if="loading" class="flex min-h-screen items-center justify-center">
      <svg class="h-8 w-8 animate-spin text-gray-300" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
      </svg>
    </div>

    <!-- Không có quyền xem -->
    <div v-else-if="!page" class="flex min-h-screen items-center justify-center text-gray-400">
      <p>Trang không tồn tại hoặc chưa được công khai.</p>
    </div>

    <LandingPreview v-else :page="page" device="desktop" />
  </div>
</template>
