/**
 * The TalkAmigo mascot: the two smiling speech bubbles from the logo (prototype MASCOT('')).
 * Used at the bottom of Settings (and later in empty states).
 */
import { SvgXml } from 'react-native-svg';

const XML = `<svg viewBox="0 0 200 160"><defs><linearGradient id="mr" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#FF6B5B"/><stop offset="1" stop-color="#E0101F"/></linearGradient><linearGradient id="mv" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#E85BD8"/><stop offset="1" stop-color="#7B3BFF"/></linearGradient></defs><path d="M60 18c30 0 52 20 52 46s-22 46-52 46c-6 0-11-1-16-2l-20 14 4-22C16 92 8 79 8 64 8 38 30 18 60 18z" fill="url(#mr)"/><path d="M38 62q8-10 16 0M70 62q8-10 16 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/><path d="M136 52c30 0 54 19 54 44 0 14-7 26-19 34l4 20-20-12c-6 2-12 2-19 2-30 0-54-19-54-44s24-44 54-44z" fill="url(#mv)"/><path d="M112 96q8-10 16 0M146 96q8-10 16 0" fill="none" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`;

export function Mascot({ width = 70 }: { width?: number }) {
  return <SvgXml xml={XML} width={width} height={(width * 160) / 200} />;
}
