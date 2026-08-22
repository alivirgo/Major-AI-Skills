---
title: "ServiceNow Enterprise Desktop & MID Server AI Skill Guide (GPT & Codex)"
description: "Comprehensive operational skill specification for OpenAI GPT and Codex to automate, script, troubleshoot, and optimize ServiceNow server-side JavaScript, GlideRecord APIs, Script Includes, and Table REST APIs."
category: "IT Service Management & Desktop Agent"
tags: ["servicenow", "gliderecord", "script-includes", "gpt-codex", "business-rules", "table-api"]
---

# ServiceNow Enterprise Desktop & MID Server AI Skill Guide (GPT & Codex)

## Overview & Engine Architecture
ServiceNow provides a JavaScript runtime engine (Rhino / ECMAScript 2021) and a comprehensive Table REST API for programmatic automation. GPT/Codex acts as a Principal ServiceNow Developer and Enterprise Automation Engineer, delivering **performant GlideRecord / GlideAggregate scripts**, **object-oriented Script Includes**, **advanced Business Rules**, and **Python Table API client SDKs**.

### Developer Architecture & Glide Execution Stack

```
┌─────────────────────────────────────────────────────────────┐
│                 ServiceNow Developer Platform               │
│                                                             │
│  Server-Side JavaScript Engine                              │
│  ├── `GlideRecord` / `GlideRecordSecure` (ORM Data Engine)  │
│  ├── `GlideAggregate` (High-Performance SQL Aggregations)   │
│  └── Object-Oriented Script Includes & REST Scripted APIs   │
│                                                             │
│  Event & Integration Layer                                  │
│  ├── Business Rules (Before, After, Async, Display)         │
│  ├── Scripted REST API Endpoints (`/api/custom/...`)        │
│  └── MID Server Script Includes & Orchestration Probes      │
└─────────────────────────────────────────────────────────────┘
```

---

## Operational Capabilities & Agent Directives

1. **GlideRecord & GlideAggregate Best Practices**: Author clean, scalable server-side JavaScript scripts utilizing `GlideAggregate` for count/sum queries instead of looping over entire table `GlideRecord` sets.
2. **Modular Script Includes**: Construct class-based Script Includes implementing initialization, prototype methods, and access control decorators.
3. **Scripted REST API Development**: Author custom REST API endpoints (`/api/x_custom/v1/`) with request validation, structured JSON responses, and HTTP error codes.
4. **Asynchronous Business Rules**: Script `async` business rules for heavy processing (e.g. external integrations, outbound REST webhooks) to avoid blocking end-user UI transactions.

---

## Production ServiceNow JavaScript: High-Performance Script Include

Save this script as a Server-Side **Script Include** named `CMDBHealthAuditor` (Client Callable: False):

```javascript
// ------------------------------------------------------------------------------
// ServiceNow Script Include: CMDBHealthAuditor
// Audits CMDB CI server health and generates summary counts using GlideAggregate.
// ------------------------------------------------------------------------------
var CMDBHealthAuditor = Class.create();
CMDBHealthAuditor.prototype = {
  initialize: function() {
    this.SERVER_TABLE = 'cmdb_ci_server';
  },

  /**
   * Returns count of active server CIs grouped by Operating System.
   * Uses GlideAggregate for sub-millisecond database grouping.
   */
  getOSDistribution: function() {
    var osCounts = {};
    var ga = new GlideAggregate(this.SERVER_TABLE);
    ga.addQuery('install_status', '1'); // Installed / Active
    ga.addNotNullQuery('os');
    ga.addAggregate('COUNT', 'os');
    ga.groupBy('os');
    ga.query();

    while (ga.next()) {
      var osName = ga.getValue('os');
      var count = ga.getAggregate('COUNT', 'os');
      osCounts[osName] = parseInt(count, 10);
    }
    return osCounts;
  },

  /**
   * Flags and returns sys_ids of servers missing assigned Support Groups.
   */
  getUnassignedServers: function(limit) {
    var unassignedList = [];
    var maxLimit = limit || 50;

    var gr = new GlideRecord(this.SERVER_TABLE);
    gr.addQuery('install_status', '1');
    gr.addNullQuery('support_group');
    gr.setLimit(maxLimit);
    gr.query();

    while (gr.next()) {
      unassignedList.push({
        sys_id: gr.getUniqueValue(),
        name: gr.getValue('name'),
        ip_address: gr.getValue('ip_address')
      });
    }
    return unassignedList;
  },

  type: 'CMDBHealthAuditor'
};
```

---

## Technical Troubleshooting Matrix

| Issue & Failure Signature | Root Cause Analysis | Diagnostic & Resolution Pathway |
| :--- | :--- | :--- |
| **`GlideRecord.next()` vs `GlideRecord._next()` Warning** | Using private internal APIs or executing `.next()` inside a single-record fetch without checking boolean return. | Always use `if (gr.next())` or `while (gr.next())` and verify record existence. |
| **Severe UI Lag during Incident Submission** | Synchronous `before` or `after` Business Rule making external REST calls on the main HTTP thread. | Change Business Rule type to **`async`** to execute outbound REST integration on the background worker thread pool. |
| **`GlideRecord.update()` Triggers Infinite Loop** | Calling `current.update()` inside a `before` or `after` Business Rule on the same table. | Never call `current.update()` in `before`/`after` rules; field modifications on `current` are persisted automatically. |
| **Scripted REST API Fails: `401 Unauthorized`** | Missing ACL rule or endpoint requires authentication while client passed no bearer/basic token. | In Scripted REST Resource settings, check **Requires authentication** or assign proper role ACLs (`rest_service`). |

---

## Command Line Syntax & Batch Processing

```bash
# Execute Background Script via ServiceNow CLI
snc record create incident --data '{"short_description": "Network Gateway Outage"}'

# Query ServiceNow Server Tables using cURL and sysparm_query
curl -X GET "https://your-instance.service-now.com/api/now/table/incident?sysparm_query=priority=1^active=true&sysparm_limit=5" \
     -u "admin:password"
```

### Essential File Locations
- **Script Includes Table**: `sys_script_include`
- **Business Rules Table**: `sys_script`
- **REST Resources Table**: `sys_ws_operation`

---

## Agent Operational Directive
> **MANDATORY**: Never execute `current.update()` within `before` or `after` Business Rules to prevent recursive transaction loops. Use `GlideAggregate` rather than `GlideRecord.getRowCount()` for large database queries.
