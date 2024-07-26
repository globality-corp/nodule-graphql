const { AsyncLocalStorage } = require('node:async_hooks');

export const requestContext = new AsyncLocalStorage();
