import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';

afterEach(cleanup);

// jsdom gaps: <dialog> modal API, window.scrollTo (used by ScrollRestoration)
// and scrollIntoView (the product picker keeps the active option in view).
HTMLDialogElement.prototype.showModal ??= function (this: HTMLDialogElement) {
  this.setAttribute('open', '');
};
HTMLDialogElement.prototype.close ??= function (this: HTMLDialogElement) {
  this.removeAttribute('open');
};
window.scrollTo = () => {};
Element.prototype.scrollIntoView ??= () => {};
