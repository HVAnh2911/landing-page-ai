<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { useGeneratorStore } from '~/stores/modules'

definePageMeta({ middleware: 'auth', layout: false })
useSeoMeta({ title: 'Dashboard — TrangDich.vn' })

const { user, isAdmin, signOut } = useAuth()
const supabase = useSupabaseClient()
const store    = useGeneratorStore()
const { history } = storeToRefs(store)

// Lấy access token để truyền vào header
const session  = ref<string | null>(null)
const { data: sessionData } = await supabase.auth.getSession()
session.value = sessionData.session?.access_token ?? null

const { data: pages, refresh } = await useFetch<Array<{
  id: string; slug: string; brand: string; industry: string
  color_primary: string; view_count: number; is_published: boolean
  created_at: string; user_id: string
}>>('/api/pages', {
  headers: computed(() => session.value ? { Authorization: `Bearer ${session.value}` } : {}),
})

// Xoá trang khỏi DB
const deletingId = ref<string | null>(null)
async function deletePage(id: string) {
  if (!confirm('Bạn chắc chắn muốn xoá trang này?')) return
  deletingId.value = id
  await $fetch(`/api/pages/${id}`, {
    method: 'DELETE',
    headers: session.value ? { Authorization: `Bearer ${session.value}` } : {},
  }).catch(() => null)
  deletingId.value = null
  await refresh()
}

function openPage(slug: string) {
  window.open(`/p/${slug}`, '_blank')
}

function previewPage(id: string) {
  window.open(`/p/preview/${id}`, '_blank')
}

const publishingId = ref<string | null>(null)
async function togglePublish(p: { id: string; slug: string; is_published: boolean }) {
  publishingId.value = p.id
  try {
    await $fetch(`/api/pages/${p.id}/publish`, {
      method: 'PATCH',
      body: { is_published: !p.is_published },
      headers: session.value ? { Authorization: `Bearer ${session.value}` } : {},
    })
    await refresh()
  } catch {
    // bỏ qua
  } finally {
    publishingId.value = null
  }
}

function relativeTime(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m    = Math.floor(diff / 60000)
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
          <span
            v-if="isAdmin"
            class="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-indigo-600"
          >Admin</span>
        </div>

        <div class="flex items-center gap-3">
          <!-- User info -->
          <div class="flex items-center gap-2">
            <div class="flex h-7 w-7 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-600">
              {{ user?.email?.charAt(0).toUpperCase() }}
            </div>
            <span class="hidden text-sm text-gray-600 sm:block">{{ user?.email }}</span>
          </div>

          <button
            class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-500 transition hover:border-red-200 hover:text-red-500"
            @click="signOut"
          >Đăng xuất</button>

          <NuxtLink
            to="/"
            class="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 transition"
          >
            + Tạo trang mới
          </NuxtLink>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-6xl px-6 py-8">

      <!-- Stats -->
      <div class="mb-8 grid grid-cols-3 gap-4">
        <div class="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p class="text-sm text-gray-500">{{ isAdmin ? 'Tổng trang (tất cả user)' : 'Trang của tôi' }}</p>
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
        <div class="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 class="font-bold text-gray-900">{{ isAdmin ? 'Tất cả trang' : 'Trang của tôi' }}</h2>
          <button class="text-xs text-gray-400 hover:text-gray-600 transition" @click="refresh()">Làm mới</button>
        </div>

        <!-- Empty -->
        <div v-if="!pages?.length" class="flex flex-col items-center justify-center py-20 text-center">
          <div class="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-3xl">🌐</div>
          <p class="font-semibold text-gray-900">Chưa có trang nào</p>
          <p class="mt-1 text-sm text-gray-400">Tạo trang đầu tiên ngay bây giờ</p>
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
                  class="inline-flex cursor-pointer items-center gap-1 rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700 hover:bg-green-100 transition"
                  @click="openPage(p.slug)"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-green-500" />
                  /p/{{ p.slug }}
                </span>
                <span v-else class="text-xs text-gray-400">Chưa publish</span>
              </td>
              <td class="px-6 py-4 text-center font-semibold text-gray-700">{{ p.view_count ?? 0 }}</td>
              <td class="px-6 py-4 text-gray-400">{{ relativeTime(p.created_at) }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center justify-end gap-2">
                  <!-- Xem trang (mở tab mới, không cần publish) -->
                  <button
                    class="flex items-center gap-1 rounded-lg border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-600 transition hover:bg-blue-100"
                    @click="previewPage(p.id)"
                  >
                    <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                    </svg>
                    Xem
                  </button>
                  <!-- Toggle publish -->
                  <button
                    class="flex items-center gap-1 rounded-lg border px-3 py-1.5 text-xs font-semibold transition disabled:opacity-40"
                    :class="p.is_published
                      ? 'border-orange-100 bg-orange-50 text-orange-600 hover:bg-orange-100'
                      : 'border-green-100 bg-green-50 text-green-600 hover:bg-green-100'"
                    :disabled="publishingId === p.id"
                    @click="togglePublish(p)"
                  >
                    <svg v-if="publishingId === p.id" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                      <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                    </svg>
                    {{ publishingId === p.id ? '...' : p.is_published ? 'Huỷ public' : 'Public' }}
                  </button>
                  <!-- Mở trang public (nếu đã publish) -->
                  <button
                    v-if="p.is_published"
                    class="rounded-lg border border-gray-200 px-3 py-1.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 transition"
                    @click="openPage(p.slug)"
                  >Xem trang →</button>
                  <button
                    class="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-50 disabled:opacity-40"
                    :disabled="deletingId === p.id"
                    @click="deletePage(p.id)"
                  >{{ deletingId === p.id ? '...' : 'Xoá' }}</button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Local session history (chỉ hiện nếu có) -->
      <div v-if="history.length" class="mt-6 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h3 class="mb-4 font-bold text-gray-900">Đã tạo trong phiên này (chưa lưu)</h3>
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
