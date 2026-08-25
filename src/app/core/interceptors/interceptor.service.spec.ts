import { interceptorFn } from './interceptor.service';

describe('interceptorFn', () => {
  it('is configured as a functional interceptor', () => {
    expect(interceptorFn).toEqual(jasmine.any(Function));
  });
});
