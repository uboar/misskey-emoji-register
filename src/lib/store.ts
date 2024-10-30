import { writable } from "svelte/store";
import { get } from "svelte/store";
import { init as apiInit } from "./misskey";
import type { DriveFile, Note } from "misskey-js/entities.js";

export type Emoji = {
 originalText: string
 name: string
 license: string 
 from: string
 description: string
 tag: string[]
 category: string
 isSensitive: string
 localOnly: string
 file: DriveFile
}

export const serverUrl = writable("");
export const accessToken = writable("");
export const note = writable<Note>();
export const defaultFFMpegArgs = writable("-lossless 1");
export const emojis = writable<Emoji[]>();

export const getCookie = () => {
  const cookies = document.cookie;
  if(cookies !== ""){
    const strArr = cookies.split("; ");
    strArr.forEach((elem) => {
      if(elem.startsWith("accessToken")) {
        accessToken.set(elem.replace(/accessToken=/, ""));
      }
      if(elem.startsWith("serverUrl")) {
        serverUrl.set(elem.replace(/serverUrl=/, ""));
      }
    })
  }
  apiInit();
}

export const updateCookie = () => {
  document.cookie = `accessToken=${get(accessToken)}; Max-Age=50000000`;
  document.cookie = `serverUrl=${get(serverUrl)}; Max-Age=50000000`;
  apiInit();
}