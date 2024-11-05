<script lang="ts">
  import { toBlobURL } from "@ffmpeg/util";
  import { defaultFFMpegArgs, note, serverUrl, type Emoji } from "../lib/store";
  import { onMount } from "svelte";
  import { get } from "svelte/store";
  import { convert } from "../lib/ffmpeg";
  import type { AdminEmojiAddRequest } from "misskey-js/entities.js";
  import { addEmoji } from "../lib/misskey";

  export let emoji: Emoji;

  let taginput = "";

  let ffmpegArgs = get(defaultFFMpegArgs);
  let beforeConvertImg: HTMLImageElement;
  let afterConvertImg: HTMLImageElement;
  let beforeConvertFile: File;
  let afterConvertFile: File;
  let inputFile: FileList;

  const FFmpegArgsTemplates = {
    ロスレス: "-lossless 1",
    ロスレスGIFアニメ: "-lossless 1 -loop 0",
    劣化圧縮: "-crf 1",
    劣化圧縮GIFアニメ: "-crf 1 -loop 0",
    縦幅128px劣化圧縮: "-vf scale=-1:128",
    縦幅128px劣化圧縮GIFアニメ: "-vf scale=-1:128 -loop 0",
  };

  const imageConvert = async () => {
    const clipboardData = await navigator.clipboard.read();
    let imageFile: File;

    for (let i = 0; i < clipboardData.length; i++) {
      const item = clipboardData[i];
      if (item.types.includes(emoji.file.type)) {
        const blob = await item.getType(emoji.file.type);

        const reader = new FileReader();
        reader.addEventListener("load", () => {
          beforeConvertImg.src = reader.result;
        });
        beforeConvertFile = new File([blob], emoji.file.name, {
          type: emoji.file.type,
        });
        reader.readAsDataURL(blob);
        afterConvertFile = await convert(beforeConvertFile, ffmpegArgs);
        if (afterConvertFile != null) {
          afterConvertImg.src = URL.createObjectURL(afterConvertFile);
        }
      }
    }
  };

  const imageConvertwithUpload = async () => {
    beforeConvertFile = inputFile[0];
    beforeConvertImg.src = URL.createObjectURL(beforeConvertFile);
    afterConvertFile = await convert(beforeConvertFile, ffmpegArgs);
    if (afterConvertFile != null) {
      afterConvertImg.src = URL.createObjectURL(afterConvertFile);
    }
  };

  let beforewidth = 0;
  let beforeheight = 0;
  let afterwidth = 0;
  let afterheight = 0;

  const beforeConvertLoaded = () => {
    beforewidth = beforeConvertImg.naturalWidth;
    beforeheight = beforeConvertImg.naturalHeight;
  };
  const afterConvertLoaded = () => {
    afterwidth = afterConvertImg.naturalWidth;
    afterheight = afterConvertImg.naturalHeight;
  };

  let sendEmojiData: AdminEmojiAddRequest = {
    name: emoji.name,
    fileId: "",
    category: emoji.category,
    aliases: emoji.tag,
    license: `@${get(note).user.username} ${emoji.license}`,
    isSensitive: emoji.isSensitive !== "",
    localOnly: emoji.localOnly !== "",
    roleIdsThatCanBeUsedThisEmojiAsReaction: [],
  };

  let busy = false;
  const sendEmoji = async (file: File) => {
    busy = true;
    await addEmoji(sendEmojiData, file);
    busy = false;
  };
</script>

<div class="grid grid-cols-2 gap-2">
  <div class="card shadow-md">
    <div class="card-body">
      <div class="card-title text-lg">申請情報</div>
      <div class="flex flex-wrap gap-2">
        <img class="w-4 bg-black object-contain" src={emoji.file.url} />
        <img class="w-4 bg-white object-contain" src={emoji.file.url} />
        <img class="w-8 bg-black object-contain" src={emoji.file.url} />
        <img class="w-8 bg-white object-contain" src={emoji.file.url} />
        <img class="w-16 bg-black object-contain" src={emoji.file.url} />
        <img class="w-16 bg-white object-contain" src={emoji.file.url} />
        <img class="w-32 bg-black object-contain" src={emoji.file.url} />
        <img class="w-32 bg-white object-contain" src={emoji.file.url} />
      </div>
      <table class="table table-zebra table-fixed">
        <tbody>
          <tr>
            <th>申請ユーザーID</th>
            <td>
              <a
                class="link"
                href={`https://${$serverUrl}/@${$note.user.username}`}
                target="_blank">{$note.user.username}</a
              >
            </td>
          </tr>
          <tr>
            <th>ショートコード</th>
            <td>{emoji.name}</td>
          </tr>
          <tr>
            <th>ライセンス</th>
            <td>{emoji.license}</td>
          </tr>
          <tr>
            <th>作成方法</th>
            <td>{emoji.from}</td>
          </tr>
          <tr>
            <th>説明</th>
            <td>{emoji.description}</td>
          </tr>
          <tr>
            <th>タグ</th>
            <td>{emoji.tag}</td>
          </tr>
          <tr>
            <th>ファイル名</th>
            <td>{emoji.file.name}</td>
          </tr>
          <tr>
            <th>ファイルタイプ</th>
            <td>{emoji.file.type}</td>
          </tr>
          <tr>
            <th>ファイルサイズ</th>
            <td>{emoji.file.size / 1000.0} KB</td>
          </tr>
          <tr>
            <th>ファイルURL</th>
            <td class="max-w-24 text-wrap"
              ><a class="link" href={emoji.file.url} target="_blank"
                >{emoji.file.url}</a
              ></td
            >
          </tr>
        </tbody>
      </table>
    </div>
  </div>
  <div class="card shadow-md">
    <div class="card-body">
      <div class="card-title">圧縮</div>
      <div class="text-lg font-bold">
        「申請情報」から画像をコピーして、「変換」をクリックして下さい<br />
        GIFアニメは一度画像をダウンロードしてからアップロード変換を選択して下さい
      </div>
      <div>
        <label>ffmpeg引数</label>
        <input
          id="ffmpeg-args"
          bind:value={ffmpegArgs}
          type="text"
          class="input input-xs input-bordered md:input-md md:w-full"
        />
        <div class="join mt-4 flex-wrap">
          {#each Object.entries(FFmpegArgsTemplates) as [key, value]}
            <button
              class="btn btn-outline join-item btn-sm"
              onclick={() => {
                ffmpegArgs = value;
              }}>{key}</button
            >
          {/each}
        </div>
      </div>
      <button
        class="btn btn-info btn-lg btn-block shadow"
        onclick={imageConvert}
      >
        変換
      </button>
      <div class="grid grid-cols-2">
        <label class="form-control w-full">
          <input
            type="file"
            bind:files={inputFile}
            class="file-input file-input-bordered"
          />
        </label>
        <button
          class="btn btn-warning btn-block h-full shadow"
          onclick={imageConvertwithUpload}
        >
          アップロード変換
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4 rounded-md bg-base-200 shadow">
        <div class="m-4">
          変換前
          <img
            bind:this={beforeConvertImg}
            class="w-32 bg-black object-contain"
            onload={beforeConvertLoaded}
          />
          {#if beforeConvertFile != null}
            <table class="table">
              <tbody>
                <tr>
                  <th>ファイル名</th>
                  <td>{beforeConvertFile.name}</td>
                </tr>
                <tr>
                  <th>ファイルタイプ</th>
                  <td>{beforeConvertFile.type}</td>
                </tr>
                <tr>
                  <th>ファイルサイズ</th>
                  <td>{beforeConvertFile.size / 1000.0} KB</td>
                </tr>
                <tr>
                  <th>幅</th>
                  <td>{beforewidth}px</td>
                </tr>
                <tr>
                  <th>高さ</th>
                  <td>{beforeheight}px</td>
                </tr>
              </tbody>
            </table>
          {/if}
        </div>
        <div class="m-4">
          変換後
          <img
            bind:this={afterConvertImg}
            class="w-32 bg-black object-contain"
            onload={afterConvertLoaded}
          />
          {#if afterConvertFile != null}
            <table class="table">
              <tbody>
                <tr>
                  <th>ファイル名</th>
                  <td>{afterConvertFile.name}</td>
                </tr>
                <tr>
                  <th>ファイルタイプ</th>
                  <td>{afterConvertFile.type}</td>
                </tr>
                <tr>
                  <th>ファイルサイズ</th>
                  <td>{afterConvertFile.size / 1000.0} KB</td>
                </tr>
                <tr>
                  <th>幅</th>
                  <td>{afterwidth}px</td>
                </tr>
                <tr>
                  <th>高さ</th>
                  <td>{afterheight}px</td>
                </tr>
              </tbody>
            </table>
          {/if}
        </div>
      </div>
    </div>
  </div>
</div>
<div class="card shadow-md">
  <div class="card-body">
    <div class="card-title">登録</div>
    <div class="grid grid-cols-2 gap-2">
      <div>
        <div class="form-control">
          <label> <span class="label-text">ショートコード</span></label>
          <input
            id="name"
            bind:value={sendEmojiData.name}
            type="text"
            class="input input-xs input-bordered md:input-md md:w-full"
          />
        </div>
        <div class="form-control">
          <label> <span class="label-text">ライセンス</span></label>
          <input
            id="license"
            bind:value={sendEmojiData.license}
            type="text"
            class="input input-xs input-bordered md:input-md md:w-full"
          />
        </div>

        <div class="form-control">
          <label> <span class="label-text">タグ</span></label>
          <input
            id="tag"
            bind:value={taginput}
            type="text"
            class="input input-xs input-bordered md:input-md md:w-full"
            onchange={() => {
              sendEmojiData.aliases = [...sendEmojiData.aliases, taginput];
              taginput = "";
            }}
          />
        </div>
      </div>
      <div>
        <div class="form-control">
          <label> <span class="label-text">カテゴリー</span></label>
          <input
            id="category"
            bind:value={sendEmojiData.category}
            type="text"
            class="input input-xs input-bordered md:input-md md:w-full"
          />
        </div>
        <div class="flex gap-8">
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text m-4">センシティブ</span>
              <input
                type="checkbox"
                class="toggle"
                bind:checked={sendEmojiData.isSensitive}
              />
            </label>
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text m-4">ローカルのみ</span>
              <input
                type="checkbox"
                class="toggle"
                bind:checked={sendEmojiData.localOnly}
              />
            </label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <button
            class="btn btn-neutral btn-lg {busy || beforeConvertFile == null
              ? 'btn-disabled'
              : ''}"
            onclick={() => {
              sendEmoji(beforeConvertFile);
            }}>変換前を登録</button
          >
          <button
            class="btn btn-primary btn-lg {busy || afterConvertFile == null
              ? 'btn-disabled'
              : ''}"
            onclick={() => {
              sendEmoji(afterConvertFile);
            }}>変換後を登録</button
          >
        </div>
      </div>
      <div class="flex flex-wrap gap-4">
        {#each sendEmojiData.aliases as tag, index}
          <button
            class="btn btn-outline btn-sm rounded-full"
            onclick={() => {
              sendEmojiData.aliases.splice(index, 1);
              sendEmojiData.aliases = sendEmojiData.aliases;
            }}
          >
            {tag}
            <div class="badge badge-error">×</div>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>
