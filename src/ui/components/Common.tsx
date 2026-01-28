import { VNode, JSX } from "preact";

interface LayoutButtonProps {
  active: boolean;
  onClick: () => void;
  icon: VNode;
  label: string;
}

export function LayoutButton({
  active,
  onClick,
  icon,
  label,
}: LayoutButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`layout-btn ${active ? "active" : ""}`}
    >
      <div className="layout-icon">{icon}</div>
      <span style={{ fontSize: "0.65rem", color: "inherit", fontWeight: 600 }}>
        {label}
      </span>
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
      className={`icon-btn ${className || ""}`}
      style={{ ...style }}
    >
      {icon}
    </button>
  );
}

interface CustomSelectProps {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string }[];
  style?: JSX.CSSProperties;
  className?: string;
  direction?: "top" | "bottom";
}

import { useState, useRef, useEffect } from "preact/hooks";
import { ChevronDown, Check } from "lucide-preact";

export function CustomSelect({
  value,
  onChange,
  options,
  style,
  className,
  direction = "bottom",
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuStyle, setMenuStyle] = useState<JSX.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const toggleOpen = () => {
    if (!isOpen) {
      const rect = containerRef.current?.getBoundingClientRect();
      if (rect) {
        const isTop = direction === "top";
        setMenuStyle({
          position: "fixed",
          width: rect.width, // Match trigger width
          left: rect.left,
          top: isTop ? "auto" : rect.bottom + 4,
          bottom: isTop ? window.innerHeight - rect.top + 4 : "auto",
          zIndex: 9999, // Ensure it's on top of everything
        });
      }
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Shadow DOM-aware click check
      const path = event.composedPath();

      if (containerRef.current && !path.includes(containerRef.current)) {
        setIsOpen(false);
      }
    };
    const handleScroll = () => {
      if (isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      window.addEventListener("scroll", handleScroll, true);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  const selectedOption = options.find((o) => o.value === value) || options[0];

  return (
    <div
      ref={containerRef}
      className={`custom-select-container ${className || ""}`}
      style={{ position: "relative", minWidth: "100px", ...style }}
    >
      <button
        onClick={toggleOpen}
        className="custom-select-trigger"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
          padding: "4px 8px 4px 10px",
          background: "var(--color-surface)",
          border: "1px solid var(--color-border)",
          borderRadius: "var(--radius-md)",
          color: "var(--color-text)",
          fontSize: "11px",
          fontWeight: 500,
          cursor: "pointer",
          outline: "none",
          height: "24px",
          gap: "4px",
          boxShadow: isOpen ? "0 0 0 2px rgba(0, 122, 255, 0.25)" : "none",
          borderColor: isOpen ? "var(--color-primary)" : "var(--color-border)",
          transition: "all var(--transition-fast)",
        }}
      >
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {selectedOption?.label}
        </span>
        <ChevronDown
          size={12}
          style={{
            opacity: 0.6,
            transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
            transition: "transform 0.2s",
          }}
        />
      </button>

      {isOpen && (
        <div
          className="custom-select-dropdown apple-blur"
          style={{
            ...menuStyle,
            width: "max-content",
            minWidth: menuStyle.width,
            background: "var(--color-glass-bg)",
            border: "1px solid var(--color-glass-border)",
            borderRadius: "var(--radius-md)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            padding: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "2px",
            maxHeight: "300px",
            overflowY: "auto",
          }}
        >
          {options.map((option) => (
            <button
              key={option.value}
              onClick={(e) => {
                e.stopPropagation();
                onChange(option.value);
                setIsOpen(false);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "6px 10px",
                fontSize: "11px",
                color: option.value === value ? "white" : "var(--color-text)",
                background:
                  option.value === value
                    ? "var(--color-primary)"
                    : "transparent",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                textAlign: "left",
                fontWeight: option.value === value ? 600 : 400,
                transition: "background 0.1s",
                flexShrink: 0,
              }}
              onMouseEnter={(e) => {
                if (option.value !== value)
                  e.currentTarget.style.background = "var(--color-item-hover)";
              }}
              onMouseLeave={(e) => {
                if (option.value !== value)
                  e.currentTarget.style.background = "transparent";
              }}
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check
                  size={10}
                  style={{ color: "white", marginLeft: "8px" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
