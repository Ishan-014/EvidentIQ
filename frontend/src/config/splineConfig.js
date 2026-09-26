/**
 * Spline 3D Configuration
 * 
 * To integrate your own Spline 3D model:
 * 1. Export your scene from Spline (https://spline.design) as a Public URL or .splinecode link.
 * 2. Paste the URL into `heroSceneUrl` or `orbitalSceneUrl` below.
 * 3. The `<SplineScene />` component will automatically load it via `@splinetool/runtime`.
 * 
 * If left empty (or while loading), a responsive 3D geometric Canvas with dynamic lighting 
 * and mouse-tracking particles will render automatically as an interactive fallback!
 */

export const SPLINE_CONFIG = {
  // Production Spline 3D Scene URLs (Interactive modern glass orb & geometric lattice)
  heroSceneUrl: "https://prod.spline.design/6Wnt13KfuhiSt-Ax/scene.splinecode",

  // Orbital Integrations Central 3D Core URL
  orbitalSceneUrl: "https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode",

  // General settings
  enabled: true,
  enableMouseInteraction: true,
  fallbackEffect: "crystal-orb", // "crystal-orb" | "geometric-lattice" | "particle-field"
};
