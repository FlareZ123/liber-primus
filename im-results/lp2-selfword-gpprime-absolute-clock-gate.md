# Self-word Gematria prime-sum absolute clock: original inverse decision

**Decision:** retire this exact self-addressed prime-clock receiver, including its bounded-offset and latent-segmentation variants below. No unknown LP2 plaintext or key recovered. The negative results do not extend to arbitrary word-derived state functions.

## Mechanism and independent motivation

The signed 2016 direction clue associates words with numbers; the authentic p56 inverse uses successive prime-minus-one shifts in GP29 with plaintext F transparent and nonconsuming. A distinct literal composition is that a current word's Gematria prime sum determines an absolute origin in the ordinary prime sequence. This is a hypothesis, not a source-authenticated operation: the clue does not specify prime sums, a prime ordinal, or a word-local reset. It differs from the previous-word pointer in #1210/#1193/#2764 and from arbitrary independent origins in prior post-shuffle experiments. The following tests freeze the canonical GP29 chart, one-based ordinal, authentic additive sign, and F bypass.

For a word (w), let (S(w)=\sum_j g(w_j)), where (g) is the original Gematria prime assignment, and let (p_k) denote the kth ordinary prime, one-based. Initialize (k=S(w)+b); encode nonzero rune (x) as (x+p_k-1\pmod {29}) and advance (k), while F=0 emits 0 without consuming a shift.

### Exact inverse without a dictionary

For known ciphertext length (L), enumerate every possible sum from (2L) through (109L). At each glyph, enumerate the legal F hold and consuming inverse, pruning branches whose sum cannot reach the assumed final sum. Accept only paths with exact self-consistent sum. This exhausts all GP29 words under the frozen receiver, without language scoring or a lexicon.

On the continuous original p0–55 source, the physical carry-aware parser yields 2,896 complete groups, 12,956 runes and 2,731 distinct ciphertext groups. At b=0:

| Original group inverse | Count |
|---|---:|
| No possible rune preimage | 1,162 |
| Exactly one | 1,008 |
| More than one | 726 |

The first three printed groups already have no inverse. All returned preimages replay exactly. Re-encoded native solved-LP controls retain their true preimages 740/740; ambiguous alternatives are common and this is a retention control, not evidence of historical reuse. For 83 original singleton groups with 28 distinct symbols, the b=0 encoder image contains 19 symbols, missing ten observed types. Even allowing every offset b=0..3301, none covers all 28 observed types; the best covers 25 at b=724. This all-key bound assumes preservation of singleton groups, even if their ordering is shuffled.

### Removing printed word boundaries

Build the exact forward word-image trie from the pinned TextBlob lexicon plus native GP29 forms, using the repository's existing normalization (including NG/ING variants). The 38,938 forms reduce to 38,916 after limiting singleton words to I/T/A (indices 10/16/24, encoded as A/G/O in the internal digit alphabet; the observed native control singleton forms). No source word boundaries enter the decoder. An exhaustive DAG computes exact tiling and the minimum number of individually uncovered ciphertext runes; ties minimize unigram negative log cost.

- Whole original tape: no exact tiling, no nonempty exact prefix; minimum 6,976 uncovered runes out of 12,956. The nine chapter-local decodes also fail.
- Eight deterministic length-matched uniform ciphertexts: 6,906–7,130 uncovered runes; original falls in their range. This is a simple reference diagnostic, not a calibrated cryptographic p-value.
- All nine re-encoded native sections admit an exact tiling (2,979 runes, 2,966 recovered by unigram Viterbi). Their words were included in the dictionary; they are in-register implementation controls, not independent language holdouts. Their covered-rune costs are 1.7396–2.1085 nats versus 5.0768 on the original.

### Finite offset extension with latent segmentation

For each of 3,302 offsets b=0..3301, exhaustively enumerate possible exact lexical boundaries until one reaches or crosses rune 32, admitting a word that straddles the cutoff (maximum vocabulary length 18). No printed word boundaries are used. Three starts are fixed from physical source: p0 including its title, p0 black body after red13, and p54 black body after red9. No offset reaches the cutoff at any start. Furthest possible complete boundary across all offsets:

| Start | Maximum covered prefix | Offset |
|---|---:|---:|
| p0 title included | 16 | 981 |
| p0 black body | 14 | 865 |
| p54 black body | 13 | 2739 |

Three re-encoded native controls with offsets 0, 724, 1033 reach boundaries 34, 36, 36 at their true origins. Exact prefix failure excludes a complete in-register segmentation for these source starts under the finite offsets, even if the remainder is not analyzed. It does not exclude a vocabulary with OOV opening words, a start inside a hidden word, arbitrary offset range, or a changed operation.

## Rival: address from the visible current ciphertext word

A solver can calculate (S(c)) directly, so the visible-word interpretation is arguably more natural. Substitute (k=S(c)) for (S(w)), keeping the exact same native shifts and F behavior, no offset. Enumerate legal F paths for each original ciphertext word. A forward encoder must solve the fixed point (S(c)=S); enumerate every possible S and retain only self-consistent outputs.

- Original: 340/2,896 groups have no inverse, 2,239 unique, 317 ambiguous. 2,752 have no native-register lexical preimage.
- On 740 known native words, 269 have no legal ciphertext at all under this encoding; multiple ciphertext outputs occur too. This is a non-total proposed word cipher unless another state or exception rule is supplied. All legal planted outputs retain the true inverse.

Do not widen either receiver with post-selected exceptions. A genuinely new source-fixed address law, side information or clock is needed to reopen this branch.

## Reproducibility and scope

All four programs consume pinned original corpus/transcription and native control Git blobs; the lexical programs pin the same TextBlob input. The core functions were executed in the connected JavaScript runtime; standalone CommonJS wrappers have not separately been executed. No CI launched.

- [Exact group inverse](../sims/lp2_selfword_gpprime_absolute_clock_sft.cjs), [output](lp2-selfword-gpprime-absolute-clock-output.json).
- [Latent segmentation](../sims/lp2_selfword_gpprime_latent_segmentation_sft.cjs), [output](lp2-selfword-gpprime-latent-segmentation-output.json).
- [Offset/prefix gate](../sims/lp2_selfword_gpprime_offset_latent_gate_sft.cjs), [output](lp2-selfword-gpprime-offset-latent-output.json).
- [Visible-word rival](../sims/lp2_selfcipherword_gpprime_clock_sft.cjs), [output](lp2-selfcipherword-gpprime-clock-output.json).

The first and fourth tests are all-rune impossibility certificates for individual source groups, not statistical language rejection. The latent tests are exact conditional on the finite register and receiver. No alteration of the overall established-results synthesis is warranted.
