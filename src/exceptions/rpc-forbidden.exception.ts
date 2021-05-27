import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Forbidden* type errors.
 *
 * @publicApi
 */
export class RpcForbiddenException extends RpcException {
  /**
   * Instantiate a `RpcForbiddenException` Exception.
   *
   * @example
   * `throw new RpcForbiddenException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.FORBIDDEN });
  }
}
