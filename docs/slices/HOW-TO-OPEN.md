# How to open TalkAmigo on an iPhone (always the latest version)

1. Install **Expo Go** from the App Store and log in with the Expo account (talkamigo2030).
2. Scan `talkamigo-latest-qr.png` with the iPhone camera, or paste this link into Safari on the iPhone:
   `exp://u.expo.dev/dac9e6c3-3427-4b70-9acb-8456ee112960?channel-name=preview`
3. This link always opens the newest version. After an update: close TalkAmigo in Expo Go (swipe it away) and open it again.

Developers: publish with `npx eas-cli update --branch preview --environment preview --message "…"` (the `preview` channel follows the `preview` branch).
