import nodemailer from "nodemailer";

// Move country data to a shared file if used in multiple places
const countryData = {
  US: { name: "United States", dialCode: "+1" },
  GB: { name: "United Kingdom", dialCode: "+44" },
  CA: { name: "Canada", dialCode: "+1" },
  AU: { name: "Australia", dialCode: "+61" },
  IN: { name: "India", dialCode: "+91" },
  DE: { name: "Germany", dialCode: "+49" },
  FR: { name: "France", dialCode: "+33" },
  JP: { name: "Japan", dialCode: "+81" },
  BR: { name: "Brazil", dialCode: "+55" },
  NG: { name: "Nigeria", dialCode: "+234" },
  CN: { name: "China", dialCode: "+86" },
  RU: { name: "Russia", dialCode: "+7" },
  IT: { name: "Italy", dialCode: "+39" },
  ES: { name: "Spain", dialCode: "+34" },
  MX: { name: "Mexico", dialCode: "+52" },
  ZA: { name: "South Africa", dialCode: "+27" },
  SA: { name: "Saudi Arabia", dialCode: "+966" },
  AE: { name: "United Arab Emirates", dialCode: "+971" },
  TR: { name: "Turkey", dialCode: "+90" },
  ID: { name: "Indonesia", dialCode: "+62" },
  PK: { name: "Pakistan", dialCode: "+92" },
  BD: { name: "Bangladesh", dialCode: "+880" },
  PH: { name: "Philippines", dialCode: "+63" },
  VN: { name: "Vietnam", dialCode: "+84" },
  TH: { name: "Thailand", dialCode: "+66" },
  MY: { name: "Malaysia", dialCode: "+60" },
  SG: { name: "Singapore", dialCode: "+65" },
  KR: { name: "South Korea", dialCode: "+82" },
  EG: { name: "Egypt", dialCode: "+20" },
  AR: { name: "Argentina", dialCode: "+54" },
  CO: { name: "Colombia", dialCode: "+57" },
  PE: { name: "Peru", dialCode: "+51" },
  CL: { name: "Chile", dialCode: "+56" },
  NZ: { name: "New Zealand", dialCode: "+64" },
  SE: { name: "Sweden", dialCode: "+46" },
  NO: { name: "Norway", dialCode: "+47" },
  FI: { name: "Finland", dialCode: "+358" },
  DK: { name: "Denmark", dialCode: "+45" },
  NL: { name: "Netherlands", dialCode: "+31" },
  BE: { name: "Belgium", dialCode: "+32" },
  CH: { name: "Switzerland", dialCode: "+41" },
  AT: { name: "Austria", dialCode: "+43" },
  PL: { name: "Poland", dialCode: "+48" },
  UA: { name: "Ukraine", dialCode: "+380" },
  RO: { name: "Romania", dialCode: "+40" },
  CZ: { name: "Czech Republic", dialCode: "+420" },
  HU: { name: "Hungary", dialCode: "+36" },
  GR: { name: "Greece", dialCode: "+30" },
  PT: { name: "Portugal", dialCode: "+351" },
  IE: { name: "Ireland", dialCode: "+353" },
  IL: { name: "Israel", dialCode: "+972" },
  IR: { name: "Iran", dialCode: "+98" },
  IQ: { name: "Iraq", dialCode: "+964" },
  KW: { name: "Kuwait", dialCode: "+965" },
  QA: { name: "Qatar", dialCode: "+974" },
  OM: { name: "Oman", dialCode: "+968" },
  KE: { name: "Kenya", dialCode: "+254" },
  GH: { name: "Ghana", dialCode: "+233" },
  ET: { name: "Ethiopia", dialCode: "+251" },
  TZ: { name: "Tanzania", dialCode: "+255" },
  UG: { name: "Uganda", dialCode: "+256" },
  DZ: { name: "Algeria", dialCode: "+213" },
  MA: { name: "Morocco", dialCode: "+212" },
  TN: { name: "Tunisia", dialCode: "+216" },
  LY: { name: "Libya", dialCode: "+218" },
  SD: { name: "Sudan", dialCode: "+249" },
  // Add more countries as needed
};
export async function POST(request) {
  const {
    name,
    email,
    country,
    phone, // This now contains the full phone number with dial code
    company,
    subject,
    message,
    recaptchaToken,
  } = await request.json();

  // Enhanced validation
  if (!name || !email || !country || !subject || !message || !recaptchaToken) {
    return new Response(
      JSON.stringify({
        error: "Missing required fields",
        details: {
          name: !name,
          email: !email,
          country: !country,
          subject: !subject,
          message: !message,
          recaptchaToken: !recaptchaToken,
        },
      }),
      {
        status: 400,
        headers: { "Content-Type": "application/json" },
      }
    );
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return new Response(JSON.stringify({ error: "Invalid email format" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    // Verify reCAPTCHA token
    const recaptchaResponse = await fetch(
      `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptchaToken}`,
      { method: "POST" }
    );
    const recaptchaData = await recaptchaResponse.json();

    if (!recaptchaData.success) {
      return new Response(
        JSON.stringify({
          error: "reCAPTCHA verification failed",
          details: recaptchaData,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Get country name - fallback to code if not found
    const countryInfo = countryData[country] || { name: country, dialCode: "" };

    // Create email transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Format the email content
    const mailOptions = {
      from: `"ToolsTrek Contact Form" <${process.env.GMAIL_USER}>`,
      to: process.env.GMAIL_USER,
      replyTo: email,
      subject: `New Contact: ${subject}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">New Contact Form Submission</h2>
          <p><strong>From:</strong> ${name} &lt;${email}&gt;</p>
          <p><strong>Country:</strong> ${countryInfo.name}</p>
          ${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ""}
          ${company ? `<p><strong>Company:</strong> ${company}</p>` : ""}
          <p><strong>Regarding:</strong> ${subject}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <h3 style="color: #2563eb;">Message:</h3>
          <p style="white-space: pre-wrap; background: #f9fafb; padding: 15px; border-radius: 5px;">${message}</p>
          <hr style="border: 1px solid #e5e7eb; margin: 20px 0;">
          <p style="font-size: 0.9em; color: #6b7280;">
            Sent via <a href="${
              process.env.NEXT_PUBLIC_SITE_URL
            }" style="color: #2563eb;">ToolsTrek Contact Form</a>
          </p>
          <p style="font-size: 0.8em; color: #9ca3af;">
            reCAPTCHA verified: ${new Date().toLocaleString()}
          </p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error processing contact form:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process your request",
        ...(process.env.NODE_ENV === "development" && { debug: error.message }),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
