import { useState } from "preact/hooks";
import emailIcon from "../assets/email.svg";

const EmailIcon = <img src={emailIcon.src} />;

export default function ThemeButton() {
  const [isCopying, setIsCopying] = useState(false);

  const getIsDarkMode = () => document.body.classList.contains("dark");
  const copy = () => {
    const email = "ruud091@gmail.com";
    navigator.clipboard.writeText(email);

    setIsCopying(true);
    setTimeout(() => setIsCopying(false), 1000);
  };

  return (
    <button
      onClick={copy}
      style={{ display: "flex", justifyContent: "center" }}
    >
      {isCopying ? (
        <span
          style={{
            display: "absolute",
            fontSize: "14px",
            ...(getIsDarkMode() && { color: "#ffffff" }),
          }}
        >
          copied!
        </span>
      ) : (
        EmailIcon
      )}
    </button>
  );
}
