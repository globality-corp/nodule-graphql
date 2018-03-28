import { OK } from 'http-status-codes';

import { getContainer, bind } from '@globality/nodule-config';


export default function health(req, res) {
    const { config, metadata } = getContainer();

    const result = {
        message: 'OK',
        name: metadata.name,
        ok: true,
    };

    if (config.buildInfoConvention) {
        if (config.buildInfoConvention.buildNum) {
            result.buildNum = {
                message: config.buildInfoConvention.buildNum,
                ok: true,
            };
        }

        if (config.buildInfoConvention.sha1) {
            result.sha1 = {
                message: config.buildInfoConvention.sha1,
                ok: true,
            };
        }
    }

    return res.status(OK).json(result);
}

bind('routes.health', () => health);
