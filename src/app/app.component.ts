import { Component, OnInit } from '@angular/core';
import {
  Constants,
  Avoidable,
  GeoApiOptions,
  CityList,
  OneCallApiOptions,
  DisplayCards,
} from './constants';
import { Cities } from './cities';
import { HttpService } from './http.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'Car Wash Planner';

  avoidables: Array<Avoidable> = Constants.avoidables;
  selectedAvoidableList: Array<any> = [];

  states: Array<string> = [];
  searchedState: String = '';
  filteredStates: Array<string> = [];
  displayFilteredStates: boolean = false;
  selectedState = '';

  cities: Array<CityList> = Cities.cities;
  searchedCity: String = '';
  filteredCities: Array<any> = [];
  displayFilteredCities: boolean = false;
  selectedCity = '';

  lon = '';
  lat = '';

  httpService: HttpService;

  cityGeoData: any;
  cityWeatherData: any;

  dailyForecast: Array<any> = [];
  daysForcastable = new Array(Constants.daysForcastable);
  daysToForecast = 'Select Days';

  displayCards: Array<any> = [];
  indicesOfAvoidablesInDisplayCards: Array<number> = [];

  bestDays: number = 0;

  constructor(httpService: HttpService) {
    this.httpService = httpService;
  }

  selectAvoidable(selectedAvoidable: String) {
    // Toggle the selected value of avoidable clicked
    this.avoidables.filter((avoidable) => {
      if (avoidable.name === selectedAvoidable) {
        avoidable.selected = avoidable.selected === true ? false : true;
      }
    });
  }

  getSelectedAvoidables() {
    // Returns the list of select avoidables
    return this.avoidables.filter((x) => x.selected === true);
  }

  searchForState(event: any) {
    // Populate the dropdown with searched state
    if (event.target.value === '') {
      this.selectedState = '';
      this.searchedCity = '';
      this.selectedCity = '';
      this.displayFilteredStates = false;
      return (this.filteredStates = []);
    }
    this.filteredStates = this.states.filter((state) => {
      this.displayFilteredStates = true;
      return state.toLowerCase().includes(event.target.value.toLowerCase());
    });
    return false;
  }

  selectState(state: string) {
    // Selects a state and sets the value of the input box
    this.selectedState = state;
    this.searchedState = state;
    this.displayFilteredStates = false;
  }

  searchForCity(event: any) {
    // Populate the dropdown with searched state
    if (event.target.value === '') {
      this.displayFilteredCities = false;
      return (this.filteredCities = []);
    }
    this.filteredCities = this.cities.filter((city) => {
      this.displayFilteredCities = true;
      if (
        city.city.toLowerCase().includes(event.target.value.toLowerCase()) &&
        city.state === this.selectedState
      ) {
        return city.city
          .toLowerCase()
          .includes(event.target.value.toLowerCase());
      } else return false;
    });
    return false;
  }

  selectCity(city: CityList) {
    // Selects a state and sets the value of the input box
    this.selectedCity = city.city;
    this.searchedCity = city.city;
    this.displayFilteredCities = false;
  }

  async geoCodeApi(options: GeoApiOptions) {
    return new Promise((resolve, reject) => {
      this.httpService
        .geoApiCall({
          city: options.city,
          limit: options.limit,
        })
        .subscribe((data) => {
          resolve(data);
        });
    });
  }

  async oneCallApi(options: OneCallApiOptions) {
    return new Promise((resolve, reject) => {
      this.httpService.oneCallApiCall(options).subscribe((data) => {
        resolve(data);
      });
    });
  }

  reset() {
    this.displayCards = [];
    this.indicesOfAvoidablesInDisplayCards = [];
  }

  prepareDisplayCards(displayCards: DisplayCards) {
    this.displayCards.push(displayCards);
  }

  bestDay() {
    return Math.max(
      ...this.displayCards.map(function (displayCard: DisplayCards) {
        return displayCard.daysClean;
      })
    );
  }

  calculateDays() {
    for (let { index, displayCard } of this.displayCards.map(
      (displayCard, index) => ({
        index,
        displayCard,
      })
    )) {
      for (let avoidable of this.selectedAvoidableList) {
        let avoidableName = avoidable['name'];
        let weatherMain = displayCard['weather'][0]['main'];
        if (avoidableName == weatherMain) {
          this.indicesOfAvoidablesInDisplayCards.push(index);
        }
      }
    }
    this.indicesOfAvoidablesInDisplayCards.push(this.displayCards.length);

    let baseIndex = 0;
    let previousAvoidableIndex = -2;

    if (this.indicesOfAvoidablesInDisplayCards.length > 0) {
      for (let indexOfAvoidable of this.indicesOfAvoidablesInDisplayCards) {
        for (let { index, displayCard } of this.displayCards.map(
          (displayCard, index) => ({ index, displayCard })
        )) {
          if (index == indexOfAvoidable) {
            displayCard.daysClean = 0;
            previousAvoidableIndex = indexOfAvoidable;
            break;
          } else if (index > previousAvoidableIndex) {
            displayCard.daysClean = indexOfAvoidable - index;
          } else continue;
        }
      }
    }

    return;
  }

  async checkWeather() {
    // Reset the variables used below
    this.reset();

    // Get Lon and Lat for One Call API
    this.cityGeoData = await this.geoCodeApi({
      city: this.selectedCity,
      limit: '1',
    });
    this.lon = this.cityGeoData[0].lon;
    this.lat = this.cityGeoData[0].lat;

    // One Call API
    this.cityWeatherData = await this.oneCallApi({
      lat: this.lat,
      lon: this.lon,
      exclude: '',
      units: 'imperial',
    });

    // Store the weather forecast
    this.dailyForecast = this.cityWeatherData['daily'];

    // Prepare the data required to display on the UI
    for (let day of this.dailyForecast) {
      this.prepareDisplayCards({
        date: this.convertUnixDateTime(day['dt']),
        weather: day['weather'],
        daysClean: 0,
      });
    }

    // Find the days the car can't be washed
    this.selectedAvoidableList = this.getSelectedAvoidables();
    this.calculateDays();

    this.bestDays = this.bestDay();
    console.log(this.bestDays);
  }

  convertUnixDateTime(date: number) {
    return new Date(date * 1000).toDateString();
  }

  ngOnInit() {
    // Extract States
    for (let x of this.cities) {
      if (this.states.indexOf(x.state) === -1) {
        this.states.push(x.state);
      }
    }
    // Sort States Array
    this.states.sort((a, b) => a.localeCompare(b));
  }
}
