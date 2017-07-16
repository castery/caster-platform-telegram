<p align="center">
<a href="https://travis-ci.org/castery/caster-telegram"><img src="https://img.shields.io/travis/castery/caster-telegram.svg?style=flat-square" alt="Build Status"></a>
<a href="https://www.npmjs.com/@castery/caster-telegram"><img src="https://img.shields.io/npm/v/@castery/caster-telegram.svg?style=flat-square" alt="NPM version"></a>
<a href="https://www.npmjs.com/package/@castery/caster-telegram"><img src="https://img.shields.io/npm/dt/@castery/caster-telegram.svg?style=flat-square" alt="NPM downloads"></a>
</p>

🤖 This is the official platform integration module for [caster](https://github.com/castery/caster). This platform was created for the messenger [Telegram](https://telegram.org/)

| 🤖 [Caster](https://github.com/castery/caster) | 📖 [Documentation](docs/) |
|------------------------------------------------|----------------------------|

## Installation
**[Node.js](https://nodejs.org/) 8.0.0 or newer is required**  

### Yarn
Recommended, auto assembly
```shell
yarn add @castery/caster-telegram
```

### NPM
```shell
npm install @castery/caster-telegram --save
```

## Usage
```js
import { TelegramPlatform } from '@castery/caster-telegram';

/* ... */

const telegram = new TelegramPlatform({
	adapter: {
		token: '<token>'
	}
});

caster.use(telegram);
```
