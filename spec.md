# GrammarFix

## Current State
New project. No existing code.

## Requested Changes (Diff)

### Add
- A text editor area where users can type or paste text
- Real-time (on-demand) spelling and grammar checking via LanguageTool public API
- Highlighted wrong words/phrases inline (red underline for spelling, yellow for grammar)
- Click on highlighted word to see suggestions and apply correction
- Auto-correct button to apply all corrections at once
- Error count summary (X spelling errors, Y grammar errors)
- Clear/reset button
- Copy corrected text button

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: HTTP outcall to LanguageTool public API (https://api.languagetool.org/v2/check) with text and language parameter
2. Backend returns list of matches: offset, length, message, replacements
3. Frontend: rich text editor with inline highlights using character offsets from API response
4. Clicking highlighted span shows a popover with suggestions
5. Apply single fix or apply all fixes
