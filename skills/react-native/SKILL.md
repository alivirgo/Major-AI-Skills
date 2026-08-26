---
name: react-native
description: "Operational skill for React Native: core components, navigation, native modules awareness, New Architecture notes, and release builds."
category: development
risk: safe
source: self
source_type: self
date_added: "2026-08-26"
tags: ["react-native", "mobile", "expo", "navigation", "javascript", "claude"]
tools: ["claude", "cursor", "gemini", "codex"]
---

# React Native Mobile AI Skill Guide

## Overview & Engine Architecture

React Native renders React component trees to native views (via the bridge or the New Architecture/JSI). Styling uses a Flexbox-like StyleSheet subset - not full browser CSS. Agents stick to platform-safe APIs, isolate native module usage, prefer well-maintained navigation (React Navigation), and clarify Expo managed vs bare workflow before adding native code.

```
JS/TS React tree
      |
  Fabric / Bridge
      |
  Native views (UIKit / Android Views)
```

## When to use this skill

- Building cross-platform mobile apps with React Native
- Choosing Expo vs bare / adding native dependencies
- Fixing platform-specific UI and permission issues
- Preparing Android/iOS release builds

## Operational directives

1. Use core components (`View`, `Text`, `Pressable`) - not DOM tags.
2. Decide Expo vs bare early; native modules may require prebuild/eject paths.
3. Handle permissions and secure storage with maintained libraries - not ad-hoc.
4. Keep lists virtualized (`FlatList` / `FlashList`) for long data.
5. Never ship `__DEV__`-only debug tools or hardcoded API secrets in release.

## Screen sketch

```tsx
import { useState } from "react";
import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";

export function AddItem({ onAdd }: { onAdd: () => Promise<void> }) {
  const [busy, setBusy] = useState(false);

  async function handlePress() {
    if (busy) return;
    setBusy(true);
    try {
      await onAdd();
    } finally {
      setBusy(false);
    }
  }

  return (
    <View style={styles.row}>
      <Pressable onPress={handlePress} disabled={busy} style={styles.btn}>
        {busy ? <ActivityIndicator /> : <Text style={styles.label}>Add item</Text>}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: { padding: 16 },
  btn: { paddingVertical: 12, paddingHorizontal: 16, backgroundColor: "#222" },
  label: { color: "#fff", fontWeight: "600" },
});
```

## Commands

```bash
npx create-expo-app@latest
npx expo start
npx react-native run-android
npx react-native run-ios
cd android && ./gradlew assembleRelease
```

## Common pitfalls

| Pitfall | Why it hurts | Fix |
| --- | --- | --- |
| Using web-only APIs | Runtime crashes | Platform checks / RN APIs |
| Unvirtualized long maps | Jank | FlatList/FlashList |
| Ignoring safe areas | Notch clipping | SafeAreaProvider |
| Mismatched native versions | Build failures | Align RN + pod/gradle |

## Best practices

- Centralize API clients and env via Expo config or react-native-config.
- Test on real devices for permissions, push, and performance.
- Use TypeScript and strict navigation param types.
- Keep OTA updates (EAS Update) coordinated with native binary versions.

## Limitations

- Not every npm package works in RN - verify native deps.
- New Architecture adoption depends on library support.
- Background tasks and Bluetooth remain platform-specific.

## Related skills

- `@react` - component and hooks fundamentals
- `@android-studio` / `@xcode-ios` - native build tooling
- `@firebase` - auth/push/analytics backends
