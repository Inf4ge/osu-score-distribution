const getParameter = module.exports;

const base_dir = './temp/';
const country_code = getParameter().country_code;

if(country_code === undefined)location.href = './index.html?country_code=ALL';

(async () => {
  //get countries data
  let countries = await (await fetch(`${base_dir}countries.json`)).json();
  countries = [{
    name: 'All Countries',
    code: 'ALL'
  }, ...countries];

  //setup ui
  const country_select = document.querySelector('#country_code');
  countries.forEach(x => {
    const option = document.createElement('option');
    option.value = x.code;
    option.innerText = x.name;
    option.selected = country_code === x.code;
    country_select.appendChild(option);
  });

  document.querySelector('#reload').addEventListener('click', () => location.href = `./index.html?country_code=${country_select.value}`);

  //get users data
  let users = country_code === 'ALL' ? await getAllUsers(countries) : await getCountryUsers(country_code);
  //filter user
  users = users
    .filter(x => x.pp < 200)
    .filter(x => Math.random() > 0.99);

  //draw charts
  google.charts.load("current", {packages:["corechart"]});
  google.charts.setOnLoadCallback(() => drawChart(users));
})();

const getAllUsers = async countries =>
  (await Promise.all(
    countries
      .filter(x => x.code !== 'ALL')
      .map(x => x.code)
      .map(x => getCountryUsers(x))
  ))
    .reduce((s, x) => [...s, ...x]);

const getCountryUsers = async country_code => await (await fetch(`${base_dir}${country_code}.json`)).json();

const getUsersInfo = users => {
  const n = users.length;
  const avg = users.reduce((s, x) => s + x.pp, 0) / n;
  const sd = Math.sqrt(users.reduce((s, x) => s + Math.pow(avg - x.pp, 2), 0) / n);
  const max = users.reduce((s, x) => x.pp > s ? x.pp : s, 0);
  const min = users.reduce((s, x) => x.pp < s ? x.pp : s, 0);

  return {
    n,
    avg,
    sd,
    max,
    min
  };
};

const drawChart = users => {
  const histogram_data = google.visualization.arrayToDataTable([
    ['user', 'pp'],
    ...users.map(x => [x.name, x.pp])
  ]);

  const histogram = new google.visualization.Histogram(document.querySelector('.histogram'));
  histogram.draw(histogram_data, {
    title: `pp histogram of Osu!Taiko users(${country_code})`,
    legend: { position: 'none' },
  });

  const users_info = getUsersInfo(users);
  document.querySelector('.info').textContent = JSON.stringify(users_info, null, '  ');

  const pp_sd_data = google.visualization.arrayToDataTable([
    ['pp', 'sd'],
    ...Array.from({length: 15000})
      .map((x, i) => (i - users_info.avg) * 10 / users_info.sd + 50)
      .map((x, i) => [i, x])
      .filter((x, i) => i % 100 === 0)
  ]);

  const pp_sd_chart = new google.visualization.LineChart(document.querySelector('.sd'));
  pp_sd_chart.draw(pp_sd_data, {
    title: 'pp standard deviation',
    curveType: 'line',
    legend: { position: 'none' }
  });
};

