import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { Observable, throwError } from 'rxjs';
import { catchError, retry } from 'rxjs/operators';
import { Constants, GeoApiOptions, OneCallApiOptions } from './constants';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  geoApiBase = 'https://api.openweathermap.org/geo/1.0/direct?q=';
  oneCallApiBase = 'https://api.openweathermap.org/data/2.5/onecall?';

  geoApiOptions = '';
  oneCallApiOptions = '';

  apiKey = Constants.apiKey;

  constructor(private http: HttpClient) {}

  prepareGeoApiOptions(options: GeoApiOptions) {
    // Creates the API URL
    return (
      this.geoApiBase +
      options.city +
      '&limit=' +
      options.limit +
      '&appid=' +
      this.apiKey
    );
  }

  geoApiCall(options: GeoApiOptions) {
    // Calls the Geo API
    return this.http.get(this.prepareGeoApiOptions(options));
  }

  prepareOneCallApiOptions(options: OneCallApiOptions) {
    // Creates the API URL
    console.log(
      this.oneCallApiBase +
        'lat=' +
        options.lat +
        '&lon=' +
        options.lon +
        '&exclude=' +
        options.exclude +
        '&units=' +
        options.units +
        '&appid=' +
        this.apiKey
    );
    return (
      this.oneCallApiBase +
      'lat=' +
      options.lat +
      '&lon=' +
      options.lon +
      '&exclude=' +
      options.exclude +
      '&appid=' +
      this.apiKey
    );
  }

  oneCallApiCall(options: OneCallApiOptions) {
    // Call the One Call API URL
    return this.http.get(this.prepareOneCallApiOptions(options));
  }
}
