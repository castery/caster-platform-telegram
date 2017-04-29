'use strict';

import Telegraf from 'telegraf';

/* TODO: Change from local package to npm */
import { Platform } from '../../caster';

import createDebug from 'debug';

import { TelegramMessageContext } from './contexts/message';

import {
	PLATFORM,
	defaultOptions,
	defaultOptionsSchema
} from './util/constants';

const debug = createDebug('caster:platform-telegram');

export class TelegramPlatform extends Platform {
	/**
	 * Constructor
	 *
	 * @param {Object} options
	 */
	constructor (options = {}) {
		super();

		this.telegraf = new Telegraf;
		this.telegram = this.telegraf.telegram;

		this._casters = new WeakSet;

		if (Object.keys(options).length > 0) {
			this.setOptions(options);
		}
	}

	/**
	 * @inheritdoc
	 */
	setOptions (options) {
		super.setOptions(options);

		if ('adapter' in options) {
			const { adapter } = this.options;

			const optionsAdapter = Object.assign({}, adapter);
			delete optionsAdapter.token;

			Object.assign(this.telegraf.options, optionsAdapter);

			if ('token' in options.adapter) {
				this.telegraf.token = adapter.token;
			}

			this.telegram = this.telegraf.telegram;
		}

		return this;
	}

	/**
	 * @inheritdoc
	 */
	getOptionsSchema () {
		return super.getOptionsSchema();
	}

	/**
	 * @inheritdoc
	 */
	async start () {
		await this.telegraf.startPolling();
	}

	/**
	 * @inheritdoc
	 */
	async stop () {
		await this.telegraf.stop();
	}

	/**
	 * @inheritdoc
	 */
	subscribe (caster) {
		if (this._casters.has(caster)) {
			return;
		}

		this._casters.add(caster);

		this.telegraf.on('text', (context) => {
			caster.dispatchIncomingMiddleware(
				new TelegramMessageContext(this, caster, context)
			);
		});
	}

	/**
	 * @inheritdoc
	 */
	unsubscribe (caster) {
		if (!this._casters.has(caster)) {
			return;
		}

		this._casters.delete(caster);

		/* TODO: Add unsubscribe events polling */
	}

	/**
	 * Sends a message
	 *
	 * @param {Object} params
	 *
	 * @return {Promise<mixed>}
	 */
	send (params) {
		return this.telegram.callApi('sendMessage', params);
	}
}
