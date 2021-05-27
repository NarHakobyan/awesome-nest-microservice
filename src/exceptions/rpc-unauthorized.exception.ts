import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Unauthorized* type errors.
 *
 * @publicApi
 */
export class RpcUnauthorizedException extends RpcException {
  /**
   * Instantiate an `RpcUnauthorizedException` Exception.
   *
   * @example
   * `throw new RpcUnauthorizedException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.UNAUTHORIZED });
  }
}
