/**
 * Line icons, the same drawings as the prototype (src/data/generated/icons.json).
 *
 *   <Icon name="chat" size={22} color={c.ink} />
 *
 * Icons that point a direction (back, chev) are flipped automatically in Arabic (right-to-left).
 */
import { memo } from 'react';
import { SvgXml } from 'react-native-svg';
import icons from '../data/generated/icons.json';
import { useLang } from '../i18n';

export type IconName = keyof typeof icons;

const FLIP_IN_RTL = new Set(['back', 'chev', 'reply', 'send']);

type Props = { name: IconName; size?: number; color?: string; strokeWidth?: number; fill?: string };

export const Icon = memo(function Icon({ name, size = 22, color = '#111114', strokeWidth = 2, fill = 'none' }: Props) {
  const rtl = useLang() === 'ar';
  const inner = icons[name] ?? '';
  const flip = rtl && FLIP_IN_RTL.has(name) ? ' transform="translate(24 0) scale(-1 1)"' : '';
  const xml = `<svg viewBox="0 0 24 24" fill="${fill}" stroke="${color}" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"><g${flip}>${inner}</g></svg>`;
  return <SvgXml xml={xml} width={size} height={size} color={color} />;
});
