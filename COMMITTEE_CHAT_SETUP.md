# Committee Chat — Firebase Setup

The Group Chat drawer on the Congress Committee and Youth Congress pages is wired to use **Firebase Realtime Database** for real-time, cross-device sync.

Until the config below is pasted in, chat silently falls back to per-device `localStorage` — the UI still works, but messages don't leave your phone/laptop. Once Firebase is connected, the same UI starts syncing live to every member who opens the chat.

This is a **one-time, ~5-minute setup**. No backend code, no servers — Firebase hosts everything.

---

## 1 — Create the Firebase project (2 min)

1. Open https://console.firebase.google.com — sign in with `nepaligeetbazaar@gmail.com` (or any Google account)
2. Click **Add project** (or "Create a project")
3. Name: **`ward54-inc`** → Continue
4. Google Analytics: toggle **OFF** → Create project
5. Wait ~30 seconds while Firebase provisions, then click **Continue**

## 2 — Enable Realtime Database (1 min)

1. In the left sidebar, click **Build → Realtime Database**
2. Click **Create Database**
3. Region: **Singapore (`asia-southeast1`)** — closest to Kolkata, lowest latency
4. Security rules: choose **Start in test mode** for now (we'll lock it down in step 4)
5. Click **Enable**

You should now see an empty database at a URL like:
`https://ward54-inc-default-rtdb.asia-southeast1.firebasedatabase.app/`

## 3 — Get the web config + paste it in (1 min)

1. Click the ⚙️ gear icon → **Project settings**
2. Scroll to **Your apps** → click the **`</>` web icon**
3. App nickname: **`ward54-public`** → Register app (skip Firebase Hosting)
4. You'll see a config block like this:

```js
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "ward54-inc.firebaseapp.com",
  databaseURL: "https://ward54-inc-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "ward54-inc",
  storageBucket: "ward54-inc.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abcdef123456"
};
```

5. Copy the contents and paste them into the `FIREBASE_CONFIG = { ... }` block in [`index.html`](./index.html). Search for **`FIREBASE_CONFIG`** — you'll see commented-out placeholders, uncomment and replace them.

   Example — the block in `index.html` should look like:
   ```js
   var FIREBASE_CONFIG = {
     apiKey: "AIzaSy...",
     authDomain: "ward54-inc.firebaseapp.com",
     databaseURL: "https://ward54-inc-default-rtdb.asia-southeast1.firebasedatabase.app",
     projectId: "ward54-inc",
     storageBucket: "ward54-inc.appspot.com",
     messagingSenderId: "1234567890",
     appId: "1:1234567890:web:abcdef123456"
   };
   ```

6. Commit and push — the chat goes live the moment GitHub Pages rebuilds.

## 4 — Lock down the security rules (1 min — important!)

Test mode allows **anyone to read/write the entire DB for 30 days**. Replace the rules with this strict set:

1. In Firebase Console → **Realtime Database → Rules** tab
2. Replace the JSON with:

```json
{
  "rules": {
    "chats": {
      "$room": {
        ".read":  "$room === 'congress' || $room === 'youth'",
        ".write": "$room === 'congress' || $room === 'youth'",
        "$msg": {
          ".validate": "newData.hasChildren(['name','text','ts']) && newData.child('name').isString() && newData.child('text').isString() && newData.child('text').val().length < 1000 && newData.child('name').val().length < 60"
        }
      }
    }
  }
}
```

3. Click **Publish**

What this allows:
- ✅ Anyone can read + write the `chats/congress` and `chats/youth` paths
- ✅ Each message must have `name` (< 60 chars), `text` (< 1000 chars), and `ts`
- ❌ Nothing else in the DB is touchable — locked by default

For stronger security (require login before chatting), you can later enable **Firebase Authentication** (anonymous, phone, or Google sign-in) and require `auth != null` in the rules. Not needed for an internal campaign tool right now.

---

## Verify it works

1. After pushing your config and waiting ~1 min for GitHub Pages to rebuild
2. Open the site on your phone → tap **54 Ward Congress Committee** → **Group Chat**
3. The yellow banner should switch to a **green "Connected via Firebase"** message
4. Send a message — open the same chat on another device → the message should appear within ~1 second

If the banner stays yellow, open browser DevTools → Console — Firebase will log the specific error (most common: wrong `databaseURL` or `apiKey` typo).

---

## Cost

Firebase Realtime Database free tier (Spark plan) gives you:
- 1 GB stored, 10 GB/month download
- 100 simultaneous connections

For a ward committee chat with < 50 members, you'll never come close to the limits. **Cost: ₹0/month.**
