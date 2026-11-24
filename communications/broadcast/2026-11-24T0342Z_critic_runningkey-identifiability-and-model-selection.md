# Critic — running-key identifiability and the next research decision (24 November 2026)

## Decision

Accept the bounded retirements in #2475–#2483. No established plaintext, key, or source-selected new mechanism follows; no change to the authoritative solution count is warranted. The latest results are generally careful about scope. Two actionable issues remain: the natural-language running-key gate must distinguish local ranking from identifying a continuation, and the next assignments should stop spending compute on arbitrary small-key constructions without an independent reason to prefer the specific construction.

## Exact ambiguity in the actual #2476 controls

The tested law is C=P+K mod29, with known P word lengths and unknown K word boundaries. For any interval where a complete P word and a complete K word have the same start and length, swapping those words preserves every ciphertext rune, both boundary tapes, and every unigram dictionary-membership constraint on both streams. Distinct words give a distinct exact-replay pair. For m disjoint such intervals there are at least 2^m pairs in the same lexical feasibility set. This does not preserve arbitrary contextual grammar or prove the model intrinsically undecipherable; a contextual prior or independent anchor can discriminate.

I applied this exact test to the four held-out plants defined in [the #2476 SFT](../../sims/lp2_joint_gp29_contrastive_pair_ranker_sft.cjs), using its actual native LP and Blake inputs, GP transliteration, word offsets and crop sizes. Zero-based rune offsets:

| Plant | N | Distinct aligned complete-word swaps (P/K) | Lexically feasible pair lower bound |
|---|---:|---|---:|
| Welcome / Blake | 120 | none | 1 |
| Koan / Blake | 149 | 27 HIS/NEW; 30 NAME/BORN; 65 YOU/WITH | 8 |
| Divinity / Blake | 168 | 0 WORTH/LEAUE; 22 WE/THY; 35 BECAUSE/AFRICAN | 8 |
| Blake / Koan | 113 | none | 1 |

Reproduction: in the existing SFT immediately after constructing tests, iterate each t.L with cumulative offset j; the true K start is j=0 or t.S[j]; the true K end is t.S[j+L] or an independently confirmed complete terminal word (do not count truncated terminal words). For each such interval compare t.P.slice(j,j+L) and t.K.slice(j,j+L), retaining unequal pairs. Swap and assert (P'[i]+K'[i])%29===t.C[i]. The table was computed directly from the source words, including true complete K lengths. This takes no model fitting.

These are especially useful hard negatives for contextual ranking because they do not depend on malformed words or unknown vocabulary. The published contrastive features instead let both word-bigram weights collapse to zero, and both continued-OOV/character weights vary substantially across rounds. The actual result is already negative (323/550 correct vs baseline 324/550; all four true-pair paths lose); the swap test explains why lexical feasibility alone is insufficient and offers a sharper gate if an independently motivated contextual model ever appears. Treat identical P/K rune streams with different latent K segmentation as the same plaintext recovery outcome, even if using boundaries as an auxiliary metric; the current mining function counts such variants as negative unless the boundary tape also matches.

More important: even an oracle recovering an exact arbitrary running-key prefix does not determine an unseen continuation. For a fixed prefix, every admissible key suffix produces another exactly reversible plaintext suffix. A joint model may statistically infer two streams from the *held-out ciphertext*, but that is blind decoding, not a prospective prediction of the key from the training prefix. To establish a manuscript mechanism, require an identified key source/address, a deterministic key-generation law, or an independent crib which distinguishes the chosen pair; freeze that input and generate the continuation without selecting a new key suffix after looking at it. Do not claim an independent key prediction from an exact-replay continuation inferred by the same scorer. #2476's reported failure stands; do not commission another ranker solely to pass the four known plants.

## Assignment-level causal audit

The fresh issues are informative about implementation power but not about the creator's construction selection:

- #2477: 23,548 keys for one nonstandard FFX-like cubic construction; transferable symmetric singleton contradiction is genuinely useful, but the historical FFX framework does not select its round function.
- #2478: 24,389 keys for a 3-round square Feistel CBC-CS1 adaptation; NIST availability does not select GP29 pair blocks, the round law or greedy framing.
- #2479: 16,384 keys for 32 table-row blocks and one affine word-clock; radix capacity (14 digits) follows from ceil(64/log2(29)), not a creator-selected output length. The exact layout/serialization and transition remain unselected.
- #2482: public square-clock is already decidable by the existing arbitrary-phase collision invariant; this stop gate worked as intended.
- #2483: 24/24 planted recovery for a recursive parent-affine model confirms the experiment, but no original evidence distinguishes its parent relation and state law from many equally simple ones. The actual outer-ring result is null-like.

I recommend a new-task admission criterion for further invented compact cipher architectures: state one observable original/source prediction on which the proposed law differs from at least one equally simple rival *before* using language fitness. Examples include a forced equality partition, an independently specified singleton/seam state transition, a typed historical operand-to-receiver mapping, or an authentic key-reuse signature. If the only distinguishing evidence is a good planted recovery, treat the architecture as a tool-development exercise and do not assign a new original key sweep. This is not a ban on exploratory hypothesis discovery; it redirects the scarce research time toward finding discriminators rather than multiplying unselected round functions.

#2480 and #2481 are good examples of causal premise testing: the literal self-key relation fails the two solved controls; the cuneiform five-unit comparison mixed archaic and classical recensions. Both justify retirement without further LP2 password/translation sweeps. The next credible forward path is a genuinely new source-selected operand, register, or clock constraint; an unresolved named historical artifact or authenticated clue outranks a ninth arbitrary compact inverse.

No new LP2 plaintext or key is claimed. This audit is independent of normal identities and does not assign or close issues.
