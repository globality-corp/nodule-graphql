import { bind } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'helm... Remove this comment to see the full error message
import helmet from 'helmet';

bind('middleware.helmet', () => helmet());
