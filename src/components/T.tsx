/**
 * Text that translates itself.
 *
 *   <T style={…}>Create account</T>        → "Créer un compte" on a French phone
 *   <T>{`Continue as ${name}`}</T>          → texts with changing parts work too
 *   <T raw>{person.bio}</T>                 → what people write is NEVER translated automatically
 *
 * Children must be one plain string. The app uses the iPhone's own font (San Francisco).
 */
import { Text, type TextProps } from 'react-native';
import { useT } from '../i18n';
import { useColors } from '../theme/colors';

type Props = TextProps & { children?: string | number | null; raw?: boolean };

export function T({ children, raw, style, ...rest }: Props) {
  const t = useT();
  const c = useColors();
  const text = children == null ? '' : String(children);
  return (
    <Text style={[{ color: c.ink, fontSize: 15 }, style]} {...rest}>
      {raw ? text : t(text)}
    </Text>
  );
}
