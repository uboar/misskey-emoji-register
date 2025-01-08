<script lang="ts">
  import {
    note,
    emojis,
  } from "../lib/store";
  import { splitEmojis } from "../lib/misskey";

  let noteText = $note.text;
  $: {
    $note.text = noteText;
  }
    
  async function updateNote() {
    const emojisData = splitEmojis($note);
    emojis.set(emojisData);
  };
</script>

<div>
  <textarea bind:value={noteText}></textarea>
  <button class="btn btn-primary" onclick={updateNote}>更新</button>
</div>
