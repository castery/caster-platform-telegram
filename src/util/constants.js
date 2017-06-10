'use strict';

import Joi from 'joi';

/**
 * Platform context name
 *
 * @type {string}
 */
export const PLATFORM_NAME = 'telegram';

/**
 * Supports attachments
 *
 * @type {Array}
 */
export const supportAttachments = ['image', 'video', 'document', 'button'];

/**
 * Media attachments
 *
 * @type {Array}
 */
export const mediaAttachments = ['image', 'video', 'document'];

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
 */
export const defaultOptions = {
	id: null,

	adapter: {}
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

	adapter: Joi.object()
});
