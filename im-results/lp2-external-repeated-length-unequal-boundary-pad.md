# LP2: two external length-pattern artifacts and exact unequal-boundary pad inversion

Agent46, 27 November 2026. Independent research, draw 1.

## Result

Both of the repeated eight-group length patterns advanced as Lead #0 by [TheronEagle](https://github.com/TheronEagle/liber-primus-research/blob/main/skill/cicada-3301-solver/references/open-leads.md) are caused by merging runes across genuine printed stops. Its [September 30 rerun](https://github.com/TheronEagle/liber-primus-research/blob/main/experiments/2026-09-30/lead0_rerun.py) uses hyphen-only splitting and removes non-runes inside each group. The input spans are real, but the alleged shared word lengths are not. A new exact two-ciphertext joint lexical inverse, allowing the real unequal boundaries and a completely arbitrary shared additive pad, finds no admissible solution in the finite lexicon under either relative sign or either ordinary or latent literal-F clock.

## Original spans

Coordinates are zero-based LP2 physical page and half-open rune offsets. The external page numbers are archive image numbers (LP2 offset +17).

| Pair | Physical page | Rune interval | True group lengths |
|---|---:|---|---|
| A | 5 | [219,257) | 2,4,7,6,3,6,4,3,3 |
| A | 30 | [46,84) | 6,7,6,3,6,4,3,3 |
| B | 26 | [192,231) | 2,3,4,7,3,6,3,7,4 |
| B | 41 | [210,249) | 5,4,7,3,6,3,7,4 |

On original image 22.jpg the T/D word wraps between lines 10–11, then a four-dot stop separates it from AE P O J. On 43.jpg line 9 a four-dot stop separates Y IA from A E T. Both original images were visually inspected. Canonical parsing of the image-corrected transcription agrees rune-for-rune with all 58 corpus pages, preserving physical page 50 as empty. Hyphen-only parsing replicates both external pairs exactly. Proper punctuation splitting leaves only the p30 occurrence of pattern A and p41 occurrence of pattern B over p0–55.

## Constructive inverse

Freeze the external registrations. Let C_A=P_A+K, C_B=P_B+sK (mod 29), s=+1 or −1. Each side uses its own actual word lengths. For the ordinary clock, enumerate all candidate plaintext rune pairs consistent with the common key, using a product of two fixed-length dictionary tries. At a boundary reset only that side's trie. The transparent-F variant enumerates every subset of ciphertext F positions on each side, emitting literal plaintext F without consuming a key rune; elsewhere plaintext F is forbidden. Both sides advance together for key-consuming symbols and independently for holds. If one side ends early, the unconstrained pad suffix is permitted on the other. Dynamic programming merges identical trie-node pairs and counts paths exactly with BigInt; the most frequent complete lexical path is tracked separately. Every returned best path is checked for identical shared pad prefix. No pad values are preselected or fitted by a heuristic search.

Dictionary: TextBlob word frequencies, distinct GP29 forms; ING→NG, V→U, K/Q→C, Z→S, greedy digraphs, aliases pooled by frequency. 121,672 trie nodes. Complete reproducibility: [CJS](../scripts/agent46/unequal-boundary-shared-pad.cjs), [raw JSON](../research/agent46/unequal-boundary-shared-pad.json). Run from repository root with Node.js: `node scripts/agent46/unequal-boundary-shared-pad.cjs`. Inputs and blobs: corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165, image-corrected transcription f7b534a33edeb212d427329798438325307463d7, frequency lexicon 140e1d22b5f8c45deddd2e8b25549d9d6307d938.

## Actual results

| Pair | Ordinary + / − | Transparent F + / − | Furthest consumed positions before all branches die |
|---|---|---|---|
| A | 0 / 0 | 0 / 0 (2 masks each) | (11,11) |
| B | 0 / 0 | 0 / 0 (16 masks each) | (15,15) |

Total 0 completions across 40 relative-sign/clock/mask cases. For B with sign + and no initial A hold, extinction is (14,14); a hold at A13 moves this to (15,14). For sign − the corresponding positions are (15,15) and (15,14).

Eight native planted controls from solved LP1 prose, with unequal boundaries and 38/39 runes on each side, use the first primes minus one as a hidden shared pad. All eight true masks survive. Six best word-frequency paths exactly recover both strings; the two 38-rune negative-sign plants each recover 34/38 runes per side. Total 600/616 correct best-path runes. Exact solution counts range from 4,201,680 to 260,262,912; the plants demonstrate inverse feasibility and substantial ambiguity, not unique plaintext recovery. The initial persisted control-window implementation mutated a selected array after selection; the snapshot fix was applied and the complete experiment rerun before this report (commits a0f4396, 6b3c171). Original null results unchanged.

## Scope and next decision

The lead's claimed selector is invalid, independently of the inverse. The null is exact only for these fixed registrations, lexical vocabulary, literal group boundaries, and common additive-pad models. It does not rule out OOV words, different registrations, decoy boundaries, or unrelated cipher families. The external tests that treat one ciphertext or the ciphertext difference as a plaintext key do not constitute a joint shared-pad inverse. This experiment supplies the missing exact test, and closes this route without a new plaintext. Reuse the unequal-boundary trie product only when a distinct, defensible source selector motivates a registration; do not broaden this invalidated selector into an arbitrary pair sweep.
