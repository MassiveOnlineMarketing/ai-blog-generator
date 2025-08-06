/**
 * Prismic configuration for ai-blog-generator
 */
export const PRISMIC_CONFIG = {
  repositoryName: 'massive-prismic',
  writeToken: process.env.PRISMIC_WRITE_TOKEN || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0eXBlIjoibWFjaGluZTJtYWNoaW5lIiwiZGJpZCI6Im1hc3NpdmUtcHJpc21pYy0xOTMwNTE2Ni1hYjVkLTQxYTItOTA4MC1lNmJmYzZhNjFmN2RfNSIsImRhdGUiOjE3NTM4NzQzNTksImRvbWFpbiI6Im1hc3NpdmUtcHJpc21pYyIsImFwcE5hbWUiOiJtYXNzaXZlLXRlc3QiLCJpYXQiOjE3NTM4NzQzNTl9.QU8NTnXcFU8Q3ldqwdUGr0hA1wKBjegOs8aJvo4qQAA',
  apiEndpoint: 'https://massive-prismic.cdn.prismic.io/api/v2'
} as const;
