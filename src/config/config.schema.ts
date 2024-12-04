import Joi from 'joi';

export const configValidationSchema = Joi.object({
  HOST: Joi.string().default('localhost'),
  PORT: Joi.number().default(3000),
  JWT_SECRET: Joi.string().required(),
  DATABASE_URL: Joi.string().uri().required(),
  DIRECT_URL: Joi.string().uri().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_ENDPOINT_URL: Joi.string().uri().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  INTERNAL_API_KEY_HASH: Joi.string().required(),
  FIREBASE_SERVICE_ACCOUNT_PATH: Joi.string().required(),
  DEBUG_USE_HTTPS: Joi.boolean().default(false),
});
