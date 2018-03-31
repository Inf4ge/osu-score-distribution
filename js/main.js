

(async () => {

  const countries = await (await fetch('./temp/countries.json')).json();
  console.log(countries);
})();
