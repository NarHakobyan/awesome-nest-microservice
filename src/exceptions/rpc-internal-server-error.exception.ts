import { HttpStatus } from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';

/**
 * Defines an RPC exception for *Internal Server Error* type errors.
 *
 * @publicApi
 */
export class RpcInternalServerErrorException extends RpcException {
  /**
   * Instantiate an `RpcInternalServerErrorException` Exception.
   *
   * @example
   * `throw new RpcInternalServerErrorException()`
   *
   * @param message string describing the error condition.
   */
  constructor(message?: string) {
    super({ message, statusCode: HttpStatus.INTERNAL_SERVER_ERROR });
  }
}
