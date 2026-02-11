import { JSX } from "preact";
import { useState } from "preact/hooks";
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
import { ReloadPromptUI } from "./ReloadPromptUI";

export const DebugPanel = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [env, setEnv] = useState<PlatformEnv>(getPlatformEnv());
  const [showTestReload, setShowTestReload] = useState(false);

  const updateMock = (key: keyof PlatformEnv, value: boolean) => {
    const newEnv = { ...env, [key]: value };
    setEnv(newEnv);
    setMockEnv(newEnv);
  };

  const resetAll = () => {
    setMockEnv(null);
    setEnv(getPlatformEnv());
    window.location.reload();
  };

  return (
    <>
      <ReloadPromptUI
        isOpen={showTestReload}
        onConfirm={() => {
          setShowTestReload(false);
          alert("触发了 Update Action (Mock)");
        }}
        onCancel={() => setShowTestReload(false)}
        title="发现新版本可用 (Test UI)"
        desc="这是通过 DebugPanel 触发的真实组件渲染测试"
        confirmLabel="刷新"
        cancelLabel="忽略"
      />

      {!isOpen ? (
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
          title="Open Debug Panel"
        >
          <Settings size={20} />
        </button>
      ) : (
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

          <div style={{ padding: "8px", overflowY: "auto", maxHeight: "400px" }}>
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

            <div
              style={{
                height: "1px",
                backgroundColor: "rgba(255,255,255,0.1)",
                margin: "8px 0",
              }}
            />

            <button
              onClick={resetAll}
              style={{
                width: "100%",
                padding: "8px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "6px",
                backgroundColor: "rgba(255, 59, 48, 0.15)",
                border: "1px solid rgba(255, 59, 48, 0.3)",
                color: "#FF3B30",
                borderRadius: "8px",
                fontSize: "13px",
                cursor: "pointer",
                marginBottom: "8px",
              }}
            >
              <RefreshCcw size={14} />
              Reset All
            </button>

            <button
              onClick={() => setShowTestReload(true)}
              style={{
                width: "100%",
                padding: "8px",
                borderRadius: "8px",
                backgroundColor: "rgba(52, 199, 89, 0.2)",
                border: "1px solid rgba(52, 199, 89, 0.3)",
                color: "#34C759",
                fontSize: "13px",
                cursor: "pointer",
                textAlign: "center",
              }}
            >
              触发 PWA 更新提示 (真实UI)
            </button>
          </div>
        </div>
      )}
    </>
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
