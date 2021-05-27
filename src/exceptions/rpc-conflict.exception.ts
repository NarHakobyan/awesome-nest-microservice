import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Conflict* type errors.
 *
 * @publicApi
 */
export class RpcConflictException extends RpcException {
  /**
   * Instantiate a `RpcConflictException` Exception.
   *
   * @example
   * `throw new RpcConflictException()`
   *
   * @param message string or object describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.CONFLICT });
  }
}
