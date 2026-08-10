import { ApplicationConfig, provideAppInitializer, inject } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { routes } from './app.routes';
import { credentialsInterceptor } from './interceptors/credentials.interceptor';
import { AuthService } from './services/auth.service';
import { registerLocaleData } from '@angular/common';
import localeIt from '@angular/common/locales/it';
import { LOCALE_ID } from '@angular/core';

registerLocaleData(localeIt);

export const appConfig: ApplicationConfig = {
  providers: [
    {
      provide: LOCALE_ID,
      useValue: 'it',
    },
    provideHttpClient(withInterceptors([credentialsInterceptor])),
    provideRouter(routes),
    provideAppInitializer(() => firstValueFrom(inject(AuthService).loadCurrentUser())),
  ]
};
