import { defineStore } from 'pinia'
import { ref, shallowRef } from 'vue'
import type { GeneratorInput, GeneratedPage } from './types'

export const useGeneratorStore = defineStore('generator', () => {
  const isGenerating = ref(false)
  const error = ref<string | null>(null)
  // shallowRef: large object — no need for deep reactivity
  const currentPage = shallowRef<GeneratedPage | null>(null)
  const history = shallowRef<GeneratedPage[]>([])

  async function generate(input: GeneratorInput) {
    isGenerating.value = true
    error.value = null

    try {
      const result = await $fetch<{ content: GeneratedPage['content']; unsplashImageUrl: string }>(
        '/api/generate',
        {
          method: 'POST',
          body: input,
        },
      )

      const page: GeneratedPage = {
        input,
        content: result.content,
        unsplashImageUrl: result.unsplashImageUrl,
        createdAt: new Date().toISOString(),
      }

      currentPage.value = page
      history.value = [page, ...history.value.slice(0, 9)]
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e)
      if (msg.includes('429') || msg.toLowerCase().includes('too many')) {
        error.value = '⏳ Gemini đang bận, vui lòng thử lại sau 30 giây.'
      } else if (msg.includes('400')) {
        error.value = '❌ Thông tin không hợp lệ, kiểm tra lại form.'
      } else {
        error.value = '⚠️ Có lỗi xảy ra, vui lòng thử lại.'
      }
    } finally {
      isGenerating.value = false
    }
  }

  function reset() {
    currentPage.value = null
    error.value = null
  }

  return { isGenerating, error, currentPage, history, generate, reset }
})
