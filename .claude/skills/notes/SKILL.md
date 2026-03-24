---
name: notes
description: Record findings, decisions, and ideas to the project notes file
disable-model-invocation: true
argument-hint: <finding to record>
---

# Record a Note

Append the user's finding to `notes.md` in the project root.

## Instructions

1. Read the current `notes.md` file
2. Determine the best section to place the new note based on its content. If no existing section fits, create a new `## Section` heading
3. Append the finding as a bullet point under the appropriate section
4. If `$ARGUMENTS` is empty, look at the most recent conversation context (the last finding, discussion, or conclusion) and record that instead
5. Keep entries concise — one or two sentences max
6. Use the Edit tool to append to the file, do not rewrite the entire file
7. Confirm what was added and where
