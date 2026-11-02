export const ASPECT_PRESETS = [
  { value: "free", label: "Free", ratio: null },
  { value: "1:1", label: "1:1", ratio: 1 },
  { value: "4:5", label: "4:5", ratio: 4 / 5 },
  { value: "3:4", label: "3:4", ratio: 3 / 4 },
  { value: "2:3", label: "2:3", ratio: 2 / 3 },
  { value: "9:16", label: "9:16", ratio: 9 / 16 },
  { value: "4:3", label: "4:3", ratio: 4 / 3 },
  { value: "3:2", label: "3:2", ratio: 3 / 2 },
  { value: "16:9", label: "16:9", ratio: 16 / 9 },
  { value: "21:9", label: "21:9", ratio: 21 / 9 },
];

export const SOCIAL_PRESETS = [
  { id: "ig-post", label: "Instagram post", width: 1080, height: 1080, ratio: 1 },
  { id: "ig-portrait", label: "Instagram portrait", width: 1080, height: 1350, ratio: 4 / 5 },
  { id: "ig-story", label: "Instagram story / Reel", width: 1080, height: 1920, ratio: 9 / 16 },
  { id: "yt-thumb", label: "YouTube thumbnail", width: 1280, height: 720, ratio: 16 / 9 },
  { id: "yt-banner", label: "YouTube banner", width: 2560, height: 1440, ratio: 16 / 9 },
  { id: "fb-cover", label: "Facebook cover", width: 820, height: 312, ratio: 820 / 312 },
  { id: "li-banner", label: "LinkedIn banner", width: 1584, height: 396, ratio: 4 },
  { id: "x-header", label: "X / Twitter header", width: 1500, height: 500, ratio: 3 },
  { id: "profile", label: "Profile picture", width: 400, height: 400, ratio: 1 },
  { id: "pin", label: "Pinterest pin", width: 1000, height: 1500, ratio: 2 / 3 },
  { id: "print-4x6", label: "Photo print 4 × 6 in", width: 1200, height: 1800, ratio: 2 / 3 },
  { id: "print-5x7", label: "Photo print 5 × 7 in", width: 1500, height: 2100, ratio: 5 / 7 },
];

export const GRID_OPTIONS = [
  { value: "none", label: "No grid" },
  { value: "thirds", label: "Rule of thirds" },
  { value: "golden", label: "Golden ratio" },
  { value: "fine", label: "Fine grid" },
];

export const FORMAT_OPTIONS = [
  { value: "original", label: "Keep original" },
  { value: "png", label: "PNG — lossless" },
  { value: "jpeg", label: "JPEG — small" },
  { value: "webp", label: "WebP — modern" },
];

export const MATTE_SWATCHES = ["#ffffff", "#000000", "#f1f5f9", "#0f172a", "#059669", "#4f46e5"];

export const CROP_FAQS = [
  {
    question: "How is my image processed?",
    answer:
      "The file is decoded by your browser into a canvas, cropped at the exact source pixels and re-encoded locally. No upload, no external service and no tracking — the image never leaves your device, even for very large photos.",
  },
  {
    question: "Does cropping reduce the image quality?",
    answer:
      "The crop itself is pixel-perfect: the selected area is re-rendered from the original image, not from the on-screen preview. If you export to PNG the result is lossless. JPEG and WebP use the quality slider, and you can keep the exact source resolution by leaving the output width on Native.",
  },
  {
    question: "What is the difference between the crop box and image zoom?",
    answer:
      "The crop box is the part of the photo you keep. Zoom magnifies the photo underneath it so you can place the box precisely on fine details, while Pan lets you slide the magnified image. Cropping always uses the original resolution regardless of the zoom level.",
  },
  {
    question: "Can I straighten a tilted photo?",
    answer:
      "Yes. Use the straighten slider from −15° to +15°, or rotate in exact 90° steps. Rotation, straightening and flipping are baked into the working canvas before the crop is taken, so there are no missing corners or transparent edges.",
  },
  {
    question: "Which aspect ratio should I choose for social media?",
    answer:
      "Pick a social preset and ToolsTrek sets both the ratio and the recommended output width — for example 1080 × 1080 for an Instagram post, 1080 × 1920 for a story, or 1280 × 720 for a YouTube thumbnail. You can still fine-tune the crop box and output size afterwards.",
  },
  {
    question: "Why does JPEG have a background colour option?",
    answer:
      "JPEG has no transparency. If the cropped area includes transparent pixels, they are filled with the matte colour you choose — white by default. PNG and WebP keep transparency, so the matte control is hidden for them.",
  },
  {
    question: "Can I crop a screenshot or an image from my clipboard?",
    answer:
      "Yes. Copy an image, then press Ctrl/Cmd + V anywhere on this page. You can also drag a file onto the drop zone, browse your device, or paste an image copied from another app.",
  },
  {
    question: "Is there a file size or resolution limit?",
    answer:
      "There is no artificial limit. Practical limits depend on your device's memory: photos up to roughly 40 MB and 50 megapixels work comfortably in modern browsers. Very large images may take a moment while the canvas is prepared.",
  },
];
