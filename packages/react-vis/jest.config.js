/*eslint-env node*/
const path = require('path');

module.exports = {
  transform: {
    '^.+\\.[jt]sx?$': path.resolve(__dirname, './jestBabelTransform.js')
  },
  setupFilesAfterEnv: ['./jest.setup.js'],
  snapshotSerializers: ['enzyme-to-json/serializer'],
  transformIgnorePatterns: [
    '/node_modules/(?!(d3-color|d3-scale|d3-interpolate|d3-hierarchy|d3-format|d3-shape|d3-array|d3-contour|d3-path|internmap|d3-time|d3-geo))'
  ],
  modulePaths: [path.resolve(__dirname, 'src')],
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],
  testMatch: ['**/?(*.)+(test).[jt]s?(x)']
};
