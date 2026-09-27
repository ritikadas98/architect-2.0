// A small hand-picked stroke icon set, drawn on a 20px grid to match the drafting style.
const paths: Record<string, string> = {
  arrow: 'M4 10h12M11 5l5 5-5 5',
  back: 'M16 10H4M9 5l-5 5 5 5',
  up: 'M10 16V4M5 9l5-5 5 5',
  check: 'M4 10.5l4 4 8-9',
  x: 'M5 5l10 10M15 5L5 15',
  plus: 'M10 4v12M4 10h12',
  minus: 'M4 10h12',
  chevron: 'M8 5l5 5-5 5',
  chevronDown: 'M5 8l5 5 5-5',
  image: 'M3 5h14v10H3zM3 13l4-4 3 3 2-2 5 5M13 7.5h.01',
  link: 'M8.5 11.5l3-3M7 9l-1.5 1.5a2.5 2.5 0 003.5 3.5L10.5 12.5M13 11l1.5-1.5A2.5 2.5 0 0011 6L9.5 7.5',
  figma: 'M8 3h4a2 2 0 010 4H8zM8 7h4a2 2 0 010 4H8zM8 11h0a2 2 0 102 2v-2M8 3a2 2 0 000 4M8 7a2 2 0 000 4',
  github:
    'M7.5 16c-3 .9-3-1.5-4.2-1.8M11.7 17.5v-2.4a2 2 0 00-.6-1.6c2-.2 4.1-1 4.1-4.4a3.4 3.4 0 00-.9-2.4 3.2 3.2 0 00-.1-2.4s-.8-.2-2.5.9a8.7 8.7 0 00-4.5 0C5.5 4.1 4.7 4.3 4.7 4.3a3.2 3.2 0 00-.1 2.4 3.4 3.4 0 00-.9 2.4c0 3.4 2.1 4.2 4.1 4.4a2 2 0 00-.6 1.6v2.4',
  rocket: 'M11 13l-4-4c1-4 4.5-6.5 9-6.5 0 4.5-2.5 8-6.5 9zM7 9l-3 .5 2-3h3M11 13l-.5 3 3-2v-3M5.5 14.5c-1 1-1 3-1 3s2 0 3-1',
  shield: 'M10 2.5l6 2.5v4.5c0 3.8-2.6 6.6-6 8-3.4-1.4-6-4.2-6-8V5z',
  shieldCheck: 'M10 2.5l6 2.5v4.5c0 3.8-2.6 6.6-6 8-3.4-1.4-6-4.2-6-8V5zM7.2 10l2 2 3.8-4',
  bolt: 'M11 2L4 11h5l-1 7 7-9h-5z',
  sparkle: 'M10 3v4M10 13v4M3 10h4M13 10h4M5.5 5.5l2 2M12.5 12.5l2 2M14.5 5.5l-2 2M7.5 12.5l-2 2',
  chat: 'M4 4h12v9H9l-4 3v-3H4z',
  eye: 'M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10zM10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  code: 'M7 6l-4 4 4 4M13 6l4 4-4 4M11 4l-2 12',
  terminal: 'M3 4h14v12H3zM6 8l2.5 2L6 12M10 12h4',
  file: 'M5 2.5h6.5L15 6v11.5H5zM11 2.5V6h4',
  folder: 'M2.5 5h5l1.5 2h8.5v9h-15z',
  layers: 'M10 3l7 4-7 4-7-4zM3 11l7 4 7-4',
  agent: 'M6 7h8v8H6zM10 7V4M8 4h4M8.5 10.5h.01M11.5 10.5h.01M8.5 13h3M4 10v3M16 10v3',
  node: 'M10 7a3 3 0 100-6 3 3 0 000 6zM4 19a3 3 0 100-6 3 3 0 000 6zM16 19a3 3 0 100-6 3 3 0 000 6zM9 6.5L5 13.5M11 6.5l4 7',
  database: 'M4 5c0-1.4 2.7-2.5 6-2.5S16 3.6 16 5v10c0 1.4-2.7 2.5-6 2.5S4 16.4 4 15zM4 5c0 1.4 2.7 2.5 6 2.5S16 6.4 16 5M4 10c0 1.4 2.7 2.5 6 2.5s6-1.1 6-2.5',
  history: 'M3.5 10a6.5 6.5 0 106.5-6.5 6.6 6.6 0 00-5 2.4M3.5 3v3.5H7M10 6.5V10l2.5 2',
  settings:
    'M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5zM16.2 12.3l1.2.9-1.6 2.8-1.4-.6a6 6 0 01-1.7 1l-.2 1.6H9.3l-.2-1.6a6 6 0 01-1.7-1l-1.4.6-1.6-2.8 1.2-.9a6 6 0 010-2l-1.2-1 1.6-2.7 1.4.6a6 6 0 011.7-1L9.3 2.6h3.2l.2 1.6a6 6 0 011.7 1l1.4-.6 1.6 2.8-1.2.9a6 6 0 010 2z',
  key: 'M12.5 3a4.5 4.5 0 00-4.3 5.8L3 14v3h3v-2h2v-2h2l1.2-1.2A4.5 4.5 0 1012.5 3zM13.5 7h.01',
  lock: 'M5 9h10v8H5zM7 9V6.5a3 3 0 016 0V9',
  globe: 'M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM2.5 10h15M10 2.5c2 2 3 4.5 3 7.5s-1 5.5-3 7.5c-2-2-3-4.5-3-7.5s1-5.5 3-7.5z',
  wand: 'M3 17L13 7M11 5l4 4M14 2v2M17 5h-2M16.5 2.5l-1 1',
  cursor: 'M4 3l12 5.5-5.2 1.6L9 15.5z',
  mobile: 'M6 2.5h8v15H6zM9 15h2',
  desktop: 'M2.5 4h15v10h-15zM7 17h6M10 14v3',
  tablet: 'M4 3h12v14H4zM9 15h2',
  refresh: 'M16 4v4h-4M4 16v-4h4M15.5 8A6 6 0 005 6.5M4.5 12A6 6 0 0015 13.5',
  undo: 'M4 7h8a4 4 0 010 8H8M7 4L4 7l3 3',
  search: 'M9 15a6 6 0 100-12 6 6 0 000 12zM13.5 13.5L17 17',
  upload: 'M10 13V3M6 7l4-4 4 4M3 13v4h14v-4',
  download: 'M10 3v10M6 9l4 4 4-4M3 13v4h14v-4',
  branch: 'M6 3v10M6 13a2 2 0 100 4 2 2 0 000-4zM14 7a2 2 0 100-4 2 2 0 000 4zM14 7c0 4-8 3-8 6',
  pr: 'M6 3a2 2 0 100 4 2 2 0 000-4zM6 7v10M14 17a2 2 0 100-4 2 2 0 000 4zM14 13V8a2 2 0 00-2-2H9M11 4L9 6l2 2',
  skill: 'M10 2l2.2 4.6 5 .7-3.6 3.5.9 5-4.5-2.4-4.5 2.4.9-5L2.8 7.3l5-.7z',
  puzzle: 'M8 3h4v2.5a1.5 1.5 0 103 0V3h2v5h-2.5a1.5 1.5 0 100 3H17v6H3v-6h2.5a1.5 1.5 0 100-3H3V3h5z',
  warning: 'M10 3l8 14H2zM10 8v4M10 14.5h.01',
  info: 'M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM10 9v5M10 6.5h.01',
  coin: 'M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM12.5 7.5c-.4-.8-1.4-1.3-2.5-1.3-1.4 0-2.5.8-2.5 1.8 0 2.5 5 1.3 5 3.8 0 1-1.1 1.9-2.5 1.9-1.1 0-2.1-.5-2.5-1.3M10 5v1.2M10 13.8V15',
  clock: 'M10 17.5a7.5 7.5 0 100-15 7.5 7.5 0 000 15zM10 6v4l2.5 2',
  user: 'M10 10a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM3.5 17.5c.8-3 3.4-5 6.5-5s5.7 2 6.5 5',
  users: 'M7.5 9.5a3 3 0 100-6 3 3 0 000 6zM2 17c.6-2.8 2.8-4.5 5.5-4.5S12.4 14.2 13 17M13 3.8a3 3 0 010 5.6M15.5 12.8c1.3.6 2.2 2.2 2.5 4.2',
  mail: 'M3 5h14v10H3zM3 5l7 6 7-6',
  logout: 'M8 3H4v14h4M13 6l4 4-4 4M17 10H8',
  more: 'M5 10h.01M10 10h.01M15 10h.01',
  play: 'M6 4l10 6-10 6z',
  stop: 'M5 5h10v10H5z',
  copy: 'M7 7h10v10H7zM13 7V3H3v10h4',
  external: 'M11 3h6v6M17 3l-8 8M14 12v5H3V6h5',
  pencil: 'M13 3l4 4-9.5 9.5H3.5v-4z',
  palette:
    'M10 2.5a7.5 7.5 0 000 15c1 0 1.5-.7 1.5-1.4 0-.9-.8-1.2-.8-2.1 0-.8.7-1.5 1.5-1.5H14a3.5 3.5 0 003.5-3.5C17.5 5.5 14.1 2.5 10 2.5zM6 9h.01M8 6h.01M12 6h.01M14 9h.01',
  flag: 'M4 17V3M4 3h10l-2 3.5L14 10H4',
  inbox: 'M3 11l2-7h10l2 7v5H3zM3 11h4l1 2h4l1-2h4',
  moon: 'M16 12.5A6.5 6.5 0 017.5 4a6.5 6.5 0 108.5 8.5z',
  sun: 'M10 13.5a3.5 3.5 0 100-7 3.5 3.5 0 000 7zM10 1.5v2M10 16.5v2M1.5 10h2M16.5 10h2M4 4l1.4 1.4M14.6 14.6L16 16M4 16l1.4-1.4M14.6 5.4L16 4',
  grid: 'M3 3h6v6H3zM11 3h6v6h-6zM3 11h6v6H3zM11 11h6v6h-6z',
  send: 'M3 10l14-7-5 14-2.5-5.5z',
  pause: 'M6 4h3v12H6zM11 4h3v12h-3z',
  cpu: 'M6 6h8v8H6zM8 2v4M12 2v4M8 14v4M12 14v4M2 8h4M2 12h4M14 8h4M14 12h4',
}

export type IconName = keyof typeof paths

export function Icon({
  name,
  size = 16,
  stroke = 1.6,
  className,
  style,
}: {
  name: IconName
  size?: number
  stroke?: number
  className?: string
  style?: React.CSSProperties
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth={stroke}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={{ flex: 'none', ...style }}
      aria-hidden="true"
    >
      <path d={paths[name]} />
    </svg>
  )
}
