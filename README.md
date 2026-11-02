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
- **Practice hub:** letter review, big & small letters, listening, tricky pairs, word review, and fixing your mistakes.
- Works on phones and desktops, has a dark mode, and can be installed to your home screen and used offline.
- Progress is saved in your browser (no account needed).

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

## Project structure

```
index.html              App shell
css/styles.css          All styling (light + dark)
js/data.js              ALL course content: letters, words, the prayer, lessons
js/audio-manifest.js    Generated map of Armenian text → audio file
js/core.js              Helpers, saved progress, XP and streaks
js/audio.js             Speech playback + sound effects
js/exercises.js         Exercise generators and lesson recipes
js/lesson.js            The lesson player and shared UI pieces
js/views.js             Learn, Alphabet, Prayer, Practice and Profile screens
js/app.js               Routing and start-up
audio/                  Eastern Armenian clips (MP3)
tools/                  Scripts that generate audio and check the course
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
