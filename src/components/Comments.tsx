import * as React from "react";
import Giscus from "@giscus/react";
import { useState } from "react";

const id = "inject-comments";

const Comments = () => {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState("dark_dimmed");

  React.useEffect(() => {
    const syncTheme = () => {
      const currentTheme = document.documentElement.dataset.theme;
      setTheme(currentTheme === "light" ? "light" : "dark_dimmed");
    };

    syncTheme();
    setMounted(true);

    const observer = new MutationObserver(syncTheme);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div id={id}>
      {mounted ? (
        <Giscus
          id={id}
          repo="pedrosousa13/psousa.dev-astro"
          repoId="R_kgDOLH8YKA"
          category="Announcements"
          categoryId="DIC_kwDOLH8YKM4Ccl4a"
          strict={"0"}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="top"
          lang="en"
          theme={theme}
          loading="lazy"
        />
      ) : null}
    </div>
  );
};

export default Comments;
