---
author: Pedro Sousa
pubDatetime: 2024-01-13T08:10:00Z
modDatetime: 2024-01-13T08:10:00Z
title: SSR CSS modules as a library author
slug: ssr-css-modules-library
featured: true
draft: false
tags:
  - docs
description:
  'Rollup-compiled CSS modules add a client-side script, raising concerns for server-side rendering. Navigate this quirk for seamless integration in both environments'
---

[Skip to solution](#solution)

## The problem

We had the task of creating a library in React for our internal design system. We decided on [CSS modules](https://github.com/css-modules/css-modules), paired with Vite (Rollup), and a Next.js boilerplate for seamless integration.

We were having this issue for a long time, where we thought we had "phantom" layout shift, where images would load with erratic sizes, swiftly resizing without causing layout shift issues in lighthouse.

Upon investigating the generated .mjs files by Rollup, we uncovered the inclusion of [style-inject](https://github.com/egoist/style-inject) in CSS modules, leading to client-side exclusive style loading. Determined to address this, we found a solution in a Rollup plugin that proposed adding styles to _globalThis['_ssrInjectedStyles'].

## <a name="solution"></a>The solution

We decided to use [vite-plugin-css-injected-by-js](https://github.com/marco-prontera/vite-plugin-css-injected-by-js) and replace `style-inject`

```ts
cssInjectedByJsPlugin({
  relativeCSSInjection: true,
  styleId: () => `libraryName-${uuidv4()}`,
  injectCodeFunction: function injectCodeCustomSSRFunction(
    cssCode,
    options
  ) {
    try {
      const SSR_INJECT_ID = '__styleInject_SSR_MODULES';
      const id =
        (typeof options.styleId === 'function'
          ? options.styleId()
          : options.styleId) ?? '';
      if (typeof document === 'undefined' && globalThis) {
        globalThis[SSR_INJECT_ID] = globalThis[SSR_INJECT_ID] || [];
        globalThis[SSR_INJECT_ID].push({ cssCode, id });
      } else {
        if (document.getElementById(id)) return;
        const elementStyle = document.createElement('style');
        elementStyle.id = id;
        elementStyle.appendChild(document.createTextNode(`${cssCode}`));
        document.head.appendChild(elementStyle);
      }
    } catch (e) {
      console.error('vite-plugin-css-injected-by-js', e);
    }
  },
}),
```

By doing this, we inject a script that will add the styles to the global object, which we can then use in our Next.js or any other app to inject the styles in the head.

in React we then created a component that injects the styles in the head via `globalThis`.

```tsx
// SSRInjectStyles.tsx
import React from 'react';
import DOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

interface SSRInjectStylesProps {
  id: string;
  cssCode: string;
}

const SSRInjectStyles = () => {
  const SSR_INJECT_ID = '__styleInject_SSR_MODULES';
  if (!globalThis?.[SSR_INJECT_ID]) return null;

  const styles: [SSRInjectStylesProps] = globalThis[SSR_INJECT_ID];

  const uniqueStyles = styles.reduce<Array<SSRInjectStylesProps>>(
    (acc, curr) => {
      if (!acc.find((style) => style.id === curr.id)) {
        acc.push(curr);
      }
      return acc;
    },
    []
  );

  const ssrDom = DOMPurify(new JSDOM('<!DOCTYPE html>').window);

  return (
    <>
      {uniqueStyles.map((module) => {
        return (
          <style
            id={module.id}
            key={module.id}
            dangerouslySetInnerHTML={{
              // sanitize css code, to avoid dangerouslySetInnerHTML since code is unknown and prevent XSS attacks
              __html: ssrDom.sanitize(module.cssCode),
            }}
          />
        );
      })}
    </>
  );
};

SSRInjectStyles.displayName = 'SSRInjectStyles';
export { SSRInjectStyles };
```

We can then use this component in our `_document.tsx` in Next.js to inject the styles in the head.

This solves the issue with loading the styles via the client and fixes all "phantom" layout shifts.