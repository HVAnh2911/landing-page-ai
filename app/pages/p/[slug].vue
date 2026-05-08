<script setup lang="ts">
import type { GeneratedPage } from '~/stores/modules/generator/types'

definePageMeta({ layout: false })

const route  = useRoute()
const slug   = route.params.slug as string

const { data, error } = await useFetch<{
  id: string; slug: string; brand: string; industry: string; tagline: string
  usp: string; phone: string; address: string; color_primary: string; color_accent: string
  content: GeneratedPage['content']; unsplash_url: string
}>(`/api/page/${slug}`)

if (error.value || !data.value) {
  throw createError({ statusCode: 404, message: 'Trang không tìm thấy' })
}

const page = computed<GeneratedPage>(() => ({
  input: {
    brand:    data.value!.brand,
    industry: data.value!.industry,
    tagline:  data.value!.tagline,
    usp:      data.value!.usp,
    phone:    data.value!.phone,
    address:  data.value!.address,
    colors:   { primary: data.value!.color_primary, accent: data.value!.color_accent },
  },
  content:          data.value!.content,
  unsplashImageUrl: data.value!.unsplash_url,
}))

useSeoMeta({
  title:       () => data.value?.content.seo.title ?? data.value?.brand ?? slug,
  description: () => data.value?.content.seo.description ?? '',
})
</script>

<template>
  <div>
    <LandingPreview v-if="page" :page="page" device="desktop" />
  </div>
</template>
