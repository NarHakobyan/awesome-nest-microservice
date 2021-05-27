/* eslint-disable camelcase */
export interface IElasticResult<T = any> {
  took: number;
  timed_out: boolean;
  _shards: {
    total: number;
    successful: number;
    skipped: number;
    failed: number;
  };
  hits: {
    total: {
      value: number;
      relation: string;
    };
    max_score: null;
    hits: Array<{
      _source: T;
    }>;
  };
}
