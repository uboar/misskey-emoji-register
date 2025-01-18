import { api } from "misskey-js";
import { v4 as uuid } from "uuid";
import { serverUrl, accessToken } from "./store";
import { get } from "svelte/store";

export class MiAuth {
  private sessionId = $state(null);
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
    return `${get(serverUrl)}/miauth/${this.sessionId}?name=misskey-emoji-register&permission=write:admin:drive,write:admin:emoji`;
  }
  async requestToken(): Promise<void> {
    if (this.sessionId == null) throw new Error("token is not ready");
    const client = new api.APIClient({ origin: get(serverUrl) });
    const { token } = await client.request(`miauth/${this.sessionId}/check`);
    this.sessionId = null;
    accessToken.set(token);
  }
}
