/**
 * Small pieces shared by the log-in / sign-up entry screens (prototype vAuth()):
 *   - AuthHeader: back button + progress bar + "Step 1 of 9" (sign-up only), then the big title and subtitle
 *   - TrustNotes: the white card of reassurance lines (lock / eye / phone / shield)
 *   - stepLabel(): "Step 1 of 9" in the app language
 *   - SIGNUP_TOTAL: number of sign-up steps a learner sees
 */
import { StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { BackButton } from '../Screen';
import { Icon, type IconName } from '../Icon';
import { useT, type Lang } from '../../i18n';
import { onRed } from '../../theme/colors';

/**
 * Learners see 9 steps: Join · Who · Country · How did you find us · Speaks · Learns · Interests · Photo · Video.
 * Prototype bug fixed: the Join page said "Step 1 of 8" but the next pages said "Step 2 of 9" (v88 added
 * "How did you find TalkAmigo?" and only the later pages were updated).
 */
export const SIGNUP_TOTAL = 9;

/** "Step 1 of 9" in every app language (prototype STEPW). */
const STEPW: Record<Lang, string> = {
  en: 'Step {a} of {b}', fr: 'Étape {a} sur {b}', es: 'Paso {a} de {b}', pt: 'Passo {a} de {b}', de: 'Schritt {a} von {b}',
  it: 'Passo {a} di {b}', ja: 'ステップ {a}/{b}', ar: 'الخطوة {a} من {b}',
};
export const stepLabel = (lang: Lang, a: number, b: number) => STEPW[lang].replace('{a}', String(a)).replace('{b}', String(b));

type HeaderProps = { title?: string; sub?: React.ReactNode; step?: number; onBack?: () => void };

export function AuthHeader({ title, sub, step, onBack }: HeaderProps) {
  const t = useT();
  return (
    <>
      <View style={styles.top}>
        <BackButton onRed onPress={onBack ?? (() => (router.canGoBack() ? router.back() : router.replace('/welcome')))} />
        {step ? (
          <>
            <View style={styles.track}>
              <View style={[styles.fill, { width: `${(step / SIGNUP_TOTAL) * 100}%` }]} />
            </View>
            <Text style={styles.step}>{stepLabel(t.lang, step, SIGNUP_TOTAL)}</Text>
          </>
        ) : null}
      </View>
      {title ? (
        <View style={styles.head}>
          <Text style={styles.title}>{t(title)}</Text>
          {sub ? typeof sub === 'string' ? <Text style={styles.sub}>{t(sub)}</Text> : sub : null}
        </View>
      ) : null}
    </>
  );
}

/** White card with icon rows ("We never post anything…"). Texts are translated. */
export function TrustNotes({ rows }: { rows: [IconName, string][] }) {
  const t = useT();
  return (
    <View style={styles.card}>
      {rows.map(([icon, text]) => (
        <View key={text} style={styles.trustRow}>
          <View style={styles.trustIcon}><Icon name={icon} size={16} color="#3A3A44" /></View>
          <Text style={styles.trustText}>{t(text)}</Text>
        </View>
      ))}
    </View>
  );
}

export const authStyles = StyleSheet.create({
  pad: { paddingHorizontal: 20 },
  card: { backgroundColor: onRed.card, borderRadius: 24, boxShadow: '0 12px 30px rgba(60,0,40,0.18)' },
});

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', gap: 10, paddingTop: 16, paddingBottom: 12, paddingHorizontal: 20 },
  track: { flex: 1, height: 6, borderRadius: 3, backgroundColor: 'rgba(255,255,255,0.28)' },
  fill: { height: 6, borderRadius: 3, backgroundColor: '#fff' },
  step: { fontSize: 12.5, fontWeight: '700', color: 'rgba(255,255,255,0.86)' },
  head: { paddingHorizontal: 20, paddingTop: 6, gap: 8 },
  title: { fontSize: 30, fontWeight: '800', letterSpacing: -0.6, lineHeight: 33, color: '#fff', textShadowColor: 'rgba(70,0,40,0.25)', textShadowRadius: 24, textShadowOffset: { width: 0, height: 6 } },
  sub: { fontSize: 15, lineHeight: 22, color: 'rgba(255,255,255,0.86)' },
  card: { ...authStyles.card, paddingVertical: 14, paddingHorizontal: 16, gap: 8 },
  trustRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  trustIcon: { width: 28, height: 28, borderRadius: 9, backgroundColor: '#F4F4F6', alignItems: 'center', justifyContent: 'center' },
  trustText: { flex: 1, fontSize: 13, fontWeight: '600', color: '#3A3A44' },
});

/**
 * Two texts the handoff translation table doesn't have yet (proposed for scripts/translation-fixes.json;
 * kept here until they are added there).
 */
const CONNECTING: Record<Lang, string> = {
  en: 'Connecting to $…', fr: 'Connexion à $…', es: 'Conectando con $…', pt: 'Conectando ao $…', de: 'Verbindung mit $…',
  it: 'Connessione a $…', ja: '$に接続中…', ar: 'جارٍ الاتصال بـ$…',
};
export const connectingText = (lang: Lang, name: string) => CONNECTING[lang].replace('$', name);
const CHECKING: Record<Lang, string> = { en: 'Checking…', fr: 'Vérification…', es: 'Comprobando…', pt: 'Verificando…', de: 'Wird geprüft…', it: 'Verifica…', ja: '確認中…', ar: 'جارٍ التحقق…' };
export const checkingText = (lang: Lang) => CHECKING[lang];

/** "7700900123" → "770 090 0123" (prototype fmtPhone: groups of 3, 3, then the rest; max 12 digits). */
export const formatPhone = (digits: string) =>
  digits.replace(/\D/g, '').slice(0, 12).replace(/(\d{3})(\d{0,3})(\d{0,6})/, (_m, a: string, b: string, c: string) => [a, b, c].filter(Boolean).join(' '));
const WELCOME_BACK: Record<Lang, string> = {
  en: 'Welcome back, $!', fr: 'Bon retour, $ !', es: '¡Hola de nuevo, $!', pt: 'Que bom te ver de novo, $!', de: 'Willkommen zurück, $!',
  it: 'Bentornato, $!', ja: 'おかえりなさい、$さん！', ar: 'مرحبًا بعودتك يا $!',
};
export const welcomeBackText = (lang: Lang, name: string) => WELCOME_BACK[lang].replace('$', name);
