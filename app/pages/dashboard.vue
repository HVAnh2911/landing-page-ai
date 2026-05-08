<script setup lang="ts">
import { useGeneratorStore } from '~/stores/modules'
import { storeToRefs } from 'pinia'

useSeoMeta({ title: 'Dashboard — TrangDich.vn' })

const store = useGeneratorStore()
const { history } = storeToRefs(store)
const router = useRouter()

const { data: pages, refresh } = await useFetch<Array<{
  id: string; slug: string; brand: string; industry: string
  color_primary: string; view_count: number; is_published: boolean; created_at: string
}>>('/api/pages')

function openPreview(slug: string) {
  window.open(`/p/${slug}`, '_blank')
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 60)  return `${m} phút trước`
  const h = Math.floor(m / 60)
  if (h < 24)  return `${h} giờ trước`
  return `${Math.floor(h / 24)} ngày trước`
}
</script>

<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Header -->
    <header class="sticky top-0 z-50 border-b border-gray-200 bg-white px-6 shadow-sm" style="height:56px">
      <div class="mx-auto flex h-full max-w-6xl items-center justify-between">
        <div class="flex items-center gap-3">
          <NuxtLink to="/" class="flex items-center gap-2">
            <div class="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-xs font-black text-white">T</div>
            <span class="font-bold text-gray-900">TrangDich<span class="text-blue-600">.vn</span></span>
          </NuxtLink>
          <span class="text-gray-300">/</span>
          <span class="text-sm font-semibold text-gray-700">Dashboard</span>
        </div>
        <NuxtLink
          to="/"
          class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
        >
          + Tạo trang mới
        </NuxtLink>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">
      <!-- Stats row -->
      <div class="mb-8 grid grid-cols-3 gap-4">
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Tổng trang</p>
          <p class="mt-1 text-3xl font-extrabold text-gray-900">{{ pages?.length ?? 0 }}</p>
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Đã publish</p>
          <p class="mt-1 text-3xl font-extrabold text-blue-600">{{ pages?.filter(p => p.is_published).length ?? 0 }}</p>
        </div>
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">Tổng lượt xem</p>
          <p class="mt-1 text-3xl font-extrabold text-gray-900">{{ pages?.reduce((s, p) => s + (p.view_count ?? 0), 0) ?? 0 }}</p>
        </div>
      </div>

      <!-- Pages list -->
      <div class="rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden">
        <div class="border-b border-gray-100 px-6 py-4">
          <h2 class="font-bold text-gray-900">Trang của tôi</h2>
        </div>

        <!-- Empty state -->
        <div v-if="!pages?.length" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">🌐</div>
          <p class="font-semibold text-gray-900">Chưa có trang nào</p>
          <p class="mt-1 text-sm text-gray-400">Tạo trang đầu tiên của bạn</p>
          <NuxtLink to="/" class="mt-4 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 transition">
            Tạo ngay
          </NuxtLink>
        </div>

        <!-- Table -->
        <table v-else class="w-full text-sm">
          <thead>
            <tr class="border-b border-gray-100 bg-gray-50 text-xs font-semibold uppercase tracking-wide text-gray-400">
              <th class="px-6 py-3 text-left">Thương hiệu</th>
              <th class="px-6 py-3 text-left">Ngành</th>
              <th class="px-6 py-3 text-left">Link</th>
              <th class="px-6 py-3 text-center">Lượt xem</th>
              <th class="px-6 py-3 text-left">Tạo lúc</th>
              <th class="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50">
            <tr v-for="p in pages" :key="p.id" class="hover:bg-gray-50 transition">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div
                    class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
                    :style="{ background: p.color_primary }"
                  >{{ p.brand.charAt(0) }}</div>
                  <span class="font-semibold text-gray-900">{{ p.brand }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-500">{{ p.industry }}</td>
              <td class="px-6 py-4">
                <span
                  v-if="p.is_published"
                  class="inline-flex items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
                  /p/{{ p.slug }}
                </span>
                <span v-else class="text-xs text-gray-400">Chưa publish</span>
              </td>
              <td class="px-6 py-4 text-center font-semibold text-gray-700">{{ p.view_count ?? 0 }}</td>
              <td class="px-6 py-4 text-gray-400">{{ relativeTime(p.created_at) }}</td>
              <td class="px-6 py-4 text-right">
                <button
                  v-if="p.is_published"
                  class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                  @click="openPreview(p.slug)"
                >
                  Xem trang →
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Local session history -->
      <div v-if="history.length" class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-bold text-gray-900">Session hiện tại</h3>
        <div class="flex flex-wrap gap-2">
          <span
            v-for="p in history"
            :key="p.createdAt"
            class="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600"
          >
            <span class="h-2 w-2 rounded-full" :style="{ background: p.input.colors.primary }" />
            {{ p.input.brand }}
          </span>
        </div>
      </div>
    </main>
  </div>
</template>
