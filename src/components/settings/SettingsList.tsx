/**
 * Grouped settings lists, like the prototype's grp() / sRow() / infoRow():
 *
 *   <Group title="Region">
 *     <Row icon="bell" label="Notifications" onPress={…} />
 *     <Row label="Restore purchases" value="—" onPress={…} />
 *   </Group>
 *
 * Every icon sits in a plain grey square with a dark icon ("Settings colours", 2 Nov 2026);
 * danger rows (Delete, Block…) use a light red square and red text.
 */
import { Children, Fragment, isValidElement } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useColors } from '../../theme/colors';
import { useT } from '../../i18n';
import { Icon, type IconName } from '../Icon';
import { Pressy } from '../Pressy';

export function Group({ title, children }: { title?: string; children: React.ReactNode }) {
  const c = useColors();
  const t = useT();
  const rows = Children.toArray(children).filter(isValidElement);
  return (
    <View style={{ gap: 8 }}>
      {title ? <Text style={[styles.label, { color: c.muted }]}>{t(title).toLocaleUpperCase(t.lang)}</Text> : null}
      <View style={[styles.group, { backgroundColor: c.card, borderColor: c.line }]}>
        {rows.map((row, i) => (
          <Fragment key={i}>
            {i > 0 && <View style={[styles.divider, { backgroundColor: c.line }]} />}
            {row}
          </Fragment>
        ))}
      </View>
    </View>
  );
}

type RowProps = {
  label: string;
  sub?: string; // small grey line under the label
  icon?: IconName;
  value?: string | React.ReactNode; // grey text (or anything) before the chevron
  onPress?: () => void;
  danger?: boolean;
  chevron?: boolean;
  raw?: boolean; // label is already final text (a name, a language's own name…)
  right?: React.ReactNode; // replaces value + chevron (e.g. a tick)
};

export function Row({ label, sub, icon, value, onPress, danger, chevron = true, raw, right }: RowProps) {
  const c = useColors();
  const t = useT();
  // text always starts on the reading side, even a Latin name in Arabic ("English" on the right)
  const align = { textAlign: t.lang === 'ar' ? ('right' as const) : ('left' as const) };
  return (
    <Pressy onPress={onPress} scale={1} highlight="rgba(120,120,128,0.16)" style={styles.row} accessibilityLabel={raw ? label : t(label)}>
      {icon ? (
        <View style={[styles.tile, { backgroundColor: danger ? 'rgba(224,16,31,0.12)' : 'rgba(127,127,140,0.16)' }]}>
          <Icon name={icon} size={19} color={danger ? '#E0101F' : c.ink} strokeWidth={2.2} />
        </View>
      ) : null}
      {/* the label always keeps at least ~90 pt; a long value ("Comme le téléphone") shrinks with … instead */}
      <View style={{ flex: 1, minWidth: 90, gap: 2 }}>
        <Text style={[styles.rowLabel, align, { color: danger ? c.tintText : c.ink }]}>{raw ? label : t(label)}</Text>
        {sub ? <Text style={[styles.sub, align, { color: c.muted }]}>{t(sub)}</Text> : null}
      </View>
      {right ?? (
        <>
          {typeof value === 'string' ? <Text style={[styles.value, { color: c.muted }]} numberOfLines={1}>{value}</Text> : value}
          {chevron && <View style={{ flexShrink: 0 }}><Icon name="chev" size={17} color={c.muted} strokeWidth={2.4} /></View>}
        </>
      )}
    </Pressy>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 11.5, fontWeight: '800', letterSpacing: 1, paddingTop: 6, paddingHorizontal: 4 },
  group: { borderRadius: 22, borderWidth: 1, overflow: 'hidden' },
  divider: { height: 1 },
  row: { minHeight: 58, flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 8, paddingHorizontal: 16 },
  tile: { width: 36, height: 36, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  rowLabel: { fontSize: 16, fontWeight: '600' },
  sub: { fontSize: 12.5, fontWeight: '500' },
  value: { fontSize: 14, fontWeight: '600', maxWidth: '45%', flexShrink: 1 },
});
