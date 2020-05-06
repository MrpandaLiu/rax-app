const MiniAppRuntimePlugin = require('rax-miniapp-runtime-webpack-plugin');
const MiniAppConfigPlugin = require('rax-miniapp-config-webpack-plugin');
const getWebpackBase = require('../../getWebpackBase');
const getAppConfig = require('../getAppConfig');
const setEntry = require('./setEntry');
const getMiniAppOutput = require('../getOutputPath');

const MiniAppPreComplieLoader = require.resolve('../../../loaders/MiniAppPreComplieLoader');

module.exports = (context, target, options) => {
  const { rootDir, command } = context;
  const outputPath = getMiniAppOutput(context, { target });

  const config = getWebpackBase(context, {
    disableRegenerator: false
  }, target);
  const appConfig = getAppConfig(rootDir, target);
  setEntry(config, context, appConfig.routes);

  // Using Components
  const usingComponents = [];
  // Native lifecycle map
  const nativeLifeCycleMap = {};
  // Collect handled pages
  const handledPages = [];
  // Remove all app.json before it
  config.module.rule('appJSON').uses.clear();

  config.module
    .rule('json')
    .test(/\.json$/)
    .use('json-loader')
    .loader(require.resolve('json-loader'));

  config.output
    .filename(`${target}/common/[name].js`)
    .library('createApp')
    .libraryExport('default')
    .libraryTarget('window');

  config.module.rule('jsx')
    .use('miniapp-pre-complie-loader')
    .loader(MiniAppPreComplieLoader)
    .options({
      usingComponents,
      routes: appConfig.routes,
      nativeLifeCycleMap,
      handledPages
    });

  // Split common chunks
  config.optimization.splitChunks({
    cacheGroups: {
      commons: {
        name: 'vendor',
        chunks: 'all',
        minChunks: 2
      }
    }
  });
  // 2MB
  config.performance.maxEntrypointSize(2097152);
  // 1.5MB
  config.performance.maxAssetSize(1572864);

  config.plugin('MiniAppConfigPlugin').use(MiniAppConfigPlugin, [
    {
      type: 'runtime',
      appConfig,
      outputPath,
      target,
      getAppConfig,
      nativeConfig: options[target] && options[target].nativeConfig,
    }
  ]);
  config.plugin('MiniAppRuntimePlugin').use(MiniAppRuntimePlugin, [
    {
      ...appConfig,
      target,
      config: options[target],
      usingComponents,
      nativeLifeCycleMap,
      rootDir,
      command
    }
  ]);

  config.devServer.writeToDisk(true).noInfo(true).inline(false);
  config.devtool('none');
  return config;
};
