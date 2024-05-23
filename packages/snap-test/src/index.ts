/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @typescript-eslint/no-throw-literal */
import type {
  OnHomePageHandler,
  OnInstallHandler,
  OnRpcRequestHandler,
  OnUpdateHandler,
  OnUserInputHandler,
} from '@metamask/snaps-sdk';
import {
  panel,
  text,
  copyable,
  divider,
  heading,
  button,
  UserInputEventType,
  ManageStateOperation,
  MethodNotFoundError,
} from '@metamask/snaps-sdk';

import { createInterface, showForm, showResult } from './ui';

/**
 * Handle incoming JSON-RPC requests from the dapp, sent through the
 * `wallet_invokeSnap` method.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The JSON-RPC response.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
  origin,
  request,
}) => {
  switch (request.method) {
    case 'hello':
      return snap.request({
        method: 'snap_dialog',
        params: {
          type: 'confirmation',
          content: panel([
            text(`Hello, **${origin}**!`),
            text('This custom confirmation is just for display purposes.'),
            text(
              'But you can edit the snap source code to make it do something, if you want to!',
            ),
          ]),
        },
      });
    case 'dialog': {
      try {
        const interfaceId = await createInterface();

        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.UpdateState,
            newState: { interfaceId },
            encrypted: false,
          },
        });

        return await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'confirmation',
            id: interfaceId,
          },
        });
      } finally {
        await snap.request({
          method: 'snap_manageState',
          params: {
            operation: ManageStateOperation.ClearState,
            encrypted: false,
          },
        });
      }
    }
    default:
      throw new MethodNotFoundError({
        method: request.method,
      });
  }
};

// Function to simulate an API call and return user info
function apiInfo() {
  return {
    firstName: 'Marko',
    lastName: 'Reljic',
    number: 123456789,
  };
}

/**
 * Handle the installation of the Snap.
 */
export const onInstall: OnInstallHandler = async () => {
  const info = apiInfo();

  const component = panel([
    text(`Hi, ${info.firstName} ${info.lastName}`),
    text('Here is your ID'),
    copyable(`${info.number}`),
  ]);

  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: component,
    },
  });
};

/**
 * Handle incoming home page requests from the MetaMask clients.
 * Create a new Snap Interface and return it.
 *
 * @returns A static panel rendered with custom UI.
 */
export const onHomePage: OnHomePageHandler = async () => {
  const info = apiInfo();

  return {
    content: panel([
      heading(`Hello, ${info.firstName} ${info.lastName}`),
      divider(),
      text('Welcome to my Snap home page!'),
      button('Hello, world!', 'button', 'myButton', 'secondary'),
    ]),
  };
};

/**
 * Handle incoming updates for the Snap.
 */
export const onUpdate: OnUpdateHandler = async () => {
  await snap.request({
    method: 'snap_dialog',
    params: {
      type: 'alert',
      content: panel([
        heading('Thank you for updating Snap'),
        text('New features added in this version:'),
        text('Added a Home Page'),
      ]),
    },
  });
};

/**
 * Handle incoming user events coming from the MetaMask clients open interfaces.
 *
 * @param params - The event parameters.
 * @param params.id - The Snap interface ID where the event was fired.
 * @param params.event - The event object containing the event type, name and value.
 */
export const onUserInput: OnUserInputHandler = async ({ id, event }) => {
  if (event.type === UserInputEventType.ButtonClickEvent) {
    switch (event.name) {
      case 'send':
        await showForm(id, '', '');
        break;
      case 'buy':
      case 'swap':
      case 'bridge':
      case 'portfolio':
        await snap.request({
          method: 'snap_dialog',
          params: {
            type: 'alert',
            content: panel([
              text(`Redirecting to Google for ${event.name}...`),
              text('Click the link below to proceed:'),
              text('[Go to Google](https://www.google.com)'),
            ]),
          },
        });
        break;
      default:
        break;
    }
  }

  if (
    event.type === UserInputEventType.FormSubmitEvent &&
    event.name === 'send_token'
  ) {
    const tokenAmount = event.value['token-amount'];
    const walletAddress = event.value['wallet-address'];

    await showResult(id, tokenAmount ?? '', walletAddress ?? '');
  }
};
