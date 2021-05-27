import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Unprocessable* type errors.
 *
 * @publicApi
 */
export class RpcUnprocessableEntityException extends RpcException {
  /**
   * Instantiate an `RpcUnprocessableEntityException` Exception.
   *
   * @example
   * `throw new RpcUnprocessableEntityException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.UNPROCESSABLE_ENTITY });
  }
}
