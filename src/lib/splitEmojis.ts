import type { Emoji } from "./store";
import type { Note } from "misskey-js/entities.js";

const NAMECHAR = "①"
const SPLITCHAR = "▼"
const TAGSPLITCHAR = /(?: |　|\n)+/
const REPEATCHAR_REGEXP = /^(★|☆)$/
const EMOJINAME_REGEXP1 = /:([a-z0-9_+-]+):/i
const EMOJINAME_REGEXP2 = /[a-z0-9_+-]+/i

// 読み取りはこの順番に行われる。入れ替わりがあると正しく読み取られない
const requestFields: [string, (text: string, emoji: Emoji) => void][] = [
  ["①", (text, emoji) => emoji.name = extractEmojiName(text)],
  ["②", (text, emoji) => emoji.license = text],
  ["③", (text, emoji) => emoji.from = text],
  ["④", (text, emoji) => emoji.description = text],
  ["⑤", (text, emoji) => emoji.tag = text.split(TAGSPLITCHAR).filter(s => s !== '')],
  // 以下docに定義なし フォーマットの定義が必要
  ["⑥", (text, emoji) => emoji.category = text],
  ["⑦", (text, emoji) => emoji.isSensitive = text],
  ["⑧", (text, emoji) => emoji.localOnly = text],
];

function extractEmojiName(text: string): string {
  let match = text.match(EMOJINAME_REGEXP1);
  if (match != null) return match[1]!;
  match = text.match(EMOJINAME_REGEXP2);
  if (match != null) return match[0]!;
  throw new Error('no emoji name detected');
}

export const splitEmojis = (note: Note): Emoji[] => {

  const splitText = note.text?.split(SPLITCHAR);
  const emojis: Emoji[] = []

  if (splitText == null) return [];

  if (!splitText[0].includes(NAMECHAR)) {
    splitText.splice(0, 1);
  }

  let prevFieldTexts: string[] = [];

  splitText.forEach((emojiText, emojiIdx) => {
    if (!emojiText.includes(NAMECHAR)) return;
    if (note.files?.[emojiIdx] == null) return;

    const positions = [];
    for (const [numbering] of requestFields) {
      const prevPosObj = positions.at(-1);
      const prevPos = prevPosObj == null ? 0 : prevPosObj.pos + prevPosObj.skip;
      const pos = emojiText.indexOf(numbering, prevPos); 
      if (pos === -1) break;
      positions.push({ pos, skip: numbering.length });
    }
    positions.push({ pos: emojiText.length, skip: 0});

    const fieldTexts: string[] = [];
    positions.reduce((start, end) => {
      fieldTexts.push(emojiText.slice(start.pos + start.skip, end.pos).trim());
      return end;
    });

    fieldTexts.map((text, i) => {
      if (text.match(REPEATCHAR_REGEXP)) fieldTexts[i] = prevFieldTexts[i];
    });

    prevFieldTexts = fieldTexts;

    const emoji: Emoji = {
      name: "",
      license: "",
      from: "",
      description: "",
      tag: [],
      originalText: emojiText,
      category: "",
      isSensitive: "",
      localOnly: "",
      file: note.files[emojiIdx]
    }

    fieldTexts.forEach((text, idx) => {
      requestFields[idx][1](text, emoji);
    });

    emojis.push(emoji);
  })

  return emojis
}

