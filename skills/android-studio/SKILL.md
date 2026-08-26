---
name: android-studio
description: "Operational skill for Android Studio: Gradle projects, emulators, Logcat, build variants, signing configs, and AGP troubleshooting."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["android-studio", "android", "gradle", "emulator", "kotlin", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# Android Studio IDE AI Skill Guide

## Overview & Engine Architecture

Android Studio (IntelliJ-based) manages Android Gradle Plugin (AGP) projects, SDK platforms, emulators (AVD), and profiling tools. Builds flow through Gradle tasks into APK/AAB artifacts. Agents align JDK, AGP, and `compileSdk`/`targetSdk`, use build variants for debug/release, and diagnose failures via Build Analyzer and Logcat rather than guessing.

```
Android Studio
  -> Gradle (AGP)
      -> compile / package
          -> APK or AAB
  -> AVD / device
      -> Logcat / Profiler
```

## When to use this skill

- Creating or importing Android/Gradle apps
- Fixing SDK, JDK, or AGP version mismatches
- Configuring product flavors and signing
- Debugging crashes with Logcat and breakpoints

## Operational directives

1. Match JDK version to AGP requirements (often JDK 17 for modern AGP).
2. Bump `compileSdk`/`targetSdk` deliberately; read behavior changes for the new API level.
3. Keep `keystore` paths and passwords out of VCS - use env or local `keystore.properties`.
4. Prefer App Bundle (AAB) for Play uploads.
5. Reproduce device-only bugs on an AVD/API level close to the crash report.

## Gradle sketch (`app/build.gradle.kts` fragment)

```kotlin
android {
  namespace = "com.example.inventory"
  compileSdk = 35

  defaultConfig {
    applicationId = "com.example.inventory"
    minSdk = 26
    targetSdk = 35
    versionCode = 3
    versionName = "1.2.0"
  }

  buildTypes {
    release {
      isMinifyEnabled = true
      proguardFiles(
        getDefaultProguardFile("proguard-android-optimize.txt"),
        "proguard-rules.pro"
      )
    }
  }
}
```

## Commands

```bash
./gradlew assembleDebug
./gradlew bundleRelease
./gradlew test
adb logcat -c && adb logcat *:E
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Wrong JDK for AGP | Cryptic Gradle errors | Install/select correct JDK |
| Committing keystores | Security incident | gitignore + CI secrets |
| Ignoring API behavior changes | Prod regressions | Read platform notes |
| Emulator-only testing | Hardware surprises | Device farm / real devices |

## Best practices

- Use Android Studio's Layout Inspector and App Inspection for UI/DB issues.
- Enable Crashlytics or equivalent for release builds.
- Keep Gradle Wrapper committed; do not rely on global Gradle alone.
- Split flavors for white-label carefully - avoid combinatorial explosion.

## Limitations

- NDK/CMake native builds add toolchain complexity beyond this skill.
- Instant Run / Apply Changes quirks still require clean rebuilds sometimes.
- Corporate proxy/SDK license acceptance can block CI agents.

## Related skills

- `@kotlin` - language and coroutines on Android
- `@react-native` / `@flutter` - cross-platform apps that still need Android Studio
- `@firebase` - common Android backend services
