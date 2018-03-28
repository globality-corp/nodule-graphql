import requestId from 'connect-requestid';

import { bind } from '@globality/nodule-config';


bind('middleware.requestId', () => requestId);
