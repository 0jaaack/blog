import darkIcon from "../assets/dark.svg";
import lightIcon from "../assets/light.svg";
import { useState, useSyncExternalStore } from "preact/compat";

const DarkIcon = <img src={darkIcon.src} />;
const LightIcon = <img src={lightIcon.src} />;

export default function ThemeButton() {
  const isDarkTheme = useSyncExternalStore(
    (flush) => {
      const mutationObserver = new MutationObserver((mutationsList) => {
        mutationsList.forEach((mutation) => {
          if (mutation.attributeName !== "class") {
            return;
          }

          flush();
        });
      });
      mutationObserver.observe(document.documentElement, { attributes: true });

      return () => {
        mutationObserver.disconnect();
      };
    },
    () => document.documentElement.classList.contains("dark"),
  );
  const [isTooltipVisible, setIsTooltipVisible] = useState(false);

  const toggleTheme = () => {
    const currentTheme = isDarkTheme ? "dark" : "light";
    const oppositeTheme = isDarkTheme ? "light" : "dark";

    localStorage.setItem("theme", oppositeTheme);

    document.documentElement.classList.remove(currentTheme);
    document.documentElement.classList.add(oppositeTheme);
  };

  const showTooltip = () => {
    setIsTooltipVisible(true);
  };

  const hideTooltip = () => {
    setIsTooltipVisible(false);
  };

  return (
    <div style={{ position: "relative" }}>
      <button
        class="icon-button"
        onClick={toggleTheme}
        onMouseEnter={showTooltip}
        onMouseLeave={hideTooltip}
      >
        {isDarkTheme ? DarkIcon : LightIcon}
      </button>
      {isTooltipVisible && (
        <div
          style={{
            position: "absolute",
            left: "50%",
            bottom: "calc(100% + 4px)",
            width: "max-content",
            padding: "4px 8px",
            color: "var(--color-primary)",
            fontSize: "12px",
            border: "none",
            borderRadius: "2px",
            background: "var(--foreground-color)",
            transform: "translateX(-50%)",
          }}
        >
          {isDarkTheme ? "밝은" : "어두운"} 화면으로 전환
        </div>
      )}
    </div>
  );
}
