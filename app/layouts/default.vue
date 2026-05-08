<script setup lang="ts">
</script>

<template>
  <div class="min-h-screen bg-[#f8fafc]">
    <header class="sticky top-0 z-50 border-b border-gray-100 bg-white/80 shadow-sm backdrop-blur-md">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
        <NuxtLink to="/" class="flex items-center gap-2" aria-label="Trang chủ">
          <div class="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow">
            <span class="text-sm font-black">T</span>
          </div>
          <span class="font-bold text-gray-900">TrangDich<span class="text-blue-600">.vn</span></span>
        </NuxtLink>
        <nav aria-label="Điều hướng chính" class="flex items-center gap-4">
          <NuxtLink to="/pricing" class="hidden text-sm font-medium text-gray-500 hover:text-gray-900 sm:block">
            Bảng giá
          </NuxtLink>
          <NuxtLink
            to="/"
            class="rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:opacity-90 transition"
          >
            Tạo trang miễn phí
          </NuxtLink>
        </nav>
      </div>
    </header>

    <main>
      <slot />
    </main>

    <footer class="mt-16 border-t border-gray-100 bg-white px-4 py-8 text-center text-sm text-gray-400">
      <p class="font-medium text-gray-600">© 2026 TrangDich.vn</p>
      <p class="mt-1">Tạo landing page cho doanh nghiệp Việt Nam trong 30 giây · Powered by Gemini AI</p>
    </footer>
  </div>
</template>
