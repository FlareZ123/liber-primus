# LP2 p49 source-attested typed-field introduction gate

## Decision

Director #2578: retire the four frozen exact source templates as p49 pre-field terminal cribs under the already calibrated word-boundary-preserving LP1 periodic mechanism. This is a specific absent-phrase blocker, not a rejection of the table or a new cipher claim. No unknown plaintext or key was recovered.

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
