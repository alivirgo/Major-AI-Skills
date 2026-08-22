---
title: "Horos Open-Source DICOM Viewer AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize Horos, Objective-C Plugin SDK (PluginFilter), XML-RPC APIs, and automated DICOM anonymizers."
category: "Open Source DICOM Viewer & Medical Imaging"
tags: ["horos", "objective-c-plugin", "pluginfilter", "xml-rpc", "gpt-codex", "dicom-anonymizer"]
---

# Horos Open-Source DICOM Viewer AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
Horos exposes an Objective-C **Plugin SDK (`PluginFilter`)**, an embedded **XML-RPC Server**, and direct file-based database integrations. GPT/Codex acts as a Principal Medical Imaging Software Engineer and Horos Plugin Developer, delivering **native Objective-C / Cocoa plugins**, **XML-RPC client automation scripts**, **automated HIPAA-compliant DICOM anonymizers**, and **WADO-RS / DICOMweb query pipelines**.

### Developer Architecture & Plugin SDK Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 Horos Developer Platform                    │
│                                                             │
│  Objective-C Plugin SDK Hierarchy                           │
│  ├── `PluginFilter` Base Class (`initPlugin`, `filterImage`)│
│  ├── `ViewerController` (Access to 2D Pixel Arrays & ROIs)  │
│  └── `DCMPix` (Float Pixel Buffers & Resampling Transforms) │
│                                                             │
│  Inter-Process & DICOMweb Integration                       │
│  ├── Embedded XML-RPC Server (Port 2056 / Remote Control)   │
│  ├── DICOMweb Protocol (WADO-RS, QIDO-RS, STOW-RS Client)   │
│  └── Python PyDICOM / Batch Pipeline Scripts                │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **Objective-C `PluginFilter` Development**: Author clean Cocoa plugins inheriting from `PluginFilter`, accessing raw image float buffers (`[curDCM fImage]`), and modifying ROI polygons.
2. **XML-RPC Scripting Automation**: Build Python scripts communicating with Horos's internal XML-RPC server (`http://localhost:2056`) to load studies, trigger filters, and close viewports.
3. **Automated HIPAA DICOM Anonymization**: Script robust Python pipelines stripping patient names, birth dates, institution identifiers, and private sequence elements while synthesizing consistent UID mappings.
4. **WADO-RS & DICOMweb Integration**: Construct automated retrieval pipelines pulling DICOM instances from cloud object storage and loading them into the Horos active viewport.

---

## Production Objective-C Plugin Code: Custom Horos Pixel Inversion Filter (`PluginFilter`)

Save this file as `CustomInversionFilter.m` within an Xcode Horos Plugin Project:

```objc
// ==============================================================================
// Horos Objective-C Plugin: Custom Pixel Inversion Filter
// Demonstrates PluginFilter architecture, accessing 2D float pixel arrays directly.
// ==============================================================================
#import <Foundation/Foundation.h>
#import "PluginFilter.h"
#import "DCMPix.h"
#import "ViewerController.h"

@interface CustomInversionFilter : PluginFilter
- (long) filterImage:(NSString*) menuName;
@end

@implementation CustomInversionFilter

- (void) initPlugin {
    NSLog(@"[HorosPlugin] CustomInversionFilter initialized successfully.");
}

- (long) filterImage:(NSString*) menuName {
    // 1. Get Current Viewer Controller and Active 2D Slice
    ViewerController *currentViewer = [self currentViewer];
    if (!currentViewer) {
        NSRunAlertPanel(@"Error", @"No active 2D viewer window detected.", @"OK", nil, nil);
        return -1;
    }

    DCMPix *curPix = [[currentViewer pixList] objectAtIndex:[[currentViewer imageView] curImage]];
    float *fImage = [curPix fImage];
    long pCount = [curPix pheight] * [curPix pwidth];

    // 2. Compute Max Value for Inversion
    float maxVal = -100000.0;
    for (long i = 0; i < pCount; i++) {
        if (fImage[i] > maxVal) {
            maxVal = fImage[i];
        }
    }

    // 3. Invert Pixel Array Values In-Place
    for (long i = 0; i < pCount; i++) {
        fImage[i] = maxVal - fImage[i];
    }

    // 4. Notify Viewport of Modified Pixel Buffer
    [curPix checkMinMax];
    [[currentViewer imageView] setNeedsDisplay:YES];
    [[currentViewer imageView] sendNavigationInfo];

    NSLog(@"[HorosPlugin] Successfully inverted %ld pixels.", pCount);
    return 0; // Success
}

@end
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **Plugin Fails to Load on Startup** | Plugin compiled for wrong architecture (e.g. x86_64 only on Apple Silicon ARM64 host). | In Xcode, set **Build Active Architecture Only** to `No` and target `Standard Architectures (Universal Binary)`. |
| **XML-RPC Server Returns `Connection Refused`** | XML-RPC interface disabled in Horos preferences. | In Horos Preferences $\rightarrow$ **Web Server / XML-RPC**, check **Enable XML-RPC Server** on port 2056. |
| **`EXC_BAD_ACCESS` in `[curPix fImage]`** | Accessing pixel array out-of-bounds or slice list index invalid during cine playback. | Wrap array access with bounds checking (`pCount = [curPix pheight] * [curPix pwidth]`). |
| **Anonymized DICOM Cannot Be Opened** | Anonymizer stripped required Type 1 DICOM tags (`SOPClassUID`, `SOPInstanceUID`). | Preserve Type 1 mandatory structural tags while pseudorandomizing Patient and Study UIDs. |

---

## Command Line Syntax & Batch Processing

```bash
# Query Horos XML-RPC Server Status via Python
python3 -c "import xmlrpc.client; s = xmlrpc.client.ServerProxy('http://localhost:2056'); print(s.version())"

# Install Compiled Plugin Bundle to Horos User Directory
cp -r CustomFilter.horosplugin ~/Library/Application\ Support/Horos/Plugins/
```

### Essential File Locations
- **Installed Horos Plugins**: `~/Library/Application Support/Horos/Plugins/`
- **Plugin SDK Headers**: Available in Horos open-source GitHub repository

---

## Agent Operational Directive
> **MANDATORY**: When compiling Objective-C plugins for modern macOS, always build Universal Binaries (`arm64` + `x86_64`) to guarantee native execution on both Apple Silicon and Intel hardware.
