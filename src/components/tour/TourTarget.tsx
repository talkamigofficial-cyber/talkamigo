/**
 * Marks a part of a screen so the welcome tour can put its spotlight on it.
 *
 *   <TourTarget id="tab-chats">…the Chats tab button…</TourTarget>
 *
 * Target ids used by the tour (TOUR_STEPS in Tour.tsx), in order:
 *   tab-flicks    the Flicks tab button               (bottom tab bar)
 *   flicks-post   the red "+" to post a Flick          (Flicks top bar)
 *   tab-chats     the Chats tab button
 *   tab-connect   the Connect tab button
 *   tab-rooms     the Rooms tab button
 *   rooms-open    the "Open room" button               (Rooms top bar)
 *   tab-me        the Me tab button
 *   me-langcard   the Language card                    (Me)
 *   me-coins      the coins chip                       (Me top row)
 *   me-diamonds   the Diamonds chip                    (Me top row)
 *   me-settings   the ☰ Settings button                (Me top row)
 * A step whose target isn't on screen shows its card in the middle instead (like the prototype).
 */
import { useEffect, useRef } from 'react';
import { View, type ViewProps } from 'react-native';

export type TourTargetId =
  | 'tab-flicks' | 'flicks-post' | 'tab-chats' | 'tab-connect' | 'tab-rooms' | 'rooms-open'
  | 'tab-me' | 'me-langcard' | 'me-coins' | 'me-diamonds' | 'me-settings';

type Rect = { x: number; y: number; width: number; height: number };

type ViewRef = React.ComponentRef<typeof View>;
const targets = new Map<TourTargetId, React.RefObject<ViewRef | null>>();

/** Where a target is on the screen right now, or null if it isn't showing. */
export function measureTarget(id: TourTargetId): Promise<Rect | null> {
  const ref = targets.get(id);
  return new Promise((resolve) => {
    if (!ref?.current) return resolve(null);
    ref.current.measureInWindow((x: number, y: number, width: number, height: number) => resolve(width && height ? { x, y, width, height } : null));
  });
}

export function TourTarget({ id, ...rest }: ViewProps & { id: TourTargetId }) {
  const ref = useRef<ViewRef>(null);
  useEffect(() => {
    targets.set(id, ref);
    return () => { if (targets.get(id) === ref) targets.delete(id); };
  }, [id]);
  return <View ref={ref} collapsable={false} {...rest} />;
}
