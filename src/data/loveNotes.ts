/**
 * ─────────────────────────────────────────────────────────────
 *  THINGS I LOVE ABOUT YOU
 * ─────────────────────────────────────────────────────────────
 *  • title    the reason
 *  • line     the short line always visible under it
 *  • note     the longer "secret note" she sees when she opens it
 *  Add, remove or reorder freely — numbering is automatic.
 */

export interface LoveNote {
  title: string;
  line: string;
  note: string;
}

export const loveNotes: LoveNote[] = [
  {
    title: "Your Smile",
    line: "Because somehow it makes everything feel a little lighter.",
    note: "I've seen it on good days and on hard ones, and it never stops working on me. Whatever kind of day I'm having, one smile from you and it quietly becomes a better one.",
  },
  {
    title: "The Way You Laugh",
    line: "Especially when you laugh so hard that you can't stop.",
    note: "The kind of laugh where you can't breathe and everyone around you starts laughing too, even if they missed the joke. It's my favourite sound, and I'd happily be the silly one forever just to hear it.",
  },
  {
    title: "Your Little Habits",
    line: "The tiny things you probably don't notice, but I secretly love.",
    note: "The way you do the small things only you do. You probably think nobody notices. I do, every single time, and each one makes me like you a little more.",
  },
  {
    title: "Your Kind Heart",
    line: "The way you care about people says so much about who you are.",
    note: "You remember the little things about people. You check in. You give more than you take. It's one of the first things I noticed about you and one of the things I admire most.",
  },
  {
    title: "The Way You Make Me Feel",
    line: "Comfortable, happy, and completely myself.",
    note: "With you I never have to pretend. I can be tired, silly, quiet or loud and it's all okay. That kind of comfort is rare, and I don't take it for granted.",
  },
  {
    title: "Our Random Conversations",
    line: "Even the most ridiculous conversations somehow become my favourite memories.",
    note: "The late-night ones, the pointless debates, the ideas we'll never actually do. Somewhere in all that nonsense is where I fell for you a little more.",
  },
  {
    title: "Your Strength",
    line: "You handle more than people realise, and I admire that about you.",
    note: "You carry a lot, often quietly, and still show up for the people you love. I hope you know you don't always have to be strong on your own. I'm right here.",
  },
  {
    title: "Simply Being You",
    line: "Because I don't need a list of reasons. I just love you.",
    note: "Everything above is true, but it's not really why. I love you because you're you. That's the whole reason, and it always will be.",
  },
];
