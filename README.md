# Alveus Sanctuary Chat Bot

This is the Twitch Chat bot for Alveus Sanctuary, allowing stream viewers to control the tech running the Livecams.
You can access the stream at [twitch.tv/alveussanctuary](https://www.twitch.tv/alveussanctuary).

## See also
- [Website repository](https://github.com/alveusgg/alveusgg)
- [Data repository](https://github.com/alveusgg/data)
- [Twitch extension](https://github.com/alveusgg/extension)

## Tech stack

This project uses Docker to run a Node.js app.

For development:

- Node.js
- Prettier (code formatting)
- ESLint (code linting)
- Docker (Compose)

## External APIs

- Twurple Twitch API Library
- Courier Notification Platform

## How to contribute

Hey there! Welcome to Alveus.gg! There's a few ways that you can help contribute.

1. If you find a bug - you can fill out a bug [report](https://github.com/alveusgg/chatbot/issues/new/choose)
2. If you have an idea that would make Alveus better - please fill out an idea [issue](https://github.com/alveusgg/chatbot/issues/new/choose)
3. If you have development experience, take a look at our issues labeled [good first issue](https://github.com/alveusgg/alveusgg/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22), read our [contributing guide](https://github.com/alveusgg/chatbot/blob/main/CONTRIBUTING.md) and agree to our [code of conduct](https://github.com/alveusgg/.github/blob/main/CODE_OF_CONDUCT.md) before you get started.

## Development setup

### Local development

1. Install Node.js (see `engines` in `package.json` for the required versions).
2. Copy `.env.example` to `.env` and open your copy in a text editor and fill it:
   1. Twitch Client Id, Secret, and Token Path.
   2. OBS Websocket Address and Key.
   3. Axis Camera Username, Password, and IP Addresses.
   4. Courier Key.
   5. OBSBot Address and Port.
   6. Unifi Address, Username, Password, and a map of Mac addresses to Names.
3. Add Twitch API tokens to `tokens` folder.
4. Configure the settings `src/config/config.js`.
5. Run `docker compose up -d`.