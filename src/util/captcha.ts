import { map } from 'rxjs/operators';

export async function validateCaptcha(secretKey: any, token: any) {
  const url =
    'https://www.google.com/recaptcha/api/siteverify?secret=' +
    secretKey +
    '&response=' +
    token;

  const result = await this.httpService
    .post(url)
    .pipe(
      map((response) => {
        return response['data'];
      }),
    )
    .toPromise();
  return result;
}
