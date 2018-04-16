import { MessageContext, contextProps } from '@castery/caster';

import {
	PLATFORM_NAME,
	supportedContextTypes,
	supportedAttachmentTypes
} from '../utils/constants';

const { SUPPORTED_CONTEXT_TYPES, SUPPORTED_ATTACHMENT_TYPES } = contextProps;

const enumTypesMessage = {
	private: 'dm',
};

/**
 * Incoming telegram context
 *
 * @public
 */
export default class TelegramMessageContext extends MessageContext {
	/**
	 * Constructor
	 *
	 * @param {Caster}  caster
	 * @param {Context} context
	 * @param {number}  id
	 */
	constructor(caster, { id, context, $text = null }) {
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
		this.$text = $text;

		this.raw = context;
	}

	/**
	 * Returns supported context types
	 *
	 * @return {Object}
	 */
	get [SUPPORTED_CONTEXT_TYPES]() {
		return supportedContextTypes;
	}

	/**
	 * Returns supported attachment types
	 *
	 * @return {Object}
	 */
	get [SUPPORTED_ATTACHMENT_TYPES]() {
		return supportedAttachmentTypes;
	}

	/**
	 * Sends a message to the current dialog
	 *
	 * @param {mixed}  text
	 * @param {Object} options
	 *
	 * @return {Promise<mixed>}
	 */
	send(text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		const message = new TelegramMessageContext(this.caster, {
			id: this.platform.id,
			context: this.raw
		});

		message.to = this.from;
		message.state = { ...this.state };

		message.text = options.text;

		if ('attachments' in options) {
			if (!Array.isArray(options.attachments)) {
				message.attachments = [options.attachments];
			} else {
				message.attachments = options.attachments;
			}
		}

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
	reply(text, options = {}) {
		if (typeof text === 'object') {
			options = text;
		} else {
			options.text = text;
		}

		options.text = `@${this.raw.from.username}, ${options.text}`;

		return this.send(options);
	}
}
