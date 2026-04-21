// lib/dynamicIcon.js
import * as LucideIcons from "lucide-react";

/**
 * Dynamically get Lucide icon component by name
 * @param {string} iconName - Name of the icon (e.g., "Link", "QrCode")
 * @returns {React.ComponentType} Lucide icon component
 */
export const getIcon = (iconName) => {
  if (!iconName) return LucideIcons.HelpCircle;

  // Try to get the icon with different naming patterns
  const iconVariants = [
    iconName,
    `${iconName}Icon`,
    iconName.charAt(0).toUpperCase() + iconName.slice(1),
    iconName.toLowerCase(),
  ];

  for (const variant of iconVariants) {
    const Icon = LucideIcons[variant];
    if (Icon) return Icon;
  }

  // Return default icon if not found
  return LucideIcons.HelpCircle;
};

// Optional: Create a mapping for backward compatibility
export const iconMap = new Proxy(
  {},
  {
    get: (target, prop) => getIcon(prop),
  },
);
