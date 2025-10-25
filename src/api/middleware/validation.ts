import Joi from 'joi';

/**
 * Validation schema for account creation
 */
export const validateAccount = (data: any) => {
  const schema = Joi.object({
    name: Joi.string().min(3).max(50).required().messages({
      'string.base': 'Name must be a string',
      'string.min': 'Name must be at least 3 characters long',
      'string.max': 'Name cannot exceed 50 characters',
      'any.required': 'Name is required'
    })
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for deposits
 */
export const validateDeposit = (data: any) => {
  const schema = Joi.object({
    accountId: Joi.string().required().messages({
      'string.base': 'Account ID must be a string',
      'any.required': 'Account ID is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'any.required': 'Amount is required'
    }),
    description: Joi.string().min(3).max(100).required().messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 100 characters',
      'any.required': 'Description is required'
    })
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for withdrawals
 */
export const validateWithdrawal = (data: any) => {
  const schema = Joi.object({
    accountId: Joi.string().required().messages({
      'string.base': 'Account ID must be a string',
      'any.required': 'Account ID is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'any.required': 'Amount is required'
    }),
    description: Joi.string().min(3).max(100).required().messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 100 characters',
      'any.required': 'Description is required'
    })
  });
  
  return schema.validate(data);
};

/**
 * Validation schema for transfers
 */
export const validateTransfer = (data: any) => {
  const schema = Joi.object({
    fromAccountId: Joi.string().required().messages({
      'string.base': 'Source account ID must be a string',
      'any.required': 'Source account ID is required'
    }),
    toAccountId: Joi.string().required().messages({
      'string.base': 'Target account ID must be a string',
      'any.required': 'Target account ID is required'
    }),
    amount: Joi.number().positive().precision(2).required().messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive',
      'number.precision': 'Amount cannot have more than 2 decimal places',
      'any.required': 'Amount is required'
    }),
    description: Joi.string().min(3).max(100).required().messages({
      'string.base': 'Description must be a string',
      'string.min': 'Description must be at least 3 characters long',
      'string.max': 'Description cannot exceed 100 characters',
      'any.required': 'Description is required'
    })
  }).custom((value, helpers) => {
    if (value.fromAccountId === value.toAccountId) {
      return helpers.error('any.invalid', { message: 'Source and target accounts cannot be the same' });
    }
    return value;
  });
  
  return schema.validate(data);
};