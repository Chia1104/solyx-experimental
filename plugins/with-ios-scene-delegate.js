const path = require('path');
const fs = require('fs');
const {
  withDangerousMod,
  withXcodeProject,
  withAppDelegate,
  withInfoPlist,
  withPlugins,
  createRunOncePlugin,
  IOSConfig,
} = require('@expo/config-plugins');

// React Native module name used by the Expo prebuild template (factory.startReactNative(withModuleName:)).
const RN_MODULE_NAME = 'main';
// Background color shown by the window before the RN root view renders. Matches app.config.ts backgroundColor.
const WINDOW_BG = { red: 0.969, green: 0.969, blue: 0.969, alpha: 1.0 };

const SCENE_DELEGATE_FILENAME = 'SceneDelegate.swift';

function sceneDelegateSource() {
  return `import UIKit
import React

// Scene-based life cycle (UIScene). iOS 27 SDK 必要，見 Apple TN3187。
// 由 plugins/with-ios-scene-delegate.js 注入，請勿手改（會被 prebuild 覆蓋）。
class SceneDelegate: UIResponder, UIWindowSceneDelegate {
  var window: UIWindow?

  func scene(
    _ scene: UIScene,
    willConnectTo session: UISceneSession,
    options connectionOptions: UIScene.ConnectionOptions
  ) {
    guard let windowScene = scene as? UIWindowScene else { return }

    // 從 AppDelegate 取得已建立的 React Native factory
    guard
      let appDelegate = UIApplication.shared.delegate as? AppDelegate,
      let factory = appDelegate.reactNativeFactory
    else { return }

    // 1. 用 windowScene 建立 window（Scene-based life cycle 要求）
    let window = UIWindow(windowScene: windowScene)
    self.window = window

    // 2. 啟動 React Native（模組名稱與 AppDelegate 原本一致）
    factory.startReactNative(
      withModuleName: "${RN_MODULE_NAME}",
      in: window,
      launchOptions: nil
    )

    // 3. window 背景色，避免 RN 掛載前閃黑
    if let rootViewController = window.rootViewController {
      rootViewController.view.backgroundColor = UIColor(
        red: ${WINDOW_BG.red},
        green: ${WINDOW_BG.green},
        blue: ${WINDOW_BG.blue},
        alpha: ${WINDOW_BG.alpha}
      )
    }

    // 4. 冷啟動的 Deep Linking（app 由 URL scheme 啟動）
    if let urlContext = connectionOptions.urlContexts.first {
      RCTLinkingManager.application(
        UIApplication.shared,
        open: urlContext.url,
        options: [:]
      )
    }

    // 5. 冷啟動的 Universal Links（app 由 universal link 啟動）
    if let userActivity = connectionOptions.userActivities.first {
      RCTLinkingManager.application(
        UIApplication.shared,
        continue: userActivity,
        restorationHandler: { _ in }
      )
    }
  }

  // 6. App 運行中收到 Deep Link
  func scene(_ scene: UIScene, openURLContexts URLContexts: Set<UIOpenURLContext>) {
    guard let url = URLContexts.first?.url else { return }
    RCTLinkingManager.application(
      UIApplication.shared,
      open: url,
      options: [:]
    )
  }

  // 7. App 運行中收到 Universal Link
  func scene(_ scene: UIScene, continue userActivity: NSUserActivity) {
    RCTLinkingManager.application(
      UIApplication.shared,
      continue: userActivity,
      restorationHandler: { _ in }
    )
  }
}
`;
}

// 1. 把 SceneDelegate.swift 寫進 ios/<projectName>/
function withSceneDelegateFile(config) {
  return withDangerousMod(config, [
    'ios',
    config => {
      const projectName = config.modRequest.projectName;
      const dir = path.join(config.modRequest.platformProjectRoot, projectName);
      fs.writeFileSync(path.join(dir, SCENE_DELEGATE_FILENAME), sceneDelegateSource());
      return config;
    },
  ]);
}

// 2. 把 SceneDelegate.swift 註冊進 pbxproj（file ref + build sources）
function withSceneDelegatePbxproj(config) {
  return withXcodeProject(config, config => {
    const projectName = config.modRequest.projectName;
    const filepath = `${projectName}/${SCENE_DELEGATE_FILENAME}`;
    const project = config.modResults;
    // 避免 incremental prebuild 重複加入
    if (!project.hasFile(filepath)) {
      IOSConfig.XcodeUtils.addBuildSourceFileToGroup({
        filepath,
        groupName: projectName,
        project,
      });
    }
    return config;
  });
}

// 3. 改 AppDelegate：移除 window 建立 + startReactNative，保留 FirebaseApp.configure()
function withAppDelegateSceneMigration(config) {
  return withAppDelegate(config, config => {
    if (config.modResults.language !== 'swift') {
      throw new Error('[with-ios-scene-delegate] expected a Swift AppDelegate');
    }
    let contents = config.modResults.contents;
    // 已經遷移過就跳過（idempotent）
    if (!/window\s*=\s*UIWindow\(frame:\s*UIScreen\.main\.bounds\)/.test(contents)) {
      return config;
    }
    // 移除 window 建立（保留下一行的 @generated firebase block）
    contents = contents.replace(/^[ \t]*window = UIWindow\(frame: UIScreen\.main\.bounds\)\n/m, '');
    // 移除 startReactNative(... in: window ...) 整段呼叫；window 改由 SceneDelegate 啟動
    contents = contents.replace(
      /^[ \t]*factory\.startReactNative\([\s\S]*?launchOptions: launchOptions\)\n/m,
      '',
    );
    config.modResults.contents = contents;
    return config;
  });
}

// 4. Info.plist 加入 UIApplicationSceneManifest
function withSceneManifest(config) {
  return withInfoPlist(config, config => {
    config.modResults.UIApplicationSceneManifest = {
      UIApplicationSupportsMultipleScenes: false,
      UISceneConfigurations: {
        UIWindowSceneSessionRoleApplication: [
          {
            UISceneConfigurationName: 'Default Configuration',
            UISceneDelegateClassName: '$(PRODUCT_MODULE_NAME).SceneDelegate',
          },
        ],
      },
    };
    return config;
  });
}

function withIosSceneDelegate(config) {
  return withPlugins(config, [
    withSceneDelegateFile,
    withSceneDelegatePbxproj,
    withAppDelegateSceneMigration,
    withSceneManifest,
  ]);
}

module.exports = createRunOncePlugin(withIosSceneDelegate, 'with-ios-scene-delegate', '1.0.0');
