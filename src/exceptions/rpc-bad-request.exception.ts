import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Bad Request* type errors.
 *
 * @publicApi
 */
export class RpcBadRequestException extends RpcException {
  /**
   * Instantiate a `RpcBadRequestException` Exception.
   *
   * @example
   * `throw new RpcBadRequestException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.BAD_REQUEST });
  }
}
