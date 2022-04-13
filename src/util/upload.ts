import { HttpService } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import { map } from "rxjs/internal/operators/map";

module.exports = {

  uploadFile: async function(
    params : any, 
    headersRequest : any,
    configService: ConfigService, 
    httpService: HttpService) 
  {
    
    const firstStepResult = await this.httpService
    .post('https://sandbox.facturedo.com/v2/auth/presigned-post', 
      {
        "file_name": params.file_name,
      },{
        headers: headersRequest,
      })
    .toPromise();

    const secondStepResult = await this.httpService
    .post('https://fact2-backend-staging.s3.amazonaws.com/', 
      {
        "file_name": params.file_name,
      },{
        headers: headersRequest,
      })
    .toPromise();
        
    return secondStepResult.data.url;

  }

}