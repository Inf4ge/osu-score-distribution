import assert from 'assert';
import {
  getCountryPageURL,
  getRankingPageURL,
  getCountryPageInfo,
  getRankingPageInfo
} from '../getter.mjs';

describe('get URL', () => {
 it('getCountryPageURL return string', () => assert.strictEqual(typeof getCountryPageURL(1, 'JP'), 'string'));
 it('getRankingPageURL return string', () => assert.strictEqual(typeof getRankingPageURL(1), 'string'));
});

describe('get info', () => {
  it('fetch country page', async () => {
    const info = await getCountryPageInfo(getCountryPageURL(1))
    
    describe('country page', () => {
      it('top country name is string', () => assert.strictEqual(typeof info.countries[0].name, 'string'));
      it('top country code is string', () => assert.strictEqual(typeof info.countries[0].code, 'string'));
      it('top country name is Japan', () => assert.strictEqual(info.countries[0].name, 'Japan'));
      it('top country code is JP', () => assert.strictEqual(info.countries[0].code, 'JP'));
      it('current page num is 1', () => assert.strictEqual(info.page_num.current, 1));
      it('max page num is 4', () => assert.strictEqual(info.page_num.max, 4));
      it('this is not final page', () => assert.strictEqual(info.is_final_page, false));
    });
  }).timeout(20000);

  it('fetch ranking page', async () => {
    const info = await getRankingPageInfo(getRankingPageURL(1, 'JP'))
    
    describe('ranking page', () => {
      it('top rank users name is string', () => assert.strictEqual(typeof info.users[0].name, 'string'));
      it('top rank users pp is number', () => assert.strictEqual(typeof info.users[0].pp, 'number'));
      it('top rank users play_count is number', () => assert.strictEqual(typeof info.users[0].play_count, 'number'));
      it('top rank users name is _yu68', () => assert.strictEqual(info.users[0].name, '_yu68'));
      it('top rank users pp is over 13000', () => assert(info.users[0].pp > 13000));
      it('current page num is 1', () => assert.strictEqual(info.page_num.current, 1));
      it('max page num is 4', () => assert.strictEqual(info.page_num.max, 9));
      it('this is not final page', () => assert.strictEqual(info.is_final_page, false));
    });
  }).timeout(20000);
});

