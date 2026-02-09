import { JSX } from "preact";
import { useState } from "preact/hooks";
import { t } from "../../core/i18n";
import { getPlatformEnv, setMockEnv, PlatformEnv } from "../../core/platform";
import {
  Settings,
  RefreshCcw,
  Smartphone,
  Laptop,
  Zap,
  AppWindow,
  X,
} from "lucide-preact";

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [env, setEnv] = useState<PlatformEnv>(getPlatformEnv());

  // 同步当前 Mock 状态
  const updateMock = (key: keyof PlatformEnv, value: boolean) => {
    const newEnv = { ...env, [key]: value };
    setEnv(newEnv);
    setMockEnv(newEnv);
  };

  const resetAll = () => {
    setMockEnv(null);
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        style={{
          position: "fixed",
          bottom: "20px",
          right: "20px",
          width: "44px",
          height: "44px",
          borderRadius: "22px",
          backgroundColor: "rgba(0, 0, 0, 0.8)",
          color: "white",
          border: "1px solid rgba(255, 255, 255, 0.2)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
          zIndex: 999999,
          cursor: "pointer",
          backdropFilter: "blur(8px)",
        }}
        title={t("openDebugPanel")}
      >
        <Settings size={20} />
      </button>
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        width: "280px",
        backgroundColor: "rgba(28, 28, 30, 0.95)",
        color: "white",
        borderRadius: "16px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
        zIndex: 999999,
        display: "flex",
        flexDirection: "column",
        backdropFilter: "blur(12px)",
        transform: "translateZ(0)",
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
      }}
    >
      <div
        style={{
          padding: "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Settings size={18} color="#007AFF" />
          <span style={{ fontWeight: "600", fontSize: "15px" }}>
            Debug Tools
          </span>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          style={{
            background: "none",
            border: "none",
            color: "#8E8E93",
            cursor: "pointer",
          }}
        >
          <X size={18} />
        </button>
      </div>

      <div style={{ padding: "8px" }}>
        <DebugItem
          icon={<AppWindow size={16} />}
          label="浏览器扩展 (Extension)"
          value={env.isExtension}
          onChange={(v) => updateMock("isExtension", v)}
        />
        <DebugItem
          icon={<Smartphone size={16} />}
          label="iOS 移动端"
          value={env.isIOS}
          onChange={(v) => updateMock("isIOS", v)}
        />
        <DebugItem
          icon={<Smartphone size={16} />}
          label="Android 移动端"
          value={env.isAndroid}
          onChange={(v) => updateMock("isAndroid", v)}
        />
        <DebugItem
          icon={<Zap size={16} />}
          label="iOS 快捷指令 (Shortcut)"
          value={env.isShortcut}
          onChange={(v) => updateMock("isShortcut", v)}
        />
        <DebugItem
          icon={<Laptop size={16} />}
          label="PWA 独立模式 (Standalone)"
          value={env.isStandalone}
          onChange={(v) => updateMock("isStandalone", v)}
        />
      </div>

      <div
        style={{
          padding: "12px",
          borderTop: "1px solid rgba(255, 255, 255, 0.1)",
          display: "flex",
          gap: "8px",
        }}
      >
        <button
          onClick={resetAll}
          style={{
            flex: 1,
            padding: "8px",
            borderRadius: "8px",
            backgroundColor: "rgba(255, 255, 255, 0.1)",
            border: "none",
            color: "white",
            fontSize: "13px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "6px",
            cursor: "pointer",
          }}
        >
          <RefreshCcw size={14} />
          还原真实环境
        </button>
      </div>
    </div>
  );
};

const DebugItem = ({
  icon,
  label,
  value,
  onChange,
}: {
  icon: JSX.Element;
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) => (
  <div
    style={{
      padding: "10px 12px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      borderRadius: "8px",
      transition: "background 0.2s",
    }}
  >
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "10px",
        color: "#E5E5E7",
      }}
    >
      <div style={{ color: "#8E8E93" }}>{icon}</div>
      <span style={{ fontSize: "13px" }}>{label}</span>
    </div>
    <div
      onClick={() => onChange(!value)}
      style={{
        width: "40px",
        height: "22px",
        borderRadius: "11px",
        backgroundColor: value ? "#34C759" : "rgba(255,255,255,0.15)",
        position: "relative",
        cursor: "pointer",
        transition: "background-color 0.2s",
      }}
    >
      <div
        style={{
          width: "18px",
          height: "18px",
          borderRadius: "50%",
          backgroundColor: "white",
          position: "absolute",
          top: "2px",
          left: value ? "20px" : "2px",
          transition: "left 0.2s ease-in-out",
          boxShadow: "0 1px 3px rgba(0,0,0,0.3)",
        }}
      />
    </div>
  </div>
);
