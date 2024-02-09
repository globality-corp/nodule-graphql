import { bind } from '@globality/nodule-config';
// @ts-expect-error TS(7016) FIXME: Could not find a declaration file for module 'loda... Remove this comment to see the full error message
import padEnd from 'lodash/padEnd';

const PAD = 20;

const CYAN = '\x1b[36m';
const GREEN = '\x1b[32m';
const RED = '\x1b[31m';
const RESET = '\x1b[0m';

export function newline() {
    global.console.log();
}

export function show(label: any, value: any, color = CYAN) {
    const left = `${label}:`;
    const right = `${color}${value}${RESET}`;
    global.console.log(`${padEnd(left, PAD)} ${right}`);
}

export function disabled(service: any) {
    show(service, 'disabled', RED);
}

export function enabled(service: any) {
    show(service, 'enabled', GREEN);
}

function noop() {}

bind('terminal', ({ metadata }: any) => ({
    disabled: metadata.testing ? noop : disabled,
    enabled: metadata.testing ? noop : enabled,
    newline,
    show,
}));
