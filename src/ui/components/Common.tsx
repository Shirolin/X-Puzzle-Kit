import { h, VNode, JSX } from "preact";

interface LayoutButtonProps {
  active: boolean;
  onClick: () => void;
  icon: VNode;
  label: string;
}

export function LayoutButton({ active, onClick, icon, label }: LayoutButtonProps) {
  return (
    <button
      onClick={onClick}
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "0.15rem",
        padding: "0.375rem 0.3rem",
        borderRadius: "var(--radius-sm)",
        border: active
          ? "1px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        backgroundColor: active
          ? "var(--color-primary)"
          : "var(--color-surface-soft)",
        cursor: "pointer",
        color: active ? "white" : "var(--color-text-muted)",
        transition: "all var(--transition-fast)",
        fontWeight: active ? "700" : "500",
        boxShadow: active ? "0 4px 15px rgba(0, 122, 255, 0.3)" : "none",
        outline: "none",
        flex: 1,
      }}
    >
      <div style={{ 
        transform: active ? "scale(1.15)" : "scale(1)",
        transition: "transform var(--transition-fast)",
        color: active ? "white" : "inherit"
      }}>{icon}</div>
      <span style={{ 
        fontSize: "0.65rem",
        color: active ? "white" : "inherit",
        fontWeight: 600
      }}>{label}</span>
    </button>
  );
}

interface IconButtonProps {
  onClick: () => void;
  disabled?: boolean;
  icon: VNode;
  style?: JSX.CSSProperties;
  title?: string;
  className?: string;
}

export function IconButton({
  onClick,
  disabled,
  icon,
  style = {},
  title,
  className,
}: IconButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      className={className}
      style={{
        border: "none",
        background: "var(--color-surface-soft)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.2 : 1,
        padding: "0.25rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text)",
        transition: "all var(--transition-fast)",
        WebkitAppRegion: "no-drag",
        ...style,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "var(--color-surface)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "var(--color-surface-soft)")}
    >
      {icon}
    </button>
  );
}
