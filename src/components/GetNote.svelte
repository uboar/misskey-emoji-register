<script lang="ts">
  import {
    accessToken,
    serverUrl,
    note,
    updateCookie,
    emojis,
    defaultFFMpegArgs,
  } from "../lib/store";
  import { getNote, splitEmojis, init } from "../lib/misskey";

  let noteId = "";

  let sanitizedNoteId = "";
  let sanitizedServerUrl = "";

  $: {
    sanitizedNoteId = noteId.replace(/.*\//, "");
  }

  $: {
    const sanitizedServerUrlTail = $serverUrl
      .replace(/^\w*:\/\//, "")
      .replace(/\/$/, "");

    sanitizedServerUrl = [
      sanitizedServerUrlTail.startsWith("localhost:") ? "http://" : "https://",
      sanitizedServerUrlTail,
    ].join("");
  }

  let noteResponse = "";

  const getNoteData = async () => {
    noteId = sanitizedNoteId;
    serverUrl.set(sanitizedServerUrl);
    updateCookie();
    init();

    const noteData = await getNote(noteId);
    note.set(noteData);
    noteResponse = JSON.stringify(noteData);
    const emojisData = splitEmojis(noteData);
    emojis.set(emojisData);
  };
</script>

<div class="grid gap-4">
  <div>
    <label for="server-url">サーバーURL</label>
    <input
      id="server-url"
      bind:value={$serverUrl}
      type="text"
      class="input input-xs input-bordered md:input-md md:w-64"
      placeholder="EX: https://voskey.icalo.net"
      oninput={updateCookie}
    />
    {#if $serverUrl !== sanitizedServerUrl}
      <div class="mt-1 text-sm">
        {sanitizedServerUrl} に自動修正されます
        <button
          class="btn btn-xs inline-block"
          onclick={() => serverUrl.set(sanitizedServerUrl)}
        >
          今すぐ修正
        </button>
      </div>
    {/if}
  </div>
  <div>
    <label for="access-token">アクセストークン</label>
    <input
      id="access-token"
      bind:value={$accessToken}
      type="password"
      class="input input-xs input-bordered md:input-md md:w-64"
      oninput={updateCookie}
    />
  </div>
  <div>
    <label for="note-id">ノートID</label>
    <input
      id="note-id"
      bind:value={noteId}
      type="text"
      class="input input-xs input-bordered md:input-md md:w-64"
      oninput={updateCookie}
    />
    {#if noteId !== sanitizedNoteId}
      <div class="mt-1 text-sm">
        {sanitizedNoteId} に自動修正されます
        <button
          class="btn btn-xs inline-block"
          onclick={() => (noteId = sanitizedNoteId)}
        >
          今すぐ修正
        </button>
      </div>
    {/if}
  </div>
  <div>
    <label for="default-ffmpeg-args">デフォルトffmpeg引数</label>
    <input
      id="default-ffmpeg-args"
      bind:value={$defaultFFMpegArgs}
      type="text"
      class="input input-xs input-bordered md:input-md md:w-64"
      placeholder="EX: -lossless 1"
      oninput={updateCookie}
    />
  </div>
  <button class="btn btn-primary" onclick={getNoteData}>ノート取得</button>
  <textarea
    class="textarea textarea-bordered"
    readonly
    bind:value={noteResponse}
  ></textarea>
</div>
