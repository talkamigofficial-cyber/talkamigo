/**
 * Sets left-to-right or right-to-left (Arabic) for everything inside.
 * On the phone this is the `direction` style; in the web preview it is the `dir` attribute.
 *
 *   <Direction rtl={lang === 'ar'} style={{ flex: 1 }}>…</Direction>
 */
import { Platform, View, type ViewProps } from 'react-native';

export function Direction({ rtl, style, ...rest }: ViewProps & { rtl: boolean }) {
  if (Platform.OS === 'web') return <View {...rest} style={style} {...({ dir: rtl ? 'rtl' : 'ltr' } as object)} />;
  return <View {...rest} style={[{ direction: rtl ? 'rtl' : 'ltr' }, style]} />;
}
