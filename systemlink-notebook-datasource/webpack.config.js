const { getPluginId } = require('@grafana/toolkit/src/config/utils/getPluginId')

module.exports.getWebpackConfig = (config, options) => {
  // Works around a bug in Grafana that prevents external fonts from being loaded when Grafana
  // is served behind a subpath. This can be removed as soon as they fix the issue.
  const fontsRule = config.module.rules.find(rule => rule.options && rule.options.outputPath === 'fonts');
  fontsRule.options.publicPath = `public/plugins/${getPluginId()}/fonts`;
  return config;
};
