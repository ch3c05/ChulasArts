/**
 * Request Validation Middleware
 *
 * Wrapper around express-validator for request validation
 * Provides helper functions for common validation patterns
 */

import { Request, Response, NextFunction } from 'express';
import { validationResult, ValidationChain } from 'express-validator';
import { ValidationError as AppValidationError } from '../utils/errors.js';

/**
 * Validate request using express-validator
 * Checks for validation errors and throws if any exist
 */
export function validate(req: Request, res: Response, next: NextFunction): void {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    const formattedErrors: Record<string, string> = {};

    errors.array().forEach((error) => {
      if (error.type === 'field') {
        formattedErrors[error.path] = error.msg;
      }
    });

    throw new AppValidationError(formattedErrors, 'Validation failed');
  }

  next();
}

/**
 * Create validation middleware chain
 * @param validations - Array of express-validator validation chains
 * @returns Middleware function
 */
export function createValidationChain(validations: ValidationChain[]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    // Run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));

    // Check for errors
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const formattedErrors: Record<string, string> = {};

      errors.array().forEach((error) => {
        if (error.type === 'field') {
          formattedErrors[error.path] = error.msg;
        }
      });

      return next(new AppValidationError(formattedErrors, 'Validation failed'));
    }

    next();
  };
}
