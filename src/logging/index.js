/**
 * Client request logger.
 */

import { bind, getContainer } from '@globality/nodule-config';
import { extractLoggingProperties } from '@globality/nodule-logging';
import { assign, get } from 'lodash';

export function calculateExecuteTime(executeStartTime) {
    const executeTime = process.hrtime(executeStartTime);
    return executeTime[0] * 1e3 + executeTime[1] * 1e-6;
}

export function getElapsedTime(req) {
    if (!req._startAt) {
        // eslint-disable-line no-underscore-dangle
        return 0;
    }
    const diff = process.hrtime(req._startAt); // eslint-disable-line no-underscore-dangle
    return diff[0] * 1e3 + diff[1] * 1e-6;
}

export function buildRequestLogs(req, serviceName, operationName, request) {
    const { config } = getContainer();
    const { data, params } = request;
    const args = assign({}, params, data);
    return {
        serviceName,
        serviceRequestName: operationName,
        ...(args ? { serviceRequestArgs: Object.keys(args) } : {}),
        ...extractLoggingProperties({ params: args }, get(config, 'logger.serviceRequestRules', [])),
    };
}

export function logSuccess(req, request, response, requestLogs, executeStartTime) {
    const { method, url } = request;
    const { config, logger } = getContainer();
    const executeTime = calculateExecuteTime(executeStartTime);
    const logs = {
        serviceResponseTimeMs: executeTime,
        ...requestLogs,
        ...extractLoggingProperties({ url: url.split('?')[0], method }, get(config, 'logger.serviceRequestRules', [])),
        ...extractLoggingProperties(response, get(config, 'logger.serviceResponseRules', [])),
    };
    if (
        get(config, 'logger.slownessWarning.enabled', false) &&
        executeTime > get(config, 'logger.slownessWarning.warnForServiceResponseTimeMs', 1000)
    ) {
        logger.warning(req, 'ServiceSlownessWarning', logs);
    }
    if (get(config, 'logger.serviceRequestSucceeded.enabled', false)) {
        logger.info(req, 'ServiceRequestSucceeded', logs);
    }
}

export function extractErrorData(error) {
    const response = get(error, 'response');

    if (response) {
        return get(response, 'data');
    }

    return get(error, 'data');
}

export function extractErrorMessage(error) {
    const responseData = get(error, 'response.data');

    if (responseData) {
        return get(responseData, 'message');
    }

    return get(error, 'message');
}

export function extractErrorStatus(error) {
    const response = get(error, 'response');

    if (response) {
        return get(response, 'status') || get(response, 'code');
    }

    return get(error, 'status') || get(error, 'code');
}

export function logFailure(req, request, error, requestLogs) {
    const { method, url } = request;
    const { config, logger } = getContainer();
    const errorData = extractErrorData(error);
    const errorMessage = extractErrorMessage(error);
    const errorStatus = extractErrorStatus(error);

    const logs = {
        errorMessage,
        status: errorStatus,
        errorData,
        ...requestLogs,
        ...extractLoggingProperties({ url, method }, get(config, 'logger.serviceRequestRules', [])),
    };

    if (errorStatus && errorStatus < 500) {
        // HTTP statuses in the 4XX range expected and not warnings
        logger.info(req, 'ServiceRequestFailed', logs);
    } else {
        logger.warning(req, 'ServiceRequestFailed', logs);
    }
}

bind('logging.buildRequestLogs', () => buildRequestLogs);
bind('logging.logSuccess', () => logSuccess);
bind('logging.logFailure', () => logFailure);
