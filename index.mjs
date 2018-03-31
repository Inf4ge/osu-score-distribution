import fs from 'fs';
import path from 'path';
import {
  getAllCountries,
  getCountryUsers
} from './getter.mjs';

//make working directory
const working_directory = './temp';
try{
  fs.mkdirSync(working_directory);
}catch(e){}

(async () => {
  const countries_file_name = path.join(working_directory, 'countries.json');
  let countries;
  try{
    countries = JSON.parse(fs.readFileSync(countries_file_name));
  }catch(e){
    countries = await getAllCountries();
    fs.writeFileSync(countries_file_name, JSON.stringify(countries));
  }

  for(const country of countries){
    const file_name = path.join(working_directory, `${country.code}.json`);
    
    if(fs.existsSync(file_name))continue;
    
    const country_users = await getCountryUsers(country.code);
    fs.writeFileSync(file_name, JSON.stringify(country_users));
  }

  console.log('done.');
})();

