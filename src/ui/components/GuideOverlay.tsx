import { useState, useEffect, useCallback } from "preact/hooks";
import { t } from "../../core/i18n";
import { ChevronRight, Check, X } from "lucide-preact";

interface GuideStep {
  target: string;
  title: string;
  desc: string;
  position: "top" | "bottom" | "left" | "right";
}

interface GuideOverlayProps {
  onFinish: () => void;
  isOpen: boolean;
}

export function GuideOverlay({ onFinish, isOpen }: GuideOverlayProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const steps: GuideStep[] = [
    {
      target: '[data-tour="import"]',
      title: t("tutorialImportTitle"),
      desc: t("tutorialImportDesc"),
      position: "left",
    },
    {
      target: '[data-tour="layout"]',
      title: t("tutorialLayoutTitle"),
      desc: t("tutorialLayoutDesc"),
      position: "left",
    },
    {
      target: '[data-tour="control"]',
      title: t("tutorialControlTitle"),
      desc: t("tutorialControlDesc"),
      position: "left",
    },
    {
      target: '[data-tour="download"]',
      title: t("tutorialExportTitle"),
      desc: t("tutorialExportDesc"),
      position: "top",
    },
  ];

  const updateRect = useCallback(() => {
    const el = document.querySelector(steps[currentStep].target);
    if (el) {
      setRect(el.getBoundingClientRect());
    } else {
      // 如果目标在移动端被折叠或不显示，跳过此步
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onFinish();
      }
    }
  }, [currentStep, onFinish]);

  useEffect(() => {
    if (!isOpen) return;
    updateRect();
    window.addEventListener("resize", updateRect);
    const timer = setInterval(updateRect, 500); // 应对动画导致的位移
    return () => {
      window.removeEventListener("resize", updateRect);
      clearInterval(timer);
    };
  }, [isOpen, updateRect]);

  if (!isOpen || !rect) return null;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onFinish();
    }
  };

  const getTooltipStyle = () => {
    if (!rect) return {};
    const padding = 12;
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      // 移动端通常固定在中间或底部，高亮区域在上方
      return {
        left: "50%",
        bottom: "20px",
        transform: "translateX(-50%)",
        width: "calc(100vw - 40px)",
        maxWidth: "400px",
      };
    }

    const { position } = steps[currentStep];
    switch (position) {
      case "left":
        return {
          right: window.innerWidth - rect.left + padding,
          top: rect.top + rect.height / 2,
          transform: "translateY(-50%)",
        };
      case "right":
        return {
          left: rect.right + padding,
          top: rect.top + rect.height / 2,
          transform: "translateY(-50%)",
        };
      case "top":
        return {
          left: rect.left + rect.width / 2,
          bottom: window.innerHeight - rect.top + padding,
          transform: "translateX(-50%)",
        };
      case "bottom":
        return {
          left: rect.left + rect.width / 2,
          top: rect.bottom + padding,
          transform: "translateX(-50%)",
        };
      default:
        return {};
    }
  };

  return (
    <div className="guide-overlay" onClick={(e) => e.stopPropagation()}>
      <div
        className="guide-hole"
        style={{
          top: rect.top - 4,
          left: rect.left - 4,
          width: rect.width + 8,
          height: rect.height + 8,
        }}
      />

      <div className={`guide-tooltip`} style={getTooltipStyle()}>
        <div className="guide-tooltip-header">
          <span className="guide-step-indicator">
            {currentStep + 1} / {steps.length}
          </span>
          <button className="guide-close" onClick={onFinish}>
            <X size={16} />
          </button>
        </div>
        <div className="guide-tooltip-content">
          <h4 className="guide-title">{steps[currentStep].title}</h4>
          <p className="guide-desc">{steps[currentStep].desc}</p>
        </div>
        <div className="guide-tooltip-footer">
          <button className="btn-skip" onClick={onFinish}>
            {t("skipTutorial")}
          </button>
          <button className="btn-next" onClick={handleNext}>
            <span>
              {currentStep === steps.length - 1
                ? t("finishTutorial")
                : t("nextStep")}
            </span>
            {currentStep === steps.length - 1 ? (
              <Check size={16} />
            ) : (
              <ChevronRight size={16} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
