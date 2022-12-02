# Numix

Add [remix](https://remix.run/)-like [loaders](https://remix.run/docs/en/v1/guides/data-loading) and [actions](https://remix.run/docs/en/v1/guides/data-writes) to your Nuxt page components.

> ⚠️ Experimental. ⚠️ APIs are subject to change.

<img src="https://i.imgur.com/6fuIdW0.jpg" width="500" />

## Documentation

For documentation about Numix please visit https://numix.vercel.app.

## Development

- Run `cp playground/.env.example playground/.env`
- Run `pnpm dev:prepare` to generate type stubs.
- Use `pnpm dev` to start [playground](./playground) in development mode.

## Credits

- [Remix](https://remix.run/) for the `Form` implementation.
- [Rakkas](https://github.com/rakkasjs/rakkasjs) for the named exports strip logic. Implemented in [unplugin-strip-exports](https://github.com/wobsoriano/unplugin-strip-exports).

## License

MIT
