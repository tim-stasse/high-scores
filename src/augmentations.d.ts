/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/consistent-type-definitions */
/* eslint-disable @typescript-eslint/interface-name-prefix */

export {}; // Allow module augmentation

declare module '@apollographql/graphql-playground-html/dist/render-playground-page' {
  interface ISettings {
    'schema.polling.enable': boolean;
    'schema.polling.endpointFilter': string;
    'schema.polling.interval': number;
    'schema.disableComments': boolean;
  }
}

declare module 'graphql-tools' {
  type IFieldResolver<TSource, TContext, TArgs = Record<string, any>> = (
    source: TSource,
    args: TArgs,
    context: TContext,
    info: GraphQLResolveInfo
  ) => any;
}
