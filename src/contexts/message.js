'use strict';

import { PLATFORM_NAME } from '../util/constants';

/* TODO: Change from local package to npm */
import { MessageContext } from '../../../caster';

const enumTypesMessage = {
	private: 'dm',
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
	 * @param {Caster}  caster
	 * @param {Context} context
	 * @param {number}  id
	 */
	constructor (caster, context, id) {
		super(caster);

		this.platform = {
			id,
			name: PLATFORM_NAME
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

		const message = new TelegramMessageContext(this.caster, this.raw, this.platform.id);

		message.to = this.from;
		message.text = options.text;

		return this.caster.dispatchOutcoming(message);
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
