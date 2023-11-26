import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  AuthenticationService,
  FlagService,
  RedirectService,
  environment,
} from '@activepieces/ui/common';
import {
  ThirdPartyAuthnProviderEnum,
  ThirdPartyAuthnProvidersToShowMap,
} from '@activepieces/ee-shared';
import { Observable, map, switchMap, tap } from 'rxjs';
import { Oauth2Service } from '@activepieces/ui/feature-connections';

@Component({
  selector: 'ap-third-party-auth',
  templateUrl: './third-party-auth.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ThirdPartyAuthComponent {
  readonly ThirdPartyAuthnProvider = ThirdPartyAuthnProviderEnum;
  thirdPartyProvidersToShow$: Observable<ThirdPartyAuthnProvidersToShowMap>;
  signInWithThirdPartyProvider$: Observable<void> | undefined;
  constructor(
    private flagService: FlagService,
    private authenticationService: AuthenticationService,
    private oauth2Service: Oauth2Service,
    private redirectService: RedirectService
  ) {
    this.thirdPartyProvidersToShow$ =
      this.flagService.getThirdPartyProvidersMap();
  }
  signInWithThirdPartyProvider(provider: ThirdPartyAuthnProviderEnum) {
    this.signInWithThirdPartyProvider$ = this.authenticationService
      .getThirdPartyLoginUrl(provider)
      .pipe(
        switchMap((response) => {
          return this.oauth2Service
            .openPopupWithLoginUrl(response.loginUrl, environment.redirectUrl)
            .pipe(
              switchMap((popupResponse) => {
                return this.authenticationService
                  .claimThirdPartyRequest({
                    providerName: provider,
                    code: popupResponse.code,
                  })
                  .pipe(
                    tap((response) => {
                      if (popupResponse) {
                        this.authenticationService.saveUser(response);
                        this.redirectService.redirect();
                      }
                    }),
                    map(() => {
                      return void 0;
                    })
                  );
              })
            );
        })
      );
  }
}
