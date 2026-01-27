import { h, VNode, JSX } from "preact";

interface LayoutButtonProps {
  active: boolean;
  onClick: () => void;
  icon: VNode;
  label: string;
}

export function LayoutButton({ active, onClick, icon, label }: LayoutButtonProps) {
  return (
    <button onClick={onClick} className={`layout-btn ${active ? 'active' : ''}`}>
      <div className="layout-icon">{icon}</div>
      <span style={{ fontSize: "0.65rem", color: "inherit", fontWeight: 600 }}>{label}</span>
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
      className={`icon-btn ${className || ''}`}
      style={{ ...style }}
    >
      {icon}
    </button>
  );
}
