# ToolsTrek 🚀

A comprehensive suite of productivity and utility tools built with modern web technologies. ToolsTrek provides easy-to-use, fast, and reliable tools for everyday tasks—all in one place.

## 🌟 Features

- **Multiple Productivity Tools** - Access a collection of essential utilities without switching between multiple applications
- **Fast & Responsive** - Built with Next.js 16 and optimized for performance
- **Beautiful UI** - Modern, user-friendly interface with dark mode support
- **Mobile Friendly** - Fully responsive design that works on all devices
- **No Account Required** - Use all tools without creating an account or login
- **Privacy First** - Your data stays on your device; no tracking or data collection
- **Easy Sharing** - Quick action buttons to copy, download, or share results

## 🛠️ Available Tools

### Text & Code

- **Case Converter** - Convert text between different cases (uppercase, lowercase, title case, camelCase, snake_case, etc.)
- **Markdown Previewer** - Write and preview Markdown in real-time with syntax highlighting
- **QR Code Scanner** - Scan QR codes using your device camera

### Media & Files

- **PDF to Image** - Convert PDF files to images with batch processing support
- **WiFi QR Generator** - Generate QR codes for your WiFi network for easy sharing

### Utilities & Generators

- **Age Calculator** - Calculate your exact age in years, months, and days
- **Days Tracker** - Track important dates and count down to events
- **Password Generator** - Generate secure, customizable passwords with strength indicator
- **Link Shortener** - Create short, shareable links

## 🏗️ Tech Stack

- **Framework**: [Next.js 16.2](https://nextjs.org/) - React framework with built-in optimization
- **Frontend**: [React 19](https://react.dev/) - UI library
- **Styling**: [TailwindCSS](https://tailwindcss.com/) - Utility-first CSS framework
- **UI Components**: [Radix UI](https://www.radix-ui.com/) - Headless component library
- **Forms**: [React Hook Form](https://react-hook-form.com/) - Efficient form validation
- **Icons**: [Lucide React](https://lucide.dev/) - Beautiful SVG icon library
- **Animation**: [Framer Motion](https://www.framer.com/motion/) - Animation library
- **QR Processing**: [@zxing/library](https://github.com/zxing-js/library), [jsqr](https://github.com/cozmo/jsqr), [qrcode.react](https://www.npmjs.com/package/qrcode.react)
- **PDF Processing**: [jspdf](https://github.com/parallax/jsPDF), [pdfjs-dist](https://mozilla.github.io/pdf.js/)
- **Code Highlighting**: [highlight.js](https://highlightjs.org/)
- **Markdown**: [react-markdown](https://github.com/remarkjs/react-markdown)
- **Email**: [Nodemailer](https://nodemailer.com/)
- **Backend**: Node.js API routes (Next.js API functions)

## 📦 Installation

### Prerequisites

- Node.js 18.17 or later
- npm or yarn package manager

### Setup

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/toolstrek.git
   cd toolstrek
   ```

2. **Install dependencies**

   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:

   ```env
   # Add any required environment variables here
   # Example: NEXT_PUBLIC_RECAPTCHA_SITE_KEY=your_key_here
   ```

4. **Start the development server**

   ```bash
   npm run dev
   ```

   The application will open at [http://localhost:1000](http://localhost:1000)

## 🚀 Quick Start

### Development

```bash
npm run dev          # Start development server with Turbopack
```

### Production

```bash
npm run build        # Build for production
npm start            # Start production server
```

### Linting

```bash
npm run lint         # Run ESLint
```

## 📁 Project Structure

```
toolstrek/
├── app/
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Home page
│   ├── api/                      # API routes
│   │   ├── contact/              # Contact form endpoint
│   │   └── verify-recaptcha/     # reCAPTCHA verification
│   ├── tools/                    # Tool pages
│   │   ├── age-calculate/
│   │   ├── case-converter/
│   │   ├── days-tracker/
│   │   ├── link-shortner/
│   │   ├── markdown-previewer/
│   │   ├── password-generator/
│   │   ├── pdf-to-image/
│   │   ├── qr-scanner/
│   │   └── wifi-qr/
│   ├── tools-compo/              # Tool components
│   ├── contact-us/               # Contact page
│   ├── about-us/                 # About page
│   ├── pricing/                  # Pricing page
│   ├── faq/                      # FAQ page
│   ├── privacy-policy/           # Privacy policy page
│   └── data/                     # Static data (FAQs, etc.)
├── components/
│   └── ui/                       # Reusable UI components
├── lib/
│   └── utils.js                  # Utility functions
├── public/                       # Static assets
├── next.config.mjs               # Next.js configuration
├── tailwind.config.js            # TailwindCSS configuration
├── postcss.config.mjs            # PostCSS configuration
├── jsconfig.json                 # JavaScript configuration
├── components.json               # UI components config
└── package.json                  # Dependencies and scripts
```

## 🎯 Features Highlights

### Performance

- **Turbopack** - Next.js native bundler for faster builds
- **Image Optimization** - Automatic image optimization
- **Code Splitting** - Automatic code splitting for faster page loads

### User Experience

- **Dark Mode** - Built-in dark mode support with `next-themes`
- **Real-time Preview** - Instant feedback for converters and generators
- **Copy to Clipboard** - One-click copying of results
- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile

### Developer Experience

- **Modern React** - Latest React 19 with improved APIs
- **TypeScript Ready** - Compatible with TypeScript (jsconfig.json)
- **ESLint** - Code quality and consistency checks
- **Hot Reload** - Fast refresh during development

## 📖 Usage Examples

### Age Calculator

1. Navigate to the Age Calculator tool
2. Select your date of birth
3. Get your exact age calculated instantly

### Password Generator

1. Open the Password Generator tool
2. Customize options (length, character types, etc.)
3. Generate passwords with strength indicator
4. Copy to clipboard with one click

### QR Code Generator

1. Visit the WiFi QR tool
2. Enter your WiFi details
3. Generate and share QR code instantly

## 🔒 Security & Privacy

- **No Data Storage** - Tools process data locally in your browser
- **No Tracking** - No analytics or user tracking
- **No Ads** - Clean, ad-free experience
- **Secure** - Uses modern security practices and HTTPS

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📧 Contact & Support

- **Email**: support@toolstrek.com
- **Website**: [toolstrek.com](https://toolstrek.com)
- **Issues**: [Report a bug](https://github.com/yourusername/toolstrek/issues)

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI Components from [Radix UI](https://www.radix-ui.com/)
- Icons from [Lucide React](https://lucide.dev/)
- Styled with [TailwindCSS](https://tailwindcss.com/)

---

Made with ❤️ by the ToolsTrek Team
