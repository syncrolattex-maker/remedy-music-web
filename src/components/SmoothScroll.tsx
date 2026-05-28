import { ReactLenis } from 'lenis/react';
import React from 'react';

export function SmoothScroll({ children }: { children: React.ReactNode }) {
  return (
    <ReactLenis root options={{ lerp: 0.07, smoothWheel: true, duration: 1.2 }}>
      {children}
    </ReactLenis>
  );
}
