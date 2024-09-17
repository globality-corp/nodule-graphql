import { bind } from '@globality/nodule-config';
import padEnd from 'lodash-es/padEnd.js';

const PAD = 20;

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export function newline() {
    global.console.log();
}

export function show(label, value, color = CYAN) {
    const left = `${label}:`;
    const right = `${color}${value}${RESET}`;
    global.console.log(`${padEnd(left, PAD)} ${right}`);
}

export function disabled(service) {
    show(service, 'disabled', RED);
}

export function enabled(service) {
    show(service, 'enabled', GREEN);
}

function noop() {}

bind('terminal', ({ metadata }) => ({
    disabled: metadata.testing ? noop : disabled,
    enabled: metadata.testing ? noop : enabled,
    newline,
    show,
}));
