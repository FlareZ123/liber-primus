# Pre-discovery source search for READ OUT / p0 80..102

**Agent4, 19 November 2026. Director #1713. Result: negative in the bounded independently dated sources searched.**

## Frozen targets

The search was fixed to material independently published before 19 November 2026 and looked for any of:

- literal `READ OUT` / `READOUT` attached to unsolved Liber Primus;
- p28 center / word28 cube-style recovery or equivalent operation;
- p0 offsets `80..102`, an equivalent four-word 23-rune receiver, or its exact boundary description;
- the DH23 state `p=23,g=5,a=6,b=15,A=8,B=19,K=2` attached to that p0 span;
- the exact p28 source word/center transliteration used by the current recovery.

Generic mentions of Diffie-Hellman, modulus23, cube maps, or ordinary ciphertext transcription were excluded because they do not preselect the current target or operation.

## Independently dated corpora checked

1. **Leo-Y-Zhang/LiberPrimusAnalysis**, session report dated 6–7 September 2026, `docs/REPORT.md`.
   Current report text contains no literal READ OUT/READOUT, p28/page28 target, exact 80..102 span, DH23 label, or the current p28 source word.
2. **Wulfic/Cicada3301-Liber_Primus**, `MASTER_TRACKER.md`, explicitly last updated 12 October 2026.
   Same exact-target search is negative.
3. **SECRA, "Inside Liber Primus"**, published 15 October 2026.
   Public article/search indexing exposes no current READ OUT/p28/p0 receiver claim and explicitly reports the unsolved pages still unsolved at that date.
4. **Dukotah/cicada3301**, pre-discovery synthesis/handoff corpus including `SOLVERS-DOSSIER.md`, `FINAL-SYNTHESIS.md`, `PICKUP-HERE.md`, and `MEASURED-CEILING.md`.
   Exact target strings are absent in the checked synthesis/handoff files.
5. Web/archive-index searches covering GitHub, Reddit, Pastebin-style results and general web indexing for:
   - `"Liber Primus" "READ OUT"`
   - `"Liber Primus" "80..102"` / `"80-102"`
   - `"Liber Primus" "23 runes" p0`
   - `"Liber Primus" "DH 23" p0`
   - p28/page45 + cube + READ OUT
   - the exact p28 and p0 transliteration fragments.
   No independently dated pre-discovery match to the frozen operation/receiver/state was found.

GitHub code-search API became rate-limited during the bounded pass, so exact repository-text checks were completed with direct file fetches and web indexing rather than waiting on an unrelated search quota.

## Decision

No pre-discovery source found in this bounded search supplies an independent target, operation, receiver, or DH23 description matching the current route.

This is a **negative holdout search**, not proof that no historical mention exists anywhere. It supplies no positive evidence for READ OUT and therefore should not be counted as confirmation. The route must stand or fall on original-artifact constraints, familywise controls, and prospective plaintext recovery.

The useful consequence is procedural: do not cite older generic DH23/cube discussions as independent anticipation of the current p28->p0 construction unless an exact dated artifact is produced.
