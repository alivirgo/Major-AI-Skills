# Plugins

Specialized plugins are focused skill packs for a job. They point at the same `skills/<id>/SKILL.md` files as the full library.

| Plugin | Best for | Example skill IDs |
| --- | --- | --- |
| MAS CAD Studio | Mechanical / industrial design | solidworks, fusion-360, catia, siemens-nx, rhino, blender |
| MAS Video Lab | Editors and motion designers | davinci-resolve, adobe-premiere-pro, adobe-after-effects, remotion, ffmpeg |
| MAS 3D & Games | DCC + engines | cinema-4d, houdini, unity, unreal-engine, godot, blender |
| MAS Design & Knowledge | Product design + notes | figma, adobe-photoshop, obsidian, notion, linear |
| MAS Desktop Ops | OS power tools | raycast, everything, microsoft-powertoys, docker, vscode |
| MAS Efficiency Pack | Token / context savings | csv-over-json-tables, token-aware-chunking, selective-grep-filtering |
| MAS Common Sense Pack | Non-technical prompting habits | ask-short-answer-first, clean-messy-notes-to-action-items |

Plugin manifests live under [`plugins/`](../../plugins/). Install via CLI filters:

```bash
npx major-ai-skills --cursor --skills solidworks,fusion-360,blender
# or
npx major-ai-skills --claude --category cad,3d
```
