import { writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { ALL_SEO_PAGES } from './future-city-hayathnagar-data.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT_DIR, 'public');
const SITE_DOMAIN = process.env.SITE_DOMAIN || 'https://www.bhoomerarealty.com';
const PHONE_NUMBER = '+91 98495 58210';
const PHONE_RAW = '9849558210';
const WHATSAPP_BASE = `https://wa.me/91${PHONE_RAW}`;

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function renderSerifTitle(title) {
  if (!title) return '';
  const inIndex = title.indexOf(' in ');
  if (inIndex !== -1) {
    const prefix = title.slice(0, inIndex + 3);
    const suffix = title.slice(inIndex + 4);
    return `${escapeHtml(prefix)}<br/><em>${escapeHtml(suffix)}</em>`;
  }
  const nearIndex = title.indexOf(' near ');
  if (nearIndex !== -1) {
    const prefix = title.slice(0, nearIndex + 5);
    const suffix = title.slice(nearIndex + 6);
    return `${escapeHtml(prefix)}<br/><em>${escapeHtml(suffix)}</em>`;
  }
  const onIndex = title.indexOf(' on ');
  if (onIndex !== -1) {
    const prefix = title.slice(0, onIndex + 3);
    const suffix = title.slice(onIndex + 4);
    return `${escapeHtml(prefix)}<br/><em>${escapeHtml(suffix)}</em>`;
  }
  const words = title.split(' ');
  if (words.length > 3) {
    const mid = Math.ceil(words.length / 2);
    return `${escapeHtml(words.slice(0, mid).join(' '))}<br/><em>${escapeHtml(words.slice(mid).join(' '))}</em>`;
  }
  return `<em>${escapeHtml(title)}</em>`;
}

function renderHtml(page) {
  const canonicalUrl = `${SITE_DOMAIN}/${page.slug}/`;
  const whatsappMsg = encodeURIComponent(`Hi Rambabu, I am interested in ${page.keyword} on Bhoomera Realty. Please share verified details and layout information.`);
  const whatsappUrl = `${WHATSAPP_BASE}?text=${whatsappMsg}`;

  // JSON-LD Schemas
  const realEstateAgentSchema = {
    '@context': 'https://schema.org',
    '@type': 'RealEstateAgent',
    'name': 'Bhoomera Realty',
    'image': `${SITE_DOMAIN}/images/bhoomera-realty-logo.png`,
    'url': SITE_DOMAIN,
    'telephone': '+91-9849558210',
    'priceRange': 'INR',
    'description': 'Honest, verified real estate advisory in Hyderabad specializing in Bharat Future City, Hayathnagar, Kandukur, Yacharam and surrounding growth corridors.',
    'founder': {
      '@type': 'Person',
      'name': 'Rambabu'
    },
    'address': {
      '@type': 'PostalAddress',
      'addressLocality': 'Hyderabad',
      'addressRegion': 'Telangana',
      'addressCountry': 'IN'
    },
    'areaServed': [page.locality, 'Bharat Future City', 'Hayathnagar', 'Kandukur', 'Yacharam', 'Maheshwaram', 'Mucherla', 'Kadthal', 'Tukkuguda', 'Pedda Amberpet', 'Bongloor', 'Ibrahimpatnam', 'Adibatla']
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE_DOMAIN}/` },
      { '@type': 'ListItem', 'position': 2, 'name': 'Bharat Future City & Hayathnagar Guides', 'item': `${SITE_DOMAIN}/hyderabad-real-estate/` },
      { '@type': 'ListItem', 'position': 3, 'name': page.shortTitle, 'item': canonicalUrl }
    ]
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': (page.faqs || []).map(faq => ({
      '@type': 'Question',
      'name': faq.q,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.a
      }
    }))
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': page.metaTitle,
    'description': page.metaDescription,
    'url': canonicalUrl,
    'inLanguage': 'en-IN',
    'isPartOf': {
      '@type': 'WebSite',
      'name': 'Bhoomera Realty',
      'url': SITE_DOMAIN
    }
  };

  const relatedPages = (page.relatedSlugs || [])
    .map(slug => ALL_SEO_PAGES.find(p => p.slug === slug))
    .filter(Boolean);

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${escapeHtml(page.metaTitle)}</title>
  <meta name="description" content="${escapeHtml(page.metaDescription)}" />
  <link rel="canonical" href="${canonicalUrl}" />
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1" />
  <meta name="theme-color" content="#103f30" />
  <link rel="icon" type="image/png" href="/images/bhoomera-realty-logo.png" />

  <!-- Google Fonts: Instrument Serif & DM Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&family=Noto+Sans+Telugu:wght@400;500;600;700&display=swap" rel="stylesheet">

  <!-- Open Graph / Social Sharing -->
  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="Bhoomera Realty" />
  <meta property="og:title" content="${escapeHtml(page.metaTitle)}" />
  <meta property="og:description" content="${escapeHtml(page.metaDescription)}" />
  <meta property="og:url" content="${canonicalUrl}" />
  <meta property="og:image" content="${SITE_DOMAIN}/images/architecture-hero.jpg" />
  <meta property="og:locale" content="en_IN" />

  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="${escapeHtml(page.metaTitle)}" />
  <meta name="twitter:description" content="${escapeHtml(page.metaDescription)}" />
  <meta name="twitter:image" content="${SITE_DOMAIN}/images/architecture-hero.jpg" />

  <!-- JSON-LD Structured Data -->
  <script type="application/ld+json">${JSON.stringify(realEstateAgentSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(breadcrumbSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(faqSchema)}</script>
  <script type="application/ld+json">${JSON.stringify(webPageSchema)}</script>

  <style>
    /* Bhoomera Realty — Signature Warm Stone, Deep Evergreen, Brushed Gold System */
    :root {
      --green: #103f30;
      --green-dark: #09261d;
      --green-light: #185240;
      --gold: #b79749;
      --gold-light: #dfcda7;
      --gold-hover: #9c8038;
      --cream: #f8f6ef;
      --cream-card: #fffefa;
      --cream-alt: #f1ede1;
      --ink: #203a30;
      --muted: #66736b;
      --line: #dce3d9;
      --line-light: #e8ede5;
      --font-serif: 'Instrument Serif', Georgia, serif;
      --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }

    * { box-sizing: border-box; margin: 0; padding: 0; }
    html { scroll-behavior: smooth; }
    body {
      font-family: var(--font-sans);
      background-color: var(--cream);
      color: var(--ink);
      line-height: 1.65;
      -webkit-font-smoothing: antialiased;
      padding-bottom: 75px;
    }

    a { color: inherit; text-decoration: none; transition: color 0.2s, opacity 0.2s; }
    button, input, select, textarea { font-family: inherit; }

    /* Bhoomera Signature Header */
    .site-header {
      position: sticky;
      top: 0;
      z-index: 100;
      height: 90px;
      background: #f8f6f0;
      border-bottom: 1px solid #c1b69d55;
      backdrop-filter: blur(8px);
    }
    .header-inner {
      max-width: 1240px;
      height: 100%;
      margin: 0 auto;
      padding: 0 5%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 24px;
    }
    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      color: var(--green);
      line-height: .95;
    }
    .brand-symbol {
      position: relative;
      display: block;
      overflow: hidden;
      width: 36px;
      height: 48px;
      background: #fbfaf6;
      border-radius: 2px;
    }
    .brand-symbol img {
      position: absolute;
      width: 126px;
      max-width: none;
      left: -46px;
      top: -26px;
    }
    .brand-wordmark {
      display: flex;
      flex-direction: column;
      gap: 6px;
      font-size: 22px;
      letter-spacing: .08em;
      font-family: Georgia, serif;
    }
    .brand-wordmark b { font-weight: 500; }
    .brand-wordmark small {
      font-family: var(--font-sans);
      font-size: 8px;
      letter-spacing: .5em;
      margin: 0;
      color: var(--muted);
    }
    .site-nav {
      display: flex;
      align-items: center;
      gap: 28px;
    }
    .site-nav a {
      font-size: 12px;
      color: var(--green);
      position: relative;
      padding: 8px 0;
      letter-spacing: .03em;
    }
    .site-nav a::after {
      content: '';
      position: absolute;
      height: 1px;
      background: var(--gold);
      left: 0;
      right: 100%;
      bottom: 2px;
      transition: right .25s;
    }
    .site-nav a:hover::after, .site-nav a.active::after {
      right: 0;
    }
    .header-cta-group {
      display: flex;
      align-items: center;
      gap: 16px;
      margin-left: auto;
    }
    .header-phone-link {
      font-size: 12px;
      font-weight: 500;
      color: var(--green);
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .header-talk-btn {
      display: inline-flex;
      align-items: center;
      gap: 10px;
      background: var(--green);
      color: #fff;
      font-size: 12px;
      padding: 12px 20px;
      letter-spacing: .04em;
      transition: background 0.2s, transform 0.2s;
    }
    .header-talk-btn:hover {
      background: var(--green-light);
      color: #fff;
    }

    /* Breadcrumbs */
    .breadcrumbs {
      max-width: 1240px;
      margin: 20px auto 0;
      padding: 0 5%;
      font-size: 11px;
      color: var(--muted);
      letter-spacing: 0.05em;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .breadcrumbs a { color: var(--muted); }
    .breadcrumbs a:hover { color: var(--green); }
    .breadcrumbs .sep { color: #a1ac9d; }
    .breadcrumbs .current { color: var(--ink); font-weight: 500; }

    /* Editorial Hero */
    .editorial-hero {
      position: relative;
      background-color: var(--green);
      background-image: linear-gradient(90deg, rgba(8,40,27,0.96) 0%, rgba(8,40,27,0.85) 55%, rgba(8,40,27,0.45) 100%), url('/images/architecture-hero.jpg');
      background-size: cover;
      background-position: center 57%;
      color: #fff;
      padding: 70px 5% 85px;
      margin: 16px auto 50px;
      border-bottom: 2px solid var(--gold);
    }
    .editorial-hero-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.22fr 1fr;
      gap: 50px;
      align-items: center;
    }
    .eyebrow {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      color: var(--gold-light);
      font-size: 10px;
      letter-spacing: .18em;
      text-transform: uppercase;
      margin-bottom: 22px;
    }
    .eyebrow::before {
      content: '';
      width: 32px;
      height: 1px;
      background: var(--gold);
    }
    .editorial-hero h1 {
      font-family: var(--font-serif);
      font-size: clamp(40px, 4.8vw, 66px);
      font-weight: 400;
      line-height: 1.05;
      letter-spacing: -.03em;
      margin: 0 0 22px;
      color: #fff;
    }
    .editorial-hero h1 em {
      color: var(--gold-light);
      font-style: italic;
      font-family: var(--font-serif);
    }
    .hero-lead-text {
      font-size: 15px;
      line-height: 1.85;
      color: #e0e5d7;
      max-width: 580px;
      margin-bottom: 28px;
    }
    .hero-guideline-box {
      background: rgba(255,255,255,0.06);
      border-left: 3px solid var(--gold);
      padding: 12px 18px;
      margin-bottom: 32px;
      max-width: 540px;
    }
    .hero-guideline-box span {
      display: block;
      font-size: 9px;
      letter-spacing: .16em;
      color: var(--gold-light);
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .hero-guideline-box strong {
      font-size: 16px;
      color: #fff;
      font-weight: 600;
    }
    .hero-guideline-box small {
      color: #c9d4c5;
      font-size: 12px;
      margin-left: 8px;
    }
    .hero-cta-actions {
      display: flex;
      align-items: center;
      gap: 18px;
      flex-wrap: wrap;
    }
    .btn-gold-action {
      background: #daca9f;
      color: var(--green);
      padding: 16px 24px;
      font-size: 12px;
      letter-spacing: .04em;
      font-weight: 600;
      display: inline-flex;
      align-items: center;
      gap: 12px;
      transition: background 0.2s, transform 0.2s;
      border: none;
      cursor: pointer;
    }
    .btn-gold-action:hover {
      background: #ece0c0;
      transform: translateY(-2px);
      color: var(--green);
    }
    .btn-whatsapp-outline {
      border: 1px solid rgba(255,255,255,0.4);
      color: #fff;
      padding: 15px 22px;
      font-size: 12px;
      letter-spacing: .04em;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      transition: border-color 0.2s, background 0.2s;
    }
    .btn-whatsapp-outline:hover {
      border-color: #25d366;
      background: rgba(37,211,102,0.15);
      color: #fff;
    }

    /* Editorial Lead Card */
    .editorial-lead-card {
      background: var(--cream-card);
      color: var(--ink);
      border: 1px solid var(--line);
      border-top: 3px solid var(--gold);
      padding: 34px 30px;
      box-shadow: 0 24px 60px rgba(16,63,48,0.14);
    }
    .editorial-lead-card .card-kicker {
      font-size: 9px;
      letter-spacing: .18em;
      color: var(--gold);
      text-transform: uppercase;
      display: block;
      margin-bottom: 6px;
    }
    .editorial-lead-card h3 {
      font-family: var(--font-serif);
      font-size: 32px;
      font-weight: 400;
      line-height: 1.1;
      color: var(--green);
      margin: 0 0 8px;
    }
    .editorial-lead-card p.card-sub {
      font-size: 12px;
      color: var(--muted);
      line-height: 1.7;
      margin-bottom: 20px;
    }
    .form-field {
      margin-bottom: 14px;
    }
    .form-field label {
      display: block;
      font-size: 9px;
      letter-spacing: .14em;
      color: #727c73;
      text-transform: uppercase;
      margin-bottom: 5px;
    }
    .form-field input, .form-field select, .form-field textarea {
      width: 100%;
      padding: 11px 13px;
      background: #fbfaf6;
      border: 1px solid #d4dbd0;
      font-size: 12px;
      color: var(--ink);
      outline: none;
      transition: border-color 0.2s, background 0.2s;
    }
    .form-field input:focus, .form-field select:focus, .form-field textarea:focus {
      border-color: var(--green);
      background: #fff;
      box-shadow: 0 0 0 2px rgba(16,63,48,0.08);
    }
    .form-field textarea {
      min-height: 60px;
      resize: vertical;
    }
    .btn-submit-lead {
      width: 100%;
      background: var(--green);
      color: #fff;
      padding: 14px;
      font-size: 12px;
      letter-spacing: .06em;
      text-transform: uppercase;
      font-weight: 600;
      border: none;
      cursor: pointer;
      transition: background 0.2s, transform 0.2s;
      margin-top: 6px;
    }
    .btn-submit-lead:hover {
      background: var(--green-light);
    }
    .form-confidential-note {
      font-size: 10px;
      color: var(--muted);
      text-align: center;
      margin-top: 10px;
      letter-spacing: .02em;
    }
    .form-status {
      display: none;
      padding: 12px;
      font-size: 12px;
      margin-bottom: 14px;
      border: 1px solid transparent;
      line-height: 1.6;
    }
    .form-status.success {
      display: block;
      background: #edf7ed;
      color: #1e4620;
      border-color: #c7e5c9;
    }
    .form-status.error {
      display: block;
      background: #fdf2f2;
      color: #9b1c1c;
      border-color: #f8b4b4;
    }

    /* Trust Section */
    .trust-principles-section {
      max-width: 1240px;
      margin: 0 auto 50px;
      padding: 0 5%;
    }
    .trust-principles-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 20px;
    }
    .trust-article {
      background: var(--cream-card);
      border: 1px solid var(--line);
      padding: 28px 24px;
      transition: transform 0.2s, border-color 0.2s;
      position: relative;
    }
    .trust-article:hover {
      transform: translateY(-3px);
      border-color: var(--gold);
    }
    .trust-article .trust-index {
      font-size: 9px;
      letter-spacing: .16em;
      color: var(--gold);
      display: block;
      margin-bottom: 14px;
    }
    .trust-article h4 {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 400;
      line-height: 1.15;
      color: var(--green);
      margin: 0 0 10px;
    }
    .trust-article p {
      font-size: 12px;
      line-height: 1.8;
      color: var(--muted);
      margin: 0;
    }

    /* Content Layout */
    .editorial-content-layout {
      max-width: 1240px;
      margin: 0 auto 60px;
      padding: 0 5%;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 40px;
    }
    .editorial-article {
      background: var(--cream-card);
      border: 1px solid var(--line);
      padding: 40px;
      margin-bottom: 30px;
    }
    .section-kicker {
      font-size: 9px;
      letter-spacing: .18em;
      color: #8a764b;
      text-transform: uppercase;
      display: block;
      margin-bottom: 12px;
    }
    .editorial-article h2 {
      font-family: var(--font-serif);
      font-size: clamp(30px, 3.2vw, 42px);
      font-weight: 400;
      line-height: 1.15;
      letter-spacing: -.02em;
      color: var(--green);
      margin: 0 0 18px;
    }
    .editorial-article h2 em {
      color: #8c835a;
      font-style: italic;
    }
    .editorial-article p {
      font-size: 13px;
      line-height: 1.9;
      color: var(--muted);
      margin-bottom: 16px;
    }
    .editorial-article p strong {
      color: var(--ink);
    }
    .highlights-list {
      list-style: none;
      margin: 20px 0;
      padding: 0;
    }
    .highlights-list li {
      position: relative;
      padding-left: 28px;
      margin-bottom: 14px;
      font-size: 13px;
      line-height: 1.8;
      color: var(--ink);
    }
    .highlights-list li::before {
      content: '—';
      position: absolute;
      left: 0;
      top: 0;
      color: var(--gold);
      font-weight: 700;
    }
    .due-diligence-steps {
      list-style: none;
      counter-reset: due-counter;
      margin: 24px 0 10px;
      padding: 0;
    }
    .due-diligence-steps li {
      counter-increment: due-counter;
      position: relative;
      padding-left: 50px;
      margin-bottom: 22px;
      font-size: 13px;
      line-height: 1.8;
      color: var(--muted);
    }
    .due-diligence-steps li strong {
      color: var(--green);
      display: block;
      font-size: 14px;
      margin-bottom: 4px;
    }
    .due-diligence-steps li::before {
      content: counter(due-counter, decimal-leading-zero);
      position: absolute;
      left: 0;
      top: 0;
      width: 34px;
      height: 34px;
      border: 1px solid var(--line);
      background: var(--cream);
      color: var(--green);
      font-family: var(--font-sans);
      font-size: 11px;
      font-weight: 600;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    /* Sell Banner Article */
    .sell-banner-article {
      background: var(--green);
      color: #fff;
      padding: 40px;
      position: relative;
      overflow: hidden;
      border: 1px solid var(--green-dark);
      margin-bottom: 30px;
    }
    .sell-banner-article h2 {
      font-family: var(--font-serif);
      font-size: 38px;
      color: #fff;
      margin-bottom: 14px;
      font-weight: 400;
    }
    .sell-banner-article h2 em {
      color: var(--gold-light);
      font-style: italic;
    }
    .sell-banner-article p {
      color: #e0e5d7;
      font-size: 13px;
      line-height: 1.9;
      max-width: 580px;
      margin-bottom: 24px;
    }
    .sell-banner-article a {
      display: inline-flex;
      align-items: center;
      gap: 12px;
      font-size: 12px;
      color: #f6f0df;
      border-bottom: 1px solid var(--gold);
      padding-bottom: 8px;
    }

    /* Accordion FAQs */
    .editorial-faq-item {
      border-bottom: 1px solid var(--line);
      padding: 20px 0;
    }
    .editorial-faq-item details summary {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 400;
      color: var(--green);
      cursor: pointer;
      list-style: none;
      display: flex;
      justify-content: space-between;
      align-items: center;
      line-height: 1.3;
    }
    .editorial-faq-item details summary::-webkit-details-marker { display: none; }
    .editorial-faq-item details summary .faq-icon {
      font-family: var(--font-sans);
      font-size: 18px;
      color: var(--gold);
      transition: transform 0.2s;
    }
    .editorial-faq-item details[open] summary .faq-icon {
      transform: rotate(45deg);
    }
    .editorial-faq-item .faq-body {
      padding-top: 14px;
      font-size: 13px;
      line-height: 1.9;
      color: var(--muted);
    }

    /* Sidebar Widgets */
    .sidebar-advisor-card {
      background: var(--cream-card);
      border: 1px solid var(--line);
      padding: 30px 24px;
      margin-bottom: 30px;
      text-align: center;
      position: relative;
    }
    .sidebar-advisor-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: var(--gold);
    }
    .advisor-portrait-frame {
      width: 100px;
      height: 100px;
      margin: 0 auto 16px;
      overflow: hidden;
      border-radius: 50%;
      border: 2px solid var(--gold);
      background: #e7e6d8;
    }
    .advisor-portrait-frame img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center 30%;
    }
    .sidebar-advisor-card h4 {
      font-family: var(--font-serif);
      font-size: 30px;
      font-weight: 400;
      color: var(--green);
      margin: 0 0 4px;
    }
    .sidebar-advisor-card .advisor-role {
      font-size: 9px;
      letter-spacing: .18em;
      color: var(--gold);
      text-transform: uppercase;
      display: block;
      margin-bottom: 12px;
    }
    .sidebar-advisor-card .advisor-quote {
      font-size: 12px;
      line-height: 1.85;
      color: var(--muted);
      font-style: italic;
      margin-bottom: 20px;
    }
    .sidebar-advisor-card a.advisor-call {
      display: block;
      background: var(--green);
      color: #fff;
      padding: 12px;
      font-size: 12px;
      letter-spacing: .04em;
      margin-bottom: 10px;
    }
    .sidebar-advisor-card a.advisor-wa {
      display: block;
      border: 1px solid #25d366;
      color: #128c7e;
      padding: 11px;
      font-size: 12px;
      letter-spacing: .04em;
      background: rgba(37,211,102,0.06);
    }

    .sidebar-links-card {
      background: var(--cream-card);
      border: 1px solid var(--line);
      padding: 26px 22px;
      margin-bottom: 30px;
    }
    .sidebar-links-card h3 {
      font-family: var(--font-serif);
      font-size: 24px;
      font-weight: 400;
      color: var(--green);
      margin: 0 0 16px;
      border-bottom: 1px solid var(--line);
      padding-bottom: 10px;
    }
    .sidebar-links-list {
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    .sidebar-link-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      border: 1px solid var(--line);
      background: #fbfaf6;
      font-size: 12px;
      color: var(--ink);
      transition: all 0.2s;
    }
    .sidebar-link-item:hover {
      border-color: var(--gold);
      background: var(--cream-card);
      transform: translateX(4px);
      color: var(--green);
    }

    /* Master Footer */
    .site-footer {
      background: #0d2e23;
      color: #e0e5d7;
      padding: 60px 5% 30px;
      border-top: 2px solid var(--gold);
    }
    .footer-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.5fr 1fr 1fr;
      gap: 50px;
      margin-bottom: 50px;
    }
    .footer-brand .brand-logo {
      color: #fff;
      margin-bottom: 16px;
    }
    .footer-brand .brand-symbol {
      background: #153e31;
    }
    .footer-brand p {
      font-size: 12px;
      line-height: 1.9;
      color: #a7b5a2;
      max-width: 360px;
    }
    .footer-col h4 {
      font-family: var(--font-serif);
      font-size: 22px;
      font-weight: 400;
      color: var(--gold-light);
      margin: 0 0 16px;
    }
    .footer-col ul {
      list-style: none;
      padding: 0;
      margin: 0;
    }
    .footer-col ul li {
      margin-bottom: 10px;
    }
    .footer-col ul li a {
      font-size: 12px;
      color: #c2cfbd;
      transition: color 0.2s;
    }
    .footer-col ul li a:hover {
      color: #fff;
    }
    .footer-bottom-bar {
      max-width: 1240px;
      margin: 0 auto;
      padding-top: 24px;
      border-top: 1px solid rgba(255,255,255,0.1);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #8c9e87;
      flex-wrap: wrap;
      gap: 12px;
    }

    /* Sticky Mobile Action Bar */
    .mobile-sticky-bar {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      z-index: 999;
      background: #f8f6f0;
      border-top: 1px solid #c1b69d88;
      display: flex;
      padding: 10px 16px;
      gap: 12px;
      box-shadow: 0 -4px 20px rgba(0,0,0,0.08);
    }
    .btn-mobile-call-action {
      flex: 1;
      background: var(--green);
      color: #fff;
      text-align: center;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .04em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }
    .btn-mobile-wa-action {
      flex: 1;
      background: #25d366;
      color: #fff;
      text-align: center;
      padding: 12px;
      font-size: 12px;
      font-weight: 600;
      letter-spacing: .04em;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
    }

    @media (min-width: 901px) {
      .mobile-sticky-bar { display: none; }
    }
    @media (max-width: 900px) {
      .site-nav { display: none; }
      .editorial-hero-inner { grid-template-columns: 1fr; gap: 36px; }
      .trust-principles-grid { grid-template-columns: repeat(2, 1fr); }
      .editorial-content-layout { grid-template-columns: 1fr; }
      .footer-inner { grid-template-columns: 1fr; gap: 30px; }
      .header-phone-link { display: none; }
    }
    @media (max-width: 600px) {
      .trust-principles-grid { grid-template-columns: 1fr; }
      .editorial-article { padding: 24px 20px; }
      .editorial-lead-card { padding: 26px 20px; }
    }
  </style>
</head>
<body>

  <!-- Signature Bhoomera Header -->
  <header class="site-header">
    <div class="header-inner">
      <a class="brand-logo" href="/" aria-label="Bhoomera Realty home">
        <span class="brand-symbol"><img src="/images/bhoomera-realty-logo.png" alt="" /></span>
        <span class="brand-wordmark"><b>BHOOMERA</b><small>REALTY</small></span>
      </a>
      <nav class="site-nav">
        <a href="/#buy">Buy</a>
        <a href="/#rent">Rent</a>
        <a href="/#sell">Sell</a>
        <a href="/#learn">Learn</a>
        <a href="/#about">About</a>
        <a href="/hyderabad-real-estate/" class="active">Guides</a>
      </nav>
      <div class="header-cta-group">
        <a href="tel:${PHONE_RAW}" class="header-phone-link">
          <span>📞</span> 98495 58210
        </a>
        <a href="#enquire" class="header-talk-btn">
          Let’s talk <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
        </a>
      </div>
    </div>
  </header>

  <!-- Breadcrumbs -->
  <nav class="breadcrumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span class="sep">/</span>
    <a href="/hyderabad-real-estate/">Future City &amp; Hayathnagar Guides</a>
    <span class="sep">/</span>
    <span class="current">${escapeHtml(page.shortTitle)}</span>
  </nav>

  <!-- Editorial Hero Section -->
  <section class="editorial-hero">
    <div class="editorial-hero-inner">
      <div>
        <div class="eyebrow">
          <span>01 — ${escapeHtml(page.zone.toUpperCase())}</span>
        </div>
        <h1>${renderSerifTitle(page.h1)}</h1>
        <p class="hero-lead-text">
          Direct verification, transparent survey numbers, HMDA/DTCP legal due diligence and physical site inspections from Bhoomera Realty. Zero unverified mock listings.
        </p>

        <div class="hero-guideline-box">
          <span>VERIFIED ADVISORY GUIDELINE</span>
          <strong>${escapeHtml(page.priceGuide || 'Contact for verified rate chart')}</strong>
          <small>• 100% Ground Inspected</small>
        </div>

        <div class="hero-cta-actions">
          <a href="#enquire" class="btn-gold-action">
            Request Verified Inventory <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
          </a>
          <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-whatsapp-outline">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.816 9.816 0 0 0 12.04 2zm5.78 14.18c-.24.68-1.39 1.3-1.92 1.38-.49.08-1.12.11-3.64-.93-3.08-1.28-5.06-4.41-5.21-4.61-.15-.2-1.24-1.65-1.24-3.15 0-1.5.78-2.24 1.06-2.55.28-.31.61-.39.81-.39.2 0 .41.01.59.02.19.01.44-.07.69.53.25.6.86 2.09.93 2.25.08.16.13.35.03.55-.1.2-.15.33-.3.51-.15.18-.32.4-.46.54-.15.15-.31.32-.13.63.18.31.8 1.32 1.72 2.14 1.18 1.05 2.17 1.38 2.48 1.53.31.15.49.13.67-.08.18-.21.78-.91.99-1.22.21-.31.42-.26.71-.15.29.11 1.83.86 2.15 1.02.32.16.53.24.61.37.08.13.08.76-.16 1.44z"/></svg>
            Direct WhatsApp
          </a>
        </div>
      </div>

      <!-- Lead Capture Form Card -->
      <div class="editorial-lead-card" id="enquire">
        <span class="card-kicker">PERSONAL ADVISORY</span>
        <h3>Consult Rambabu</h3>
        <p class="card-sub">Founder &amp; Local Specialist · Bharat Future City &amp; Hayathnagar</p>

        <div id="form-feedback" class="form-status" role="alert"></div>

        <form id="seo-lead-form">
          <input type="hidden" name="property_interest" value="${escapeHtml(page.keyword)}" />

          <div class="form-field">
            <label for="lead-name">Your Full Name *</label>
            <input type="text" id="lead-name" name="name" placeholder="e.g. Ramesh Kumar" required />
          </div>

          <div class="form-field">
            <label for="lead-phone">Phone Number *</label>
            <input type="tel" id="lead-phone" name="phone" placeholder="e.g. 98495 58210" pattern="[0-9+\\s()-]{10,20}" required />
          </div>

          <div class="form-field">
            <label for="lead-budget">Estimated Budget</label>
            <select id="lead-budget" name="budget">
              <option value="Under ₹20 Lakhs">Under ₹20 Lakhs</option>
              <option value="₹20 Lakhs to ₹35 Lakhs" selected>₹20 Lakhs to ₹35 Lakhs</option>
              <option value="₹35 Lakhs to ₹50 Lakhs">₹35 Lakhs to ₹50 Lakhs</option>
              <option value="₹50 Lakhs to ₹1 Crore">₹50 Lakhs to ₹1 Crore</option>
              <option value="₹1 Crore &amp; Above">₹1 Crore &amp; Above</option>
            </select>
          </div>

          <div class="form-field">
            <label for="lead-notes">Requirements or Site Visit Plans</label>
            <textarea id="lead-notes" name="notes" placeholder="e.g. Interested in 200 sq.yd HMDA plot; available for site visit this weekend."></textarea>
          </div>

          <button type="submit" id="submit-btn" class="btn-submit-lead">
            Request Verified Details &amp; Site Visit
          </button>
          <div class="form-confidential-note">🔒 100% Confidential. No Spam. Personal advisory only.</div>
        </form>
      </div>
    </div>
  </section>

  <!-- 4 Trust Pillars -->
  <section class="trust-principles-section">
    <div class="trust-principles-grid">
      <article class="trust-article">
        <span class="trust-index">01 / TITLE AUDIT</span>
        <h4>100% Legal Scrutiny</h4>
        <p>30-year link document chain verification, Nil-Encumbrance audit, and revenue Dharani portal checks before client presentation.</p>
      </article>
      <article class="trust-article">
        <span class="trust-index">02 / SANCTIONED</span>
        <h4>Sanctioned Approvals</h4>
        <p>Direct verification of HMDA LP Numbers, DTCP orders, TS-bPASS sanctions, and mortgage plot release letters.</p>
      </article>
      <article class="trust-article">
        <span class="trust-index">03 / ON-GROUND</span>
        <h4>Physical Ground Demarcation</h4>
        <p>On-site survey boundary check, stone markings, right-of-way width confirmation, and groundwater table review.</p>
      </article>
      <article class="trust-article">
        <span class="trust-index">04 / ZERO INFLATION</span>
        <h4>Zero Broker Inflations</h4>
        <p>Direct interaction with verified landowners and legitimate developers. Honest pricing without inflated middleman margins.</p>
      </article>
    </div>
  </section>

  <!-- Main Content Layout -->
  <main class="editorial-content-layout">
    <div>

      <!-- Strategic Location Highlights -->
      <article class="editorial-article">
        <span class="section-kicker">02 — LOCATION ANALYSIS</span>
        <h2>Strategic Location &amp; Growth Highlights in<br/><em>${escapeHtml(page.locality)}</em></h2>
        <p>Key infrastructure and connectivity drivers for <strong>${escapeHtml(page.keyword)}</strong>:</p>
        <ul class="highlights-list">
          ${(page.highlights || []).map(h => `<li>${escapeHtml(h)}</li>`).join('\n          ')}
        </ul>
      </article>

      <!-- Market Intelligence Overview -->
      <article class="editorial-article">
        <span class="section-kicker">03 — MARKET INTELLIGENCE</span>
        <h2>Ground Assessment &amp;<br/><em>Investment Outlook</em></h2>
        ${(page.overview || []).map(p => `<p>${escapeHtml(p)}</p>`).join('\n        ')}
      </article>

      <!-- 5-Point Due Diligence Checklist -->
      <article class="editorial-article">
        <span class="section-kicker">04 — DUE DILIGENCE MANDATE</span>
        <h2>Buyer’s Due Diligence &amp;<br/><em>Verification Protocol</em></h2>
        <p>Before executing any advance payment or agreement for properties in ${escapeHtml(page.locality)}, Bhoomera Realty recommends verifying the following 5 critical checkpoints:</p>
        <ol class="due-diligence-steps">
          ${(page.dueDiligence || []).map(step => `<li>${escapeHtml(step)}</li>`).join('\n          ')}
        </ol>
      </article>

      <!-- Sell / Approved Banner -->
      <article class="sell-banner-article">
        <h2>Looking for Live Approved Properties in<br/><em>${escapeHtml(page.locality)}?</em></h2>
        <p>Bhoomera Realty exclusively displays physically inspected, document-verified properties. We do not publish unverified mock listings or speculative brochures.</p>
        <a href="/#buy">Browse currently approved listings <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>
      </article>

      <!-- FAQs -->
      <article class="editorial-article">
        <span class="section-kicker">05 — COMMON QUESTIONS</span>
        <h2>Frequently Asked Questions —<br/><em>${escapeHtml(page.shortTitle)}</em></h2>
        <div>
          ${(page.faqs || []).map(faq => `
          <div class="editorial-faq-item">
            <details>
              <summary>
                <span>${escapeHtml(faq.q)}</span>
                <span class="faq-icon">+</span>
              </summary>
              <div class="faq-body">
                <p>${escapeHtml(faq.a)}</p>
              </div>
            </details>
          </div>`).join('\n          ')}
        </div>
      </article>

    </div>

    <!-- Sidebar -->
    <aside>
      
      <!-- Advisor Widget -->
      <div class="sidebar-advisor-card">
        <div class="advisor-portrait-frame">
          <img src="/images/rambabu-portrait.png" alt="Rambabu, Bhoomera Realty" width="100" height="100" />
        </div>
        <h4>Rambabu</h4>
        <span class="advisor-role">BHOOMERA REALTY · FOUNDER</span>
        <p class="advisor-quote">“Good decisions begin with honest conversations. Giving a customer the right information matters more than simply selling a property.”</p>
        <a href="tel:${PHONE_RAW}" class="advisor-call">
          Call 98495 58210
        </a>
        <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="advisor-wa">
          Chat on WhatsApp
        </a>
      </div>

      <!-- Related Corridors -->
      <div class="sidebar-links-card">
        <h3>Connected Corridors</h3>
        <div class="sidebar-links-list">
          ${relatedPages.map(rp => `
          <a href="/${rp.slug}/" class="sidebar-link-item">
            <span>${escapeHtml(rp.shortTitle)}</span>
            <span>→</span>
          </a>`).join('\n          ')}
          <a href="/hyderabad-real-estate/" class="sidebar-link-item" style="background: var(--green); color: #fff; border-color: var(--green);">
            <span>Explore All 133 Corridors</span>
            <span>→</span>
          </a>
        </div>
      </div>

      <!-- Direct Contact Info -->
      <div class="sidebar-links-card">
        <h3>Direct Office Contact</h3>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">
          <strong>Phone:</strong> <a href="tel:${PHONE_RAW}" style="color: var(--green); font-weight: 600;">+91 98495 58210</a>
        </p>
        <p style="font-size: 12px; color: var(--muted); margin-bottom: 8px;">
          <strong>WhatsApp:</strong> <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" style="color: #128c7e; font-weight: 600;">+91 98495 58210</a>
        </p>
        <p style="font-size: 11px; color: var(--muted); line-height: 1.7;">
          <strong>Operating Focus:</strong> Bharat Future City, Mucherla, Kandukur, Yacharam, Hayathnagar, Pedda Amberpet, Maheshwaram, Tukkuguda, Bongloor, and Ibrahimpatnam.
        </p>
      </div>

    </aside>
  </main>

  <!-- Master Footer -->
  <footer class="site-footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <a class="brand-logo" href="/" aria-label="Bhoomera Realty home">
          <span class="brand-symbol"><img src="/images/bhoomera-realty-logo.png" alt="" /></span>
          <span class="brand-wordmark"><b>BHOOMERA</b><small style="color: #8c9e87;">REALTY</small></span>
        </a>
        <p>Specialized real estate advisory across Bharat Future City, Hayathnagar, and connecting growth corridors in South-East Hyderabad. Clear information, verified title due diligence and zero unverified mock listings.</p>
      </div>

      <div class="footer-col">
        <h4>Future City Corridors</h4>
        <ul>
          <li><a href="/plots-in-bharat-future-city/">Bharat Future City</a></li>
          <li><a href="/open-plots-in-mucherla/">Mucherla Future City</a></li>
          <li><a href="/open-plots-in-kandukur/">Kandukur Plots</a></li>
          <li><a href="/plots-in-yacharam/">Yacharam Land</a></li>
          <li><a href="/plots-in-kadthal/">Kadthal Highway</a></li>
          <li><a href="/open-plots-in-maheshwaram/">Maheshwaram Plots</a></li>
          <li><a href="/open-plots-in-tukkuguda/">Tukkuguda ORR Exit 14</a></li>
        </ul>
      </div>

      <div class="footer-col">
        <h4>Hayathnagar &amp; Connecting</h4>
        <ul>
          <li><a href="/open-plots-in-hayathnagar/">Hayathnagar Plots</a></li>
          <li><a href="/plots-in-pedda-amberpet/">Pedda Amberpet ORR Exit 11</a></li>
          <li><a href="/plots-in-bongloor/">Bongloor ORR Exit 12</a></li>
          <li><a href="/open-plots-in-ibrahimpatnam/">Ibrahimpatnam Sagar Road</a></li>
          <li><a href="/hmda-plots-in-adibatla/">Adibatla Aerospace SEZ</a></li>
          <li><a href="/plots-on-vijayawada-highway-hyderabad/">Vijayawada Highway NH-65</a></li>
          <li><a href="/hyderabad-real-estate/">All 133 Guides</a></li>
        </ul>
      </div>
    </div>

    <div class="footer-bottom-bar">
      <div>© ${new Date().getFullYear()} Bhoomera Realty · Hyderabad, Telangana.</div>
      <div>Specializing in Bharat Future City, Hayathnagar &amp; Connected Corridors. Personal attention by Rambabu.</div>
    </div>
  </footer>

  <!-- Sticky Mobile Action Bar -->
  <div class="mobile-sticky-bar">
    <a href="tel:${PHONE_RAW}" class="btn-mobile-call-action">
      <span>📞</span> Call 98495 58210
    </a>
    <a href="${whatsappUrl}" target="_blank" rel="noopener noreferrer" class="btn-mobile-wa-action">
      <span>💬</span> WhatsApp
    </a>
  </div>

  <!-- Client-side Form Submission Script -->
  <script>
    document.getElementById('seo-lead-form').addEventListener('submit', async function(e) {
      e.preventDefault();
      var btn = document.getElementById('submit-btn');
      var status = document.getElementById('form-feedback');
      var name = document.getElementById('lead-name').value.trim();
      var phone = document.getElementById('lead-phone').value.trim();
      var budget = document.getElementById('lead-budget').value;
      var notes = document.getElementById('lead-notes').value.trim();
      var interest = "${escapeHtml(page.keyword)}";

      if (!name || !phone) {
        status.className = 'form-status error';
        status.textContent = 'Please enter your name and valid phone number.';
        return;
      }

      btn.disabled = true;
      btn.textContent = 'Submitting your enquiry...';
      status.className = 'form-status';
      status.style.display = 'none';

      var payload = {
        kind: 'enquiry',
        fields: {
          'entry.2071933396': name,
          'entry.96690586': phone,
          'entry.1951885304': interest + ' (SEO Page: ${page.slug})',
          'entry.826190633': 'Budget: ' + budget,
          'entry.2022145013': notes ? notes + ' | Budget: ' + budget : 'Budget: ' + budget
        }
      };

      try {
        var res = await fetch('/api/google-submit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (res.ok) {
          status.className = 'form-status success';
          status.textContent = 'Thank you! Rambabu of Bhoomera Realty has received your details and will call you shortly. Need immediate assistance? Call 98495 58210.';
          document.getElementById('seo-lead-form').reset();
        } else {
          throw new Error('Server response not ok');
        }
      } catch (err) {
        status.className = 'form-status success';
        status.innerHTML = 'Thank you ' + name + '! We have noted your request for ' + interest + '. <a href="${whatsappUrl}" target="_blank" style="text-decoration:underline; font-weight:bold;">Click here to message Rambabu on WhatsApp</a> for instant response!';
      } finally {
        btn.disabled = false;
        btn.textContent = 'Request Verified Details & Site Visit';
      }
    });
  </script>

</body>
</html>`;
}

function renderDirectoryHtml(pages) {
  const clusters = [
    {
      title: 'Bharat Future City & Mucherla Core Hub',
      desc: 'Smart city master plan, Young India Skills University, AI City, 300-ft greenfield expressway, and residential/commercial layouts.',
      pages: pages.filter(p => p.slug.includes('future-city') || p.slug.includes('mucherla') || p.slug.includes('ai-city') || p.slug.includes('skills-university') || p.slug.includes('300ft'))
    },
    {
      title: 'Kandukur Mandal & Srisailam Highway Corridor',
      desc: 'Prime beneficiary zone of Future City along NH-765. HMDA layouts, DTCP ventures, farmland, Meerkhanpet, Pulimamidi, and Nedunoor.',
      pages: pages.filter(p => p.slug.includes('kandukur') || p.locality === 'Kandukur' || p.slug.includes('meerkhanpet') || p.slug.includes('pulimamidi') || p.slug.includes('timmapur') || p.slug.includes('rachaloor') || p.slug.includes('nedunoor'))
    },
    {
      title: 'Yacharam Mandal & Nagarjuna Sagar Road Belt',
      desc: 'Bhoomera Realty home operating ground. Open plots, DTCP layouts, managed farmland, Mall, Chintapatla, Manthangoud, and Nandiwanaparthy.',
      pages: pages.filter(p => p.slug.includes('yacharam') || p.locality === 'Yacharam' || p.slug.includes('chintapatla') || p.slug.includes('manthangoud') || p.slug.includes('nandiwanaparthy'))
    },
    {
      title: 'Kadthal, Amangal & Southern Future City Extension',
      desc: 'Srisailam Highway 4-lane expansion, Maisigandi Temple belt, Regional Ring Road (RRR) southern intersection, and affordable plotted ventures.',
      pages: pages.filter(p => p.slug.includes('kadthal') || p.locality === 'Kadthal' || p.slug.includes('amangal') || p.slug.includes('talakondapally') || p.slug.includes('maisigandi'))
    },
    {
      title: 'Maheshwaram & Western Future City Gateway',
      desc: 'Electronic Hardware Park, Fab City, Mansanpally, Harshaguda, Nagaram, and HMDA residential communities.',
      pages: pages.filter(p => p.slug.includes('maheshwaram') || p.locality === 'Maheshwaram' || p.slug.includes('hardware-park') || p.slug.includes('mansanpally') || p.slug.includes('harshaguda') || p.slug.includes('nagaram'))
    },
    {
      title: 'Tukkuguda & Srisailam Highway (ORR Exit 14 Corridor)',
      desc: '10 minutes from RGIA Airport. Outer Ring Road Exit 14, Fab City, luxury villa townships, and prime highway commercial frontage.',
      pages: pages.filter(p => p.slug.includes('tukkuguda') || p.slug.includes('srisailam-highway') || p.slug.includes('exit-14'))
    },
    {
      title: 'Hayathnagar Municipality & Core Residential Enclaves',
      desc: 'Prime gateway to East Hyderabad on Vijayawada Highway. HMDA layouts, RTC Colony, Word & Deed belt, Lecturers Colony, and independent houses.',
      pages: pages.filter(p => p.slug.includes('hayathnagar') && !p.slug.includes('pedda-amberpet') && !p.slug.includes('kuntloor'))
    },
    {
      title: 'Pedda Amberpet & Direct Hayathnagar ORR Exit 11 Vicinity',
      desc: 'Major junction of Vijayawada Highway and Outer Ring Road. Kuntloor, Tatti Annaram, Pasumamula, and Koheda mega market belt.',
      pages: pages.filter(p => p.slug.includes('pedda-amberpet') || p.slug.includes('kuntloor') || p.slug.includes('tatti-annaram') || p.slug.includes('pasumamula') || p.slug.includes('koheda') || p.slug.includes('exit-11'))
    },
    {
      title: 'Vijayawada Highway Corridor (Hayathnagar to Choutuppal)',
      desc: 'Batasingaram logistics hub, Abdullapurmet, Ramoji Film City tourism corridor, and Choutuppal RRR intersection.',
      pages: pages.filter(p => p.slug.includes('vijayawada-highway') || p.slug.includes('batasingaram') || p.slug.includes('abdullapurmet') || p.slug.includes('ramoji') || p.slug.includes('anajpur') || p.slug.includes('choutuppal'))
    },
    {
      title: 'Connecting Triangle: Bongloor (ORR Exit 12), Adibatla & Ibrahimpatnam',
      desc: 'The direct geographic bridge linking Hayathnagar to Bharat Future City. TCS Adibatla, Aerospace SEZ, Sagar Road (NH-565), and RRR Southern Arc.',
      pages: pages.filter(p => p.slug.includes('bongloor') || p.slug.includes('adibatla') || p.slug.includes('ibrahimpatnam') || p.slug.includes('mangalapally') || p.slug.includes('manchal') || p.slug.includes('sagar-highway') || p.slug.includes('rrr'))
    },
    {
      title: 'Regulatory Approval Guides & Due Diligence',
      desc: 'HMDA layout compliance, DTCP approval orders, TS-RERA registration checks, and title due diligence across Future City and Hayathnagar.',
      pages: pages.filter(p => p.slug.includes('legal-verification') || p.slug.includes('acquisition') || p.slug.includes('rera-approved') || p.slug.includes('hmda-approved-plots-in-bharat'))
    }
  ];

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Bharat Future City &amp; Hayathnagar Real Estate Directory — 133+ Verified Guides | Bhoomera Realty</title>
  <meta name="description" content="Comprehensive real estate directory for Bharat Future City, Hayathnagar, Kandukur, Yacharam, Maheshwaram &amp; connecting corridors. 100% legal verification, zero mock data. Call 98495 58210." />
  <link rel="canonical" href="${SITE_DOMAIN}/hyderabad-real-estate/" />
  <meta name="robots" content="index, follow" />
  <meta name="theme-color" content="#103f30" />
  <link rel="icon" type="image/png" href="/images/bhoomera-realty-logo.png" />

  <!-- Google Fonts: Instrument Serif & DM Sans -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;1,9..40,400&family=Instrument+Serif:ital@0;1&display=swap" rel="stylesheet">

  <style>
    :root {
      --green: #103f30;
      --green-dark: #09261d;
      --gold: #b79749;
      --gold-light: #dfcda7;
      --cream: #f8f6ef;
      --cream-card: #fffefa;
      --ink: #203a30;
      --muted: #66736b;
      --line: #dce3d9;
      --font-serif: 'Instrument Serif', Georgia, serif;
      --font-sans: 'DM Sans', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: var(--font-sans); background: var(--cream); color: var(--ink); line-height: 1.6; padding-bottom: 70px; }
    a { color: inherit; text-decoration: none; }
    .site-header { position: sticky; top: 0; z-index: 100; height: 90px; background: #f8f6f0; border-bottom: 1px solid #c1b69d55; }
    .header-inner { max-width: 1240px; height: 100%; margin: 0 auto; padding: 0 5%; display: flex; align-items: center; justify-content: space-between; }
    .brand-logo { display: flex; align-items: center; gap: 12px; color: var(--green); line-height: .95; }
    .brand-symbol { position: relative; display: block; overflow: hidden; width: 36px; height: 48px; background: #fbfaf6; border-radius: 2px; }
    .brand-symbol img { position: absolute; width: 126px; max-width: none; left: -46px; top: -26px; }
    .brand-wordmark { display: flex; flex-direction: column; gap: 6px; font-size: 22px; letter-spacing: .08em; font-family: Georgia, serif; }
    .brand-wordmark b { font-weight: 500; }
    .brand-wordmark small { font-family: var(--font-sans); font-size: 8px; letter-spacing: .5em; color: var(--muted); }
    .header-cta { background: var(--green); color: #fff; padding: 12px 20px; font-size: 12px; display: inline-flex; align-items: center; gap: 8px; }
    .hero-dir { background: linear-gradient(90deg, rgba(8,40,27,0.96) 0%, rgba(8,40,27,0.85) 55%, rgba(8,40,27,0.45) 100%), url('/images/architecture-hero.jpg'); background-size: cover; color: #fff; padding: 70px 5% 80px; text-align: center; border-bottom: 2px solid var(--gold); }
    .hero-dir .eyebrow { display: inline-flex; align-items: center; gap: 12px; color: var(--gold-light); font-size: 10px; letter-spacing: .18em; text-transform: uppercase; margin-bottom: 16px; }
    .hero-dir .eyebrow::before { content: ''; width: 32px; height: 1px; background: var(--gold); }
    .hero-dir h1 { font-family: var(--font-serif); font-size: clamp(38px, 4.5vw, 64px); font-weight: 400; line-height: 1.08; margin-bottom: 14px; }
    .hero-dir h1 em { color: var(--gold-light); font-style: italic; }
    .hero-dir p { max-width: 720px; margin: 0 auto; font-size: 14px; color: #e0e5d7; line-height: 1.8; }
    .search-box-dir { max-width: 580px; margin: 30px auto 0; position: relative; }
    .search-box-dir input { width: 100%; padding: 15px 20px; border-radius: 0; border: 1px solid var(--gold); font-size: 13px; background: #fff; color: var(--ink); outline: none; }
    .container { max-width: 1240px; margin: 48px auto; padding: 0 5%; }
    .cluster-card { background: var(--cream-card); border: 1px solid var(--line); border-top: 3px solid var(--gold); padding: 36px 32px; margin-bottom: 36px; box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
    .cluster-card h2 { font-family: var(--font-serif); font-size: 30px; font-weight: 400; color: var(--green); margin-bottom: 6px; }
    .cluster-card p.desc { font-size: 12px; color: var(--muted); margin-bottom: 24px; line-height: 1.7; }
    .links-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 14px; }
    .directory-item { padding: 14px 16px; background: #fbfaf6; border: 1px solid var(--line); font-size: 12px; font-weight: 500; color: var(--ink); display: flex; align-items: center; justify-content: space-between; transition: all 0.2s; }
    .directory-item:hover { border-color: var(--gold); background: var(--cream-card); transform: translateX(3px); color: var(--green); }
    .badge-count { font-size: 10px; color: var(--muted); }
    .site-footer { background: #0d2e23; color: #e0e5d7; padding: 48px 5% 24px; text-align: center; font-size: 12px; margin-top: 60px; border-top: 2px solid var(--gold); }
    .site-footer a { color: var(--gold-light); }
  </style>
</head>
<body>
  <header class="site-header">
    <div class="header-inner">
      <a class="brand-logo" href="/" aria-label="Bhoomera Realty home">
        <span class="brand-symbol"><img src="/images/bhoomera-realty-logo.png" alt="" /></span>
        <span class="brand-wordmark"><b>BHOOMERA</b><small style="color: var(--muted);">REALTY</small></span>
      </a>
      <a href="tel:${PHONE_RAW}" class="header-cta">
        <span>📞</span> Call 98495 58210
      </a>
    </div>
  </header>

  <section class="hero-dir">
    <div class="eyebrow"><span>VERIFIED LOCAL INTELLIGENCE</span></div>
    <h1>Bharat Future City &amp; Hayathnagar<br/><em>Real Estate Directory</em></h1>
    <p>133 verified research guides covering smart city development, HMDA &amp; DTCP layout sanctions, agricultural land, and connecting arterial corridors. Zero mock listings.</p>
    <div class="search-box-dir">
      <input type="text" id="dir-search" placeholder="Type a locality or keyword (e.g. Mucherla, Kandukur, Hayathnagar, HMDA)..." oninput="filterCorridors()" />
    </div>
  </section>

  <main class="container" id="clusters-container">
    ${clusters.map((cluster, cIndex) => `
    <section class="cluster-card" data-cluster-title="${escapeHtml(cluster.title.toLowerCase())}">
      <h2>0${cIndex + 1} — ${escapeHtml(cluster.title)}</h2>
      <p class="desc">${escapeHtml(cluster.desc)} (${cluster.pages.length} Guides)</p>
      <div class="links-grid">
        ${cluster.pages.map(page => `
        <a href="/${page.slug}/" class="directory-item" data-text="${escapeHtml(page.shortTitle.toLowerCase())} ${escapeHtml(page.keyword.toLowerCase())}">
          <span>${escapeHtml(page.shortTitle)}</span>
          <span class="badge-count">→</span>
        </a>`).join('\n        ')}
      </div>
    </section>`).join('\n    ')}
  </main>

  <footer class="site-footer">
    <p>© ${new Date().getFullYear()} Bhoomera Realty. Hyderabad, Telangana. Direct advisory by Rambabu: <a href="tel:${PHONE_RAW}">+91 98495 58210</a></p>
  </footer>

  <script>
    function filterCorridors() {
      var query = document.getElementById('dir-search').value.toLowerCase().trim();
      var items = document.querySelectorAll('.directory-item');
      var sections = document.querySelectorAll('.cluster-card');

      items.forEach(function(item) {
        var text = item.getAttribute('data-text') || '';
        if (!query || text.indexOf(query) !== -1) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });

      sections.forEach(function(sec) {
        var visibleItems = sec.querySelectorAll('.directory-item[style*="display: flex"]');
        if (!query) {
          sec.style.display = 'block';
        } else if (visibleItems.length > 0 || (sec.getAttribute('data-cluster-title') || '').indexOf(query) !== -1) {
          sec.style.display = 'block';
        } else {
          sec.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;
}

function generateSitemapXml(pages) {
  const today = new Date().toISOString().split('T')[0];

  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- Homepage -->
  <url>
    <loc>${SITE_DOMAIN}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Master Directory -->
  <url>
    <loc>${SITE_DOMAIN}/hyderabad-real-estate/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority>
  </url>
`;

  for (const page of pages) {
    xml += `  <url>
    <loc>${SITE_DOMAIN}/${page.slug}/</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
`;
  }

  xml += `</urlset>`;
  return xml;
}

function generateRobotsTxt() {
  return `# Bhoomera Realty Robots.txt
User-agent: *
Allow: /

# Sitemaps
Sitemap: ${SITE_DOMAIN}/sitemap.xml
`;
}

async function run() {
  console.log(`Starting SEO pages generation for ${ALL_SEO_PAGES.length} targets (Bharat Future City, Hayathnagar & related)...`);

  // 1. Generate individual SEO landing pages
  for (const page of ALL_SEO_PAGES) {
    const htmlContent = renderHtml(page);

    // Write to folder/index.html (e.g. public/plots-for-sale-in-kandukur/index.html)
    const pageDir = path.join(PUBLIC_DIR, page.slug);
    await mkdir(pageDir, { recursive: true });
    await writeFile(path.join(pageDir, 'index.html'), htmlContent, 'utf8');

    // Also write to slug.html for server fallback compatibility (e.g. public/plots-for-sale-in-kandukur.html)
    await writeFile(path.join(PUBLIC_DIR, `${page.slug}.html`), htmlContent, 'utf8');
  }
  console.log(`✓ Generated ${ALL_SEO_PAGES.length} individual SEO pages (both /slug/index.html and /slug.html formats).`);

  // 2. Generate Master Directory Page
  const dirPageContent = renderDirectoryHtml(ALL_SEO_PAGES);
  const dirDir = path.join(PUBLIC_DIR, 'hyderabad-real-estate');
  await mkdir(dirDir, { recursive: true });
  await writeFile(path.join(dirDir, 'index.html'), dirPageContent, 'utf8');
  await writeFile(path.join(PUBLIC_DIR, 'hyderabad-real-estate.html'), dirPageContent, 'utf8');
  console.log('✓ Generated master directory at /hyderabad-real-estate/');

  // 3. Generate Sitemap XML
  const sitemapContent = generateSitemapXml(ALL_SEO_PAGES);
  await writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), sitemapContent, 'utf8');
  console.log(`✓ Generated public/sitemap.xml with ${ALL_SEO_PAGES.length + 2} URLs.`);

  // 4. Generate Robots.txt
  const robotsContent = generateRobotsTxt();
  await writeFile(path.join(PUBLIC_DIR, 'robots.txt'), robotsContent, 'utf8');
  console.log('✓ Generated public/robots.txt pointing to sitemap.xml.');

  console.log('All SEO assets generated successfully!');
}

run().catch(err => {
  console.error('Error generating SEO pages:', err);
  process.exit(1);
});
