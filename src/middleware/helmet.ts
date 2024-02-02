import { bind } from '@globality/nodule-config';
import helmet from 'helmet';

bind('middleware.helmet', () => helmet());
