import { HttpService } from "@nestjs/common";
import { ConfigService } from '@nestjs/config';
import FormData from 'form-data';

module.exports = {

  uploadFile: async function(
    params : any, 
    token : string,
    httpService: HttpService)  : Promise<string>
  {
    
    const headersFirstRequest = {
      'Content-Type': 'application/json', 
      Authorization: `Bearer ${token}`,
    };

    const firstStepResult = await httpService
    .post('https://sandbox.facturedo.com/v2/auth/presigned-post', 
      {
        "file_name": params.file_name,
      },{
        headers: headersFirstRequest,
      })
    .toPromise();

    const headersSecondRequest = {
      'Content-Type': 'multipart/form-data', 
      Authorization: `Bearer ${token}`,
    };

    var bodyFormData = new FormData();
    for(var [key, value] of Object.entries(firstStepResult.data.fields) )
    {
      bodyFormData.append(key, value);
    }
    bodyFormData.append("file", params.file);

    const secondStepResult = await httpService
    .post('https://fact2-backend-staging.s3.amazonaws.com/' + firstStepResult.data.url.data.url, 
        bodyFormData,{
        headers: headersSecondRequest,
      })
    .toPromise();
        
    return secondStepResult.data.url;

  }

}