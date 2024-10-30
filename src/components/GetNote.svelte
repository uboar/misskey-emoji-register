<script lang="ts">
  import { get } from "svelte/store";
  import { accessToken, serverUrl, note, updateCookie, emojis, defaultFFMpegArgs } from "../lib/store";
  import { getNote, splitEmojis } from "../lib/misskey";

  let noteId = "";

  let noteResponse = "";

  const getNoteData = async () => {
    noteId = noteId
      .replace("https://", "")
      .replace(get(serverUrl), "")
      .replace("/notes/", "");

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
      class="input input-xs md:input-md input-bordered md:w-64"
      placeholder="EX:voskey.icalo.net"
      oninput={updateCookie}
    />
  </div>
  <div>
    <label for="access-token">アクセストークン</label>
    <input
      id="access-token"
      bind:value={$accessToken}
      type="password"
      class="input input-xs md:input-md input-bordered md:w-64"
      oninput={updateCookie}
    />
  </div>
  <div>
    <label for="server-url">ノートID</label>
    <input
      id="note-id"
      bind:value={noteId}
      type="text"
      class="input input-xs md:input-md input-bordered md:w-64"
    />
  </div>
  <div>
    <label for="server-url">デフォルトffmpeg引数</label>
    <input
      id="default-ffmpeg-args"
      bind:value={$defaultFFMpegArgs}
      type="text"
      class="input input-xs md:input-md input-bordered md:w-64"
      placeholder="EX:voskey.icalo.net"
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
