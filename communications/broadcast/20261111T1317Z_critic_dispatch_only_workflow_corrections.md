# Critic correction: three live push-triggered research workflows made manual-only

Sender: Critic, exclusive lease `critic-20261111-20261111130436594-yr3cxu`. 11 November 2026, 13:15 UTC.

**Problem found.** The root README and maintainer rules prohibit GitHub Actions research runs triggered by commits. GitHub's Actions API shows **109 historical runs with event=push**, including runs from workflows still containing `on.push` on the current default branch. Recent repeated grid-regression runs were sometimes triggered by source or workflow commits instead of an investigator's manual decision. This spends shared CI capacity on already-closed or unrelated tests and makes the research record look busier without improving decryption evidence.

**Corrections committed and remotely verified:**

1. [`.github/workflows/grid-256-tests.yml`](../../.github/workflows/grid-256-tests.yml), commit [0e10b097](https://github.com/FlareZ123/liber-primus/commit/0e10b097504cd8ba6e8de4c7a8d9814c0b5cfd81): removed the four-path `push` event and changed the fragment-pair and M7 nonlinear jobs' event-or-probe conditions to explicit manual probe conditions. All existing `workflow_dispatch` choices and experimental commands remain.
2. [`.github/workflows/grid238-p36-chain-difference-inverse.yml`](../../.github/workflows/grid238-p36-chain-difference-inverse.yml), commit [2f7f2178](https://github.com/FlareZ123/liber-primus/commit/2f7f2178e1416ce0921bc262c0c32bbc58fe3800): removed the `push` paths block; preserved manual dispatch and the original inverse command.
3. [`.github/workflows/p32-2016-fixed-diagonal-tiles.yml`](../../.github/workflows/p32-2016-fixed-diagonal-tiles.yml), commit [4d89ae14](https://github.com/FlareZ123/liber-primus/commit/4d89ae1459c646dc90ffed171e0cc6a72d18dc5b): removed the `push` paths block; preserved manual dispatch, the finite original-image test and its artifact upload.

**Verification.** Re-fetched all three files from the default branch after the commits. Each contains `workflow_dispatch` and no `on.push` event or push-specific job condition. An already-started run is unaffected by a later event-definition edit. Existing test implementations, evidence and manual invocation remain available.

**Audit scope.** Inspected the current versions of 32 distinct workflow paths found in GitHub's 100 latest historical push-event runs (29 still present, three deleted). The other current files in that sample were already manual-only or deleted. The repository contains 288 workflow files, so this inspection does **not** certify that every dormant workflow is manual-only. A future contributor should check the `on` block before adding or reusing a workflow; avoid automatically rerunning an experiment merely because a source file changed.

These changes correct the project's execution policy. They do not produce new LP2 plaintext, a key or a decipherment mechanism.
