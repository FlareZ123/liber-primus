# The p13/p14 literal FOLD, 136+136 line fold, and one-rune F bypass

**23 November 2026, Agent 35. Classification:** a newly coupled, original-image-motivated fold/key hypothesis and a negative full-page additive inverse with an exact all-secret pair-recoding obstruction. **No authentic unknown LP2 plaintext or creator-selected operation has been recovered.** Reproducer: [original-input read-only Node22 SFT](../sims/lp2_p13_p14_literal_fold_phi137_original_sft.cjs).

## Human-visible source route and its rival

Original physical LP2 **p13 = 30.jpg** shows a sapling on the **right** margin and **12 complete printed rune lines**. Its immediate successor **p14 = 31.jpg** mirrors the sapling onto the **left** margin, prints the exact whole second GP29 word **`FOLD`** (runes `ᚠᚩᛚᛞ`) and has **seven** printed text lines above a flying insect. The source page order supplies the adjacency and the original art supplies the left/right pairing, independently of any generated key.

There is a stricter numerical relation in the untouched source transcription:

| Printed register | Original count |
| --- | ---: |
| p13 first six lines | **136** runes, individual lines `[24,21,23,23,22,23]` |
| p13 last six lines | **136** runes, individual lines `[22,25,21,22,22,24]` |
| Complete p13 | **272 = 2 × 136** runes |
| Complete p14 | **137** runes |
| p14 after omitting just the first rune of its original `FOLD` word | **136** runes |

**137 is prime #33, and φ(137) = 136**, so the relation also has a 2014-available arithmetic vocabulary. The original p14 initial rune sequence is `T J - F O L D`: the candidate transparent `F` is **GP index 0 at page-local rune offset 2**, followed by `O L D`. This is separate from the p56 authentic **F-skip**, where the cipher's transmitted `F` is held literally. The solved p56 precedent makes that exact kind of bypass worth testing. **There is no authentic instruction that transfers p56's F-skip to p14.**

The strongest competing explanation is ordinary typesetting: full-body pages tend to have twelve lines of roughly 22–24 glyphs and chapter endings are shorter. A 136/136 split can arise from the page designer balancing line width, and an unencrypted-looking FOLD is possible by chance in an otherwise encrypted book. The mirrored saplings may be reused decoration. **None of these correspondences alone proves a fold cipher**, and their joint observation was discovered after inspecting the book.

## Full 137-rune invertible receiver, frozen before examining outputs

Fold the source p13 text tape at its exact six-line boundary: source positions `0..135` pair with `271..136` in reverse. For each of the **136** paired positions take `(a,b)` in native zero-based GP29 indices; also read their published Gematria prime values `P(a), P(b)`. Form one of ten explicit 136-symbol additive key candidates:

`a`, `b`, `a+b`, `a−b`, `b−a`, `P(a)+P(b)`, `P(a)−P(b)`, `P(a)+P(b)−2`, `a×b`, or `P(a)×P(b)^{-1} mod137`, with the final key reduced modulo29.

The ninth operation is ordinary GP29 multiplication; the last is a separately bounded test motivated by φ(137), not an authored opcode. The modular inverse exists because all 29 published GP primes are nonzero below137. The first nine choices are familiar additive, difference, totient and multiplicative constructions; all ten are explicit and independently reproducible.

Leave the p14 printed **F at rune offset 2** untouched as a literal bypass, read the other 136 original p14 runes in printed or reversed order, then **add or subtract** each p13-derived key residue modulo29. Reinsert the literal F to reconstruct the full original 137-rune packet. This gives exactly **10 × 2 × 2 = 40** full-packet source-key inverses. In every case the ciphertext can be reconstructed from candidate plaintext, p13 and the transparent F; this algebraic invertibility by itself is not a correctness test.

## Original-input outcome and genuine native controls

The language diagnostic is a frozen smoothed GP29 trigram log likelihood trained on an independently source-preserved Gibran text (`resources/control/gibran_prophet_58585.txt`, **62,492** normalized GP runes). It uses source GP multigraphs including ING/IO and no p14 plaintext guesses. There are **459** disjoint, 136-rune native control windows. The independently solved p57 runes are a real Cicada plaintext control.

| Untouched or candidate register | Per-rune native trigram log likelihood (nats) |
| --- | ---: |
| Native Gibran 136-rune windows, **minimum** across459 | **−2.496458** |
| Native Gibran windows, median | **−2.101345** |
| Authentic p57 clear runes | **−2.459596** |
| Original source p14, all 137 runes | **−3.939338** |
| Original source p14 after the defined F bypass | **−3.939033** |
| **Best** of all40 proposed p13-derived inverse readings | **−3.941339** |

The best scoring inverse uses the **mirrored second half alone**, reading the 136 source p14 non-F runes **in reverse**, and subtracts that half's GP29 symbols; its initial output is `S AE EO L G L N W W T N R O F O P U T T M P G A L A`. This is not an English instruction. **Every** frozen p13-derived key candidate scores worse than the original p14 ciphertext under the same native model, and all are markedly worse than every independent 136-rune Gibran control. The strongest alternative field-ratio inverse also fails (best −3.941374 nats).

An independent synthetic full-packet plant encrypts genuine native Gibran GP29 symbols under the *actual p13 folded prime-sum key*, inserts the same literal F at source offset2, and inverts all 137 ciphertext slots exactly. The plant's natural-language model score lies in the native range. Thus a failure to reproduce authentic native text is a property of the original p14 data under these proposed operations, rather than a faulty F bypass or modular inverse implementation.

## A stronger key-independent necessary condition for literal fold transfer

Another visible hypothesis says that each folded p13 **ordered rune pair** is mapped to one observed p14 rune, with the extra literal F added separately. Grant an **arbitrary secret deterministic function** from any ordered pair of 29-symbol inputs to one output GP rune, even if it is noninjective. For repeated identical input pairs, that one function must produce identical outputs. Optimal fitting amounts to choosing the most frequent p14 target symbol separately for each source-pair input; it does not assume any affine/alphabetic key.

| Source pairs ⇒ full p14 minus original F | Distinct folded source-pair classes | Best possible matching p14 outputs | Forced wrong outputs |
| --- | ---: | ---: | ---: |
| Ordered pairs, original p14 direction | 128 | **130/136** | **6** |
| Ordered pairs, reverse p14 | 128 | **129/136** | **7** |
| Unordered pairs (all symmetric fold operations), original | 121 | **123/136** | **13** |
| Unordered pairs, reverse | 121 | **122/136** | **14** |

Therefore no **fixed one-output-per-folded-pair map**, including a wholly unknown 29²-entry mapping, can generate the original p14 from its actual F-omitted source packet in either reading direction. This excludes literal stationary pair folding as a *ciphertext-to-ciphertext* transcription. It **does not** exclude using folded p13 as a stateful **key** for decrypting different p14 plaintext, as in the forty tested receivers, or a lossy/compressed transform with side information.

## Decision

**Retire** a simple p13 136+136 literal fold as a complete p14 additive/prime-derived plaintext decoder with the local F bypass, and retire *every deterministic stationary folded-pair → observed-p14-rune map* at the source-selected alignment. The combination of printed FOLD, mirrored facing illustrations, exact central 136/136 line cut and near-matching 137-rune successor is a concrete clue-chain candidate, but it currently has **no validated ciphertext-to-plaintext mechanism**. Do not promote the fold to a proven human solve-path instruction or extend it through fitted secret shifts and extra bypasses.

This experiment is **different** from the previously tested p14–p55 **42-page** mirror fold ([source gate](lp2-p14-p55-fold42-original-gate.md)): this one tests the *immediately preceding p13*, its exact internal printed six-line fold and the p14 local F bypass. A useful successor would need new first-party evidence that chooses a non-additive state transition, a field residue interpretation or a concrete p14 plaintext prediction before attempting more key variants.
