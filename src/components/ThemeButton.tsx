import { useState } from "preact/hooks";
import darkIcon from "../assets/dark.svg";
import lightIcon from "../assets/light.svg";

const DarkIcon = <img src={darkIcon.src} style={{ filter: "invert(1)" }} />;
const LightIcon = <img src={lightIcon.src} />;

export default function ThemeButton() {
  const [theme, setTheme] = useState(() =>
    document.body.classList.contains("dark") ? "dark" : "light"
  );

  const toggleTheme = () => {
    const currentTheme = document.body.classList.contains("dark")
      ? "dark"
      : "light";
    const theme = currentTheme === "light" ? "dark" : "light";

    localStorage.setItem("theme", theme);

    document.body.classList.remove(currentTheme);
    document.body.classList.add(theme);

    setTheme(theme);
  };

  return (
    <button class="icon-button" onClick={toggleTheme}>
      {theme === "dark" ? DarkIcon : LightIcon}
    </button>
  );
}
