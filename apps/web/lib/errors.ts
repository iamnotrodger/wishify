import { NextResponse } from 'next/server';

export const UNKNOWN_ERROR_MESSAGE = 'Unknown error occurred';

export const unknownError = (error: Error) => {
  return NextResponse.json(
    { message: UNKNOWN_ERROR_MESSAGE, error: error.toString() },
    { status: 500 }
  );
};
