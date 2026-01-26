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
        gap: "0.35rem",
        padding: "0.6rem 0.4rem",
        borderRadius: "var(--radius-lg)",
        border: active
          ? "2px solid var(--color-primary)"
          : "1px solid var(--color-border)",
        backgroundColor: active
          ? "rgba(59, 130, 246, 0.05)"
          : "var(--color-surface)",
        cursor: "pointer",
        color: active ? "var(--color-primary)" : "var(--color-text)",
        transition: "all var(--transition-fast)",
        fontWeight: active ? "700" : "400",
        boxShadow: active ? "0 4px 12px rgba(59, 130, 246, 0.15)" : "none",
      }}
    >
      <div style={{ opacity: active ? 1 : 0.6 }}>{icon}</div>
      <span style={{ fontSize: "0.7rem" }}>{label}</span>
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
        border: "1px solid var(--color-border)",
        backgroundColor: "var(--color-surface)",
        borderRadius: "var(--radius-sm)",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.3 : 1,
        padding: "0.375rem",
        display: "flex",
        color: "var(--color-text)",
        transition: "all var(--transition-fast)",
        ...style,
      }}
      className="icon-btn-hover"
    >
      {icon}
    </button>
  );
}
