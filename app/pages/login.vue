<script setup lang="ts">
definePageMeta({ layout: false })
useSeoMeta({ title: 'Đăng nhập — TrangDich.vn' })

const supabase  = useSupabaseClient()
const user      = useSupabaseUser()
const router    = useRouter()
const route     = useRoute()

// Nếu đã đăng nhập thì redirect luôn
if (user.value) {
  await navigateTo((route.query.redirect as string) || '/dashboard')
}

type Tab = 'login' | 'register'
const tab       = ref<Tab>('login')
const email     = ref('')
const password  = ref('')
const fullName  = ref('')
const loading   = ref(false)
const error     = ref('')
const success   = ref('')

async function handleLogin() {
  error.value   = ''
  loading.value = true
  const { error: e } = await supabase.auth.signInWithPassword({
    email: email.value.trim(),
    password: password.value,
  })
  loading.value = false
  if (e) { error.value = e.message; return }
  await navigateTo((route.query.redirect as string) || '/dashboard')
}

async function handleRegister() {
  error.value   = ''
  success.value = ''
  loading.value = true
  const { error: e } = await supabase.auth.signUp({
    email: email.value.trim(),
    password: password.value,
    options: { data: { full_name: fullName.value.trim() } },
  })
  loading.value = false
  if (e) { error.value = e.message; return }
  success.value = 'Đăng ký thành công! Kiểm tra email để xác nhận tài khoản.'
}

async function handleGoogle() {
  await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: `${window.location.origin}/dashboard` },
  })
}
</script>

<template>
  <div class="flex min-h-screen items-center justify-center bg-gray-50 px-4">
    <div class="w-full max-w-sm">

      <!-- Logo -->
      <div class="mb-8 text-center">
        <NuxtLink to="/" class="inline-flex items-center gap-2">
          <div class="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-indigo-600 text-sm font-black text-white">T</div>
          <span class="text-xl font-extrabold text-gray-900">TrangDich<span class="text-blue-600">.vn</span></span>
        </NuxtLink>
        <p class="mt-2 text-sm text-gray-500">Tạo landing page bằng AI trong 30 giây</p>
      </div>

      <div class="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">

        <!-- Tabs -->
        <div class="flex border-b border-gray-100">
          <button
            class="flex-1 py-3.5 text-sm font-semibold transition"
            :class="tab === 'login' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'"
            @click="tab = 'login'; error = ''; success = ''"
          >Đăng nhập</button>
          <button
            class="flex-1 py-3.5 text-sm font-semibold transition"
            :class="tab === 'register' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-400 hover:text-gray-600'"
            @click="tab = 'register'; error = ''; success = ''"
          >Đăng ký</button>
        </div>

        <div class="p-6">

          <!-- Google -->
          <button
            class="mb-4 flex w-full items-center justify-center gap-2.5 rounded-xl border border-gray-200 py-2.5 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
            @click="handleGoogle"
          >
            <svg class="h-4 w-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Tiếp tục với Google
          </button>

          <div class="mb-4 flex items-center gap-3">
            <div class="flex-1 border-t border-gray-100" />
            <span class="text-xs text-gray-400">hoặc</span>
            <div class="flex-1 border-t border-gray-100" />
          </div>

          <!-- Form register -->
          <div v-if="tab === 'register'" class="mb-3">
            <label class="mb-1.5 block text-xs font-semibold text-gray-600">Họ tên</label>
            <input
              v-model="fullName"
              type="text"
              placeholder="Nguyễn Văn A"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
            />
          </div>

          <div class="mb-3">
            <label class="mb-1.5 block text-xs font-semibold text-gray-600">Email</label>
            <input
              v-model="email"
              type="email"
              placeholder="ban@email.com"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              @keydown.enter="tab === 'login' ? handleLogin() : handleRegister()"
            />
          </div>

          <div class="mb-4">
            <label class="mb-1.5 block text-xs font-semibold text-gray-600">Mật khẩu</label>
            <input
              v-model="password"
              type="password"
              placeholder="••••••••"
              class="w-full rounded-xl border border-gray-200 px-3.5 py-2.5 text-sm outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
              @keydown.enter="tab === 'login' ? handleLogin() : handleRegister()"
            />
          </div>

          <!-- Error / Success -->
          <div v-if="error" class="mb-3 rounded-xl bg-red-50 px-4 py-2.5 text-xs font-medium text-red-600">
            {{ error }}
          </div>
          <div v-if="success" class="mb-3 rounded-xl bg-green-50 px-4 py-2.5 text-xs font-medium text-green-700">
            {{ success }}
          </div>

          <!-- Submit -->
          <button
            class="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold text-white transition hover:opacity-90 disabled:opacity-60"
            style="background:linear-gradient(135deg,#2563eb,#4f46e5)"
            :disabled="loading"
            @click="tab === 'login' ? handleLogin() : handleRegister()"
          >
            <svg v-if="loading" class="h-4 w-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
            </svg>
            {{ tab === 'login' ? 'Đăng nhập' : 'Tạo tài khoản' }}
          </button>

        </div>
      </div>

      <p class="mt-6 text-center text-xs text-gray-400">
        Bằng cách tiếp tục, bạn đồng ý với
        <a href="#" class="text-blue-500 hover:underline">Điều khoản dịch vụ</a>
      </p>
    </div>
  </div>
</template>
