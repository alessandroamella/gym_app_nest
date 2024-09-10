import Joi from 'joi';

export const configValidationSchema = Joi.object({
  DATABASE_URL: Joi.string().uri().required(),
  R2_BUCKET_NAME: Joi.string().required(),
  R2_ENDPOINT_URL: Joi.string().uri().required(),
  R2_ACCESS_KEY_ID: Joi.string().required(),
  R2_SECRET_ACCESS_KEY: Joi.string().required(),
  R2_PUBLIC_URL: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().required(),
  PORT: Joi.number().default(3000),
  HOST: Joi.string().default('localhost'),
});
