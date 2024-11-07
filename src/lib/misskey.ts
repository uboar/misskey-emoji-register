import { api } from "misskey-js";

import { serverUrl, accessToken, type Emoji } from "./store";
import { get } from "svelte/store";
import type { APIClient } from "misskey-js/api.js";
import type { AdminEmojiAddRequest, DriveFilesCreateResponse, Note } from "misskey-js/entities.js";


let miApi: APIClient;

const SPLITCHAR = "▼"
const NAMECHAR = "①"
const LICENSECHAR = "②"
const FROMCHAR = "③"
const DESCRIPTIONCHAR = "④"
const TAGCHAR = "⑤"
const CATEGORYCHAR = "⑥"
const ISSENSITIVECHAR = "⑦"
const LOCALONLYCHAR = "⑧"
const TAGSPLITCHAR = / |　/

export const init = () => {
  miApi = new api.APIClient({
    origin: get(serverUrl),
    credential: get(accessToken),
  })
}

export const getNote = async (noteId: string): Promise<Note> => {
  const note = miApi.request("notes/show", {
    noteId
  })

  return note;
}

export const splitEmojis = (note: Note): Emoji[] => {

  const splitText = note.text?.split(SPLITCHAR);
  const emojis: Emoji[] = []

  if (splitText == null) return [];

  if (!splitText[0].includes(NAMECHAR)) {
    splitText.splice(0, 1);
  }

  splitText?.forEach((val, index) => {
    if (val.includes(NAMECHAR) && note.files != null) {
      const emoji: Emoji = {
        name: "",
        license: "",
        from: "",
        description: "",
        tag: [],
        originalText: val,
        category: "",
        isSensitive: "",
        localOnly: "",
        file: note.files[index]
      }

      const lines = val.split("\n");
      lines.forEach((line) => {
        if (line.includes(NAMECHAR)) emoji.name = line.replace(NAMECHAR, "").replaceAll(":", "");
        if (line.includes(LICENSECHAR)) emoji.license = line.replace(LICENSECHAR, "")
        if (line.includes(FROMCHAR)) emoji.from = line.replace(FROMCHAR, "")
        if (line.includes(DESCRIPTIONCHAR)) emoji.description = line.replace(DESCRIPTIONCHAR, "")
        if (line.includes(TAGCHAR)) emoji.tag = line.replace(TAGCHAR, "").split(TAGSPLITCHAR).map((val) => val.replace(TAGSPLITCHAR, ""))
        if (line.includes(CATEGORYCHAR)) emoji.category = line.replace(CATEGORYCHAR, "")
        if (line.includes(ISSENSITIVECHAR)) emoji.category = line.replace(ISSENSITIVECHAR, "")
        if (line.includes(LOCALONLYCHAR)) emoji.category = line.replace(LOCALONLYCHAR, "")
      })
      emojis.push(emoji);
    }
  })

  return emojis
}

export const addEmoji = async (request: AdminEmojiAddRequest, file: File) => {


  const formData = new FormData();
  formData.append("i", get(accessToken));
  formData.append("file", file);
  const createFile = await (await miApi.fetch(`${get(serverUrl)}/api/drive/files/create`, {
    method: "POST", body: formData, headers: {},
  })).json() as any as DriveFilesCreateResponse
  request.fileId = createFile.id;
  await miApi.request("admin/emoji/add", request);
}
