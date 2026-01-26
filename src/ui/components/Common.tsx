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
        gap: "0.5rem",
        padding: "0.8rem 0.6rem",
        borderRadius: "var(--radius-lg)",
        border: active
          ? "1px solid rgba(255, 255, 255, 0.15)"
          : "1px solid rgba(255, 255, 255, 0.05)",
        backgroundColor: active
          ? "rgba(255, 255, 255, 0.1)"
          : "rgba(255, 255, 255, 0.03)",
        cursor: "pointer",
        color: active ? "var(--color-primary)" : "var(--color-text-muted)",
        transition: "all var(--transition-fast)",
        fontWeight: active ? "600" : "500",
        boxShadow: active ? "0 4px 12px rgba(0, 0, 0, 0.2)" : "none",
        outline: "none",
        flex: 1,
      }}
    >
      <div style={{ 
        transform: active ? "scale(1.1)" : "scale(1)",
        transition: "transform var(--transition-fast)",
        color: active ? "var(--color-primary)" : "inherit"
      }}>{icon}</div>
      <span style={{ 
        fontSize: "0.75rem",
        color: active ? "white" : "inherit"
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
}

export function IconButton({
  onClick,
  disabled,
  icon,
  style = {},
  title,
}: IconButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      disabled={disabled}
      title={title}
      style={{
        border: "none",
        background: "rgba(255, 255, 255, 0.05)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.2 : 1,
        padding: "0.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "var(--color-text)",
        transition: "all var(--transition-fast)",
        WebkitAppRegion: "no-drag",
        ...style,
      }}
      onMouseOver={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.1)")}
      onMouseOut={(e) => (e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)")}
    >
      {icon}
    </button>
  );
}
