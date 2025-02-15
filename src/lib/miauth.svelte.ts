import { api } from "misskey-js";
import { v4 as uuid } from "uuid";
import { serverUrl, accessToken } from "./store";
import { get } from "svelte/store";
import type { MiauthGenTokenResponse } from "misskey-js/entities.js";

export class MiAuth {
  private sessionId = $state(null as null | string);
  constructor() {}

  readonly isTokenReady = $derived(this.sessionId != null);
  getUrl(): string {
    this.sessionId = uuid();
    const savedServerUrl = get(serverUrl);
    // サーバーURLが変更されたらリセット
    const unsubscribe = serverUrl.subscribe((value) => {
      if (value === savedServerUrl) return;
      this.sessionId = null;
      unsubscribe();
    });
    return `${get(serverUrl)}/miauth/${this.sessionId}?name=misskey-emoji-register&permission=write:drive,write:admin:emoji`;
  }
  async requestToken(): Promise<void> {
    if (this.sessionId == null) throw new Error("token is not ready");
    const client = new api.APIClient({ origin: get(serverUrl) });
    const { token } = await client.request(`miauth/${this.sessionId}/check` as any, {}) as any as MiauthGenTokenResponse;
    this.sessionId = null;
    accessToken.set(token);
  }
}
