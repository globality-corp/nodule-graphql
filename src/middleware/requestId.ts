import { bind } from '@globality/nodule-config';
import requestId from 'connect-requestid';

bind('middleware.requestId', () => requestId);
