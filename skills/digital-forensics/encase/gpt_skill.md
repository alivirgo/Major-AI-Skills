---
title: "OpenText EnCase Forensic AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize OpenText EnCase Forensic, EnScript programming language, and automated Evidence Processor pipelines."
category: "Enterprise Digital Forensics & eDiscovery"
tags: ["encase", "enscript-api", "digital-forensics", "gpt-codex", "dfir-automation", "evidence-processor"]
---

# OpenText EnCase Forensic AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
OpenText EnCase Forensic provides a strongly typed, object-oriented scripting runtime (**EnScript**) with comprehensive access to evidence objects, filesystems, compound archives, and bookmark databases. GPT/Codex acts as a Principal Forensic Automation Developer and EnScript Architect, delivering **custom EnScript utilities**, **automated Evidence Processor condition builders**, **registry artifact parsers**, and **headless CLI batch scripts**.

### EnScript API Architecture & Object Model

```
┌─────────────────────────────────────────────────────────────┐
│                 EnScript Object Hierarchy                   │
│                                                             │
│  Case & Evidence Hierarchy                                  │
│  ├── `CaseClass` (Active Case Session & Metadata)           │
│  ├── `ItemClass` $\rightarrow$ `EntryClass` (File Tree Node)│
│  └── `EvidenceClass` (Physical & Logical Image Context)     │
│                                                             │
│  Forensic Artifacts & Output Model                          │
│  ├── `BookmarkClass` (Evidence Tagging & Comment Tree)      │
│  ├── `FileClass` (Direct Binary Byte Stream I/O)            │
│  └── `SearchClass` (Multi-Threaded Regex Pattern Matcher)   │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **EnScript Object-Oriented Development**: Author syntactically correct EnScript classes (`class MainClass`, `EntryClass`, `BookmarkClass`, `DateClass`) incorporating error handling and memory cleanup.
2. **Automated Keyword & Hash Condition Formulation**: Programmatically generate EnCase Condition filters (`.SearchFilter`) matching hash lists, file size ranges, and file extensions.
3. **Compound Archive & Email Parser Automation**: Script the automated recursive expansion of PST, OST, MBOX, and ZIP containers into the case hierarchy.
4. **Registry & EVTX Parser Scripts**: Author EnScripts to extract specific subkeys (`Software\Microsoft\Windows\CurrentVersion\Run`) and export values to tab-delimited files.

---

## Production EnScript Automation: Registry Autorun Key Harvester

Save this script as `HarvestAutoruns.EnScript` and compile inside EnCase:

```csharp
// EnScript: Automated Registry Autorun Key Harvester
class MainClass {
  void Main(CaseClass c) {
    if (!c) {
      SystemClass::Message(SystemClass::MB_ICONEXCLAMATION, "Error", "No active case found.");
      return;
    }

    String exportPath = "C:\\Export\\Registry_Autoruns.tsv";
    FileClass exportFile();
    if (!exportFile.Open(exportPath, FileClass::WRITE)) {
      SystemClass::Message(SystemClass::MB_ICONSTOP, "Error", "Could not open output file for writing.");
      return;
    }

    exportFile.WriteLine("Case Name\tFile Name\tFile Path\tLogical Size\tLast Written Date");

    uint count = 0;
    for (ItemIteratorClass iter(c); ItemClass item = iter.GetNextItem();) {
      EntryClass entry = EntryClass::List(item);
      if (entry) {
        ScanForRegistryHives(entry, exportFile, count, c.Name());
      }
    }

    exportFile.Close();
    SystemClass::Message(SystemClass::MB_ICONINFORMATION, "Complete", 
      String::Format("Harvested {0} Registry Hive files to: {1}", count, exportPath));
  }

  void ScanForRegistryHives(EntryClass entry, FileClass exportFile, uint &count, String caseName) {
    String name = entry.Name().ToLower();
    
    // Check for standard Windows Registry Hives
    if (name.Compare("system") == 0 || name.Compare("software") == 0 || name.Compare("ntuser.dat") == 0 || name.Compare("sam") == 0) {
      exportFile.WriteLine(String::Format("{0}\t{1}\t{2}\t{3}\t{4}", 
        caseName, entry.Name(), entry.FullPath(), entry.LogicalSize(), entry.LastWriteTime().GetString()));
      count++;
    }

    for (EntryClass child = entry.FirstChild(); child; child = child.Next()) {
      ScanForRegistryHives(child, exportFile, count, caseName);
    }
  }
}
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`EnScript Error: Null object reference at line XX`** | Accessing methods on a null `EntryClass` or uninitialized `BookmarkClass` instance. | 1. Always check `if (entry)` and `if (c)` before calling member functions.<br>2. Handle empty directories gracefully in recursive functions. |
| **`FileClass::Open()` Fails with Return False** | Target export path is write-protected or contains invalid filename characters. | 1. Verify directory exists before opening file.<br>2. Sanitize output filename strings using `String::Replace()`. |
| **Evidence Processor Memory Exhaustion (OOM)** | Memory leak in custom EnScript keeping large binary arrays allocated in global variables. | 1. Scope variables locally within loop iterations.<br>2. Call `.Close()` on all `FileClass` instances. |
| **EnScript Execution Hangs on Large Evidence Set** | Single-threaded synchronous UI execution without yielding to the message queue. | Add periodic progress updates to allow GUI responsiveness. |

---

## Command Line Syntax & Batch Processing

```bash
# Execute EnCase with Auto-Run Script
"C:\Program Files\OpenText\EnCase\EnCase.exe" -runscript "C:\EnScripts\HarvestAutoruns.EnScript"

# Verify E01 Checksum via CLI
ewfverify "C:\Evidence\evidence_01.E01"
```

### Essential File Locations
- **EnScript User Library**: `%USERPROFILE%\Documents\EnCase\EnScripts`
- **EnCase Configuration Files**: `C:\Program Files\OpenText\EnCase\Config`

---

## Agent Operational Directive
> **MANDATORY**: EnScript code must perform null-checks on all `CaseClass` and `EntryClass` pointers before calling methods. Always close `FileClass` objects to release system file handles.
