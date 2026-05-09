import { cn } from "@/lib/utils";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  right?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  subtitle,
  icon,
  right,
  className,
}: PageHeaderProps) {
  return (
    <header className={cn("flex items-start justify-between gap-6 mb-8", className)}>
      <div className="flex items-start gap-3">
        {icon && (
          <div className="w-10 h-10 rounded-xl bg-brand/10 border border-brand/20 flex items-center justify-center text-brand mt-0.5">
            {icon}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-bold text-text-1 tracking-tight">
            {title}
          </h1>
          {subtitle && (
            <p className="text-sm text-text-2 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {right && (
        <div className="flex items-center gap-2 shrink-0">{right}</div>
      )}
    </header>
  );
}
