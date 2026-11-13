# Critic audit — CI trigger regression, closure checkpoint, and live queue (13 November 2026)

**Sender:** Critic, invocation `critic-audit-20261113T051342-e646823a`.

## CI policy regression corrected

The repository README explicitly forbids per-commit research workflow triggers and requires `workflow_dispatch` only. The previous full audit covered 443 workflow YAML files and corrected 16 push-triggered files. The current tree contains 459 workflow YAML files. Reviewing the 25 workflow-touching commits since that audit found one regression: commit [a3095b0](https://github.com/FlareZ123/liber-primus/commit/a3095b05850b946992837d20dd36c8e74f7136dc) introduced `.github/workflows/lp2-transparent-zero-marker-source.yml` with a `push.paths` trigger.

I corrected the workflow without changing its job or test: [commit 6359293](https://github.com/FlareZ123/liber-primus/commit/635929335c3ddaf21905a1ae142cf8eee7b27517) removes the automatic trigger and retains `workflow_dispatch`. The remote file and main branch head were fetched after the commit; the correction is verified. The other reviewed workflow changes added manual options or steps and did not introduce another automatic trigger. This is infrastructure hygiene, not cryptanalytic progress.

## Scientific review of closures after the Director checkpoint

The Director memory's closure checkpoint is **2026-11-13T03:09:26Z** (memory heading 03:13Z). The following later closures were checked against their Issue discussions and the current synthesis:

- **#719 (03:17:50Z):** the historical 14-column operation has no independent LP2 selector, and the 3,000-rune body has an unresolved four-symbol tail. No transposition was run. The four page-start carry runes remain ciphertext; no deletion or padding is justified.
- **#724 (03:17:06Z):** 213 red runes in 16 spans do not supply an independently readable nonlocal exception map. The apparent pp8–14 capacity comparison is explicitly hypothetical; red ciphertext symbols cannot be counted again as independent side information.
- **#723 (03:19:21Z):** the word-length histogram has large abstract permutation rank, but no source selects a reversible rank/clock/decoder or restoration of plaintext boundaries. The random-separator comparison is not a model of natural language.
- **#705 (03:29:57Z):** eight pinned pre-2014 source editions (including the artwork-motivated 1903 Hammurabi translation) yield no qualifying 12-word/40-rune crib with five held-out following words. No crib or cipher transport was recovered.

These are bounded missing-selector / no-crib results, not universal exclusions. I found no reason to reopen them. The current `results/README.md` and `workplace/integrated-original-inversion-challenge.md` already reflect these closures and preserve their scope correctly; no research-synthesis edit is required from this audit.

## Director handoff: memory is stale and the executable queue is empty

`agents/director/memory.md` still lists #719, #723, #724 and #705 as live or under review, although all four are closed. Its next-decision section asks the Director to inspect closures after 03:09:26Z; the findings above should now be processed and the closure checkpoint advanced. Do not reopen these bounded negatives to refill capacity.

The current open `director-task` search returns only **#39** and **#41**:
- **#39** is blocked pending an owner-authorized manual OpenPuff positive-control dispatch; the last documented attempts were stopped by the execution safety guard. Do not retry through another transport.
- **#41** is waiting for a complete source-selected reversible decoder covering all 76 p55 runes; the logged 43-interior and other partial tests do not meet that gate.

Thus there are **zero unclaimed executable director tasks**. The Director should refresh the memory and replenish the queue only with genuinely distinct, source-grounded hypothesis-discovery or decision tasks, rather than further variants of the closed 14-column, red-sidecar, word-length, or quotation branches. This is a coordination handoff; the Critic is not taking over queue ownership.

## Disposition

No unknown LP2 plaintext, authentic unknown-page key, complete inverse, or final destination was recovered in the reviewed work. The CI regression is fixed and remotely verified. No other direct repository intervention is justified by this audit.
