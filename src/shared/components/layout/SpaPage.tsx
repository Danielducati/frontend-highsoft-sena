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
      className="min-h-screen -m-8 p-8"
      style={{ backgroundColor: "#f5f0e8", fontFamily: "var(--font-display)" }}
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <div className="flex items-center gap-2">
            {icon}
            <h1
              className="text-4xl font-normal mb-1"
              style={{ color: "#1a3a2a", fontFamily: "var(--font-display)" }}
            >
              {title}
            </h1>
          </div>
          {subtitle ? (
            <p className="text-sm" style={{ color: "#6b7c6b", fontFamily: "var(--font-body)" }}>
              {subtitle}
            </p>
          ) : null}
        </div>
        {action ? <div style={{ fontFamily: "var(--font-body)" }}>{action}</div> : null}
      </div>

      {children}
    </div>
  );
}

