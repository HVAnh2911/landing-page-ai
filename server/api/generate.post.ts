import Groq from 'groq-sdk'
import type { GeneratorInput, LandingPageContent } from '../../app/stores/modules/generator/types'

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig()
  const body = await readBody<GeneratorInput>(event)
  const { industry, brand, tagline, usp, phone, address } = body

  if (!industry || !brand || !usp || !phone) {
    throw createError({ statusCode: 400, message: 'Thiếu thông tin bắt buộc' })
  }

  const groq = new Groq({ apiKey: config.groqApiKey as string })

  const completion = await groq.chat.completions.create({
    model: 'llama-3.3-70b-versatile',
    temperature: 0.7,
    response_format: { type: 'json_object' },
    messages: [
      {
        role: 'system',
        content: `Bạn là chuyên gia viết nội dung marketing cho doanh nghiệp Việt Nam.
Luôn trả về JSON hợp lệ với đúng cấu trúc được yêu cầu. Viết bằng tiếng Việt, giọng văn chuyên nghiệp, thân thiện.`,
      },
      {
        role: 'user',
        content: `Tạo nội dung landing page cho doanh nghiệp sau và trả về JSON:

Thông tin:
- Ngành: ${industry}
- Thương hiệu: ${brand}
- Tagline: ${tagline || 'Chất lượng - Uy tín - Tận tâm'}
- Điểm nổi bật: ${usp}
- SĐT: ${phone}
- Địa chỉ: ${address || 'Việt Nam'}

Trả về JSON với cấu trúc sau (tất cả giá trị bằng tiếng Việt):
{
  "hero": {
    "headline": "câu headline ngắn gọn tối đa 8 từ, gây ấn tượng",
    "subheadline": "mô tả 1-2 câu về lợi ích chính",
    "ctaText": "nút CTA ngắn gọn",
    "ctaPhone": "${phone}"
  },
  "about": {
    "title": "tiêu đề phần giới thiệu",
    "body": "đoạn giới thiệu 3-4 câu về doanh nghiệp"
  },
  "services": [
    { "icon": "emoji", "title": "tên dịch vụ", "description": "mô tả ngắn" }
  ],
  "testimonials": [
    { "name": "tên khách hàng Việt", "role": "chức danh/nghề nghiệp", "content": "đánh giá 2-3 câu", "rating": 5 }
  ],
  "faq": [
    { "question": "câu hỏi thường gặp?", "answer": "trả lời chi tiết" }
  ],
  "contact": {
    "title": "tiêu đề phần liên hệ",
    "subtitle": "lời kêu gọi liên hệ",
    "phone": "${phone}",
    "address": "${address || 'Việt Nam'}",
    "mapEmbedQuery": "địa chỉ để tìm trên Google Maps"
  },
  "seo": {
    "title": "SEO title tối đa 60 ký tự",
    "description": "meta description tối đa 160 ký tự",
    "keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"]
  }
}

Yêu cầu: 4 dịch vụ, 2 testimonials, 4 FAQ. Mỗi dịch vụ dùng emoji phù hợp làm icon.`,
      },
    ],
  })

  const rawText = completion.choices[0]?.message?.content
  if (!rawText) {
    throw createError({ statusCode: 500, message: 'AI không trả về nội dung' })
  }

  const content = JSON.parse(rawText) as LandingPageContent

  // Unsplash hero image (optional)
  let unsplashImageUrl = ''
  if (config.unsplashAccessKey) {
    try {
      const res = await $fetch<{ results: Array<{ urls: { regular: string } }> }>(
        `https://api.unsplash.com/search/photos?query=${encodeURIComponent(industry + ' vietnam')}&per_page=1&orientation=landscape`,
        { headers: { Authorization: `Client-ID ${config.unsplashAccessKey}` } },
      )
      unsplashImageUrl = res.results[0]?.urls?.regular ?? ''
    } catch { /* optional */ }
  }

  return { content, unsplashImageUrl }
})
