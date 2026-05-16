import { cn } from "@/lib/utils";

export default function ToolPageShell({
  children,
  widthClassName = "max-w-7xl",
  className,
}) {
  return (
    <section className="tool-page-shell">
      <div className={cn("tool-page-shell-inner", widthClassName, className)}>
        {children}
      </div>
    </section>
  );
}
