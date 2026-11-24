# LP2 p49 source-attested typed-field introduction gate

## Decision

Director #2578: retire the four frozen exact source templates as p49 pre-field terminal cribs under the already calibrated word-boundary-preserving LP1 periodic mechanism. This is a specific absent-phrase blocker, not a rejection of the table or a new cipher claim. No unknown plaintext or key was recovered. Agent14's spacing-free extension also rejects the three sufficiently long frozen clauses under all period-1..13 stationary phase bijections, with ordinary consumption or historical F holds, irrespective of printed spaces.

The supplied original scan 66 (physical p49) shows the red ten-dot data separator after 66 runes of prose, followed by the first ten rows of the table. The preceding sentence extends into p48. The checked-in corpus and transcription agree rune-for-rune for p48 and p49; the final pre-field clause is 138 runes, 33 words. Removing transcription line wraps while retaining separators gives:

`[5,3,6,3,3,2,8,4,5,7,5,3,3,4,3,9,2,3,2,4,6,2,4,3,4,6,3,3,4,6,5,2,6]`

## Prospective source gate

The candidate set was committed in [freeze JSON](lp2-p49-typed-field-template-freeze-agent48.json) at 4a8716489083d8a92422ff7a1be53b5222be948a before opening target ciphertext values. It includes the native solved p56 hash-introduction clause, the exact native LP1 KNOW THIS repeated before two numerical tables, and the two explicit typed-data introductions in the archived signed 2012 RSA challenge. The historical material is used solely as linguistic precedent. Its source-attested literal English is encoded with a single declared greedy chart mapping; alternative contextual spelling is not claimed excluded.

| Candidate | GP runes | Terminal word length | Exact terminal widths match |
|---|---:|---:|---|
| p56 hash introduction | 40 | 2 | no |
| LP1 numerical table introduction (two occurrences) | 7 | 3 | no |
| 2012 encrypted-message introduction | 74 | 4 | no |
| 2012 serialized-public-key introduction | 79 | 8 | no |

Original p49 last word has six runes. All four frozen templates fail even this necessary condition; their full width vectors also fail. Native p56 and both LP1 source controls reproduce the frozen exact rune strings. The 7-rune LP1 template would also be insufficient by itself for the preselected 26-rune LP1 period recovery gate.

The calibrated LP1 recovery in `sims/lp1_self_revealing_key_control_sft.cjs` uses 26 exact known runes to recover periods 8 and 13, with independent 489- and 293-rune continuation checks. Here there is no admissible aligned crib, so no key fit was performed and the 170-rune posttable holdout was not used. The final-word obstruction also holds under **every segmentation of the fixed source Latin spellings**: exact dynamic programming over GP chart tokens, including NG/ING and IA/IO, gives TO {2}, THIS {3,4}, CPAN {4}, BREAKABLE {8,9}. None includes six. This does not exclude arbitrary phonetic respelling, a different authored clause, a nonterminal placement, changed word boundaries or a different cipher family.

## Reproduction and next decision

Run `node sims/lp2_p49_typed_field_template_gate_sft.cjs` from repository root (no dependencies). The checked-in script was actually executed in the connected JS runtime with exact fetched file strings and a minimal file/assert/path shim, all assertions passed. Independent Node CI was not run. The original image was inspected locally from the maintainer-provided zip.

For a successor, require an independently authenticated long operator clause with the terminal width signature, especially final 5,2,6, and a motivated invertible receiver. Avoid paraphrasing the failed templates to fit the visible widths. Alternatively, obtain a source-selected cipher operation that changes boundaries and then explicitly predict the original widths. The table's semantics remain unresolved; there is no positive plaintext claim.


## Spacing-free exact key recovery extension (Agent14, 24 November 2026)

The original word-length grammar anomaly makes it reasonable to test the same **unchanged frozen source phrases** without requiring their word boundaries to coincide with printed groups. This is a bounded test of the existing source candidates, not a claim that LP2 resegmented its plaintext or copied these phrases. Each exact GP rune string is aligned to the terminal suffix of the previously established 138-rune pretable clause; its end is fixed at the original data separator. The 7-rune KNOW THIS remains below the original freeze's 26-rune minimum and is not tested.

For each of the three eligible phrases and every period q=1..13, solve for a shared affine slope a=1..28 and arbitrary q-symbol additive key using C_i−aP_i mod29 at consuming positions. The initial phase is absorbed by rotation. Ordinary consumption and authentic literal-F hold are separate models. A hold requires P=F and C=F and advances no phase; every other plaintext advances the phase. In addition, remove the affine assumption completely and grant any independent permutation of GP29 at each phase (all 29! possibilities per phase); the observed pairs in each phase must form an injection, including the F clock constraints when enabled. This is a necessary and sufficient condition for completion of each phase's observed partial permutation. A key consistent with a crib would be a candidate for independent continuation, not a solution by construction.

| Frozen candidate | GP runes | Affine fits (728 possible period/slope/clock combinations each) | Arbitrary phase-bijection fits (26 period/clock combinations each) |
|---|---:|---:|---:|
| p56 hash introduction | 40 | 0 | 0 |
| 2012 encrypted-message introduction | 74 | 0 | 0 |
| 2012 serialized-public-key introduction | 79 | 0 | 0 |

The third phrase has its sole plaintext F at zero-based crib position67, where original ciphertext is not F. This specifically rules out the historic hold there even before key consistency. The first two phrases contain no F.

The independently native 40-rune p56 clause is enciphered with a 13-digit planted GP key. The same fitting routine recovers all 13 digits, replays all 40 ciphertext runes and identifies 38 distinct observed phase/plaintext pairs in the more general bijection model. No original candidate survives, so no posttable continuation is inferred or scored. There is no evidence for a newly identified key or plaintext.

This eliminates the declared exact terminal placement and three frozen native/greedy spellings for periods 1–13, even with arbitrary per-phase permutation keys and all printed separators discarded. It does not exclude an alternative phrase, different spellings/placement, clocks outside that range, or a genuinely different stateful operation. Do not use these failures as justification for post hoc paraphrase searches.

[Read-only CJS reproducer](../sims/lp2_p49_typed_field_spacingfree_crib_sft.cjs), commit 66067ebf. Executed with fetched canonical source strings directly in JS; no separate CI run.
