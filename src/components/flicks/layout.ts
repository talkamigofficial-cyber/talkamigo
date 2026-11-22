/**
 * Positions on a Flick, in points from the bottom of the feed (the top of the tab bar).
 * The prototype measures from the bottom of the phone with a 78 pt tab bar on top,
 * so its numbers are these + 78 (e.g. comment bar 92, caption 152, rail 150).
 */
export const FLICK_LAYOUT = {
  cbarBottom: 14, // "Add a comment or a correction…" bar
  metaBottom: 74, // caption block
  railBottom: 72, // button rail
  progressBottom: 4, // video progress line
  railSide: 8, // rail distance from the screen edge
  metaGap: 68, // caption stops this far from the rail side
};
