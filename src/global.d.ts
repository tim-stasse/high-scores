declare module '*.gql' {
  const value: import('graphql').DocumentNode;
  export = value;
}

declare module '*.graphql' {
  const value: import('graphql').DocumentNode;
  export = value;
}
