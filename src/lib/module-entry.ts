import { mount, unmount } from 'svelte';
import EmbedChat from './components/EmbedChat.svelte';

export interface ModuleOptions {
  instanceUrl?: string;
  wsUrl?: string;
  pairingCode?: string;
  theme?: string;
  token?: string;
}

export function create(container: HTMLElement, opts: ModuleOptions) {
  const wsUrl = opts.wsUrl || opts.instanceUrl || '';
  const pairingCode = opts.pairingCode || '123456';

  const component = mount(EmbedChat, {
    target: container,
    props: { wsUrl, pairingCode },
  });

  return {
    destroy() {
      unmount(component);
    },
  };
}
