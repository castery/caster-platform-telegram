import * as Joi from 'joi';

import { MessageContext } from '@castery/caster';

/**
 * Platform context name
 *
 * @type {string}
 */
export const PLATFORM_NAME = 'telegram';

/**
 * Supported platform types
 *
 * @type {Object}
 */
export const supportedContextTypes = MessageContext.defaultSupportedContextTypes({
	message: true
});

/**
 * Supported platform attachments
 *
 * @type {Object}
 */
export const supportedAttachmentTypes = MessageContext.defaultSupportedAttachmentTypes({
	image: true,
	voice: true,
	video: true,
	document: true
});

/**
 * Switches type attachments
 *
 * @type {Object}
 */
export const switchAttachments = {
	image: 'photo',
	document: 'doc'
};

/**
 * Default options platform
 *
 * @type {Object}
 *
 * @property {mixed}  [id]       Unique ID platform
 * @property {Object} [adapter]  Options for adapter
 * @property {string} [username] Username bot
 */
export const defaultOptions = {
	id: null,

	adapter: {},

	username: null
};

/**
 * Default options platform schema
 *
 * @type {Object}
 *
 * @extends {defaultOptions}
 */
export const defaultOptionsSchema = Joi.object().keys({
	id: Joi.number().allow(null),

	adapter: Joi.object(),

	username: Joi.string().allow(null),
});
