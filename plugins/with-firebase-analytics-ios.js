const { withPodfile, withPlugins, createRunOncePlugin } = require('@expo/config-plugins');
const {
  mergeContents,
  removeGeneratedContents,
} = require('@expo/config-plugins/build/utils/generateCode');

const ANCHOR = /prepare_react_native_project!/;

function setPodfileFlag(src, tag, flag, enabled) {
  if (!enabled) {
    return removeGeneratedContents(src, tag) ?? src;
  }

  return mergeContents({
    src,
    newSrc: flag,
    tag,
    anchor: ANCHOR,
    offset: 1,
    comment: '#',
  }).contents;
}

function withIosWithoutAdIdSupport(config, props) {
  return withPodfile(config, config => {
    config.modResults.contents = setPodfileFlag(
      config.modResults.contents,
      '@react-native-firebase/analytics-withoutAdIdSupport',
      '$RNFirebaseAnalyticsWithoutAdIdSupport = true',
      props?.ios?.withoutAdIdSupport === true,
    );
    return config;
  });
}

function withIosGoogleAppMeasurementOnDeviceConversion(config, props) {
  return withPodfile(config, config => {
    config.modResults.contents = setPodfileFlag(
      config.modResults.contents,
      '@react-native-firebase/analytics-googleAppMeasurementOnDeviceConversion',
      '$RNFirebaseAnalyticsGoogleAppMeasurementOnDeviceConversion = true',
      props?.ios?.googleAppMeasurementOnDeviceConversion === true,
    );
    return config;
  });
}

function withFirebaseAnalyticsIos(config, props) {
  return withPlugins(config, [
    [withIosWithoutAdIdSupport, props],
    [withIosGoogleAppMeasurementOnDeviceConversion, props],
  ]);
}

module.exports = createRunOncePlugin(
  withFirebaseAnalyticsIos,
  'with-firebase-analytics-ios',
  '1.0.0',
);
