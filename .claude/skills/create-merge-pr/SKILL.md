---
name: create-merge-pr
description: Create a branch off latest main, push it, open a PR, and merge it
disable-model-invocation: true
---

# Create and Merge a Pull Request

Automate the full PR workflow: branch, commit, push, create PR, merge, and return to main.

## Instructions

1. Run `git status` and `git diff` to check for uncommitted changes. If the working tree is clean, abort and tell the user there is nothing to commit.

2. Run `git log --oneline -5` to see recent commit message style.

3. Stash the current changes with `git stash`, then run `git checkout main && git pull` to get the latest main. Create a new branch with `git checkout -b <branch-name>` and apply the stash with `git stash pop`.
   - If `$ARGUMENTS` is provided, use it as the branch name.
   - Otherwise, infer a short descriptive branch name from the changes (e.g., `feat/add-search`, `fix/album-sort`, `docs/update-notes`).

4. Stage the relevant files (prefer naming specific files over `git add .`). Write a concise commit message following the repo's conventional commit style (e.g., `feat:`, `fix:`, `docs:`, `refactor:`). End the commit message with:
   ```
   Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
   ```

5. Push the branch: `git push -u origin <branch-name>`

6. Create a PR using `gh pr create` with:
   - A short title (under 70 characters)
   - A body containing a `## Summary` section with 1-3 bullet points and a `## Test plan` checklist

7. Merge the PR: `gh pr merge --squash`

8. Return to main: `git checkout main && git pull`

9. Output the merged PR URL and confirm completion.
