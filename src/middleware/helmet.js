import helmet from 'helmet';

import { bind } from '@globality/nodule-config';


bind('middleware.helmet', () => helmet());
