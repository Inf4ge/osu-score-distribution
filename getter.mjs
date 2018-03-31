import fetch from 'node-fetch';
import jsdom from 'jsdom';
const JSDOM = jsdom.JSDOM;

const interval = 3000;
const wait = time => new Promise(resolve => setTimeout(resolve, time));

export const getCountryPageURL = page_num => `https://osu.ppy.sh/rankings/taiko/country?page=${page_num}#jump-target`;
export const getRankingPageURL = (page_num, country_code) => `https://osu.ppy.sh/rankings/taiko/performance?country=${country_code}&page=${page_num}#jump-target`;

export const getAllUsers = async () => {
  let users = [];

  const countries = await getAllCountries();

  for(const country of countries){
    const country_users = await getCountryUsers(country.code);
    users = [...users, ...country_users];
  }

  return users;
};

export const getAllCountries = async () => {
  let countries = [];
  let current_page_num = 1;
  let info;

  do{
    info = await getCountryPageInfo(getCountryPageURL(current_page_num));
    countries = [...countries, ...info.countries];
    current_page_num++;
    await wait(interval);
  }while(!info.is_final_page)

  return countries;
};

export const getCountryUsers = async (country_code) => {
  let users = [];
  let current_page_num = 1;
  let info;

  do{
    info = await getRankingPageInfo(getRankingPageURL(current_page_num, country_code));
    users = [...users, ...info.users];
    current_page_num++;
    await wait(interval);
  }while(!info.is_final_page)

  return users;
};

export const getCountryPageInfo = async (url) => {
  console.log('fetching...', url);

  const dom = new JSDOM(await((await fetch(url)).text()));
  const document = dom.window.document;

  const rows = document.querySelectorAll('table.ranking-page-table > tbody > tr');
  const countries =
    Array.from(rows)
      .map(x => x.querySelector('a'))
      .map(x => ({
        name: x.textContent.replace(/[ \n]/g, ''),
        code: x.href.match(/country=(.+?)$/)[1]
      }));

  const pnavs = document.querySelectorAll('.paginator__page');
  const current_page_num =
    pnavs.length !== 0
      ?
        parseInt(
          Array.from(pnavs)
            .find(x => x.classList.contains('paginator__page--current'))
            .textContent
        )
      : 1;

  const max_page_num =
    pnavs.length !== 0
      ?
        Array.from(pnavs)
          .map(x => parseInt(x.textContent))
          .filter(x => !isNaN(x))
          .reduce((s, x) => x > s ? x : s)
      : 1;

  return {
    countries,
    page_num: {
      current: current_page_num,
      max: max_page_num
    },
    is_final_page: current_page_num === max_page_num
  };
};

export const getRankingPageInfo = async (url) => {
  console.log('fetching...', url);

  const dom = new JSDOM(await((await fetch(url)).text()));
  const document = dom.window.document;

  const rows = document.querySelectorAll('table.ranking-page-table > tbody > tr');
  const users =
    Array.from(rows)
      .map(x => ({
        name: x.querySelector('.ranking-page-table__user-link-text').textContent.replace(/[\n ]/g, ''),
        pp: parseInt(x.querySelector('td:nth-child(5)').textContent.replace(/[\n ]/g, '')),
        play_count: parseInt(x.querySelector('td:nth-child(4)').textContent.replace(/[\n ]/g, ''))
      }));

  const pnavs = document.querySelectorAll('.paginator__page');
  const current_page_num =
    pnavs.length !== 0
      ?
        parseInt(
          Array.from(pnavs)
            .find(x => x.classList.contains('paginator__page--current'))
            .textContent
        )
      : 1;

  const max_page_num =
    pnavs.length !== 0
      ?
        Array.from(pnavs)
          .map(x => parseInt(x.textContent))
          .filter(x => !isNaN(x))
          .reduce((s, x) => x > s ? x : s)
      : 1;

  return {
    users,
    page_num: {
      current: current_page_num,
      max: max_page_num
    },
    is_final_page: current_page_num === max_page_num
  };
};

