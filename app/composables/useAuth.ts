export function useAuth() {
  const supabase = useSupabaseClient()
  const user     = useSupabaseUser()

  const isLoggedIn = computed(() => !!user.value)

  const isAdmin = computed(() => {
    // is_admin được lưu trong user_metadata sau khi profile trigger chạy
    // hoặc có thể check qua profile table — dùng app_metadata nếu set từ service role
    return (user.value?.app_metadata?.is_admin === true) ||
           (user.value?.user_metadata?.is_admin === true)
  })

  async function signOut() {
    await supabase.auth.signOut()
    await navigateTo('/login')
  }

  return { user, isLoggedIn, isAdmin, signOut }
}
