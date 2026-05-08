<script setup lang="ts">
import { computed } from 'vue'
import type { GeneratedPage } from '~/stores/modules/generator/types'

interface Props {
  page: GeneratedPage
  device?: 'mobile' | 'tablet' | 'desktop'
}

const props = defineProps<Props>()

const primary = computed(() => props.page.input.colors.primary)
const accent  = computed(() => props.page.input.colors.accent)

// Services grid: desktop=3, tablet=2, mobile=1
const servicesGrid = computed(() => {
  if (props.device === 'mobile')  return 'grid-cols-1'
  if (props.device === 'tablet')  return 'grid-cols-2'
  return 'grid-cols-3'
})

// Testimonials grid
const testimonialsGrid = computed(() =>
  props.device === 'mobile' ? 'grid-cols-1' : 'grid-cols-2',
)

// Hero text size
const heroTitle = computed(() =>
  props.device === 'mobile' ? 'text-2xl' : props.device === 'tablet' ? 'text-3xl' : 'text-4xl',
)
</script>

<template>
  <article class="overflow-hidden bg-white">

    <!-- ── HERO ── -->
    <section
      class="relative overflow-hidden"
      :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }"
    >
      <img
        v-if="page.unsplashImageUrl"
        :src="page.unsplashImageUrl"
        :alt="page.input.brand"
        class="absolute inset-0 h-full w-full object-cover opacity-20"
        loading="lazy"
      />
      <div class="relative z-10 flex flex-col items-center px-6 pb-14 pt-10 text-center text-white">

        <!-- Brand logo badge -->
        <div class="mb-5 flex flex-col items-center gap-2">
          <div
            class="flex items-center justify-center rounded-2xl font-black text-white shadow-lg ring-2 ring-white/30"
            :style="{
              width: device === 'mobile' ? '52px' : '64px',
              height: device === 'mobile' ? '52px' : '64px',
              fontSize: device === 'mobile' ? '22px' : '28px',
              background: 'rgba(255,255,255,0.18)',
              backdropFilter: 'blur(8px)',
            }"
          >
            {{ page.input.brand.charAt(0).toUpperCase() }}
          </div>
          <span class="rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold backdrop-blur-sm">
            {{ page.input.brand }}
          </span>
        </div>

        <h1
          class="font-extrabold leading-tight tracking-tight drop-shadow-sm"
          :class="heroTitle"
        >
          {{ page.content.hero.headline }}
        </h1>
        <p class="mt-3 max-w-lg text-base opacity-90 leading-relaxed">
          {{ page.content.hero.subheadline }}
        </p>
        <a
          :href="`tel:${page.content.hero.ctaPhone}`"
          class="mt-7 inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition hover:opacity-90"
          :style="{ background: '#fff', color: primary }"
        >
          📞 {{ page.content.hero.ctaText }}
        </a>
      </div>
    </section>

    <!-- ── ABOUT ── -->
    <section class="px-6 py-12 text-center">
      <h2 class="text-xl font-bold" :style="{ color: primary }">
        {{ page.content.about.title }}
      </h2>
      <p class="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-gray-600">
        {{ page.content.about.body }}
      </p>
    </section>

    <!-- ── SERVICES ── -->
    <section class="bg-gray-50 px-6 py-12">
      <h2 class="mb-8 text-center text-xl font-bold text-gray-900">Dịch vụ của chúng tôi</h2>
      <ul class="grid gap-4" :class="servicesGrid" role="list">
        <li
          v-for="service in page.content.services"
          :key="service.title"
          class="rounded-xl bg-white p-5 shadow-sm transition hover:shadow-md"
        >
          <span class="text-2xl">{{ service.icon }}</span>
          <h3 class="mt-2.5 text-sm font-bold text-gray-900">{{ service.title }}</h3>
          <p class="mt-1 text-xs leading-relaxed text-gray-500">{{ service.description }}</p>
        </li>
      </ul>
    </section>

    <!-- ── TESTIMONIALS ── -->
    <section class="px-6 py-12">
      <h2 class="mb-8 text-center text-xl font-bold text-gray-900">Khách hàng nói gì?</h2>
      <ul class="grid gap-4" :class="testimonialsGrid" role="list">
        <li
          v-for="t in page.content.testimonials"
          :key="t.name"
          class="rounded-xl border border-gray-100 bg-gray-50 p-5"
        >
          <div class="flex gap-0.5">
            <span v-for="n in 5" :key="n" :class="n <= t.rating ? 'text-yellow-400' : 'text-gray-200'" class="text-base">★</span>
          </div>
          <blockquote class="mt-2.5 text-sm leading-relaxed text-gray-700">"{{ t.content }}"</blockquote>
          <footer class="mt-3 flex items-center gap-2">
            <div
              class="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              :style="{ background: primary }"
            >{{ t.name.charAt(0) }}</div>
            <div>
              <p class="text-xs font-bold text-gray-900">{{ t.name }}</p>
              <p class="text-[11px] text-gray-400">{{ t.role }}</p>
            </div>
          </footer>
        </li>
      </ul>
    </section>

    <!-- ── FAQ ── -->
    <section class="bg-gray-50 px-6 py-12">
      <h2 class="mb-8 text-center text-xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
      <dl class="mx-auto max-w-2xl space-y-3">
        <div
          v-for="faq in page.content.faq"
          :key="faq.question"
          class="rounded-xl border border-gray-200 bg-white px-5 py-4"
        >
          <dt class="text-sm font-bold text-gray-900">{{ faq.question }}</dt>
          <dd class="mt-1.5 text-xs leading-relaxed text-gray-500">{{ faq.answer }}</dd>
        </div>
      </dl>
    </section>

    <!-- ── CONTACT ── -->
    <section
      class="px-6 py-12 text-center text-white"
      :style="{ background: `linear-gradient(135deg, ${primary} 0%, ${accent} 100%)` }"
    >
      <h2 class="text-xl font-bold">{{ page.content.contact.title }}</h2>
      <p class="mt-1.5 text-sm opacity-90">{{ page.content.contact.subtitle }}</p>
      <div class="mt-6 flex flex-col items-center gap-2 text-sm">
        <p class="opacity-90">📞 {{ page.content.contact.phone }}</p>
        <p v-if="page.content.contact.address" class="opacity-75 text-xs">
          📍 {{ page.content.contact.address }}
        </p>
      </div>
      <a
        :href="`tel:${page.content.contact.phone}`"
        class="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-bold shadow-lg transition hover:opacity-90"
        :style="{ background: '#fff', color: primary }"
      >
        📲 Gọi ngay miễn phí
      </a>
    </section>

    <!-- ── SEO (chỉ hiện trong editor) ── -->
    <aside class="border-t border-dashed border-blue-100 bg-blue-50 px-6 py-5">
      <p class="text-[10px] font-bold uppercase tracking-widest text-blue-500">SEO Meta</p>
      <p class="mt-1 text-xs font-semibold text-gray-800">{{ page.content.seo.title }}</p>
      <p class="mt-0.5 text-[11px] text-gray-500">{{ page.content.seo.description }}</p>
      <div class="mt-2 flex flex-wrap gap-1">
        <span
          v-for="kw in page.content.seo.keywords"
          :key="kw"
          class="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] text-blue-600"
        >{{ kw }}</span>
      </div>
    </aside>

  </article>
</template>
