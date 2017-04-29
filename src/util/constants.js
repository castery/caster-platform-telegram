'use strict';

import Joi from 'joi';

/**
 * Platform context name
 *
 * @type {string}
 */
export const PLATFORM = 'telegram';

/**
 * Default options platform
 *
 * @type {Object}
 */
export const defaultOptions = {
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
	adapter: Joi.object()
});
