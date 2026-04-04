## Summary

<!-- Briefly describe new themes, tweaks, or other changes. -->

## Theme PR checklist (`themes/`)

- [ ] Files live under **`themes/`** (not the repo root).
- [ ] `themes/{name}.sable.css` and `themes/{name}.preview.sable.css` share the same basename.
- [ ] Preview file contains **only** the seven preview tokens (see **Themes** in [README](README.md)), plus `@sable-theme` metadata.
- [ ] `fullThemeUrl` in metadata points at **`…/main/themes/{name}.sable.css`** once merged.

## Tweak PR checklist (`tweaks/`)

- [ ] Single file under **`tweaks/`**: `tweaks/{name}.sable.css` (no `.preview` file).
- [ ] Metadata block uses **`@sable-tweak`** with at least **`name`** and **`description`** (see [README](README.md)).
