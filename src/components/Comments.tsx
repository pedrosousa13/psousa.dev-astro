import * as React from 'react';
import Giscus from '@giscus/react';
import { useState } from "react";

const id = 'inject-comments';

const Comments = () => {
  const [mounted, setMounted] = useState(false);

  React.useEffect(() => {
    setMounted(true);
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
          strict={'0'}
          mapping="pathname"
          reactionsEnabled="1"
          emitMetadata="1"
          inputPosition="top"
          lang="en"
          theme={'dark_dimmed'}
          loading="lazy"
        />
      ) : null}
    </div>
  );
};

export default Comments;
