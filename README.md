# Armenian Tutor · Այբուբեն

A friendly, Duolingo-style web app for learning **Eastern Armenian**, the Armenian spoken in Yerevan.

You learn **all 38 letters, capital and lowercase**, through the words of the **Jesus Prayer**:

> **Տեր Հիսուս Քրիստոս, Աստծո Որդի, ողորմիր ինձ՝ մեղավորիս։**
> *Ter Hisus Kristos, Astso Vordi, voghormir indz, meghavoris.*
> Lord Jesus Christ, Son of God, have mercy on me, a sinner.

Then you move on to the rest of the alphabet and intermediate vocabulary.

## Features

- **Every letter, both cases.** Each letter has a card with its capital and lowercase form, its name, and its sound.
- **English sound-alikes.** Every sound is tied to an English word: Տ = the *t* in “s**t**op”, Թ = the *t* in “**t**op”, Ղ = the French *r* in “Pa**r**is”, and so on.
- **Audio for every letter and word.** Built-in Eastern Armenian recordings work in every browser. If the device has a natural Armenian voice (Microsoft Edge does), the app uses it automatically.
- **Learn through the Jesus Prayer.** Each word of the prayer introduces a few new letters. By the end of Part 1 you can read the whole prayer.
- **Duolingo-style lessons.** A lesson path, XP, a daily streak, a daily goal, 5 hearts per lesson, and wrong answers come back at the end of the lesson.
- **Many exercise types.** Letter → sound, sound → letter, listening, capital ↔ lowercase, matching pairs, spelling words from letter tiles, putting prayer words in order, and fill in the blank.
- **Alphabet page** with a writing pad for tracing each letter.
- **Prayer page** with word-by-word breakdown and a read-along mode that highlights each word as it is spoken.
- **Pick 4 letters:** choose any 4 letters and practice them inside real words. You fill in the missing letter, tap the letter in a word, read, listen and spell. Use “Surprise me” for a random set. The app remembers your last set.
- **Practice hub:** letter review, big & small letters, listening, tricky pairs, word review, and fixing your mistakes.
- **Accounts:** sign in with email and password to keep your lessons, XP, streak and settings on every device. Practicing on two devices merges the progress, so nothing is lost. Any progress made before signing in is added to your account. Accounts need a one-time setup (see [Turning on accounts](#turning-on-accounts)). Without it, progress is saved in your browser only.
- Works on phones and desktops, has a dark mode, and can be installed to your home screen and used offline.

## Course outline

| Part | Units | What you learn |
|---|---|---|
| **1 · The Jesus Prayer** | Տեր · Հիսուս · Քրիստոս · Աստծո · Որդի · ողորմիր · ինձ · մեղավորիս · The whole prayer | 17 letters plus ու, one prayer word at a time, then reading the full prayer |
| **2 · The Rest of the Alphabet** | Բարև · Խաչ · Փառք · Հաց · Պատարագ · Լույս · Ընկեր · Tricky pairs · Alphabet master | The other 21 letters plus և, with church and everyday words, then sound pairs that English speakers mix up |
| **3 · Vocabulary (Intermediate)** | Greetings · Family · Numbers · Food · Colors · Days · Faith & church · Useful phrases · Verbs · Around Armenia | About 110 words and phrases |

There are 97 lessons in total.

## Use it

### Online (GitHub Pages)
1. In this repository go to **Settings → Pages**.
2. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose **`main`** and **`/ (root)`**, then click **Save**.
3. After about a minute the app is live at `https://<your-username>.github.io/Armenian-Tutor-/`.

On a phone, open that link and choose **Add to Home Screen** to use it like an app.

### On your computer
There is no build step. Serve the folder with any static web server:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` directly from disk also works. The only thing missing that way is offline mode.

## Turning on accounts

GitHub Pages only serves files and can't store accounts, so the app uses **[Supabase](https://supabase.com)**, which has a free tier. It's a one-time setup of about 5 minutes:

1. **Create a project.** Sign up at [supabase.com](https://supabase.com) and click **New project**. Pick any name and a database password (you won't need the password again), then wait about a minute for it to start.
2. **Create the progress table.** In the project open **SQL Editor**, paste in the contents of [`supabase/schema.sql`](supabase/schema.sql), and click **Run**. This creates one row per learner and rules that only let each person read and change their own progress.
3. **Point email links at your site.** Open **Authentication → URL Configuration**. Set **Site URL** to your site's address, e.g. `https://jkonyan25.github.io/Armenian-Tutor-/`. Add the same address under **Redirect URLs**. Sign-up confirmation and password-reset emails will then link back to the app.
4. **Connect the app.** Open **Project Settings → API Keys** (or **Settings → API** in older dashboards). Copy the **Project URL** and the **publishable** key (`sb_publishable_…`, or the legacy **anon public** key) into [`js/config.js`](js/config.js):
   ```js
   window.ARM_CONFIG = {
     supabaseUrl: 'https://abcdefghijklmnop.supabase.co',
     supabaseKey: 'sb_publishable_...'
   };
   ```
   Commit and push. Within about a minute a **Sign in** button appears in the top bar.

Notes:
- These two values are meant to be public. Never put the **secret** / **service_role** key in the app.
- By default Supabase asks new users to confirm their email. To let people start right away, turn off **Confirm email** under **Authentication → Sign In / Providers → Email**.
- Supabase's built-in email service only sends a few emails per hour. That's fine for personal use; for more, add your own email provider under **Authentication → Emails (SMTP)**.
- Free projects pause after about a week without use. Reopen the project in the Supabase dashboard to resume it.

## Project structure

```
index.html              App shell
css/styles.css          All styling (light + dark)
js/data.js              ALL course content: letters, words, the prayer, lessons
js/config.js            Supabase project URL + public key (accounts)
js/audio-manifest.js    Generated map of Armenian text → audio file
js/core.js              Helpers, saved progress, XP, streaks, merging progress
js/cloud.js             Sign-in and syncing progress with Supabase
js/account.js           Sign-in, sign-up and account screens
js/audio.js             Speech playback + sound effects
js/exercises.js         Exercise generators and lesson recipes
js/lesson.js            The lesson player and shared UI pieces
js/views.js             Learn, Alphabet, Prayer, Practice and Profile screens
js/app.js               Routing and start-up
audio/                  Eastern Armenian clips (MP3)
tools/                  Scripts that generate audio and check the course
supabase/schema.sql     Database setup for accounts
sw.js, manifest.webmanifest, icons/   Offline + install support
```

## Changing the content

All of the content is in **`js/data.js`**: letters, words, the prayer, and the lesson order. After you add or change Armenian text, rebuild the audio and run the checker:

```bash
sudo apt-get install espeak-ng ffmpeg   # once
node tools/build-audio.mjs              # makes clips for any new text
node tools/validate.mjs                 # checks the whole course
```

The checker confirms that every word in Parts 1 and 2 only uses letters the learner has already been taught, that every letter is taught, and that every piece of Armenian has audio.

## Notes on language and audio

- Spelling is modern (reformed) Eastern Armenian, as used in Armenia. The Prayer page also shows the classical church spelling.
- The romanization is written for English speakers, not the scholarly ISO system. A ’ marks the “puff of air” letters (Թ t’, Փ p’, Ք k’, Չ ch’, Ց ts’).
- The built-in clips are generated with the open-source **eSpeak NG** Eastern Armenian voice (`hy`). They are clear but robotic. For a natural voice, use a browser that offers one, such as Microsoft Edge with *Microsoft Anahit/Hayk (Armenian)*. The app picks it up automatically, and you can switch voices in Profile → Settings.
