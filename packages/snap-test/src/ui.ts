import {
  button,
  copyable,
  form,
  heading,
  input,
  panel,
  text,
} from '@metamask/snaps-sdk';

/**
 * Initiate a new interface with multiple buttons.
 *
 * @returns The Snap interface ID.
 */
export async function createInterface(): Promise<string> {
  return await snap.request({
    method: 'snap_createInterface',
    params: {
      ui: panel([
        button({ value: 'Buy', name: 'buy' }),
        button({ value: 'Send', name: 'send' }),
        button({ value: 'Swap', name: 'swap' }),
        button({ value: 'Bridge', name: 'bridge' }),
        button({ value: 'Portfolio', name: 'portfolio' }),
      ]),
    },
  });
}

/**
 * Update a Snap interface to show a form.
 *
 * @param id - The Snap interface ID to update.
 * @param amount - The amount to display in the form.
 * @param walletAddress - The wallet address to display in the form.
 */
export async function showForm(
  id: string,
  amount: string,
  walletAddress: string,
) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Send token'),
        form({
          name: 'send_token',
          children: [
            input({
              name: 'token-amount',
              value: amount ?? '',
              label: 'Token amount',
              placeholder: 'Token amount',
            }),
            input({
              name: 'wallet-address',
              value: walletAddress ?? '',
              label: 'Recipient address',
              placeholder: 'Recipient address',
            }),
            button({
              value: 'Submit',
              buttonType: 'submit',
            }),
          ].filter(Boolean),
        }),
      ]),
    },
  });
}

/**
 * Update a Snap interface to show the result of the form submission.
 *
 * @param id - The Snap interface ID to update.
 * @param tokenAmount - The token amount to display in the UI.
 * @param walletAddress - The wallet address to display in the UI.
 */
export async function showResult(
  id: string,
  tokenAmount: string,
  walletAddress: string,
) {
  await snap.request({
    method: 'snap_updateInterface',
    params: {
      id,
      ui: panel([
        heading('Sending'),
        text('You are sending:'),
        copyable(tokenAmount),
        text('to:'),
        copyable(walletAddress),
      ]),
    },
  });
}
