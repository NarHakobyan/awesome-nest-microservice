import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Not Found* type errors.
 *
 * @publicApi
 */
export class RpcNotFoundException extends RpcException {
  /**
   * Instantiate a `RpcNotFoundException` Exception.
   *
   * @example
   * `throw new RpcNotFoundException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.NOT_FOUND });
  }
}
