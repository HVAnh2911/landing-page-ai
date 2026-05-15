<script setup lang="ts">
import { ref, computed, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useGeneratorStore } from '~/stores/modules'
import LandingPreview from '~/features/generator/LandingPreview.vue'
import { useHtmlExport } from '~/composables/useHtmlExport'

definePageMeta({ layout: false })

const router   = useRouter()
const store    = useGeneratorStore()
const { currentPage } = storeToRefs(store)
const { download }    = useHtmlExport()
const { isLoggedIn } = useAuth()
const supabase = useSupabaseClient()

if (!currentPage.value) router.replace('/')

type Device = 'mobile' | 'tablet' | 'desktop'
const device = ref<Device>('desktop')

const devices: { id: Device; label: string; width: string }[] = [
  { id: 'mobile',  label: 'Mobile',  width: '390px' },
  { id: 'tablet',  label: 'Tablet',  width: '768px' },
  { id: 'desktop', label: 'Desktop', width: '100%'  },
]

const current       = computed(() => devices.find(d => d.id === device.value)!)
const isConstrained = computed(() => device.value !== 'desktop')

// ── Upgrade modal (Export HTML) ──
const showUpgrade = ref(false)

// ── Payment QR modal ──
const showPayment    = ref(false)
const paymentTimer   = ref(0)
const paymentStatus  = ref<'waiting' | 'checking' | 'success' | 'error'>('waiting')
const orderCode      = ref('')

let _payInterval:  ReturnType<typeof setInterval> | null = null
let _pollInterval: ReturnType<typeof setInterval> | null = null

const timerDisplay = computed(() => {
  const m = Math.floor(paymentTimer.value / 60).toString().padStart(2, '0')
  const s = (paymentTimer.value % 60).toString().padStart(2, '0')
  return `${m}:${s}`
})

// Tạo mã đơn hàng unique: TD + timestamp 6 chữ số cuối
function genOrderCode() {
  return 'TD' + Date.now().toString().slice(-6)
}

function openPayment() {
  showUpgrade.value   = false
  showPayment.value   = true
  paymentStatus.value = 'waiting'
  orderCode.value     = genOrderCode()
  paymentTimer.value  = 5 * 60

  // Đếm ngược
  _payInterval = setInterval(() => {
    paymentTimer.value--
    if (paymentTimer.value <= 0) closePayment()
  }, 1000)

  // Poll SePay mỗi 4 giây
  _pollInterval = setInterval(async () => {
    if (paymentStatus.value === 'success') return
    paymentStatus.value = 'checking'
    try {
      const res = await $fetch<{ paid: boolean }>('/api/check-payment', {
        query: { code: orderCode.value },
      })
      if (res.paid) {
        paymentStatus.value = 'success'
        stopIntervals()
        if (!currentPage.value) return
        await nextTick()
        download(currentPage.value)
        // Đóng modal sau 1.5s để user thấy thông báo thành công
        setTimeout(() => { showPayment.value = false }, 1500)
      } else {
        paymentStatus.value = 'waiting'
      }
    } catch {
      paymentStatus.value = 'waiting'
    }
  }, 4000)
}

function stopIntervals() {
  if (_payInterval)  { clearInterval(_payInterval);  _payInterval  = null }
  if (_pollInterval) { clearInterval(_pollInterval); _pollInterval = null }
}

function closePayment() {
  stopIntervals()
  showPayment.value = false
  paymentStatus.value = 'waiting'
}

// ── Publish ──
const publishing   = ref(false)
const publishedUrl = ref('')
const showPublishSuccess = ref(false)
const publishError = ref('')

async function handlePublish() {
  if (!currentPage.value) return

  if (!isLoggedIn.value) {
    await navigateTo('/login?redirect=/preview')
    return
  }

  publishing.value   = true
  publishError.value = ''
  try {
    const { data: sessionData } = await supabase.auth.getSession()
    const token = sessionData.session?.access_token ?? ''

    const res = await $fetch<{ url: string; slug: string }>('/api/publish', {
      method: 'POST',
      body: { page: currentPage.value, publish: true },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
    publishedUrl.value        = res.url
    showPublishSuccess.value  = true
  } catch (e: unknown) {
    publishError.value = e instanceof Error ? e.message : 'Lỗi khi publish'
  } finally {
    publishing.value = false
  }
}

const copied = ref(false)
async function copyLink() {
  await navigator.clipboard.writeText(publishedUrl.value)
  copied.value = true
  setTimeout(() => (copied.value = false), 2000)
}
</script>

<template>
  <div
    v-if="currentPage"
    style="height:100dvh;display:flex;flex-direction:column;overflow:hidden"
    class="bg-[#e8eaed]"
  >

    <!-- ════ HEADER ════ -->
    <header
      style="flex-shrink:0;height:56px;z-index:50"
      class="flex items-center gap-3 border-b border-gray-200 bg-white px-4 shadow-sm"
    >
      <!-- Back -->
      <button
        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
        @click="router.push('/')"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        Trang chủ
      </button>

      <div class="h-5 w-px bg-gray-200" />

      <!-- Brand -->
      <div class="flex min-w-0 items-center gap-2">
        <div
          class="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-extrabold text-white"
          :style="{ background: currentPage.input.colors.primary }"
        >{{ currentPage.input.brand.charAt(0).toUpperCase() }}</div>
        <div class="min-w-0 leading-tight">
          <p class="truncate text-sm font-bold text-gray-900">{{ currentPage.input.brand }}</p>
          <p class="truncate text-[11px] text-gray-400">{{ currentPage.input.industry }}</p>
        </div>
      </div>

      <div class="flex-1" />

      <!-- Device switcher -->
      <div class="flex items-center gap-0.5 rounded-xl border border-gray-200 bg-gray-100 p-1">
        <button
          v-for="d in devices"
          :key="d.id"
          :title="`${d.label}${d.id !== 'desktop' ? ' · ' + d.width : ''}`"
          class="relative flex flex-col items-center justify-center gap-[3px] rounded-lg transition-all duration-150"
          style="width:52px;height:38px"
          :class="device === d.id ? 'bg-white shadow text-blue-600' : 'text-gray-400 hover:text-gray-600'"
          @click="device = d.id"
        >
          <!-- Mobile -->
          <svg v-if="d.id === 'mobile'" width="13" height="19" viewBox="0 0 13 19" fill="none">
            <rect x=".75" y=".75" width="11.5" height="17.5" rx="2.25" stroke="currentColor" stroke-width="1.5"/>
            <line x1="4.5" y1="2.75" x2="8.5" y2="2.75" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/>
            <rect x="5.25" y="15.25" width="2.5" height="1.5" rx=".75" fill="currentColor"/>
          </svg>
          <!-- Tablet -->
          <svg v-else-if="d.id === 'tablet'" width="17" height="19" viewBox="0 0 17 19" fill="none">
            <rect x=".75" y=".75" width="15.5" height="17.5" rx="2.25" stroke="currentColor" stroke-width="1.5"/>
            <rect x="6.75" y="15.25" width="3.5" height="1.5" rx=".75" fill="currentColor"/>
            <line x1="3" y1="3.5" x2="14" y2="3.5" stroke="currentColor" stroke-width="1.1" stroke-linecap="round" opacity=".4"/>
          </svg>
          <!-- Desktop -->
          <svg v-else width="21" height="19" viewBox="0 0 21 19" fill="none">
            <rect x=".75" y=".75" width="19.5" height="12.5" rx="1.75" stroke="currentColor" stroke-width="1.5"/>
            <path d="M7 17h7M10.5 13.25V17" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
          </svg>
          <span class="text-[9px] font-semibold leading-none">{{ d.label }}</span>
        </button>
      </div>

      <!-- Width badge -->
      <span class="w-12 text-center font-mono text-xs text-gray-400 tabular-nums">
        {{ current.id === 'desktop' ? '100%' : current.width }}
      </span>

      <div class="h-5 w-px bg-gray-200" />

      <!-- Dashboard link -->
      <NuxtLink
        to="/dashboard"
        class="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-gray-500 transition hover:bg-gray-100"
      >
        <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
          <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
        </svg>
        Dashboard
      </NuxtLink>

      <!-- Publish button -->
      <button
        class="flex items-center gap-1.5 rounded-xl border border-gray-200 px-3.5 py-2 text-sm font-semibold text-gray-700 transition hover:border-blue-400 hover:text-blue-600 disabled:opacity-50"
        :disabled="publishing"
        @click="handlePublish"
      >
        <svg v-if="!publishing" class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
        </svg>
        <svg v-else class="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
        </svg>
        {{ publishing ? 'Đang publish...' : 'Publish' }}
      </button>

      <!-- Export HTML (paid) -->
      <button
        class="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:opacity-90"
        style="background:linear-gradient(135deg,#2563eb,#4f46e5)"
        @click="showUpgrade = true"
      >
        <svg class="h-3.5 w-3.5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
        </svg>
        Xuất HTML
        <span class="rounded-md bg-white/25 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wide">Pro</span>
      </button>
    </header>

    <!-- ════ CANVAS ════ -->
    <main style="flex:1;min-height:0;overflow-y:auto">
      <div
        class="flex min-h-full justify-center transition-all duration-300"
        :class="isConstrained ? 'items-start py-8 px-4' : 'items-start'"
      >
        <div
          class="w-full bg-white transition-all duration-300"
          :class="isConstrained ? 'shadow-2xl' : ''"
          :style="isConstrained ? {
            maxWidth: current.width,
            borderRadius: device === 'mobile' ? '28px' : '16px',
            border: '8px solid #111827',
            overflow: 'hidden',
          } : {}"
        >
          <!-- Status bar -->
          <div v-if="isConstrained" class="flex items-center justify-between bg-gray-900 px-4" style="height:26px">
            <span class="text-[10px] font-semibold text-gray-300">9:41</span>
            <div v-if="device === 'mobile'" class="h-2.5 w-16 rounded-full bg-gray-700" />
            <div class="flex items-center gap-1.5">
              <svg width="12" height="9" viewBox="0 0 12 9" fill="none">
                <rect x="0" y="6" width="2" height="3" rx=".5" fill="#6b7280"/>
                <rect x="3" y="4" width="2" height="5" rx=".5" fill="#6b7280"/>
                <rect x="6" y="2" width="2" height="7" rx=".5" fill="#6b7280"/>
                <rect x="9" y="0" width="2" height="9" rx=".5" fill="#d1d5db"/>
              </svg>
              <svg width="18" height="9" viewBox="0 0 18 9" fill="none">
                <rect x=".5" y=".5" width="14" height="8" rx="1.5" stroke="#6b7280"/>
                <rect x="15.5" y="2.5" width="2" height="4" rx="1" fill="#6b7280"/>
                <rect x="2" y="2" width="8" height="5" rx="1" fill="#d1d5db"/>
              </svg>
            </div>
          </div>

          <LandingPreview :page="currentPage" :device="device" />
        </div>
      </div>
    </main>

    <!-- ════ MODAL: Upgrade to Pro ════ -->
    <Teleport to="body">
      <div
        v-if="showUpgrade"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,.5);backdrop-filter:blur(4px)"
        @click.self="showUpgrade = false"
      >
        <div class="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl">
          <!-- Header gradient -->
          <div class="bg-gradient-to-br from-blue-600 to-indigo-600 px-6 py-8 text-center text-white">
            <div class="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20">
              <svg class="h-7 w-7" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/>
              </svg>
            </div>
            <h3 class="text-xl font-extrabold">Xuất file HTML</h3>
            <p class="mt-1 text-sm text-blue-100">Tính năng dành cho gói Pro</p>
          </div>

          <div class="p-6">
            <ul class="mb-6 space-y-3">
              <li v-for="f in ['Tải file HTML hoàn chỉnh, dùng ngay', 'Tự host trên bất kỳ server nào', 'Không watermark, code sạch 100%', 'Responsive Mobile + Tablet + Desktop', 'Hỗ trợ SEO đầy đủ']"
                :key="f"
                class="flex items-center gap-2.5 text-sm text-gray-700"
              >
                <svg class="h-4 w-4 shrink-0 text-blue-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
                {{ f }}
              </li>
            </ul>

            <div class="mb-4 rounded-xl bg-blue-50 p-4 text-center">
              <p class="text-2xl font-extrabold text-blue-700">99.000 ₫<span class="text-sm font-normal text-blue-400">/tháng</span></p>
              <p class="mt-0.5 text-xs text-blue-400">Hoặc 799.000 ₫/năm — tiết kiệm 33%</p>
            </div>

            <button
              class="w-full rounded-xl py-3 text-sm font-bold text-white shadow-sm transition hover:opacity-90"
              style="background:linear-gradient(135deg,#2563eb,#4f46e5)"
              @click="openPayment"
            >
              Thanh toán & Tải HTML ngay
            </button>
            <button class="mt-2 w-full rounded-xl py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50 transition" @click="showUpgrade = false">
              Để sau
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════ MODAL: QR Thanh toán ════ -->
    <Teleport to="body">
      <div
        v-if="showPayment"
        class="fixed inset-0 z-[110] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,.6);backdrop-filter:blur(6px)"
        @click.self="closePayment"
      >
        <div class="w-full max-w-xs overflow-hidden rounded-2xl bg-white shadow-2xl">
          <!-- Top bar -->
          <div class="flex items-center justify-between border-b border-gray-100 px-5 py-3.5">
            <div>
              <p class="text-sm font-extrabold text-gray-900">Thanh toán chuyển khoản</p>
              <p class="text-xs text-gray-400">Quét mã QR bằng app ngân hàng</p>
            </div>
            <!-- Countdown -->
            <div
              class="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold tabular-nums"
              :class="paymentTimer < 60 ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-gray-600'"
            >
              <svg class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
              </svg>
              {{ timerDisplay }}
            </div>
          </div>

          <!-- QR code -->
          <div class="flex flex-col items-center px-5 py-5">

            <!-- Trạng thái thành công -->
            <div v-if="paymentStatus === 'success'" class="flex flex-col items-center py-6 gap-3">
              <div class="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <svg class="h-8 w-8 text-green-600" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <p class="text-base font-extrabold text-green-700">Thanh toán thành công!</p>
              <p class="text-xs text-gray-400">File HTML đang được tải xuống...</p>
            </div>

            <template v-else>
              <div class="mb-3 overflow-hidden rounded-xl border-2 border-blue-100 p-2 shadow-sm">
                <img
                  :src="`https://img.vietqr.io/image/VIB-366760872-qr_only.png?amount=99000&addInfo=${orderCode}&accountName=HOANG%20VAN%20ANH`"
                  alt="QR thanh toán"
                  class="h-44 w-44 object-contain"
                  loading="eager"
                />
              </div>

              <!-- Bank info -->
              <div class="w-full space-y-2 rounded-xl bg-gray-50 px-4 py-3 text-xs">
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Ngân hàng</span>
                  <span class="font-bold text-gray-800">VIB Bank</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Số tài khoản</span>
                  <span class="font-bold text-gray-800 tracking-wide">366 760 872</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Chủ TK</span>
                  <span class="font-bold text-gray-800">HOANG VAN ANH</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Số tiền</span>
                  <span class="font-extrabold text-blue-600">99.000 ₫</span>
                </div>
                <div class="flex items-center justify-between">
                  <span class="text-gray-400">Nội dung CK</span>
                  <span class="font-bold text-blue-700 tracking-wide">{{ orderCode }}</span>
                </div>
              </div>

              <!-- Trạng thái polling -->
              <div class="mt-3 flex items-center gap-1.5 text-[11px]"
                :class="paymentStatus === 'checking' ? 'text-blue-500' : 'text-gray-400'"
              >
                <svg v-if="paymentStatus === 'checking'" class="h-3 w-3 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <svg v-else class="h-3 w-3" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="10"/><path stroke-linecap="round" d="M12 6v6l4 2"/>
                </svg>
                {{ paymentStatus === 'checking' ? 'Đang kiểm tra giao dịch...' : 'Tự động xác nhận sau khi chuyển khoản' }}
              </div>
            </template>
          </div>

          <!-- Actions -->
          <div v-if="paymentStatus !== 'success'" class="border-t border-gray-100 px-5 pb-5">
            <button
              class="mt-2 w-full rounded-xl py-2 text-xs font-medium text-gray-400 transition hover:text-gray-600"
              @click="closePayment"
            >
              Hủy
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- ════ MODAL: Publish thành công ════ -->
    <Teleport to="body">
      <div
        v-if="showPublishSuccess"
        class="fixed inset-0 z-[100] flex items-center justify-center p-4"
        style="background:rgba(0,0,0,.5);backdrop-filter:blur(4px)"
        @click.self="showPublishSuccess = false"
      >
        <div class="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl text-center">
          <div class="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100 text-2xl">🎉</div>
          <h3 class="text-lg font-extrabold text-gray-900">Trang đã được publish!</h3>
          <p class="mt-1 text-sm text-gray-400">Chia sẻ link này với khách hàng</p>

          <div class="mt-4 flex items-center gap-2 rounded-xl border border-gray-200 bg-gray-50 px-3 py-2.5">
            <span class="flex-1 truncate text-left text-sm font-medium text-blue-600">{{ publishedUrl }}</span>
            <button
              class="shrink-0 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-700 transition"
              @click="copyLink"
            >
              {{ copied ? '✓ Đã copy' : 'Copy' }}
            </button>
          </div>

          <a
            :href="publishedUrl"
            target="_blank"
            class="mt-3 flex items-center justify-center gap-1.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
          >
            Mở trang →
          </a>
          <button class="mt-2 w-full text-sm text-gray-400 hover:text-gray-600 transition" @click="showPublishSuccess = false">Đóng</button>
        </div>
      </div>
    </Teleport>

    <!-- Publish error toast -->
    <div
      v-if="publishError"
      class="fixed bottom-6 left-1/2 z-[200] -translate-x-1/2 rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white shadow-lg"
    >
      ⚠️ {{ publishError }}
    </div>
  </div>
</template>
