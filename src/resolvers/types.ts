import { getContainer } from '@globality/nodule-config';
import { GraphQLResolveInfo } from 'graphql';
import { isFunction, isNil } from 'lodash';

/* Default mask function: preserves standard arguments
 */
function defaultMask<Args, Context, Object>(
    obj: Object,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
): DefaultMaskResult<Args, Context, Object> {
    return [obj, args, context, info];
}

export type AggregateFunc<MaskResult extends Array<unknown>, AggregateResult> = (...masked: MaskResult) => Promise<AggregateResult>;
export type AuthorizerFunc<Args, Context, Object> = (obj: Object, args: Args, context: Context, info: GraphQLResolveInfo) => boolean;
export type AuthorizerWithDataFunc<Args, Context, Object, AuthorizerData> = (
    authData: AuthorizerData,
    obj: Object,
    args: Args,
    context: Context,
    info: GraphQLResolveInfo
) => boolean;
export type TransformFunc<Data, TransformedData, MaskResult extends Array<unknown>> = (
    data: Data,
    ...masked: MaskResult
) => Promise<TransformedData> | TransformedData;
export type MaskFunc<Args, Context, Object, Result> = (obj: Object, args: Args, context: Context, info: GraphQLResolveInfo) => Result;
export type DefaultMaskResult<Args, Context, Object> = [Object, Args, Context, GraphQLResolveInfo];

type ResolverOptions<
    Args,
    AggregateResult,
    Context,
    Object = void,
    MaskResult extends Array<unknown> = DefaultMaskResult<Args, Context, Object>,
    TransformedResult = AggregateResult,
    AuthorizerData = void
> = {
    aggregate: AggregateFunc<MaskResult, AggregateResult>;
    authorize?: AuthorizerFunc<Args, Context, Object> | AuthorizerWithDataFunc<Args, Context, Object, AuthorizerData> | string;
    authorizeData?: AuthorizerData;
    transform?: TransformFunc<AggregateResult, TransformedResult, MaskResult>;
    mask?: MaskFunc<Args, Context, Object, MaskResult>;
};

/* A resolver is a structured abstraction around a GraphQL resolver function.
 *
 * It includes:
 *
 *  -  An async `aggregate` function, which queries/mutates data from one or more services.
 *  -  An async `authorize` function, which throws an error if the resolver should not run.
 *  -  A user-defined `authorizedData` payload, which is passed to the `authorize` function
 *     (if provided).
 *  -  A synchronous `transform` function, which presents the result of the aggregation in
 *     the expected shape of the upstream resource.
 *  -  A synchronous `mask` function, which manipulates the standard GraphQL resolver
 *     arguments into a form supported by the other functions.
 */
export class Resolver<
    Args,
    AggregateResult,
    Context,
    Object = void,
    MaskResult extends Array<unknown> = DefaultMaskResult<Args, Context, Object>,
    TransformedResult = AggregateResult,
    AuthorizerData = void
> {
    aggregate: AggregateFunc<MaskResult, AggregateResult>;

    authorize?: AuthorizerFunc<Args, Context, Object> | AuthorizerWithDataFunc<Args, Context, Object, AuthorizerData> | string;

    authorizeData?: AuthorizerData;

    transform?: TransformFunc<AggregateResult, TransformedResult, MaskResult>;

    mask: MaskFunc<Args, Context, Object, MaskResult>;

    constructor({
        aggregate,
        authorize,
        authorizeData,
        transform,
        mask,
    }: ResolverOptions<Args, AggregateResult, Context, Object, MaskResult, TransformedResult, AuthorizerData>) {
        this.aggregate = aggregate;
        this.authorize = authorize;
        this.authorizeData = authorizeData;
        this.transform = transform;

        this.mask = mask ?? (defaultMask as unknown as MaskFunc<Args, Context, Object, MaskResult>);
    }

    async resolve(
        obj: Object,
        args: Args,
        context: Context,
        info: GraphQLResolveInfo
    ): Promise<TransformedResult extends AggregateResult ? AggregateResult : TransformedResult>;
    async resolve(obj: Object, args: Args, context: Context, info: GraphQLResolveInfo): Promise<TransformedResult | AggregateResult> {
        if (this.authorize) {
            // allow authorizer to be looked up by name
            const authorize = isFunction(this.authorize)
                ? this.authorize
                : (getContainer(`graphql.authorizers.${this.authorize}`) as
                      | AuthorizerFunc<Args, Context, Object>
                      | AuthorizerWithDataFunc<Args, Context, Object, AuthorizerData>);

            // always invoke authorizers with standard resolver arguments
            if (isNil(this.authorizeData)) {
                await (authorize as AuthorizerFunc<Args, Context, Object>)(obj, args, context, info);
            } else {
                await (authorize as AuthorizerWithDataFunc<Args, Context, Object, AuthorizerData>)(
                    this.authorizeData,
                    obj,
                    args,
                    context,
                    info
                );
            }
        }

        // apply mask function
        const masked = this.mask(obj, args, context, info);

        // aggregate asynchronous requests over services.
        const aggregated = await this.aggregate(...masked);

        if (!this.transform) {
            return aggregated;
        }

        // transform aggregated service data into a resource
        return this.transform(aggregated, ...masked);
    }
}

/* Create a resolver.
 */
export function createResolver<
    Args,
    AggregateResult,
    Context,
    Object = void,
    MaskResult extends Array<unknown> = DefaultMaskResult<Args, Context, Object>,
    TransformedResult = AggregateResult,
    AuthorizerData = void
>(options: ResolverOptions<Args, AggregateResult, Context, Object, MaskResult, TransformedResult, AuthorizerData>) {
    return new Resolver<Args, AggregateResult, Context, Object, MaskResult, TransformedResult, AuthorizerData>(options);
}

/* Create a strict resolver.
 *
 * A strict resolver must define an authorize and a mask function.
 */
export function createStrictResolver<
    Args,
    AggregateResult,
    Context,
    Object = void,
    MaskResult extends Array<unknown> = DefaultMaskResult<Args, Context, Object>,
    TransformedResult = AggregateResult,
    AuthorizerData = void
>(options: ResolverOptions<Args, AggregateResult, Context, Object, MaskResult, TransformedResult, AuthorizerData>) {
    if (!options.aggregate) {
        throw new Error('Strict resolver must define an `aggregate` option');
    }
    if (!options.authorize) {
        throw new Error('Strict resolver must define an `authorize` option');
    }
    return createResolver(options);
}
