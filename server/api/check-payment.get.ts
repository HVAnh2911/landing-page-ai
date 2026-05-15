export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const { code } = getQuery(event)

  if (!code) throw createError({ statusCode: 400, message: 'Thiếu mã giao dịch' })

  const sePayKey = config.sePayApiKey
  if (!sePayKey) throw createError({ statusCode: 500, message: 'Chưa cấu hình SEPAY_API_KEY' })

  // SePay API: lấy danh sách giao dịch gần đây, lọc theo nội dung chứa orderCode
  const res = await $fetch<{
    status: number
    messages: { success: boolean }
    transactions: Array<{
      id: number
      amount_in: number
      transaction_content: string
      transfer_type: string
    }>
  }>(`https://my.sepay.vn/userapi/transactions/list?account_number=366760872&limit=20`, {
    headers: {
      Authorization: `Bearer ${sePayKey}`,
      'Content-Type': 'application/json',
    },
  }).catch(() => null)

  if (!res || !res.messages?.success) {
    return { paid: false }
  }

  const matched = res.transactions.find(
    (t) =>
      t.transfer_type === 'in' &&
      t.amount_in >= 99000 &&
      t.transaction_content?.toUpperCase().includes(String(code).toUpperCase()),
  )

  return { paid: !!matched }
})
