import { bind } from '@globality/nodule-config';


/* Register a default 'null' authorizer.
 */
bind('graphql.authorizers.null', () => () => true);
