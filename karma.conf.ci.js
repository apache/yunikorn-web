// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

process.env.CHROME_BIN = require('puppeteer').executablePath();

module.exports = function(config) {
  config.set({
    basePath: '',
    frameworks: ['jasmine', '@angular-devkit/build-angular'],
    plugins: [
      require('karma-jasmine'),
      require('karma-chrome-launcher'),
      require('karma-jasmine-html-reporter'),
      require('karma-coverage-istanbul-reporter'),
      require('@angular-devkit/build-angular/plugins/karma'),
      require('karma-super-dots-reporter')
    ],
    client: {
      clearContext: false // leave Jasmine Spec Runner output visible in browser
    },
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, './coverage/yunikorn-web'),
      reports: ['text-summary'],
      fixWebpackSourcePaths: true
    },
    reporters: ['super-dots'],
    superDotsReporter: {
      nbDotsPerLine: 180
    },
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['ChromeHeadless'],
    captureTimeout: 180000,
    browserDisconnectTolerance: 3,
    browserDisconnectTimeout: 180000,
    browserNoActivityTimeout: 180000,
    singleRun: true,
    restartOnFileChange: true
  });
};
