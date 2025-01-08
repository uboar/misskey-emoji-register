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
    $emojis = splitEmojis($note);
  };
</script>

<div class="grid gap-4">
  <textarea
    class="textarea textarea-primary h-32"
    style="height: 50vh"
    bind:value={noteText}
  ></textarea>
  <button class="btn btn-primary" onclick={updateNote}>更新</button>
</div>
