import { NextResponse } from 'next/server';

export const MESSAGES = {
  UNAUTHORIZED: 'unauthorized request',
  UNKNOWN_ERROR: 'unknown error occurred',
  INVALID: 'invalid request',
  PRODUCT_NOT_FOUND: 'product not found',
};

export const unauthorizedResponse = () =>
  NextResponse.json(
    { message: MESSAGES.UNAUTHORIZED, success: false },
    { status: 401 }
  );

export const unknownErrorResponse = (error: Error) =>
  NextResponse.json(
    { message: MESSAGES.UNKNOWN_ERROR, error: error.message, success: false },
    { status: 500 }
  );

export const invalidRequestResponse = (error: Error) =>
  NextResponse.json(
    { message: MESSAGES.INVALID, error: error.message, success: false },
    { status: 400 }
  );

export const productNotFoundResponse = (error: Error) =>
  NextResponse.json(
    {
      message: MESSAGES.PRODUCT_NOT_FOUND,
      error: error.message,
      success: false,
    },
    { status: 404 }
  );
