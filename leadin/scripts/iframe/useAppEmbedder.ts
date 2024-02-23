import { useEffect } from 'react';
import {
  accountName,
  adminUrl,
  deviceId,
  hubspotBaseUrl,
  leadinQueryParams,
  locale,
  plugins,
  portalDomain,
  portalEmail,
  portalId,
  reviewSkippedDate,
  refreshToken,
  impactLink,
  theme,
} from '../constants/leadinConfig';
import { App, AppIframe } from './constants';
import { messageMiddleware } from './messageMiddleware';
import { resizeWindow, useIframeNotRendered } from '../utils/iframe';

const getLeadinConfig = () => {
  const utm_query_params = Object.keys(leadinQueryParams)
    .filter(x => /^utm/.test(x))
    .reduce(
      (p: { [key: string]: string }, c: string) => ({
        [c]: leadinQueryParams[c],
        ...p,
      }),
      {}
    );
  return {
    accountName,
    adminUrl,
    company: leadinQueryParams.company,
    deviceId,
    email: leadinQueryParams.email,
    firstName: leadinQueryParams.firstName,
    irclickid: leadinQueryParams.irclickid,
    lastName: leadinQueryParams.lastName,
    mpid: leadinQueryParams.mpid,
    nonce: leadinQueryParams.nonce,
    plugins,
    portalDomain,
    portalEmail,
    portalId,
    reviewSkippedDate,
    theme,
    trackConsent: leadinQueryParams.trackConsent,
    websiteName: leadinQueryParams.websiteName,
    admin: leadinQueryParams.admin,
    justConnected: leadinQueryParams.justConnected,
    ...utm_query_params,
  };
};

const getAppOptions = (app: App, createRoute = false) => {
  const {
    IntegratedAppOptions,
    FormsAppOptions,
    LiveChatAppOptions,
    PluginAppOptions,
  }: any = window;
  let options;

  switch (app) {
    case App.Plugin:
      options = new PluginAppOptions().setLeadinConfig(getLeadinConfig());
      break;
    case App.PluginSettings:
      options = new PluginAppOptions()
        .setLeadinConfig(getLeadinConfig())
        .setPluginSettingsInit();
      break;
    case App.Forms:
      options = new FormsAppOptions();
      if (createRoute) {
        options = options.setCreateFormAppInit();
      }
      break;
    case App.LiveChat:
      options = new LiveChatAppOptions();
      if (createRoute) {
        options = options.setCreateLiveChatAppInit();
      }
      break;
    default:
      options = new IntegratedAppOptions();
  }

  return options;
};

export default function useAppEmbedder(
  app: App,
  createRoute: boolean,
  container: HTMLElement | null
) {
  const iframeNotRendered = useIframeNotRendered(AppIframe[app]);

  useEffect(() => {
    const { IntegratedAppEmbedder }: any = window;

    if (IntegratedAppEmbedder) {
      const options = getAppOptions(app, createRoute)
        .setLocale(locale)
        .setDeviceId(deviceId)
        .setRefreshToken(refreshToken);

      const embedder = new IntegratedAppEmbedder(
        AppIframe[app],
        portalId,
        hubspotBaseUrl,
        resizeWindow,
        refreshToken ? '' : impactLink
      ).setOptions(options);

      embedder.subscribe(messageMiddleware(embedder));
      embedder.attachTo(container, true);
      embedder.postStartAppMessage(); // lets the app know all all data has been passed to it

      (window as any).embedder = embedder;
    }
  }, []);

  return iframeNotRendered;
}
