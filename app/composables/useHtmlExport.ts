import type { GeneratedPage } from '~/stores/modules/generator/types'

export function useHtmlExport() {
  function generate(page: GeneratedPage): string {
    const { content, input } = page
    const { primary, accent } = input.colors

    const services = content.services.map(s => `
      <div style="background:#fff;border-radius:12px;padding:24px;box-shadow:0 1px 4px rgba(0,0,0,.08)">
        <div style="font-size:32px">${s.icon}</div>
        <h3 style="margin:12px 0 6px;font-size:16px;font-weight:700;color:#111">${s.title}</h3>
        <p style="margin:0;font-size:14px;color:#6b7280;line-height:1.6">${s.description}</p>
      </div>`).join('')

    const testimonials = content.testimonials.map(t => `
      <div style="background:#f9fafb;border-radius:12px;padding:20px;border:1px solid #f3f4f6">
        <div style="color:#fbbf24;font-size:16px;letter-spacing:2px">${'★'.repeat(t.rating)}${'☆'.repeat(5 - t.rating)}</div>
        <blockquote style="margin:10px 0;font-size:14px;color:#374151;line-height:1.7;font-style:italic">"${t.content}"</blockquote>
        <div style="display:flex;align-items:center;gap:10px;margin-top:12px">
          <div style="width:32px;height:32px;border-radius:50%;background:${primary};display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:12px">${t.name.charAt(0)}</div>
          <div>
            <div style="font-size:13px;font-weight:700;color:#111">${t.name}</div>
            <div style="font-size:11px;color:#9ca3af">${t.role}</div>
          </div>
        </div>
      </div>`).join('')

    const faqs = content.faq.map(f => `
      <div style="background:#fff;border-radius:12px;border:1px solid #e5e7eb;padding:18px 20px">
        <div style="font-size:14px;font-weight:700;color:#111;margin-bottom:8px">${f.question}</div>
        <div style="font-size:13px;color:#6b7280;line-height:1.6">${f.answer}</div>
      </div>`).join('')

    const keywords = content.seo.keywords.map(k => `<meta name="keywords" content="${k}">`).join('\n  ')

    return `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${content.seo.title}</title>
  <meta name="description" content="${content.seo.description}">
  ${keywords}
  <style>
    *{box-sizing:border-box;margin:0;padding:0}
    body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#111;line-height:1.5}
    a{text-decoration:none;color:inherit}
    @media(max-width:640px){
      .services-grid{grid-template-columns:1fr!important}
      .testimonials-grid{grid-template-columns:1fr!important}
      .hero-title{font-size:28px!important}
    }
    @media(min-width:641px) and (max-width:1023px){
      .services-grid{grid-template-columns:repeat(2,1fr)!important}
    }
  </style>
</head>
<body>

<!-- HERO -->
<section style="background:linear-gradient(135deg,${primary} 0%,${accent} 100%);padding:80px 24px;text-align:center;position:relative;overflow:hidden">
  ${page.unsplashImageUrl ? `<img src="${page.unsplashImageUrl}" alt="" style="position:absolute;inset:0;width:100%;height:100%;object-fit:cover;opacity:.15;pointer-events:none">` : ''}
  <div style="position:relative;z-index:1;max-width:640px;margin:0 auto">
    <div style="display:inline-flex;flex-direction:column;align-items:center;gap:8px;margin-bottom:24px">
      <div style="width:64px;height:64px;border-radius:16px;background:rgba(255,255,255,.2);backdrop-filter:blur(8px);display:flex;align-items:center;justify-content:center;font-size:28px;font-weight:900;color:#fff;border:2px solid rgba(255,255,255,.3)">${input.brand.charAt(0).toUpperCase()}</div>
      <span style="background:rgba(255,255,255,.2);color:#fff;padding:2px 12px;border-radius:99px;font-size:12px;font-weight:600">${input.brand}</span>
    </div>
    <h1 class="hero-title" style="font-size:40px;font-weight:900;color:#fff;line-height:1.2;margin-bottom:16px">${content.hero.headline}</h1>
    <p style="font-size:18px;color:rgba(255,255,255,.9);margin-bottom:32px;line-height:1.6">${content.hero.subheadline}</p>
    <a href="tel:${content.hero.ctaPhone}" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:${primary};padding:14px 32px;border-radius:99px;font-size:16px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.2)">
      📞 ${content.hero.ctaText}
    </a>
  </div>
</section>

<!-- ABOUT -->
<section style="padding:72px 24px;text-align:center;background:#fff">
  <div style="max-width:720px;margin:0 auto">
    <h2 style="font-size:28px;font-weight:800;color:${primary};margin-bottom:16px">${content.about.title}</h2>
    <p style="font-size:16px;color:#4b5563;line-height:1.8">${content.about.body}</p>
  </div>
</section>

<!-- SERVICES -->
<section style="padding:72px 24px;background:#f9fafb">
  <div style="max-width:1100px;margin:0 auto">
    <h2 style="text-align:center;font-size:28px;font-weight:800;color:#111;margin-bottom:40px">Dịch vụ của chúng tôi</h2>
    <div class="services-grid" style="display:grid;grid-template-columns:repeat(3,1fr);gap:20px">
      ${services}
    </div>
  </div>
</section>

<!-- TESTIMONIALS -->
<section style="padding:72px 24px;background:#fff">
  <div style="max-width:900px;margin:0 auto">
    <h2 style="text-align:center;font-size:28px;font-weight:800;color:#111;margin-bottom:40px">Khách hàng nói gì?</h2>
    <div class="testimonials-grid" style="display:grid;grid-template-columns:repeat(2,1fr);gap:16px">
      ${testimonials}
    </div>
  </div>
</section>

<!-- FAQ -->
<section style="padding:72px 24px;background:#f9fafb">
  <div style="max-width:720px;margin:0 auto">
    <h2 style="text-align:center;font-size:28px;font-weight:800;color:#111;margin-bottom:32px">Câu hỏi thường gặp</h2>
    <div style="display:flex;flex-direction:column;gap:12px">${faqs}</div>
  </div>
</section>

<!-- CONTACT -->
<section style="padding:72px 24px;text-align:center;background:linear-gradient(135deg,${primary} 0%,${accent} 100%)">
  <div style="max-width:600px;margin:0 auto">
    <h2 style="font-size:28px;font-weight:800;color:#fff;margin-bottom:8px">${content.contact.title}</h2>
    <p style="font-size:16px;color:rgba(255,255,255,.9);margin-bottom:28px">${content.contact.subtitle}</p>
    <div style="display:flex;flex-direction:column;align-items:center;gap:8px;color:rgba(255,255,255,.9);font-size:14px;margin-bottom:28px">
      <span>📞 ${content.contact.phone}</span>
      ${content.contact.address ? `<span>📍 ${content.contact.address}</span>` : ''}
    </div>
    <a href="tel:${content.contact.phone}" style="display:inline-flex;align-items:center;gap:8px;background:#fff;color:${primary};padding:14px 32px;border-radius:99px;font-size:16px;font-weight:700;box-shadow:0 8px 24px rgba(0,0,0,.2)">
      📲 Gọi ngay miễn phí
    </a>
  </div>
</section>

<footer style="background:#111;padding:24px;text-align:center;color:#9ca3af;font-size:13px">
  © ${new Date().getFullYear()} ${input.brand} · Được tạo bởi <a href="https://trangdich.vn" style="color:#60a5fa">TrangDich.vn</a>
</footer>

</body>
</html>`
  }

  function download(page: GeneratedPage) {
    const html = generate(page)
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = `${page.input.brand.toLowerCase().replace(/\s+/g, '-')}.html`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return { generate, download }
}
