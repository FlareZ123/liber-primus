# LP2 p54–55: exact shared q7 additive receiver with literal EA reset events

**Decision:** the exploratory simple EA-reset receiver is excluded on original p54 under its stated intact-word lexical bound. No key or plaintext recovered. Do not repeat this exact receiver.

## Motivation and fixed model

The independent July 2026 p54 study identifies eight native EA positions and a seven-rune CONSUME keyword, but does not authenticate its layered scaffold. See [public-source delta](lp2-public-nongithub-solve-delta-20261126.md). A different, deliberately minimal executable receiver treats **every ciphertext EA** as a control (not payload), resetting a shared seven-position additive key to phase zero. This is an exploratory interpretation, not a reproduction of the external author's unpublished verifier. Two versions: ordinary consuming GP29 addition, and historical literal plaintext-F bypass (F emitted unchanged and phase held, while non-F may consume to ciphertext F). Both start at phase zero on physical p54; the nine-rune heading is clocked but not scored. The clock is continuous across p54→p55. Marker-containing groups are excluded from lexical constraints, not guessed. No alternative phases, periods, marker subsets, or group boundaries tuned to original output.

Inputs: `resources/liber-primus/lp2-page-groups-54-55-derived.json`; 38,910 unaugmented native spellings from `resources/control/english_wordfreq_textblob.txt`, exactly the normalization of the existing q8 multi-anchor register. The original complete body gives 41 marker-free training groups and 13 marker-free p55 holdout groups (incoming carry not scored). Four disjoint eight-rune anchors with no EA or ciphertext F: group indices 2,18,36,39; page offsets 9,86,159,176. The lexicon must match at least 38 of 41 training groups. Under that bound at least one of these four anchors is in the register. Its eight consecutive consuming runes determine all seven shifts, including one repeat-phase consistency condition. Enumerating every dictionary candidate at each anchor therefore nominates every possible qualifying key. With historical F bypass, all eight histories of the three original training ciphertext Fs are enumerated. No p55 data is used to select the key.

## Results

| Original model | Histories | Distinct nominated keys | Key/history checks | Legal full training inverses | Best training matches among nominated legal inverses | Qualifying |
|---|---:|---:|---:|---:|---:|---:|
| Ordinary | 1 | 754 | 754 | 754 | 8/41 | 0 |
| Literal F bypass | 8 | 638 | 5,104 | 2 | 5/41 | 0 |

Keys outside the nominated set may exist with at least four OOV anchors; the exact exclusion is **no key with at most three OOV groups**. The best-support figures are not global maxima over keys violating that bound. No key survives training, so no original continuation is scored or claimed.

Blind receiver controls: two separately seeded hidden keys, source-shaped lengths and EA locations, exactly three deliberately unregistered anchor plaintext groups. Sampled dictionary groups are not coherent natural prose; controls are lexical/key recovery calibrations. Ordinary control nominates 843 distinct keys and uniquely recovers [16,27,19,27,23,13,5]. F-hold control includes a forced literal hold, nominates 846 distinct keys across two histories, and uniquely recovers [25,27,14,7,8,3,3]. In each control the exact full training plaintext and exact unchanged held-out continuation are present among legal recovered paths, including deliberately OOV material. F-hold control is constrained to one forced ciphertext F; original enumeration handles all three. No claim of unique plaintext paths where histories coincide. A preliminary control sampler starved the forced F by using its cap earlier; fixed before the successful execution.

[Standalone Node SFT](../sims/lp2_p54_ea_reset_q7_anchor_sft.cjs) and [machine output](lp2-p54-ea-reset-q7-anchor.json), executed in connected V8 on exact repository inputs. Standalone Node wrapper not separately executed. The explicit finite register/three-OOV bound does not exclude marker-containing plaintext words, arbitrary hidden segmentation, the published layered scaffold, other clocks, or non-additive mechanisms.

No source-selected alternative follows from this negative. Keep the missing external executable scaffold and typed original source selector as the prerequisite for further dependent work; do not expand to a generic EA-key sweep.

## Spacing-free exact maximum-likelihood follow-up

The lexical gate alone does not decide this clock if the printed groups are decoys. Without changing the reset rule, period, marker assignment, or initial phase, remove **all** word boundaries and maximize a GP29 conditional trigram log likelihood trained on Shakespeare, Emerson and Gibran (unigram/bigram/trigram interpolation strengths 29, 8, 12). Score every payload rune, including the heading, and reset language context only at the same EA events; no context term crosses a marker. The p54→p55 seam retains key phase and the last two plaintext runes, with no parameter fitted on p55.

For a fixed F-hold history, every trigram uses at most three consecutive consuming key positions. Thus the whole prefix objective is a sum of seven cyclic factors F_j(k_j,k_(j+1),k_(j+2)), plus a constant for fully held-F terms. Ordinary search covers all 17249876309 keys exactly; the F-bypass version separately enumerates all eight histories of the three visible ciphertext Fs and deletes each shift that would decode a consuming glyph to plaintext F. Fix the first two shifts, maximize the remaining factor chain via dynamic programming, then close the last two wraparound factors. Verify the resulting direct decoded score against the factor maximum. Complexity O(7*29^5) rather than O(29^7*232). No lexicon, guessed plaintext, beam, or original heldout selection.

| Run | Exact best key | Fit log likelihood/payload rune | Unchanged p55-like continuation | Heldout log likelihood/payload rune |
|---|---|---:|---|---:|
| KOAN1 ordinary | 3,0,17,28,6,7,17 | -2.234092 | 1 legal histories | -2.184986 |
| WELCOME F bypass | 23,0,15,0,16,15,15 | -2.274040 | 1 legal histories | -2.358936 |
| Original ordinary | 23,0,3,3,4,16,13 | -4.963729 | 1 legal histories | -7.174355 |
| Original fhold | 0,14,17,3,4,22,15 | -5.139593 | 0 legal histories | none |

Authentic continuous solved-native controls, KOAN1 at offset0 and WELCOME at offset133, have markers inserted at original-shaped locations and independently seeded legal keys selected to avoid spurious EA (and accidental ciphertext F in the F-bypass control). They recover both exact keys, all 224 payload training runes and all 73 payload holdout runes, with the 8+3 fixed markers also reproduced. They are separate from the lexical plants. The F-bypass control has three visible literal Fs in training; no accidental consuming-F control in this small calibration. Both exact optima on original p54 are nonlinguistic and much worse than controls; the ordinary key produces a poor frozen continuation and the F-bypass winner has **zero legal p55 continuations**. This is an exact optimization of the fixed trigram objective, not a universal language/segmentation theorem. It retires this simple EA-reset additive clock even as a calibrated spacing-free receiver; no new unknown plaintext or authentic key.

[Spacing-free SFT](../sims/lp2_p54_ea_reset_q7_spacingfree_exact_sft.cjs) (commit 47e79b86a70eeca0da5597bbd0238bba84b59dea) · [full machine output](lp2-p54-ea-reset-q7-spacingfree-exact.json) (commit bcbc6528c9adf0dfd4b3d1498aaae081d88cfd05). Core executed in connected V8; standalone Node wrapper not separately run. No additional EA-clock family expansion justified.
