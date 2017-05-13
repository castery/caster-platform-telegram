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

		Object.assign(this.options, defaultOptions);

		this.telegraf = new Telegraf;
		this.telegram = this.telegraf.telegram;

		this._casters = new Set;

		if (Object.keys(options).length > 0) {
			this.setOptions(options);
		}

		this._addDefaultEvents();
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
		return defaultOptionsSchema;
	}

	/**
	 * @inheritdoc
	 */
	async start () {
		if (this.options.id === null) {
			const { id } = await this.telegram.getMe();

			this.setOptions({ id });
		}

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
		this._casters.add(caster);
	}

	/**
	 * @inheritdoc
	 */
	unsubscribe (caster) {
		this._casters.delete(caster);
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

	/**
	 * Add default events telegram
	 */
	_addDefaultEvents () {
		this.telegraf.on('message', (context) => {
			for (const caster of this._casters) {
				caster.dispatchIncomingMiddleware(
					new TelegramMessageContext(this, caster, context)
				);
			}
		});
	}
}
