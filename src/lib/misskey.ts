import { api } from "misskey-js"

import { serverUrl, accessToken } from "./store";
import { get } from "svelte/store";
import type { APIClient } from "misskey-js/api.js";
import type { AdminEmojiAddRequest, DriveFilesCreateResponse, Note } from "misskey-js/entities.js";

let miApi: APIClient;

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

export const addEmoji = async (request: Omit<AdminEmojiAddRequest, 'file'>, file: File) => {
  const formData = new FormData();
  formData.append("i", get(accessToken));
  formData.append("file", file);

  const res = await miApi.fetch(
    `${get(serverUrl)}/api/drive/files/create`,
    { method: "POST", body: formData, headers: {} }
  ).then(res => res.json())// as any as DriveFilesCreateResponse
  if ('error' in res) throw res.error;

  await miApi.request("admin/emoji/add", {
    ...request, fileId: res.id,
  });
}
