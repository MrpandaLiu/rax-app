const path = require('path');

module.exports = (applyMethod) => {
  applyMethod('addPluginTemplate', path.join(__dirname, 'templates'));
  applyMethod('addAppConfigTypes', { exportName: 'renderComponent?: FrameworkComponentType' });
};
