// / <reference types="cypress" />
// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)

/**
 * @type {Cypress.PluginConfig}
 */
module.exports = (on /* , config */) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config
  on('before:browser:launch', (browser = {}, launchOptions) => {
    if (browser.family === 'chromium' && browser.name !== 'electron') {
      // Mac/Linux
      launchOptions.args.push('--enable-webgl2-compute-context');
      // TODO Remove the 2 --use-fake-... if they are actually defaults like on issue cypress/2704
      launchOptions.args.push('--use-fake-device-for-media-stream');
      launchOptions.args.push('--use-fake-ui-for-media-stream');
      launchOptions.args.push(
        '--use-file-for-fake-video-capture=cypress/fixtures/deadline_cif.y4m'
      );

      // Windows
      // launchOptions.args.push('--use-file-for-fake-video-capture=c:\\path\\to\\video\\my-video.y4m')
    }

    return launchOptions;
  });
};
