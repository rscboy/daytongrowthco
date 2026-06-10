export const sceneLayers = [
  {
    id: 'back-haze',
    label: 'Market haze',
    imageUrl: null, // Replace with '/assets/layers/back-haze.png' or any PNG/JPG served by Vite.
    colorA: '#0b1635',
    colorB: '#2563eb',
    z: -16,
    x: -1.4,
    y: 0.65,
    width: 14,
    height: 8,
    scale: 1,
    opacity: 0.62,
    parallax: 0.08,
    rotation: -0.05,
    timing: { fadeIn: 0, fadeOut: 0.9 }
  },
  {
    id: 'grid-depth',
    label: 'Lead system grid',
    imageUrl: null, // Replace with a transparent grid/depth PNG for your own branded scene.
    colorA: '#111827',
    colorB: '#3b82f6',
    z: -11,
    x: 1.25,
    y: -0.2,
    width: 11,
    height: 6.2,
    scale: 0.95,
    opacity: 0.72,
    parallax: 0.14,
    rotation: 0.04,
    timing: { fadeIn: 0.05, fadeOut: 0.96 }
  },
  {
    id: 'site-card',
    label: 'Website layer',
    imageUrl: null, // Add your website screenshot PNG/JPG here.
    colorA: '#f8fafc',
    colorB: '#93c5fd',
    z: -6.8,
    x: -1.25,
    y: 0.1,
    width: 7.8,
    height: 4.6,
    scale: 0.92,
    opacity: 0.94,
    parallax: 0.23,
    rotation: -0.08,
    timing: { fadeIn: 0.08, fadeOut: 0.88 }
  },
  {
    id: 'automation-card',
    label: 'Automation layer',
    imageUrl: null, // Add a workflow, CRM, or dashboard layer here.
    colorA: '#0f172a',
    colorB: '#7c3aed',
    z: -3.8,
    x: 1.1,
    y: -0.45,
    width: 6.4,
    height: 4,
    scale: 0.86,
    opacity: 0.86,
    parallax: 0.36,
    rotation: 0.09,
    timing: { fadeIn: 0.12, fadeOut: 0.82 }
  },
  {
    id: 'lead-chip',
    label: 'Lead captured',
    imageUrl: null, // Swap with a transparent foreground PNG for a stronger depth effect.
    colorA: '#ffffff',
    colorB: '#dbeafe',
    z: -1.7,
    x: -0.55,
    y: -1.05,
    width: 4.8,
    height: 2.25,
    scale: 0.82,
    opacity: 0.96,
    parallax: 0.56,
    rotation: -0.02,
    timing: { fadeIn: 0.18, fadeOut: 0.75 }
  },
  {
    id: 'foreground-spark',
    label: 'Growth signal',
    imageUrl: null, // Use a transparent accent PNG here, such as light streaks or product UI details.
    colorA: '#60a5fa',
    colorB: '#c084fc',
    z: 0.35,
    x: 1.35,
    y: 1.05,
    width: 3.4,
    height: 3.4,
    scale: 0.72,
    opacity: 0.7,
    parallax: 0.78,
    rotation: 0.14,
    timing: { fadeIn: 0.22, fadeOut: 0.68 }
  }
];

export const timelineBeats = [
  {
    progress: '0%',
    label: 'Camera pulled back. The business system is visible as layered depth.'
  },
  {
    progress: '25%',
    label: 'The camera moves through website and lead capture layers.'
  },
  {
    progress: '55%',
    label: 'Foreground automation layers scale faster for stronger parallax.'
  },
  {
    progress: '82%',
    label: 'Atmosphere fades and the camera passes through the scene.'
  }
];
