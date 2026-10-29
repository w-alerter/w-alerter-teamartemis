import {EnvironmentalDataRepository} from './repository.mjs';
import {EnvironmentalDataService} from './service.mjs';
export {EnvironmentalDataRepository,EnvironmentalDataService};
export const environmentalRepository=new EnvironmentalDataRepository();
export const environmentalDataService=new EnvironmentalDataService(environmentalRepository);
export const getEnvironmentalValue=(variable,latitude,longitude,date,options={})=>environmentalDataService.getEnvironmentalValue(variable,latitude,longitude,date,options);
