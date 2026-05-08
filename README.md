# ToolsTrek

ToolsTrek is a modern online utility hub built with Next.js. It combines text tools, PDF utilities, QR tools, image converters, and productivity helpers in one fast, responsive interface.

## Overview

The project is designed for quick, low-friction workflows:

- Most tools run directly in the browser.
- The interface is responsive and works well across desktop and mobile.
- Supporting pages include About, FAQ, Pricing, Contact, and Privacy Policy.
- Server-side routes are used where needed for contact delivery and verification.

## Key Features

- Browser-first experience with no account required
- Fast and responsive UI
- Privacy-conscious tool design
- Clear navigation across a large tool library
- Contact form with SMTP and reCAPTCHA support
- Free and easy to use

## Tool Library

### Text and Writing

- Case Converter
- Markdown Previewer
- Text Repeater
- Numbers to Words

### Productivity

- Age Calculator
- Days Tracker
- BMI Calculator
- Domain Age Checker
- Fake Info Generator

### QR and Scanning

- QR Code Generator
- QR Scanner
- WiFi QR Generator

### Documents and PDF

- PDF to Image
- Image to PDF
- Combine Files to PDF
- PDF Merger
- PDF Split
- PDF Reorder
- PDF Compression
- Crop PDF
- N-up PDF
- Add Attachments

### Media and Conversion

- AVIF Converter
- Image to Text

### Links and Security

- Link Shortener
- Password Generator

## Tech Stack

- Next.js 16.2
- React 19
- Tailwind CSS 4
- Radix UI
- Framer Motion
- Lucide React
- React Hook Form
- Zod
- Sonner
- pdf-lib, pdfjs-dist, jspdf
- qrcode, qrcode.react, @zxing/library, jsqr, tesseract.js
- Nodemailer

## Getting Started

### Prerequisites

- Node.js
- npm

### Install Dependencies

```bash
npm install
```

### Environment Variables

Create a `.env.local` file in the project root using `.env.example` as a guide.

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_EMAIL=your-email@gmail.com
SMTP_PASSWORD=your-app-password
TO_EMAIL=recipient@example.com
RECAPTCHA_SECRET_KEY=your-recaptcha-secret-key
```

### Run the Development Server

```bash
npm run dev
```

The app runs at `http://localhost:1000`.

### Production Build

```bash
npm run build
npm start
```

### Lint

```bash
npm run lint
```

## Project Structure

```text
toolstrek/
|-- app/
|   `-- (main)/
|       |-- api/
|       |-- about-us/
|       |-- contact-us/
|       |-- faq/
|       |-- privacy-policy/
|       |-- tools/
|       |-- tools-compo/
|       |-- layout.js
|       `-- page.js
|-- components/
|   `-- ui/
|-- lib/
|-- public/
|-- .env.example
|-- next.config.mjs
|-- package.json
`-- README.md
```

## Contributing

ToolsTrek is open source, and contributions are welcome.

If you'd like to contribute:

1. Fork the repository.
2. Create a branch for your change.
3. Make your updates with a clear, focused scope.
4. Test your changes locally.
5. Open a pull request with a short description of what changed and why.

Helpful contribution guidelines:

- Keep changes consistent with the existing design and structure.
- Prefer small, focused pull requests.
- If you are fixing a bug, include the issue details or reproduction steps.
- If you are adding a tool, update the README and route structure if needed.
- Be respectful and constructive in discussions and reviews.

## License

This project is licensed under the MIT License.
