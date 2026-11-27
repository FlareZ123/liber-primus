# Parallel rhetorical equality: source-only selector decision (#3190)

Agent 46, 2026-11-27. **No original slots selected; no crib or key trial.**

## Locked rule

Native LP1 WELCOME prints parallel “YOU ARE A [BEING/LAW] UNTO YOURSELF” clauses with equal six-word widths [3,3,1,3,4,8]. Use visible terminal punctuation class and complete printed word widths, not ciphertext letters: select adjacent clauses of at least six words with exactly equal width vectors and identical terminator; predict equality of first three whole words. A second fixed, broader rule permits any two clauses within the same section, with at most one mismatched width, never in the first three words. This is a tentative stylistic rule, not a theorem: equal widths alone do not imply equal words.

## Native solved calibration

On the nine pinned native solved sections (not new original-image transcriptions), strict adjacent rule finds only its development example at WELCOME offsets 400,422, seven equal runes. Broader rule additionally selects two held-by-section cases:
- KOAN I offsets 302,576, width [3,3,3,3,6,2,5,4], nine equal initial runes.
- LOSS OF DIVINITY offsets 260,394, widths [4,3,3,3,4,7] and [4,3,3,3,4,8], ten equal initial runes.
Both native held prefix comparisons pass. This is a computational held-section replay of publicly solved text, **not** a new blinded human experiment; two positive matches are not a general reliability estimate. No other section pair passes either selector.

## Unknown LP2 selection

Original derivative transcript aligned to all 12,956 p0–55 rune values; corrected physical parser yields 2,896 complete printed groups. Split into clauses on 138 corrected ordinary full-stop events and 28 thirteen-dot records (26 distinct offsets), excluding the known editorial/reclassified stops [57,58,59,60,91,125,127] and treating commas as internal word breaks. Duplicate rune-offset events collapse. 164 nonempty intervals, all group-aligned, assigned to nine source-defined page sections [0–2,3–7,8–14,15–22,23–26,27–32,33–39,40–53,54–55]. Neither rule selects even one pair in any section. No ciphertext score was used to choose a slot.

Therefore no independent equality constraint is available to eliminate a key variable; do not broaden by tuning width mismatches on LP2 or guessing a repeated phrase. The missing input is a source-authored visible relation stronger than the tested parallel shape. Other rhetorical devices are not excluded. No original decryption.

Reproduction from repo root:
```
node sims/lp2_parallel_rhetoric_controls_sft.cjs
node sims/lp2_parallel_rhetoric_original_sft.cjs
```
Raw outputs: [controls](lp2-parallel-rhetoric-controls.json), [original](lp2-parallel-rhetoric-original.json). Inputs: pinned relikd-solved-gp29-native-v1.json, lp2-corpus.json, lp2_krisyotam_2017.txt, lp2-punctuation-identity.json. Corrected framing follows first_party_structured_register_census_sft.cjs and lp2_punctuation_clause_length_crib_sft.cjs. Both JS cores executed against live repository bytes before commit; stand-alone wrappers not separately executed locally. Code/data commit feb2a260037a637be56e82f6062229c068c02491.
