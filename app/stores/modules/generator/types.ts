export interface GeneratorInput {
  industry: string
  brand: string
  tagline: string
  usp: string
  phone: string
  address: string
  colors: {
    primary: string
    accent: string
  }
}

export interface LandingPageHero {
  headline: string
  subheadline: string
  ctaText: string
  ctaPhone: string
}

export interface LandingPageService {
  icon: string
  title: string
  description: string
}

export interface LandingPageTestimonial {
  name: string
  role: string
  content: string
  rating: number
}

export interface LandingPageFaq {
  question: string
  answer: string
}

export interface LandingPageContent {
  hero: LandingPageHero
  about: {
    title: string
    body: string
  }
  services: LandingPageService[]
  testimonials: LandingPageTestimonial[]
  faq: LandingPageFaq[]
  contact: {
    title: string
    subtitle: string
    phone: string
    address: string
    mapEmbedQuery: string
  }
  seo: {
    title: string
    description: string
    keywords: string[]
  }
}

export interface GeneratedPage {
  id?: string
  input: GeneratorInput
  content: LandingPageContent
  unsplashImageUrl?: string
  createdAt?: string
}

export const LANDING_PAGE_JSON_SCHEMA = {
  type: 'object',
  properties: {
    hero: {
      type: 'object',
      properties: {
        headline: { type: 'string' },
        subheadline: { type: 'string' },
        ctaText: { type: 'string' },
        ctaPhone: { type: 'string' },
      },
      required: ['headline', 'subheadline', 'ctaText', 'ctaPhone'],
    },
    about: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        body: { type: 'string' },
      },
      required: ['title', 'body'],
    },
    services: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          icon: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
        },
        required: ['icon', 'title', 'description'],
      },
      minItems: 3,
      maxItems: 6,
    },
    testimonials: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          name: { type: 'string' },
          role: { type: 'string' },
          content: { type: 'string' },
          rating: { type: 'number', minimum: 1, maximum: 5 },
        },
        required: ['name', 'role', 'content', 'rating'],
      },
      minItems: 2,
      maxItems: 3,
    },
    faq: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          answer: { type: 'string' },
        },
        required: ['question', 'answer'],
      },
      minItems: 3,
      maxItems: 5,
    },
    contact: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        subtitle: { type: 'string' },
        phone: { type: 'string' },
        address: { type: 'string' },
        mapEmbedQuery: { type: 'string' },
      },
      required: ['title', 'subtitle', 'phone', 'address', 'mapEmbedQuery'],
    },
    seo: {
      type: 'object',
      properties: {
        title: { type: 'string', maxLength: 60 },
        description: { type: 'string', maxLength: 160 },
        keywords: { type: 'array', items: { type: 'string' }, maxItems: 8 },
      },
      required: ['title', 'description', 'keywords'],
    },
  },
  required: ['hero', 'about', 'services', 'testimonials', 'faq', 'contact', 'seo'],
} as const
