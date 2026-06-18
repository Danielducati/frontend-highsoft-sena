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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6 sm:mb-8">
        <div className="min-w-0">
          <h1
            className="text-2xl sm:text-4xl font-bold mb-1 truncate"
            style={{ color: "#1a3a2a", fontFamily: "var(--font-body)" }}
          >
            {title}
          </h1>
          {subtitle ? (
            <p className="text-sm" style={{ color: "#7c6b6bff", fontFamily: "var(--font-body)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div style={{ fontFamily: "var(--font-body)", flexShrink: 0 }}>{action}</div> : null}
      </div>

      {children}
    </div>
  );
}

