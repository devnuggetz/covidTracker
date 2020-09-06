import React, {useState, useEffect} from 'react';
import './App.css';
import {FormControl, Select, MenuItem, Card, CardContent} from '@material-ui/core';
import InfoBox from './InfoBox';
import Map from './Map'
import Table from './Table'
import { sortData, prettyPrintStat } from './util';
import LineGraph from './LineGraph';
import 'leaflet/dist/leaflet.css';

function App() {
  const [countries, setCountries]= useState([""]);
  const [country1, setCountry]= useState("worldwide");
  const [countryInfo, setCountryInfo]= useState({});
  const [tableData, setTableData]= useState([]);
  const [mapCenter, setMapCenter]= useState({
    lat: 22.9,
    lng: 78.65
  });
  const [mapZoom, setMapZoom]= useState(3);
  const [mapCountries, setMapCountries]= useState([]);
  const [casesType, setCasesTypes]= useState("cases");




  useEffect(()=>{
    fetch('https://disease.sh/v3/covid-19/all')
    .then(response=>response.json())
    .then(data=>{
      setCountryInfo(data);
    })
  },[])
  useEffect(() => {
    const getCountriesData = async () =>{
      await fetch("https://disease.sh/v3/covid-19/countries")
      .then((response)=> response.json())
      .then((data)=> {
        const countries= data.map((country)=>(
          {
            name: country.country,
            value: country.countryInfo.iso2
          }
        ));
        
        const sortedData= sortData(data);
        setMapCountries(data)
        setTableData(sortedData);
        setCountries(countries);
        
      })
    };
    getCountriesData();
  })

  const onCountryChange= async (event)=>{
    const countryCode= event.target.value
    setCountry(countryCode)

    const url= countryCode==='worldwide'
    ? 'https://disease.sh/v3/covid-19/all'
    : `https://disease.sh/v3/covid-19/countries/${countryCode}`

    await fetch(url)
    .then(response=> response.json())
    .then( data=> {
        setCountry(countryCode);
        setCountryInfo(data);
        setMapCenter([data.countryInfo.lat, data.countryInfo.long]);
    })
  }
  return (
    <div className="app">
      <div className='app__left'>
      <div className='app__header'>
      <h1>COVID-19 Tracker</h1>
      <FormControl className='app__dropdown'>
        <Select
          variant='outlined'
          onChange={onCountryChange}
          value={country1}
        >
          <MenuItem value='worldwide'>Worldwide</MenuItem>
           {
             countries.map(country=>(
               <MenuItem value={country.value}>{country.name}</MenuItem>
             ))
           } 
        </Select>

      </FormControl>
      </div>
      {/* Header */}
      {/* Title and Dropdown */}

      <div className='app__stats'>
           <InfoBox 
           isRed
           active= {casesType=== 'cases'}
           onClick={(e)=>setCasesTypes('cases')}
           title='Coronavirus Cases' cases={prettyPrintStat(countryInfo.todayCases)} total={countryInfo.cases} />
           <InfoBox 
           active= {casesType=== 'recovered'}
           onClick={(e)=>setCasesTypes('recovered')}
           title='Recovered' cases={prettyPrintStat(countryInfo.todayRecovered)} total={countryInfo.recovered} />
           <InfoBox 
           isRed
           active= {casesType=== 'deaths'}
           onClick={(e)=>setCasesTypes('deaths')}
           title='Deaths' cases={prettyPrintStat(countryInfo.todayDeaths)} total={countryInfo.deaths} />
           {/* Info boxes */}
           {/* Info boxes */}
      </div>
      

      
      <Map 
      casesType={casesType}
      countries={mapCountries}
      center={mapCenter}
      zoom={mapZoom}
      />
      {/* map */}

      </div>
      <Card className='app__right'>
       <CardContent>
         <h3>Live Cases by Countries</h3>
            <Table countries={tableData} />
          <h3 className='app__graphTitle' >Worldwide new {casesType}</h3>
         <LineGraph 
         className='app__graph'
         casesTypes={casesType}
         />
       </CardContent>
      </Card>
    </div>
  );
}

export default App;
