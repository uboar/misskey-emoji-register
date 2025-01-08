<script lang="ts">
  import { onMount, tick } from "svelte";
  import EmojiRegister from "./components/EmojiRegister.svelte";
  import GetNote from "./components/GetNote.svelte";
  import EditNote from "./components/EditNote.svelte";

  import { emojis, getCookie, note } from "./lib/store";
  import { load } from "./lib/ffmpeg";

  let selectedTab: null | 'getnote' | 'editnote' | number = 'getnote';

  getCookie();

  onMount(async () => {
    await load();
  });

  const tabSelect = async (tabId: typeof selectedTab) => {
    selectedTab = null;
    await tick();
    selectedTab = tabId;
  };
</script>

<main>
  <div class="h-screen w-screen">
    <div class="navbar bg-base-300">
      <div class="navbar-start">
        <h1 class="text-xl">Misskey emoji Register</h1>
      </div>
    </div>

    <div role="tablist" class="tabs tabs-bordered bg-base-300 shadow overflow-auto">
      <button
        role="tab"
        class="tab {selectedTab === 'getnote' ? 'tab-active' : ''} min-w-max"
        onclick={() => tabSelect('getnote')}>ノート取得</button
      >
      {#if $note != null}
        <button
          role="tab"
          class="tab {selectedTab === 'editnote' ? 'tab-active' : ''} min-w-max"
          onclick={() => tabSelect('editnote')}>申請の編集</button
        >
      {/if}
      {#each $emojis as emoji, index}
        <button
          role="tab"
          class="tab {selectedTab === index ? 'tab-active' : ''} overflow-hidden"
          onclick={() => tabSelect(index)}
	>
	  <div class="min-w-4 flex flex-row">
            <img class="w-4 object-contain" src={emoji.file.url} />
            <span class="px-2 whitespace-nowrap">:{emoji.name}:</span>
          </div>
	</button>
      {/each}
    </div>

    <div class="p-4">
      {#if selectedTab == null}
        <div></div>
      {:else if selectedTab === 'getnote'}
        <GetNote></GetNote>
      {:else if selectedTab === 'editnote'}
        <EditNote></EditNote>
      {:else}
        <EmojiRegister bind:emoji={$emojis[selectedTab]}></EmojiRegister>
      {/if}
    </div>
  </div>
</main>
