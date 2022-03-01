export interface Avoidable {
  name: string;
  icon: string;
  selected: boolean;
  main: string;
}

export interface CityList {
  city: string;
  state: string;
}

export interface GeoApiOptions {
  city: string;
  limit: string;
}

export interface OneCallApiOptions {
  lat: string;
  lon: string;
  exclude: string;
  units: string;
}

export interface DisplayCards {
  date: any;
  weather: Array<any>;
  daysClean: number;
}

export class Constants {
  public static apiKey = '37f11cfb70ecf412b76530f38731c6c9';

  public static options = ['current', 'minutely', 'hourly', 'daily', 'alerts'];

  public static units = ['standard', 'metric', 'imperial'];

  public static avoidables: Array<Avoidable> = [
    {
      name: 'Storm',
      icon: 'fa-solid fa-bolt-lightning',
      selected: false,
      main: 'Thunderstorm',
    },
    {
      name: 'Drizzle',
      icon: 'fa-solid fa-cloud-rain',
      selected: false,
      main: 'Drizzle',
    },
    {
      name: 'Rain',
      icon: 'fa-solid fa-cloud-showers-heavy',
      selected: false,
      main: 'Rain',
    },
    {
      name: 'Snow',
      icon: 'fa-solid fa-snowflake',
      selected: false,
      main: 'Snow',
    },
    { name: 'Dust', icon: 'fa-solid fa-wind', selected: false, main: 'Dust' },
  ];

  public static daysForcastable = 7;
}
