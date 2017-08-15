'use strict';

import createDebug from 'debug';
import Telegraf, { Markup } from 'telegraf';
import { Platform, errors as casterErrors } from '@castery/caster';

import { TelegramMessageContext } from './contexts/message';

import {
	PLATFORM_NAME,
	defaultOptions,
	mediaAttachments,
	defaultOptionsSchema,
	supportedContextTypes,
	supportedAttachmentTypes
} from './util/constants';

const { UnsupportedAttachmentType, UnsupportedContextType } = casterErrors;

const debug = createDebug('caster-telegram');

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
		const { id, username } = await this.telegram.getMe();

		this.setOptions({ username });

		if (this.options.id === null) {
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

			if (supportedContextTypes[context.type] !== true) {
				throw new UnsupportedContextType({
					type: context.type
				});
			}

			const chatId = context.from.id;

			const message = {
				chat_id: chatId,
				text: context.text
			};

			if ('attachments' in context) {
				for (const { type } of context.attachments) {
					if (supportedAttachmentTypes[type] !== true) {
						throw new UnsupportedAttachmentType({ type });
					}
				}

				await Promise.all(
					context.attachments.map(({ type, source }) => {
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
					})
				);
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
			let $text = context.message.text.replace(`@${this.options.username}`, '');

			if ($text.startsWith('/')) {
				$text = $text.substring(1);
			}

			for (const caster of this._casters) {
				caster.dispatchIncoming(
					new TelegramMessageContext(caster, {
						id: this.options.id,
						context,
						$text
					})
				);
			}
		});
	}
}
