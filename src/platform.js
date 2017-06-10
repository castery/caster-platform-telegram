'use strict';

import Telegraf, { Markup } from 'telegraf';

/* TODO: Change from local package to npm */
import { Platform } from '../../caster';

import createDebug from 'debug';

import { TelegramMessageContext } from './contexts/message';

import {
	PLATFORM_NAME,
	defaultOptions,
	mediaAttachments,
	supportAttachments,
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
	getAdapter () {
		return this.telegram;
	}

	/**
	 * Returns the platform id
	 *
	 * @return {string}
	 */
	getId () {
		return this.options.id;
	}

	/**
	 * Returns the platform name
	 *
	 * @return {string}
	 */
	getPlatformName () {
		return PLATFORM_NAME;
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
	async subscribe (caster) {
		this._casters.add(caster);

		if (!this.isStarted()) {
			await this.start();
		}

		caster.outcoming.addPlatform(this, async (context, next) => {
			if (context.getPlatformName() !== PLATFORM_NAME) {
				return await next();
			}

			if (context.getPlatformId() !== this.options.id) {
				return await next();
			}

			const chatId = context.from.id;

			const message = {
				chat_id: chatId,
				text: context.text
			};

			if ('attachments' in context) {
				const media = context.attachments.filter(({ type }) => (
					mediaAttachments.includes(type)
				))
				.map(({ type, source }) => {
					if (type === 'image') {
						return this.telegram.sendPhoto(chatId, source);
					}

					if (type === 'video') {
						return this.telegram.sendVideo(chatId, source);
					}

					if (type === 'audio') {
						return this.telegram.sendAudio(chatId, source);
					}

					if (type === 'document') {
						return this.telegram.sendDocument(chatId, source);
					}
				});

				const buttons = context.attachments.filter(({ type }) => (
					!mediaAttachments.includes(type)
				));

				return await Promise.all([...media, ...buttons]);
			}

			return await this.telegram.callApi('sendMessage', message);
		});
	}

	/**
	 * @inheritdoc
	 */
	async unsubscribe (caster) {
		this._casters.delete(caster);

		caster.outcoming.removePlatform(this);

		if (this._casters.size === 0 && this.isStarted()) {
			await this.stop();
		}
	}

	/**
	 * Add default events telegram
	 */
	_addDefaultEvents () {
		this.telegraf.on('message', (context) => {
			for (const caster of this._casters) {
				caster.dispatchIncoming(
					new TelegramMessageContext(caster, context, this.options.id)
				);
			}
		});
	}
}
