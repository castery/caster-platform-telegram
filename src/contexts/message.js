'use strict';

import { PLATFORM } from '../util/constants';

/* TODO: Change from local package to npm */
import { MessageContext } from '../../../caster';

const enumTypesMessage = {
	private: 'dialog',
};

/**
 * Incoming vk context
 *
 * @public
 */
export class TelegramMessageContext extends MessageContext {
	/**
	 * Constructor
	 *
	 * @param {TelegramPlatform} platform
	 * @param {Caster}           caster
	 * @param {Context}          context
	 * @param {string}           type
	 */
	constructor (platform, caster, context) {
		super(caster);

		this.platform = {
			id: platform.options.id,
			name: PLATFORM
		};

		const { type } = context.chat;

		this.from = {
			id: context.chat.id,
			type: (type in enumTypesMessage)
				? enumTypesMessage[type]
				: type
		};

		this.sender = {
			id: context.from.id,
			type: 'user'
		};

		this.text = context.message.text;

		this.raw = context;

		this._platform = platform;
	}

	/**
	 * Sends a message to the current dialog
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	send (text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		options.chat_id = this.from.id;

		return this._platform.send(options);
	}

	/**
	 * Responds to a message with a mention
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	reply (text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		options.text = `@${this.raw.from.username}, ${options.text}`;

		return this.send(options);
	}
}
