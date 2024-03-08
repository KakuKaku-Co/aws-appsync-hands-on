# Amplify で自動生成された VTL を読んでみる

Amplify で自動生成された VTL を読んでみます。

## やること

- [ ] AMplify で自動生成された VTL を読む

## Amplify で自動生成された VTL を読む

Amplify では、特定のディレクティブを設定した際に自動的にリゾルバーが設定されます。

例えば、 `@auth(rules: [{ allow: private, provider: userPools }]` のようなディレクティブを設定すると、認証を行うためのリゾルバーが自動的に設定されます。

> [!NOTE]
> このリポジトリの `/amplify` ディレクトリ配下にある `graphql.schema` の設定を Amplify の GraphQL API に反映させると、 Mutation の `sendMessageWithAuthentication` に自動的に Pipeline Resolver が設定されます。
