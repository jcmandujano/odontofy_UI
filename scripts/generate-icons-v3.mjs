import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const outputDirectory = resolve(root, 'public/icons/iconsV3');

const icons = {
  'appointment-dot': `<circle cx="16" cy="16" r="6" fill="currentColor" stroke="none"/>`,
  agenda: `
    <rect x="3.5" y="5.5" width="21" height="20" rx="2.5"/>
    <path d="M3.5 11h21M9 3.5v4M19 3.5v4M8 15h3M14 15h3M8 19h3"/>
    <circle cx="24" cy="23.5" r="5" fill="white"/>
    <circle cx="24" cy="23.5" r="5"/>
    <path d="M24 21v2.8l2 1.2"/>`,
  bell: `
    <path d="M7 22h18l-2.3-3.1V13a6.7 6.7 0 0 0-13.4 0v5.9L7 22Z"/>
    <path d="M13 25.5a3.4 3.4 0 0 0 6 0M14.2 5.2a2 2 0 0 1 3.6 0"/>`,
  calendar: `
    <rect x="4" y="6" width="24" height="22" rx="2.5"/>
    <path d="M4 12h24M10 3.5v5M22 3.5v5"/>
    <path d="M9 17h3M15 17h3M21 17h2M9 22h3M15 22h3M21 22h2"/>`,
  'check-circle': `
    <circle cx="16" cy="16" r="12"/>
    <path d="m10.5 16.2 3.6 3.7 7.8-8"/>`,
  'check-square': `
    <rect x="4.5" y="4.5" width="23" height="23" rx="3"/>
    <path d="m10 16.3 4 4 8.5-9"/>`,
  'chevron-down': `<path d="m8 12 8 8 8-8"/>`,
  'chevron-left': `<path d="m20 7-9 9 9 9"/>`,
  'chevron-right': `<path d="m12 7 9 9-9 9"/>`,
  'clinical-notes': `
    <rect x="4" y="6" width="20" height="21" rx="2.5"/>
    <path d="M4 12h20M9 3.5v5M19 3.5v5M8 16h3M14 16h3M8 20h3"/>
    <circle cx="24" cy="23" r="5" fill="white"/>
    <circle cx="24" cy="23" r="5"/>
    <path d="M24 20.5v2.8l2 1.2"/>`,
  clock: `
    <circle cx="16" cy="16" r="12"/>
    <path d="M16 9v7l5 3"/>`,
  'close-circle': `
    <circle cx="16" cy="16" r="12"/>
    <path d="m11.5 11.5 9 9m0-9-9 9"/>`,
  'consent-document': `
    <path d="M6 3.5h13l6 6V25a3 3 0 0 1-3 3H6V3.5Z"/>
    <path d="M19 3.5V10h6M11 14h8M11 18h5"/>
    <circle cx="22.5" cy="23" r="4" fill="white"/>
    <circle cx="22.5" cy="23" r="4"/>
    <path d="m25.5 26 3 3"/>`,
  edit: `
    <path d="M17.5 7H6a2.5 2.5 0 0 0-2.5 2.5V26A2.5 2.5 0 0 0 6 28.5h16.5A2.5 2.5 0 0 0 25 26V14.5"/>
    <path d="m13 21 1-5 10.7-10.7a2.8 2.8 0 0 1 4 4L18 20l-5 1ZM22.5 7.5l4 4"/>`,
  eye: `
    <path d="M3 16s4.8-8 13-8 13 8 13 8-4.8 8-13 8S3 16 3 16Z"/>
    <circle cx="16" cy="16" r="4" fill="currentColor" stroke="none"/>`,
  'eye-off': `
    <path d="M6.2 8.2C4.2 10 3 12.2 3 16c0 0 4.8 8 13 8 2.6 0 4.9-.8 6.8-2M11 8.8A13 13 0 0 1 16 8c8.2 0 13 8 13 8a15 15 0 0 1-3 3.8M12.5 12.5a5 5 0 0 1 7 7M4 4l24 24"/>`,
  home: `
    <path d="m3.5 15.5 12.5-11 12.5 11"/>
    <path d="M6.5 13v15h19V13M12 28v-9h8v9"/>`,
  'id-card': `
    <rect x="3" y="6" width="26" height="20" rx="2.5"/>
    <circle cx="10" cy="13" r="3"/>
    <path d="M5.8 22c.8-3.5 2.2-5.2 4.2-5.2s3.4 1.7 4.2 5.2M18 12h7M18 17h7M18 22h5"/>`,
  key: `
    <circle cx="10" cy="15" r="5"/>
    <path d="M15 15h13M23 15v4M19 15v3"/>
    <circle cx="10" cy="15" r="1.25" fill="currentColor" stroke="none"/>`,
  'list-details': `
    <rect x="6" y="5" width="20" height="24" rx="2.5"/>
    <path d="M12 5a4 4 0 0 1 8 0v3h-8V5ZM11 15l2 2 3.5-4M19 15h3M11 22l2 2 3.5-4M19 22h3"/>`,
  mail: `
    <rect x="3.5" y="6.5" width="25" height="19" rx="2.5"/>
    <path d="m5 9 11 8 11-8"/>`,
  'minus-circle': `
    <circle cx="16" cy="16" r="12"/>
    <path d="M10 16h12"/>`,
  'more-horizontal': `
    <circle cx="7" cy="16" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="16" cy="16" r="1.6" fill="currentColor" stroke="none"/>
    <circle cx="25" cy="16" r="1.6" fill="currentColor" stroke="none"/>`,
  'patient-add': `
    <circle cx="12" cy="10" r="5"/>
    <path d="M3.5 27c.8-6.2 3.6-9.3 8.5-9.3s7.7 3.1 8.5 9.3M25 8v9M20.5 12.5h9"/>`,
  payments: `
    <rect x="3.5" y="7" width="25" height="18" rx="2.5"/>
    <path d="M3.5 12c4 0 6-1.7 6-5M22.5 25c0-3.3 2-5 6-5"/>
    <circle cx="16" cy="16" r="4"/>`,
  phone: `
    <path d="M8.2 4.5 12 11l-3 2.2c1.8 4.6 5.3 8.1 9.8 9.8l2.2-3 6.5 3.8-1.2 4.5c-.3 1-1.2 1.7-2.2 1.7C12 29.5 2.5 20 2 7.9c0-1 .7-1.9 1.7-2.2l4.5-1.2Z" fill="currentColor" stroke="none"/>`,
  'plus-circle': `
    <circle cx="16" cy="16" r="12"/>
    <path d="M16 10v12M10 16h12"/>`,
  power: `
    <path d="M16 3v13M10 6.5a12 12 0 1 0 12 0"/>`,
  prescription: `
    <path d="M18 7H6a2.5 2.5 0 0 0-2.5 2.5V26A2.5 2.5 0 0 0 6 28.5h16.5A2.5 2.5 0 0 0 25 26V15"/>
    <path d="m13 21 1-5 10.7-10.7a2.8 2.8 0 0 1 4 4L18 20l-5 1ZM22.5 7.5l4 4"/>`,
  printer: `
    <path d="M9 12V4h14v8M9 24H5a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h22a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-4"/>
    <rect x="9" y="19" width="14" height="10" rx="1"/>
    <circle cx="24.5" cy="16" r="1" fill="currentColor" stroke="none"/>`,
  receipt: `
    <path d="M7 3.5h18v25l-3-2-3 2-3-2-3 2-3-2-3 2v-25Z"/>
    <path d="M11 10h10M11 15h10M11 20h5M20 20h1"/>`,
  search: `
    <circle cx="14" cy="14" r="8.5"/>
    <path d="m20.2 20.2 7 7"/>`,
  'send-mail': `
    <rect x="3.5" y="7" width="20" height="16" rx="2"/>
    <path d="m5 9 8.5 6 8.5-6M19 26h9M24 21l5 5-5 5"/>`,
  settings: `
    <path d="M13 3h6l.7 3.4c1 .4 1.9.9 2.7 1.6l3.3-1.1 3 5.2-2.6 2.3c.1.5.2 1.1.2 1.6s-.1 1.1-.2 1.6l2.6 2.3-3 5.2-3.3-1.1c-.8.7-1.7 1.2-2.7 1.6L19 29h-6l-.7-3.4c-1-.4-1.9-.9-2.7-1.6l-3.3 1.1-3-5.2 2.6-2.3A8 8 0 0 1 5.7 16c0-.5.1-1.1.2-1.6l-2.6-2.3 3-5.2L9.6 8c.8-.7 1.7-1.2 2.7-1.6L13 3Z"/>
    <circle cx="16" cy="16" r="4.5"/>`,
  'sort-down': `<path d="m8 12 8 8 8-8" fill="currentColor" stroke="none"/>`,
  'sort-up': `<path d="m8 20 8-8 8 8" fill="currentColor" stroke="none"/>`,
  tooth: `
    <path d="M9.2 4.4c2.7-1.6 5-.7 6.8 1.5 1.8-2.2 4.1-3.1 6.8-1.5 4.5 2.7 3.1 8.7 1.7 12.7l-3.2 8.7c-.8 2.2-1.8 3.2-2.9 3.2-1.4 0-2.3-1.5-3.6-3.7-1-1.7-1.8-2.5-2.8-2.5s-1.8.8-2.8 2.5C7.9 27.5 7 29 5.6 29c-1.1 0-2.1-1-2.9-3.2L-.5 17.1C-1.9 13.1-3.3 7.1 1.2 4.4 4 2.7 6.4 3.1 9.2 4.4Z" transform="translate(7.2)"/>
    <path d="m12 7 4 2.3"/>`,
  trash: `
    <path d="M6 9h20l-1.7 18H7.7L6 9ZM3.5 9h25M11 9l1.5-4h7L21 9M12 14v8M20 14v8"/>`,
};

const semanticColors = {
  bell: '#F2C94C',
  'check-circle': '#2E7D32',
  'close-circle': '#C62828',
  'minus-circle': '#EB5757',
  'plus-circle': '#27AE60',
  power: '#C0D9FF',
  trash: '#EB5757',
};

const svg = (name, body) => {
  const color = semanticColors[name] ?? '#407DDA';
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" color="${color}" fill="none" stroke="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${body}</svg>\n`;
};

await mkdir(outputDirectory, { recursive: true });

await Promise.all(Object.entries(icons).map(([name, body]) =>
  writeFile(resolve(outputDirectory, `${name}.svg`), svg(name, body))
));

const symbols = Object.entries(icons).map(([name, body]) =>
  `<symbol id="${name}" viewBox="0 0 32 32" fill="none" stroke="currentColor" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${body}</symbol>`
).join('');

await writeFile(resolve(outputDirectory, 'sprite.svg'), `<svg xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><defs>${symbols}</defs></svg>\n`);

const columns = 6;
const cellWidth = 160;
const cellHeight = 112;
const rows = Math.ceil(Object.keys(icons).length / columns);
const previewItems = Object.entries(icons).map(([name, body], index) => {
  const x = (index % columns) * cellWidth;
  const y = Math.floor(index / columns) * cellHeight;
  const color = name === 'trash' || name === 'minus-circle' || name === 'close-circle'
    ? '#EB5757'
    : name === 'check-circle' || name === 'check-square' || name === 'plus-circle'
      ? '#27AE60'
      : '#407DDA';
  return `<g transform="translate(${x} ${y})"><rect x="6" y="6" width="148" height="100" rx="10" fill="#fff" stroke="#DDEAFF"/><g transform="translate(64 18)" fill="none" stroke="${color}" color="${color}" stroke-width="2.25" stroke-linecap="round" stroke-linejoin="round">${body}</g><text x="80" y="88" text-anchor="middle" font-family="Arial, sans-serif" font-size="11" fill="#59636F">${name}</text></g>`;
}).join('');

await writeFile(resolve(outputDirectory, 'preview.svg'), `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${columns * cellWidth} ${rows * cellHeight}" width="${columns * cellWidth}" height="${rows * cellHeight}"><rect width="100%" height="100%" fill="#F4F8FE"/>${previewItems}</svg>\n`);

console.log(`Generated ${Object.keys(icons).length} icons in ${outputDirectory}`);
