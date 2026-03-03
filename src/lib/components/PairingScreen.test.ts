// @vitest-environment jsdom
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render } from '@testing-library/svelte';
import PairingScreen from './PairingScreen.svelte';

describe('PairingScreen', () => {
  it('sanitizes pin input and submits valid pairing payload', async () => {
    const onConnect = vi.fn();
    const { getByPlaceholderText, container, getByRole } = render(PairingScreen, {
      props: {
        connecting: false,
        error: null,
        onConnect,
      },
    });

    const codeInput = getByPlaceholderText('______') as HTMLInputElement;
    await fireEvent.input(codeInput, { target: { value: '12ab 3!45x6' } });
    expect(codeInput.value).toBe('123456');

    expect(getByRole('button', { name: 'CONNECT' })).toBeTruthy();

    const form = container.querySelector('form');
    expect(form).toBeTruthy();
    await fireEvent.submit(form as HTMLFormElement);

    expect(onConnect).toHaveBeenCalledTimes(1);
    expect(onConnect).toHaveBeenCalledWith('ws://127.0.0.1:32123/ws', '123456', '');
  });

  it('does not submit when code is invalid', async () => {
    const onConnect = vi.fn();
    const { getByPlaceholderText, container } = render(PairingScreen, {
      props: {
        connecting: false,
        error: null,
        onConnect,
      },
    });

    const codeInput = getByPlaceholderText('______') as HTMLInputElement;
    await fireEvent.input(codeInput, { target: { value: '123' } });

    const form = container.querySelector('form');
    await fireEvent.submit(form as HTMLFormElement);

    expect(onConnect).not.toHaveBeenCalled();
  });

  it('passes auth token when provided', async () => {
    const onConnect = vi.fn();
    const { getByPlaceholderText, container } = render(PairingScreen, {
      props: {
        connecting: false,
        error: null,
        onConnect,
      },
    });

    const tokenInput = getByPlaceholderText('required for non-loopback listen') as HTMLInputElement;
    const codeInput = getByPlaceholderText('______') as HTMLInputElement;
    await fireEvent.input(tokenInput, { target: { value: 'gateway-secret-token' } });
    await fireEvent.input(codeInput, { target: { value: '123456' } });

    const form = container.querySelector('form');
    await fireEvent.submit(form as HTMLFormElement);

    expect(onConnect).toHaveBeenCalledWith(
      'ws://127.0.0.1:32123/ws',
      '123456',
      'gateway-secret-token',
    );
  });
});
