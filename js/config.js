/* =========================================================================
   Accounts (sign in & save progress across devices)

   Accounts use Supabase, which has a free tier. To turn them on, paste your
   project's details below. Step-by-step instructions are in README.md under
   "Turning on accounts".

   Both values are meant to be public: the key only allows what the
   database rules in supabase/schema.sql allow (each person can read and
   write only their own progress).

   Leave them empty and the app still works, but progress is saved only
   in the browser you're using.
   ========================================================================= */
window.ARM_CONFIG = {
  // Project URL, e.g. 'https://abcdefghijklmnop.supabase.co'
  supabaseUrl: '',
  // The "publishable" key (sb_publishable_...) or the legacy "anon public" key
  supabaseKey: ''
};
