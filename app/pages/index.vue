<script setup lang="ts">
import { watch } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGeneratorStore } from '~/stores/modules'
import GeneratorForm from '~/features/generator/GeneratorForm.vue'

useSeoMeta({
  title: 'TrangDich.vn — Tạo landing page AI cho SME Việt Nam',
  description: 'Nhập thông tin doanh nghiệp, AI tạo trang web chuyên nghiệp trong 30 giây. Miễn phí, không cần kỹ thuật.',
})

const router = useRouter()
const store = useGeneratorStore()
const { currentPage } = storeToRefs(store)

// Tự động chuyển sang /preview khi tạo xong
watch(currentPage, (page) => {
  if (page) router.push('/preview')
})
</script>

<template>
  <div>
    <!-- Hero -->
    <section class="relative overflow-hidden bg-gradient-to-b from-blue-50 via-white to-white px-4 pb-12 pt-16">
      <div
        class="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-100 opacity-50 blur-3xl"
        aria-hidden="true"
      />
      <div class="relative mx-auto max-w-xl text-center">
        <div class="mb-5 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white px-4 py-1.5 text-xs font-semibold text-blue-700 shadow-sm">
          <span class="h-1.5 w-1.5 animate-pulse rounded-full bg-green-500" />
          Miễn phí · Không cần kỹ thuật · Chỉ 30 giây
        </div>
        <h1 class="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
          Landing page cho<br />
          <span class="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
            doanh nghiệp Việt Nam
          </span>
        </h1>
        <p class="mx-auto mt-4 max-w-sm text-base text-gray-500">
          Điền thông tin, AI viết nội dung và thiết kế trang ngay lập tức.
        </p>
      </div>
    </section>

    <!-- Form (căn giữa, không có preview bên cạnh) -->
    <section class="mx-auto max-w-lg px-4 pb-20 -mt-4">
      <GeneratorForm />

      <div class="mt-6 flex flex-wrap items-center justify-center gap-5 text-sm text-gray-400">
        <span>🏪 500+ doanh nghiệp đã dùng</span>
        <span>⭐ 4.9/5 đánh giá</span>
        <span>🤖 Groq · Llama 3.3</span>
      </div>
    </section>

    <!-- Features -->
    <section class="border-t border-gray-100 bg-white px-4 py-14">
      <div class="mx-auto max-w-4xl">
        <h2 class="mb-8 text-center text-xl font-bold text-gray-900">Tại sao chọn TrangDich.vn?</h2>
        <ul class="grid gap-4 sm:grid-cols-3" role="list">
          <li class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-lg">⚡</div>
            <h3 class="font-bold text-gray-900">30 giây</h3>
            <p class="mt-1 text-sm leading-relaxed text-gray-500">AI tạo toàn bộ nội dung và thiết kế ngay lập tức</p>
          </li>
          <li class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-red-100 text-lg">🇻🇳</div>
            <h3 class="font-bold text-gray-900">Tiếng Việt chuẩn</h3>
            <p class="mt-1 text-sm leading-relaxed text-gray-500">Nội dung đúng văn phong doanh nghiệp Việt Nam</p>
          </li>
          <li class="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div class="mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-green-100 text-lg">📈</div>
            <h3 class="font-bold text-gray-900">SEO sẵn sàng</h3>
            <p class="mt-1 text-sm leading-relaxed text-gray-500">Meta title, description và keywords tối ưu Google</p>
          </li>
        </ul>
      </div>
    </section>
  </div>
</template>
