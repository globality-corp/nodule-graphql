/* Client request logging.
 */
import { GraphQLError } from 'graphql';
import { assign, get } from 'lodash';
import {
    getLogger,
    extractLoggingProperties,
} from '@globality/nodule-logging';
import { getContainer } from '@globality/nodule-config';

export function calculateExecuteTime(executeStartTime) {
    const executeTime = process.hrtime(executeStartTime);
    return (executeTime[0] * 1e3) + (executeTime[1] * 1e-6);
}

export function getElapsedTime(req) {
    // XXX - test safe
    if (!req._startAt) { // eslint-disable-line no-underscore-dangle
        return 0;
    }
    const diff = process.hrtime(req._startAt); // eslint-disable-line no-underscore-dangle
    return (diff[0] * 1e3) + (diff[1] * 1e-6);
}

export function buildRequestLogs(req, serviceName, operationName, request) {
    const { config } = getContainer();
    const { data, params } = request;
    const args = assign({}, params, data);
    return {
        serviceName,
        serviceRequestName: operationName,
        ...(params ? { serviceRequestArgs: Object.keys(args) } : {}),
        ...extractLoggingProperties(
            { params: args },
            get(config, 'logging.backendServiceRequestRules', []),
        ),
    };
}


export function logSuccess(req, request, response, requestLogs, executeStartTime) {
    const { method, url } = request;
    const { config } = getContainer();
    const logger = getLogger();
    const executeTime = calculateExecuteTime(executeStartTime);
    const logs = {
        serviceResponseTimeMs: executeTime,
        ...requestLogs,
        ...extractLoggingProperties(
            { url: url.split('?')[0], method },
            get(config, 'logging.backendServiceRequestRules', []),
        ),
        ...extractLoggingProperties(
            response,
            get(config, 'logging.backendServiceResponseRules', []),
        ),
    };
    if (get(config, 'logging.slownessWarning.enabled', false) &&
        executeTime > get(config, 'logging.slownessWarning.warnForServiceResponseTimeMs', 1000)) {
        logger.warning(req, 'ServiceSlownessWarning', logs);
    }
    if (get(config, 'logging.serviceRequestSucceeded.enabled', false)) {
        logger.info(req, 'ServiceRequestSucceeded', logs);
    }
    // XXX - move this code
    if (getElapsedTime(req) > get(config, 'perfomance.maxExecutionTimeMs')) {
        logger.warning(req, 'MaxExecutionTimePassed', logs);
        throw new GraphQLError('MaxExecutionTimePassed');
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
    const logger = getLogger();
    const { config } = getContainer();
    const errorData = extractErrorData(error);
    const errorMessage = extractErrorMessage(error);
    const errorStatus = extractErrorStatus(error);

    const logs = {
        errorMessage,
        status: errorStatus,
        errorData,
        ...requestLogs,
        ...extractLoggingProperties(
            { url, method },
            get(config, 'logging.backendServiceRequestRules', []),
        ),
    };

    if (errorStatus && errorStatus < 500) {
        // HTTP statuses in the 4XX range expected and not warnings
        logger.info(req, 'ServiceRequestFailed', logs);
    } else {
        logger.warn(req, 'ServiceRequestFailed', logs);
    }
}
