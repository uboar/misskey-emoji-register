<script lang="ts">
  import { onMount, tick } from "svelte";
  import EmojiRegister from "./components/EmojiRegister.svelte";
  import GetNote from "./components/GetNote.svelte";

  import { emojis, getCookie } from "./lib/store";
  import { load } from "./lib/ffmpeg";

  let selectedTab = 0;

  getCookie();

  onMount(async () => {
    await load();
  });

  const tabSelect = async (tabNum: number) => {
    selectedTab = -1;
    await tick();
    selectedTab = tabNum;
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
        class="tab {selectedTab === 0 ? 'tab-active' : ''} min-w-max"
        onclick={() => tabSelect(0)}>ノート取得</button
      >
      {#each $emojis as emoji, index}
        <button
          role="tab"
          class="tab {selectedTab === 1 + index ? 'tab-active' : ''} overflow-hidden"
          onclick={() => tabSelect(1 + index)}
	>
	  <div class="min-w-4 flex flex-row">
            <img class="w-4 object-contain" src={emoji.file.url} />
            <span class="px-2 whitespace-nowrap">:{emoji.name}:</span>
          </div>
	</button>
      {/each}
    </div>

    <div class="p-4">
      {#if selectedTab === 0}
        <GetNote></GetNote>
      {:else if selectedTab === -1}
        <div></div>
      {:else}
        <EmojiRegister bind:emoji={$emojis[selectedTab - 1]}></EmojiRegister>
      {/if}
    </div>
  </div>
</main>
