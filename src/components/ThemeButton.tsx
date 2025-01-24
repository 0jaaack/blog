import darkIcon from "../assets/dark.svg";
import lightIcon from "../assets/light.svg";
import { useSyncExternalStore } from "preact/compat";

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
      mutationObserver.observe(document.body, { attributes: true });

      return () => {
        mutationObserver.disconnect();
      };
    },
    () => document.body.classList.contains("dark"),
  );

  const toggleTheme = () => {
    const currentTheme = isDarkTheme ? "dark" : "light";
    const oppositeTheme = isDarkTheme ? "light" : "dark";

    localStorage.setItem("theme", oppositeTheme);

    document.body.classList.remove(currentTheme);
    document.body.classList.add(oppositeTheme);
  };

  return (
    <button class="icon-button" onClick={toggleTheme}>
      {isDarkTheme ? DarkIcon : LightIcon}
    </button>
  );
}
