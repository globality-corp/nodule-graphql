import { bind } from '@globality/nodule-config';
// @ts-expect-error TS(7016): Could not find a declaration file for module 'conn... Remove this comment to see the full error message
import requestId from 'connect-requestid';

bind('middleware.requestId', () => requestId);
