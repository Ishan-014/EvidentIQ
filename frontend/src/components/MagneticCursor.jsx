import React, { useEffect, useRef, useState, useCallback } from 'react';

/**
 * MagneticCursor — Premium custom cursor with:
 *  • Precise glowing dot (instant mouse tracking)
 *  • Large spring-physics trailing halo (lags behind with easing)
 *  • Context-aware color morphing on interactive elements
 *  • 3D depth illusion via scale + blur transitions
 */
export default function MagneticCursor() {
  const dotRef = useRef(null);
  const haloRef = useRef(null);
  const rafRef = useRef(null);

  // Live mouse position
  const mouse = useRef({ x: -200, y: -200 });
  // Spring position for halo (interpolated)
  const halo = useRef({ x: -200, y: -200 });

  const [cursorState, setCursorState] = useState('default'); // 'default' | 'hover' | 'active' | 'card'
  const [isVisible, setIsVisible] = useState(false);

  // Color map per state
  const colorMap = {
    default: {
      dot:    'rgba(99, 102, 241, 0.95)',   // indigo
      halo:   'rgba(99, 102, 241, 0.12)',
      border: 'rgba(99, 102, 241, 0.35)',
      shadow: '0 0 18px 4px rgba(99,102,241,0.25)',
    },
    hover: {
      dot:    'rgba(255, 255, 255, 0.95)',
      halo:   'rgba(99, 102, 241, 0.22)',
      border: 'rgba(165, 180, 252, 0.7)',
      shadow: '0 0 28px 8px rgba(99,102,241,0.35)',
    },
    card: {
      dot:    'rgba(245, 158, 11, 0.95)',   // amber
      halo:   'rgba(245, 158, 11, 0.12)',
      border: 'rgba(252, 211, 77, 0.5)',
      shadow: '0 0 22px 6px rgba(245,158,11,0.28)',
    },
    active: {
      dot:    'rgba(16, 185, 129, 0.95)',   // emerald
      halo:   'rgba(16, 185, 129, 0.15)',
      border: 'rgba(52, 211, 153, 0.6)',
      shadow: '0 0 24px 6px rgba(16,185,129,0.30)',
    },
  };

  // Lerp helper
  const lerp = (a, b, t) => a + (b - a) * t;

  // Animation loop — runs every frame
  const animate = useCallback(() => {
    const ease = 0.09; // lower = more lag (springier)
    halo.current.x = lerp(halo.current.x, mouse.current.x, ease);
    halo.current.y = lerp(halo.current.y, mouse.current.y, ease);

    if (dotRef.current) {
      dotRef.current.style.transform = `translate(${mouse.current.x}px, ${mouse.current.y}px) translate(-50%, -50%)`;
    }
    if (haloRef.current) {
      haloRef.current.style.transform = `translate(${halo.current.x}px, ${halo.current.y}px) translate(-50%, -50%)`;
    }

    rafRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    // Start animation loop
    rafRef.current = requestAnimationFrame(animate);

    const onMove = (e) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      if (!isVisible) setIsVisible(true);

      // Detect what we're hovering
      const target = e.target;
      if (
        target.closest('button') ||
        target.closest('a') ||
        target.closest('[role="button"]') ||
        target.closest('[data-cursor="hover"]')
      ) {
        setCursorState('hover');
      } else if (
        target.closest('.rounded-3xl') ||
        target.closest('.rounded-2xl') ||
        target.closest('[data-cursor="card"]')
      ) {
        setCursorState('card');
      } else if (target.closest('[data-cursor="active"]')) {
        setCursorState('active');
      } else {
        setCursorState('default');
      }
    };

    const onLeave = () => setIsVisible(false);
    const onEnter = () => setIsVisible(true);
    const onDown  = () => setCursorState('active');
    const onUp    = (e) => {
      // Reset to what we're hovering
      const target = e.target;
      if (target.closest('button') || target.closest('a')) setCursorState('hover');
      else setCursorState('default');
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    document.addEventListener('mouseleave', onLeave);
    document.addEventListener('mouseenter', onEnter);
    window.addEventListener('mousedown', onDown);
    window.addEventListener('mouseup', onUp);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
      document.removeEventListener('mouseenter', onEnter);
      window.removeEventListener('mousedown', onDown);
      window.removeEventListener('mouseup', onUp);
    };
  }, [animate, isVisible]);

  const colors = colorMap[cursorState];
  const isHovering = cursorState === 'hover' || cursorState === 'active';
  const isCard = cursorState === 'card';

  return (
    <>
      {/* Hide native OS cursor site-wide */}
      <style>{`
        * { cursor: none !important; }
      `}</style>

      {/* ── DOT: precise pinpoint tracker ── */}
      <div
        ref={dotRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '10px' : '8px',
          height: isHovering ? '10px' : '8px',
          borderRadius: '50%',
          backgroundColor: colors.dot,
          boxShadow: colors.shadow,
          pointerEvents: 'none',
          zIndex: 99999,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.15s ease, height 0.15s ease, background-color 0.25s ease, box-shadow 0.25s ease, opacity 0.3s ease',
          willChange: 'transform',
        }}
      />

      {/* ── HALO: spring-physics trailing orb ── */}
      <div
        ref={haloRef}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: isHovering ? '52px' : isCard ? '64px' : '44px',
          height: isHovering ? '52px' : isCard ? '64px' : '44px',
          borderRadius: '50%',
          backgroundColor: colors.halo,
          border: `1.5px solid ${colors.border}`,
          backdropFilter: isHovering ? 'blur(1px)' : 'none',
          pointerEvents: 'none',
          zIndex: 99998,
          opacity: isVisible ? 1 : 0,
          transition: 'width 0.3s cubic-bezier(0.34,1.56,0.64,1), height 0.3s cubic-bezier(0.34,1.56,0.64,1), background-color 0.3s ease, border-color 0.3s ease, opacity 0.3s ease',
          willChange: 'transform',
        }}
      >
        {/* Inner 3D shimmer ring (visible when hovering cards) */}
        {isCard && (
          <div style={{
            position: 'absolute',
            inset: '6px',
            borderRadius: '50%',
            border: '1px solid rgba(252, 211, 77, 0.3)',
            background: 'radial-gradient(circle, rgba(245,158,11,0.08) 0%, transparent 70%)',
          }} />
        )}
        {/* Inner pulse ring (visible when hovering buttons) */}
        {isHovering && (
          <div style={{
            position: 'absolute',
            inset: '8px',
            borderRadius: '50%',
            border: '1px solid rgba(165,180,252,0.4)',
            background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)',
          }} />
        )}
      </div>
    </>
  );
}
