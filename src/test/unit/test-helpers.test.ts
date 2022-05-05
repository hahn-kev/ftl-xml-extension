import {test, suite} from 'mocha';
import {expect} from 'chai';
import {extractLocation} from './test-helpers';

suite('test helpers', () => {
  test('can extract location', () => {
    const [offset, text] = extractLocation('0123$567');
    expect(offset).to.eq(4);
    expect(text).to.eq('0123567');
  });
  test('extract location from start', () => {
    const [offset, text] = extractLocation('$1234567');
    expect(offset).to.eq(0);
    expect(text).to.eq('1234567');
  });
  test('extract location from end', () => {
    const [offset, text] = extractLocation('0123456$');
    expect(offset).to.eq(7);
    expect(text).to.eq('0123456');
  });
});
