//C:\Users\samue\frontend-highsoft-sena\src\shared\components\layout\SpaPage.tsx
type SpaPageProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  icon?: React.ReactNode;
  children: React.ReactNode;
};

export function SpaPage({ title, subtitle, action, icon, children }: SpaPageProps) {
  return (
    <div
      className="min-h-screen -m-8 p-4 sm:p-8"
      style={{ backgroundColor: "var(--bg-app)", fontFamily: "var(--font-body)" }}
    >
      <header className="spa-page-header mb-6 sm:mb-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="spa-page-title-block">
            <div className="flex items-center gap-3">
              {icon ? <span className="flex-shrink-0">{icon}</span> : null}
              <h1
                className="text-2xl sm:text-3xl lg:text-4xl font-bold"
                style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}
              >
                {title}
              </h1>
            </div>
            {subtitle ? (
              <p
                className="text-sm mt-1 leading-relaxed"
                style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}
              >
                {subtitle}
              </p>
            ) : null}
          </div>
          {action ? (
            <div className="spa-page-actions">{action}</div>
          ) : null}
        </div>
      </header>

      {children}
    </div>
  );
}
