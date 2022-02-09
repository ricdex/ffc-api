import { HttpService } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { map } from "rxjs/internal/operators/map";

module.exports = {

  validateCaptcha: async function(params : any, 
    configService: ConfigService, 
    httpService: HttpService) 
  {
      const secretKey = configService.get('RECAPTCHA');
      const url =
        'https://www.google.com/recaptcha/api/siteverify?secret=' +
        secretKey +
        '&response=' +
        params.token;

      const result = await httpService
        .post(url)
        .pipe(
          map((response) => {
            return response['data'];
          }),
        )
        .toPromise();
        
      return result.success;

  }

}