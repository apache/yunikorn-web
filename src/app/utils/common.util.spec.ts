import { CommonUtil } from './common.util';

describe('CommonUtil', () => {
  it('should have createUniqId method', () => {
    expect(CommonUtil.createUniqId).toBeTruthy();
  });

  it('should have formatMemory method', () => {
    expect(CommonUtil.formatMemory).toBeTruthy();
  });
});
