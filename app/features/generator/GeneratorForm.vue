<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useGeneratorStore } from '~/stores/modules'
import type { GeneratorInput } from '~/stores/modules/generator/types'

const INDUSTRIES = [
  { label: 'Spa & Làm đẹp',       icon: '💆' },
  { label: 'Nhà hàng & Ăn uống',  icon: '🍜' },
  { label: 'Phòng khám & Y tế',   icon: '🏥' },
  { label: 'Giáo dục & Đào tạo',  icon: '📚' },
  { label: 'Xây dựng & Nội thất', icon: '🏠' },
  { label: 'Thời trang & Phụ kiện', icon: '👗' },
  { label: 'Du lịch & Khách sạn', icon: '✈️' },
  { label: 'Bất động sản',         icon: '🏢' },
  { label: 'Công nghệ & IT',       icon: '💻' },
  { label: 'Thể thao & Gym',       icon: '💪' },
  { label: 'Vận tải & Logistics',  icon: '🚚' },
  { label: 'Kế toán & Tư vấn',    icon: '📊' },
]

const store = useGeneratorStore()
const { isGenerating, error } = storeToRefs(store)

const form = reactive<GeneratorInput>({
  industry: '',
  brand: '',
  tagline: '',
  usp: '',
  phone: '',
  address: '',
  colors: { primary: '#2563eb', accent: '#f59e0b' },
})

const step = ref<1 | 2>(1)
const submitted = ref(false)

const step1Valid = computed(() => form.industry && form.brand && form.usp && form.phone)

function tryNext() {
  submitted.value = true
  if (step1Valid.value) {
    submitted.value = false
    step.value = 2
  }
}
</script>

<template>
  <div class="overflow-hidden rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.10)]">

    <!-- Step header -->
    <div class="flex border-b border-gray-100">
      <button
        type="button"
        class="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition"
        :class="step === 1 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'"
        @click="step = 1"
      >
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
          :class="step === 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'"
        >1</span>
        Thông tin
      </button>
      <div class="w-px bg-gray-100" />
      <button
        type="button"
        class="flex flex-1 items-center justify-center gap-2 py-4 text-sm font-semibold transition"
        :class="step === 2 ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-400 hover:text-gray-600'"
        :disabled="!step1Valid"
        @click="tryNext"
      >
        <span
          class="flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
          :class="step === 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'"
        >2</span>
        Tùy chỉnh
      </button>
    </div>

    <div class="p-6">

      <!-- ── STEP 1 ── -->
      <form v-if="step === 1" class="space-y-5" @submit.prevent="tryNext">

        <!-- Chọn ngành -->
        <div>
          <p class="mb-2 text-sm font-semibold text-gray-700">
            Ngành nghề <span class="text-red-500">*</span>
          </p>
          <div class="grid grid-cols-3 gap-2">
            <button
              v-for="ind in INDUSTRIES"
              :key="ind.label"
              type="button"
              class="flex flex-col items-center gap-1 rounded-xl border py-3 text-center transition"
              :class="form.industry === ind.label
                ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-400'
                : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'"
              @click="form.industry = ind.label"
            >
              <span class="text-xl leading-none">{{ ind.icon }}</span>
              <span class="text-[11px] font-medium leading-tight text-gray-700">{{ ind.label }}</span>
            </button>
          </div>
          <p v-if="submitted && !form.industry" class="mt-1.5 text-xs text-red-500">
            Vui lòng chọn ngành nghề
          </p>
        </div>

        <!-- Tên thương hiệu -->
        <div class="space-y-1.5">
          <label for="brand" class="block text-sm font-semibold text-gray-700">
            Tên thương hiệu <span class="text-red-500">*</span>
          </label>
          <input
            id="brand"
            v-model="form.brand"
            type="text"
            placeholder="VD: Lotus Spa, Phở Bắc Hà..."
            class="w-full rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2"
            :class="submitted && !form.brand
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'"
          />
          <p v-if="submitted && !form.brand" class="text-xs text-red-500">Vui lòng nhập tên thương hiệu</p>
        </div>

        <!-- USP -->
        <div class="space-y-1.5">
          <label for="usp" class="block text-sm font-semibold text-gray-700">
            Điểm nổi bật của bạn <span class="text-red-500">*</span>
          </label>
          <textarea
            id="usp"
            v-model="form.usp"
            rows="3"
            placeholder="VD: Dùng tinh dầu thiên nhiên 100%, kỹ thuật viên 5 năm kinh nghiệm, không gian yên tĩnh riêng tư..."
            class="w-full resize-none rounded-xl border bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2"
            :class="submitted && !form.usp
              ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'"
          />
          <p v-if="submitted && !form.usp" class="text-xs text-red-500">Vui lòng nhập điểm nổi bật</p>
          <p v-else class="text-xs text-gray-400">Càng chi tiết → AI tạo nội dung càng hay</p>
        </div>

        <!-- SĐT -->
        <div class="space-y-1.5">
          <label for="phone" class="block text-sm font-semibold text-gray-700">
            Số điện thoại <span class="text-red-500">*</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
            </span>
            <input
              id="phone"
              v-model="form.phone"
              type="tel"
              placeholder="0901 234 567"
              class="w-full rounded-xl border bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:bg-white focus:ring-2"
              :class="submitted && !form.phone
                ? 'border-red-400 focus:border-red-400 focus:ring-red-100'
                : 'border-gray-200 focus:border-blue-500 focus:ring-blue-100'"
            />
          </div>
          <p v-if="submitted && !form.phone" class="text-xs text-red-500">Vui lòng nhập số điện thoại</p>
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99]"
        >
          Tiếp theo →
        </button>
      </form>

      <!-- ── STEP 2 ── -->
      <form v-else class="space-y-5" @submit.prevent="store.generate({ ...form })">

        <!-- Tagline -->
        <div class="space-y-1.5">
          <label for="tagline" class="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            Tagline
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-400">Tùy chọn</span>
          </label>
          <input
            id="tagline"
            v-model="form.tagline"
            type="text"
            placeholder="VD: Chăm sóc bạn từ tận tâm"
            class="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
          />
        </div>

        <!-- Địa chỉ -->
        <div class="space-y-1.5">
          <label for="address" class="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            Địa chỉ
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-400">Tùy chọn</span>
          </label>
          <div class="relative">
            <span class="absolute inset-y-0 left-3.5 flex items-center text-gray-400">
              <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </span>
            <input
              id="address"
              v-model="form.address"
              type="text"
              placeholder="VD: 123 Nguyễn Huệ, Q1, TP.HCM"
              class="w-full rounded-xl border border-gray-200 bg-gray-50 py-3 pl-10 pr-4 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-100"
            />
          </div>
        </div>

        <!-- Màu -->
        <div class="space-y-2">
          <p class="flex items-center gap-1.5 text-sm font-semibold text-gray-700">
            Màu thương hiệu
            <span class="rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-normal text-gray-400">Tùy chọn</span>
          </p>
          <div class="grid grid-cols-2 gap-3">
            <label for="colorPrimary" class="cursor-pointer">
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div class="relative">
                  <div class="h-8 w-8 rounded-lg shadow-sm" :style="{ background: form.colors.primary }" />
                  <input
                    id="colorPrimary"
                    v-model="form.colors.primary"
                    type="color"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-700">Màu chính</p>
                  <p class="font-mono text-[11px] text-gray-400">{{ form.colors.primary }}</p>
                </div>
              </div>
            </label>
            <label for="colorAccent" class="cursor-pointer">
              <div
                class="flex items-center gap-3 rounded-xl border border-gray-200 bg-gray-50 px-3.5 py-3 transition hover:border-blue-300 hover:bg-blue-50"
              >
                <div class="relative">
                  <div class="h-8 w-8 rounded-lg shadow-sm" :style="{ background: form.colors.accent }" />
                  <input
                    id="colorAccent"
                    v-model="form.colors.accent"
                    type="color"
                    class="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
                <div>
                  <p class="text-xs font-semibold text-gray-700">Màu nhấn</p>
                  <p class="font-mono text-[11px] text-gray-400">{{ form.colors.accent }}</p>
                </div>
              </div>
            </label>
          </div>
        </div>

        <!-- Error -->
        <div v-if="error" role="alert" class="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <span class="mt-0.5 shrink-0 text-base">⚠️</span>
          <span>{{ error }}</span>
        </div>

        <!-- Summary chip -->
        <div class="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm">
          <p class="font-semibold text-blue-800">{{ form.brand }} · {{ form.industry }}</p>
          <p class="mt-0.5 line-clamp-1 text-xs text-blue-500">{{ form.usp }}</p>
        </div>

        <div class="flex gap-2.5">
          <button
            type="button"
            class="rounded-xl border border-gray-200 px-4 py-3.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-50 active:scale-[0.99]"
            @click="step = 1"
          >
            ← Quay lại
          </button>
          <button
            type="submit"
            :disabled="isGenerating"
            class="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-600 py-3.5 text-sm font-bold text-white shadow-sm transition hover:bg-blue-700 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <svg v-if="isGenerating" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4" />
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            {{ isGenerating ? 'AI đang tạo trang...' : '✨ Tạo trang ngay' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
