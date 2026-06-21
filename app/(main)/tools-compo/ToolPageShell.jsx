import { cn } from "@/lib/utils";

export default function ToolPageShell({
  children,
  widthClassName = "max-w-7xl",
  className,
}) {
  const cleanClasses = (classes) => {
    if (!classes) return "";
    return classes.replace(/\b(?:[a-z]+:)?p[ty]-(?:[0-9]+|px|auto)\b/g, "").trim();
  };

  const cleanedWidthClassName = cleanClasses(widthClassName);
  const cleanedClassName = cleanClasses(className);

  return (
    <section className="tool-page-shell">
      <div className={cn("tool-page-shell-inner", cleanedWidthClassName, cleanedClassName)}>
        {children}
      </div>
    </section>
  );
}
