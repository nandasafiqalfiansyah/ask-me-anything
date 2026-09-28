const fs = require('fs')
const path = require('path')
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib')

const CERTIFICATES_DATA = [
  {
    id: 1,
    slug: 'bangkit-ml',
    title: 'Bangkit Academy - Machine Learning Distinction Graduate',
    company: 'Google, GoTo, Traveloka',
    issuedDate: 'January 15, 2024',
    isoDate: '2024-01-15',
    credentialId: 'BANGKIT-2023-ML-0894',
    badge: 'Distinction Graduate',
    accentColor: '#1A73E8', // Google Blue
    accentColorRgb: [0.1, 0.45, 0.91],
    goldColor: '#F9AB00',
    description: 'Awarded to Nanda Safiq Alfiansyah for graduating with Distinction in the Machine Learning path led by Google, GoTo, and Traveloka (Kemendikbudristek Kampus Merdeka).'
  },
  {
    id: 2,
    slug: 'gcp-ace',
    title: 'Google Cloud Certified - Associate Cloud Engineer Preparation',
    company: 'Google Cloud Platform',
    issuedDate: 'November 20, 2023',
    isoDate: '2023-11-20',
    credentialId: 'GCP-ACE-2023-NDAV88',
    badge: 'Cloud Architecture & Systems',
    accentColor: '#4285F4',
    accentColorRgb: [0.26, 0.52, 0.96],
    goldColor: '#34A853',
    description: 'Awarded to Nanda Safiq Alfiansyah for comprehensive specialization covering IAM, Compute Engine, Kubernetes Engine, and Cloud Storage architectures.'
  },
  {
    id: 3,
    slug: 'deeplearning-tf',
    title: 'TensorFlow Developer Professional Specialization',
    company: 'DeepLearning.AI',
    issuedDate: 'September 10, 2023',
    isoDate: '2023-09-10',
    credentialId: 'DL-TF-2023-882190',
    badge: 'Deep Learning & Neural Networks',
    accentColor: '#FF6F00', // TensorFlow Orange
    accentColorRgb: [1.0, 0.43, 0.0],
    goldColor: '#E65100',
    description: 'Awarded to Nanda Safiq Alfiansyah for mastering neural networks, Computer Vision with CNNs, Natural Language Processing with RNNs, and Time Series Forecasting.'
  },
  {
    id: 4,
    slug: 'dicoding-backend',
    title: 'Menjadi Back-End Developer Expert',
    company: 'Dicoding Indonesia',
    issuedDate: 'June 18, 2023',
    isoDate: '2023-06-18',
    credentialId: '1OP8WLV31XQK',
    badge: 'Expert Backend Architect',
    accentColor: '#2D3E50', // Dicoding Navy
    accentColorRgb: [0.18, 0.24, 0.31],
    goldColor: '#E0A96D',
    description: 'Awarded to Nanda Safiq Alfiansyah for demonstrating expertise in scalable microservices, CI/CD pipelines, automated testing, Redis caching, and RabbitMQ message queues.'
  },
  {
    id: 5,
    slug: 'dicoding-frontend',
    title: 'Menjadi Front-End Web Developer Expert',
    company: 'Dicoding Indonesia',
    issuedDate: 'April 05, 2023',
    isoDate: '2023-04-05',
    credentialId: '72PVDW1E8ZY5',
    badge: 'Expert Frontend Engineer',
    accentColor: '#00838F', // Dicoding Teal
    accentColorRgb: [0.0, 0.51, 0.56],
    goldColor: '#FFB300',
    description: 'Awarded to Nanda Safiq Alfiansyah for mastering Progressive Web Apps (PWA), Web Accessibility (a11y), clean code architecture, performance optimization, and E2E testing.'
  },
  {
    id: 6,
    slug: 'aws-cloud',
    title: 'Architecting on AWS (Membangun Arsitektur Cloud)',
    company: 'Amazon Web Services (AWS)',
    issuedDate: 'February 12, 2023',
    isoDate: '2023-02-12',
    credentialId: 'AWS-ARCH-2023-551042',
    badge: 'Cloud Solutions Architect',
    accentColor: '#FF9900', // AWS Orange
    accentColorRgb: [1.0, 0.6, 0.0],
    goldColor: '#232F3E',
    description: 'Awarded to Nanda Safiq Alfiansyah for expertise in designing highly available, cost-effective, fault-tolerant, and scalable systems on Amazon Web Services.'
  }
]

function generateSvgCertificate(cert) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 680" width="100%" height="100%">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FCFCFD"/>
      <stop offset="100%" stop-color="#F3F4F6"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="50%" stop-color="#D97706"/>
      <stop offset="100%" stop-color="#B45309"/>
    </linearGradient>
    <linearGradient id="primaryGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${cert.accentColor}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
    <filter id="shadow" x="-5%" y="-5%" width="110%" height="110%">
      <feDropShadow dx="0" dy="4" stdDeviation="6" flood-opacity="0.12"/>
    </filter>
  </defs>

  <!-- Background Canvas -->
  <rect width="1000" height="680" fill="url(#bgGrad)"/>
  
  <!-- Outer Border Frame -->
  <rect x="25" y="25" width="950" height="630" rx="12" fill="none" stroke="#D1D5DB" stroke-width="2"/>
  <rect x="36" y="36" width="928" height="608" rx="8" fill="none" stroke="#E5E7EB" stroke-width="1"/>
  
  <!-- Corner Ornaments -->
  <path d="M 45 65 L 45 45 L 65 45" fill="none" stroke="${cert.accentColor}" stroke-width="3"/>
  <path d="M 955 65 L 955 45 L 935 45" fill="none" stroke="${cert.accentColor}" stroke-width="3"/>
  <path d="M 45 615 L 45 635 L 65 635" fill="none" stroke="${cert.accentColor}" stroke-width="3"/>
  <path d="M 955 615 L 955 635 L 935 635" fill="none" stroke="${cert.accentColor}" stroke-width="3"/>

  <!-- Top Accent Bar -->
  <rect x="200" y="36" width="600" height="4" fill="url(#goldGrad)" rx="2"/>

  <!-- Top Badge / Organization -->
  <g transform="translate(500, 100)" text-anchor="middle">
    <rect x="-140" y="-22" width="280" height="34" rx="17" fill="${cert.accentColor}" fill-opacity="0.08" stroke="${cert.accentColor}" stroke-width="1.2"/>
    <text y="0" font-family="system-ui, -apple-system, sans-serif" font-size="12" font-weight="700" fill="${cert.accentColor}" letter-spacing="2">
      ${cert.company.toUpperCase()}
    </text>
  </g>

  <!-- Certificate Heading -->
  <text x="500" y="165" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="34" font-weight="bold" fill="#111827" letter-spacing="1">
    CERTIFICATE OF ACHIEVEMENT
  </text>
  <text x="500" y="195" text-anchor="middle" font-family="system-ui, sans-serif" font-size="13" font-weight="500" fill="#6B7280" letter-spacing="3">
    THIS CREDENTIAL IS PROUDLY PRESENTED TO
  </text>

  <!-- Recipient Name -->
  <text x="500" y="260" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="40" font-weight="bold" fill="#0F172A">
    Nanda Safiq Alfiansyah
  </text>
  
  <!-- Underline under name -->
  <line x1="280" y1="280" x2="720" y2="280" stroke="url(#goldGrad)" stroke-width="2"/>
  <circle cx="500" cy="280" r="4" fill="#D97706"/>

  <!-- Course Title / Purpose -->
  <text x="500" y="325" text-anchor="middle" font-family="system-ui, sans-serif" font-size="14" fill="#4B5563">
    for successfully completing all requirements and demonstrating excellence in
  </text>
  <text x="500" y="365" text-anchor="middle" font-family="Georgia, serif" font-size="24" font-weight="bold" fill="${cert.accentColor}">
    ${cert.title}
  </text>

  <!-- Description / Detail -->
  <foreignObject x="180" y="390" width="640" height="60">
    <p xmlns="http://www.w3.org/1999/xhtml" style="font-family: system-ui, sans-serif; font-size: 13px; color: #4B5563; text-align: center; margin: 0; line-height: 1.5;">
      ${cert.description}
    </p>
  </foreignObject>

  <!-- Gold Stamp / Seal (Center Bottom) -->
  <g transform="translate(500, 520)" filter="url(#shadow)">
    <circle cx="0" cy="0" r="42" fill="url(#goldGrad)"/>
    <circle cx="0" cy="0" r="38" fill="none" stroke="#FFFFFF" stroke-width="1.5" stroke-dasharray="3,2"/>
    <circle cx="0" cy="0" r="32" fill="#FFFFFF" fill-opacity="0.15"/>
    <!-- Star icon -->
    <polygon points="0,-18 5,-5 19,-5 8,4 12,17 0,9 -12,17 -8,4 -19,-5 -5,-5" fill="#FFFFFF"/>
    <text y="24" text-anchor="middle" font-family="system-ui, sans-serif" font-size="8" font-weight="800" fill="#FFFFFF" letter-spacing="1">VERIFIED</text>
  </g>

  <!-- Left: Issue Date & Credential ID -->
  <g transform="translate(180, 520)">
    <line x1="0" y1="0" x2="160" y2="0" stroke="#9CA3AF" stroke-width="1.5"/>
    <text x="80" y="20" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#1F2937">
      ${cert.issuedDate}
    </text>
    <text x="80" y="38" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#6B7280" letter-spacing="1">
      DATE ISSUED
    </text>
    <text x="80" y="55" text-anchor="middle" font-family="monospace" font-size="9" font-weight="bold" fill="${cert.accentColor}">
      ID: ${cert.credentialId}
    </text>
  </g>

  <!-- Right: Authorized Signature -->
  <g transform="translate(660, 520)">
    <!-- Signature Graphic -->
    <path d="M 20 -15 Q 40 -35, 60 -10 T 100 -20 T 140 -5" fill="none" stroke="#1E293B" stroke-width="2" stroke-linecap="round"/>
    <line x1="0" y1="0" x2="160" y2="0" stroke="#9CA3AF" stroke-width="1.5"/>
    <text x="80" y="20" text-anchor="middle" font-family="system-ui, sans-serif" font-size="12" font-weight="600" fill="#1F2937">
      ${cert.company.split(',')[0]}
    </text>
    <text x="80" y="38" text-anchor="middle" font-family="system-ui, sans-serif" font-size="10" fill="#6B7280" letter-spacing="1">
      AUTHORIZED SIGNATURE
    </text>
    <text x="80" y="55" text-anchor="middle" font-family="system-ui, sans-serif" font-size="9" fill="#10B981" font-weight="bold">
      STATUS: VERIFIED
    </text>
  </g>

  <!-- Footer security code -->
  <text x="500" y="630" text-anchor="middle" font-family="monospace" font-size="9" fill="#9CA3AF">
    Cryptographically Verified Certificate • SHA-256 Authentication • nandasafiqalfiansyah@gmail.com
  </text>
</svg>`
}

async function generatePdfCertificate(cert) {
  // Landscape A4: 841.89 x 595.28 points
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage([842, 595])
  
  const fontSerif = await pdfDoc.embedFont(StandardFonts.TimesRomanBold)
  const fontSerifRegular = await pdfDoc.embedFont(StandardFonts.TimesRoman)
  const fontSans = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const fontSansBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold)
  const fontMono = await pdfDoc.embedFont(StandardFonts.CourierBold)

  const [ar, ag, ab] = cert.accentColorRgb

  // Background rect
  page.drawRectangle({
    x: 0,
    y: 0,
    width: 842,
    height: 595,
    color: rgb(0.98, 0.98, 0.99)
  })

  // Outer border
  page.drawRectangle({
    x: 20,
    y: 20,
    width: 802,
    height: 555,
    borderColor: rgb(0.8, 0.82, 0.86),
    borderWidth: 2,
    color: rgb(0.99, 0.99, 1.0)
  })

  // Inner border
  page.drawRectangle({
    x: 30,
    y: 30,
    width: 782,
    height: 535,
    borderColor: rgb(0.9, 0.92, 0.94),
    borderWidth: 1
  })

  // Top Accent Banner
  page.drawRectangle({
    x: 180,
    y: 560,
    width: 482,
    height: 4,
    color: rgb(0.85, 0.65, 0.15)
  })

  // Company badge
  const companyText = cert.company.toUpperCase()
  const compWidth = fontSansBold.widthOfTextAtSize(companyText, 11)
  page.drawRectangle({
    x: 421 - compWidth / 2 - 16,
    y: 505,
    width: compWidth + 32,
    height: 24,
    color: rgb(ar, ag, ab)
  })
  page.drawText(companyText, {
    x: 421 - compWidth / 2,
    y: 512,
    size: 11,
    font: fontSansBold,
    color: rgb(1, 1, 1)
  })

  // Title: Certificate of Achievement
  const heading = 'CERTIFICATE OF ACHIEVEMENT'
  const headWidth = fontSerif.widthOfTextAtSize(heading, 28)
  page.drawText(heading, {
    x: 421 - headWidth / 2,
    y: 460,
    size: 28,
    font: fontSerif,
    color: rgb(0.1, 0.12, 0.18)
  })

  // Subtitle
  const sub = 'THIS CREDENTIAL IS PROUDLY PRESENTED TO'
  const subWidth = fontSans.widthOfTextAtSize(sub, 10)
  page.drawText(sub, {
    x: 421 - subWidth / 2,
    y: 435,
    size: 10,
    font: fontSans,
    color: rgb(0.4, 0.45, 0.5)
  })

  // Recipient Name
  const name = 'Nanda Safiq Alfiansyah'
  const nameWidth = fontSerif.widthOfTextAtSize(name, 36)
  page.drawText(name, {
    x: 421 - nameWidth / 2,
    y: 375,
    size: 36,
    font: fontSerif,
    color: rgb(0.06, 0.09, 0.16)
  })

  // Name underline
  page.drawLine({
    start: { x: 250, y: 360 },
    end: { x: 592, y: 360 },
    thickness: 1.5,
    color: rgb(0.85, 0.65, 0.15)
  })

  // For fulfilling requirements
  const descLead = 'for successfully completing all curriculum requirements and demonstrating excellence in'
  const descLeadWidth = fontSans.widthOfTextAtSize(descLead, 11)
  page.drawText(descLead, {
    x: 421 - descLeadWidth / 2,
    y: 330,
    size: 11,
    font: fontSans,
    color: rgb(0.3, 0.35, 0.4)
  })

  // Course Title
  const courseTitle = cert.title
  const courseWidth = fontSerif.widthOfTextAtSize(courseTitle, 19)
  page.drawText(courseTitle, {
    x: 421 - courseWidth / 2,
    y: 300,
    size: 19,
    font: fontSerif,
    color: rgb(ar, ag, ab)
  })

  // Badge pill
  const badgeText = cert.badge
  const badgeWidth = fontSansBold.widthOfTextAtSize(badgeText, 10)
  page.drawRectangle({
    x: 421 - badgeWidth / 2 - 12,
    y: 260,
    width: badgeWidth + 24,
    height: 20,
    color: rgb(0.94, 0.96, 0.98),
    borderColor: rgb(0.8, 0.85, 0.9),
    borderWidth: 1
  })
  page.drawText(badgeText, {
    x: 421 - badgeWidth / 2,
    y: 266,
    size: 10,
    font: fontSansBold,
    color: rgb(0.2, 0.25, 0.3)
  })

  // Gold seal in center bottom
  page.drawCircle({
    x: 421,
    y: 135,
    size: 38,
    color: rgb(0.9, 0.7, 0.15)
  })
  page.drawCircle({
    x: 421,
    y: 135,
    size: 34,
    borderColor: rgb(1, 1, 1),
    borderWidth: 1.5
  })
  const sealText = 'OFFICIAL'
  const sealWidth = fontSansBold.widthOfTextAtSize(sealText, 8)
  page.drawText(sealText, {
    x: 421 - sealWidth / 2,
    y: 138,
    size: 8,
    font: fontSansBold,
    color: rgb(1, 1, 1)
  })
  const sealText2 = 'VERIFIED'
  const sealWidth2 = fontSansBold.widthOfTextAtSize(sealText2, 7)
  page.drawText(sealText2, {
    x: 421 - sealWidth2 / 2,
    y: 126,
    size: 7,
    font: fontSansBold,
    color: rgb(1, 1, 1)
  })

  // Left column: Issue Date & Credential ID
  page.drawLine({
    start: { x: 140, y: 150 },
    end: { x: 280, y: 150 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.7)
  })
  page.drawText(cert.issuedDate, {
    x: 140,
    y: 132,
    size: 11,
    font: fontSansBold,
    color: rgb(0.15, 0.2, 0.25)
  })
  page.drawText('DATE ISSUED', {
    x: 140,
    y: 116,
    size: 9,
    font: fontSans,
    color: rgb(0.5, 0.55, 0.6)
  })
  page.drawText(`CREDENTIAL ID: ${cert.credentialId}`, {
    x: 140,
    y: 98,
    size: 8,
    font: fontMono,
    color: rgb(ar, ag, ab)
  })

  // Right column: Authorized Signatures
  page.drawLine({
    start: { x: 560, y: 150 },
    end: { x: 700, y: 150 },
    thickness: 1,
    color: rgb(0.6, 0.65, 0.7)
  })
  const issuerShort = cert.company.split(',')[0]
  page.drawText(issuerShort, {
    x: 560,
    y: 132,
    size: 11,
    font: fontSansBold,
    color: rgb(0.15, 0.2, 0.25)
  })
  page.drawText('AUTHORIZED VERIFIER', {
    x: 560,
    y: 116,
    size: 9,
    font: fontSans,
    color: rgb(0.5, 0.55, 0.6)
  })
  page.drawText('STATUS: AUTHENTICATED & RECORDED', {
    x: 560,
    y: 98,
    size: 8,
    font: fontSansBold,
    color: rgb(0.1, 0.6, 0.3)
  })

  // Security footer
  const footerText = 'Cryptographically Verified Credential • SHA-256 Authentication • nandasafiqalfiansyah@gmail.com'
  const fWidth = fontMono.widthOfTextAtSize(footerText, 8)
  page.drawText(footerText, {
    x: 421 - fWidth / 2,
    y: 45,
    size: 8,
    font: fontMono,
    color: rgb(0.6, 0.65, 0.7)
  })

  const pdfBytes = await pdfDoc.save()
  return pdfBytes
}

async function main() {
  const outDir = path.join(__dirname, '../public/certificates')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }

  console.log('Generating vector SVG certificate images and genuine PDF files...')

  for (const cert of CERTIFICATES_DATA) {
    // 1. Generate SVG image
    const svgContent = generateSvgCertificate(cert)
    const svgPath = path.join(outDir, `${cert.slug}.svg`)
    fs.writeFileSync(svgPath, svgContent, 'utf8')
    console.log(`✓ Created SVG: ${cert.slug}.svg`)

    // 2. Generate PDF document
    const pdfBytes = await generatePdfCertificate(cert)
    const pdfPath = path.join(outDir, `${cert.slug}.pdf`)
    fs.writeFileSync(pdfPath, pdfBytes)
    console.log(`✓ Created PDF: ${cert.slug}.pdf (${pdfBytes.length} bytes)`)
  }

  console.log('All certificate image and PDF assets successfully created!')
}

main().catch(err => {
  console.error('Error generating certificates:', err)
  process.exit(1)
})
