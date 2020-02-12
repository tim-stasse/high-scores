const schemaConfig = {
  immutableTypes: true,
  scalars: {
    Date: 'Date | string',
    DateTime: 'Date | string | number',
    Time: 'Date | string'
  },
  declarationKind: 'type',
  enumsAsTypes: true
};

const serviceConfig = {
  ...schemaConfig,
  noSchemaStitching: true,
  showUnusedMappers: true,
  useIndexSignature: true
};

const typescriptPlugins = [{ add: '/* eslint-disable */' }, 'typescript'];

const resolverPlugins = [...typescriptPlugins, 'typescript-resolvers'];

module.exports = {
  hooks: {
    afterOneFileWrite: ['prettier --write']
  },
  overwrite: true,
  generates: {
    'src/@schema/generated.d.ts': {
      schema: 'src/**/*+(.graphql|.gql)',
      plugins: typescriptPlugins,
      config: schemaConfig
    },
    'src/@services/high-score/types.generated.d.ts': {
      schema: [
        'src/@schema/**/*+(.graphql|.gql)',
        'src/@services/high-score/**/*+(.graphql|.gql)'
      ],
      plugins: resolverPlugins,
      config: {
        ...serviceConfig,
        contextType: '@services/high-score/context#Context'
      }
    }
  }
};
