"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import ReCAPTCHA from "react-google-recaptcha";
import ReactCountryFlag from "react-country-flag";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const formSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email" }),
  country: z.string().min(1, { message: "Please select your country" }),
  phone: z
    .string()
    .regex(/^[0-9\s\-\(\)]{6,}$/, {
      message: "Please enter a valid phone number",
    })
    .optional(),
  company: z.string().optional(),
  subject: z.string().min(1, { message: "Please select a subject" }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters" }),
});

const toolOptions = [
  { value: "Link Shortener", label: "Link Shortener" },
  { value: "WiFi QR Code Maker", label: "WiFi QR Code Maker" },
  { value: "Age Calculator", label: "Age Calculator" },
  { value: "QR Code Scanner", label: "QR Code Scanner" },
  { value: "Days Tracker", label: "Days Tracker" },
  { value: "Suggest a Tool", label: "Suggest a Tool" },
  { value: "Other Inquiry", label: "Other Inquiry" },
];

const countries = [
  { code: "US", name: "United States", dialCode: "+1" },
  { code: "GB", name: "United Kingdom", dialCode: "+44" },
  { code: "CA", name: "Canada", dialCode: "+1" },
  { code: "AU", name: "Australia", dialCode: "+61" },
  { code: "IN", name: "India", dialCode: "+91" },
  { code: "DE", name: "Germany", dialCode: "+49" },
  { code: "FR", name: "France", dialCode: "+33" },
  { code: "JP", name: "Japan", dialCode: "+81" },
  { code: "BR", name: "Brazil", dialCode: "+55" },
  { code: "NG", name: "Nigeria", dialCode: "+234" },
  // Add more countries as needed
];

export default function ContactForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState(null);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]);
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const recaptchaRef = useRef();

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      country: countries[0].code,
      phone: "",
      company: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(data) {
    if (!recaptchaToken) {
      toast.error("Please complete the reCAPTCHA verification");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          phone: data.phone ? `${selectedCountry.dialCode} ${data.phone}` : "",
          recaptchaToken,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to send message");
      }

      toast.success("Message sent successfully!");
      form.reset();
      setSelectedCountry(countries[0]);
      recaptchaRef.current.reset();
      setRecaptchaToken(null);
    } catch (error) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleCountryChange = (countryCode) => {
    const country = countries.find((c) => c.code === countryCode);
    if (country) {
      setSelectedCountry(country);
      form.setValue("country", countryCode);
      setShowCountryDropdown(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 sm:text-4xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-gray-600">
            Have questions about our tools? We'd love to hear from you!
          </p>
        </div>

        <div className="bg-white shadow rounded-lg p-8 sm:p-10">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Full Name *</FormLabel>
                      <FormControl>
                        <Input placeholder="Your name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          type="email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Phone Input with Country Selector */}
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone Number</FormLabel>
                      <div className="relative flex">
                        <button
                          type="button"
                          onClick={() =>
                            setShowCountryDropdown(!showCountryDropdown)
                          }
                          className="shrink-0 z-10 inline-flex items-center py-1.5 px-2 text-sm font-medium text-center text-gray-900 bg-gray-100 border border-gray-300 rounded-s-lg hover:bg-gray-200 focus:ring-1 focus:outline-none focus:ring-gray-100"
                        >
                          <ReactCountryFlag
                            countryCode={selectedCountry.code}
                            svg
                            style={{
                              width: "1.3em",
                              height: "1.3em",
                            }}
                            title={selectedCountry.code}
                          />
                          <span className="ml-2">
                            {selectedCountry.dialCode}
                          </span>
                          <svg
                            className="w-2.5 h-2.5 ml-2.5"
                            aria-hidden="true"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 10 6"
                          >
                            <path
                              stroke="currentColor"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="m1 1 4 4 4-4"
                            />
                          </svg>
                        </button>

                        {showCountryDropdown && (
                          <div className="absolute z-10 bg-white divide-y divide-gray-100 rounded-lg shadow w-60 top-full mt-1 h-[200px] overflow-y-scroll">
                            <ul className="py-2 text-sm text-gray-700">
                              {countries.map((country) => (
                                <li key={country.code}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleCountryChange(country.code)
                                    }
                                    className="inline-flex w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                  >
                                    <span className="inline-flex items-center">
                                      <ReactCountryFlag
                                        countryCode={country.code}
                                        svg
                                        style={{
                                          width: "1.3em",
                                          height: "1.3em",
                                        }}
                                        title={country.code}
                                      />
                                      <span className="ml-2">
                                        {country.name} ({country.dialCode})
                                      </span>
                                    </span>
                                  </button>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        <FormControl>
                          <Input
                            placeholder="123 456 7890"
                            className="rounded-l-none"
                            {...field}
                          />
                        </FormControl>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="company"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Company Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your company (optional)"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="subject"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>What tool are you inquiring about? *</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl className="w-full">
                        <SelectTrigger>
                          <SelectValue placeholder="Select a tool" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="w-full">
                        {toolOptions.map((tool) => (
                          <SelectItem key={tool.value} value={tool.value}>
                            {tool.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Your Message *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Tell us about your inquiry..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <ReCAPTCHA
                ref={recaptchaRef}
                sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY}
                onChange={(token) => setRecaptchaToken(token)}
                onExpired={() => setRecaptchaToken(null)}
                className="mx-auto"
              />

              <div className="flex justify-end">
                <Button
                  type="submit"
                  size="lg"
                  disabled={isSubmitting || !recaptchaToken}
                  className="w-full sm:w-auto"
                >
                  {isSubmitting ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Sending...
                    </>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </div>

        <div className="mt-12 text-center text-gray-500">
          <p>
            Prefer email? Contact us directly at: contact.toolstrek@gmail.com
          </p>
        </div>
      </div>
    </div>
  );
}
