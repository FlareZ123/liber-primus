# Original p0 red-word 8+5 layered Vigenère inverse

**Agent46, 24 November 2026. Intermediate negative, no unknown plaintext.**

The original opening rubric has two red words of eight and five GP29 runes, then a large red 13-dot mark. The original-image adjudication is [here](lp2-p0-red13-13dot-blackbody-original-source-adjudication.md). The hypothesis is that the two visibly separated words are two literal key operands, rather than a single 13-rune title/key. Historical solved LP1 Vigenère supplies the GP29 addition and nonconsuming plaintext-F convention. This is a conjectural receiver; no first-party text specifically commands two layers.

## Source-selected inverse

The exact keys are K8=[15,8,18,3,6,19,27,0] and K5=[15,26,18,21,5]. The target is the entire 716-rune black opening section from physical p0 offset13 through p2, 156 complete printed groups, five singleton groups. The original source parser checks every one of the 729 source opening runes against the canonical numeric corpus.

For each order, and each of the four choices of +/- signs, test:
- FF: two separate additive layers each implementing transparent nonconsuming plaintext F.
- FC or CF: the designated F layer holds, the other consumes every symbol.
- CC: ordinary additive layers, both consume.
- sharedF: the original plaintext F holds both phases; nonzero plaintext receives both additive shifts.

The independent phase state is (a,b), with 40 possible states. Invert each layer by allowing a literal F at output zero, and any nonzero consuming plaintext consistent with that layer's signed modular addition; invert outer then inner. SharedF uses the sum of shifts. The dynamic program merges identical phase states only. It is exact for reachability, irrespective of how many earlier plaintext histories led to the same state. All 40 incoming phase pairs are granted; no reset inside the body. For the language-free gate, printed word grouping is immaterial. For the additional native gate, complete singleton words must be A or I, matching the solved p57 control.

## Original outcome

For the strongest literal two-layer historical F-hold hypothesis, zero-phase failures occur at black-body offsets 16,2,20,15,16,78,2,90 (one-based). Granting all 40 incoming phases still produces empty state sets:

| Inner→outer key lengths | Signs ++ | +- | -+ | -- |
|---|---:|---:|---:|---:|
| 8→5 | 94 | 40 | 78 | 40 |
| 5→8 | 155 | 101 | 73 | 101 |

These are exact earliest prefixes at which all possible states have died; no language model is involved. Every mixed-hold case also fails language-independently, by offset295. The sharedF variants fail by offset483. The CC cases are bijective with supplied phases and therefore all have nonlinguistic witnesses; each fails the additional intact A/I singleton constraint by offset232. In total 32 of 40 configurations fail purely mathematically, and all 40 fail under native singleton support. The 40 counts include algebraically equivalent choices for CC/sharedF; they are configuration counts, not 40 independent hypotheses.

All 40 corresponding encryptions of the authentic 95-rune p57 are admitted by the inverse; the complete actual planted path is checked transition by transition, and every selected witness is forward-replayed exactly. Some F-hold plants admit multiple paths; the first witness need not equal the actual planted text. These controls demonstrate reachability/replay, not unique plaintext recovery.

**Decision:** retire these literal two-word key receivers on the opening black body. This is distinct from the earlier [prime-stream plus historical keyword two-clock screen](lp2-two-clock-prime-keyword-screen.md), which uses a prime outer clock and optional collision rejection, and from earlier single-title/recurrence tests. No proof exists that the two red words are keys. Arbitrary unknown keys, ciphertext-derived state changes, other historical operations, changes to the rune alphabet, and non-native singleton semantics are outside the declared family. No additional sign, offset, word or key sweep is justified by this result.

[Standalone Node/CommonJS SFT](../sims/lp2_p0_red8_red5_two_layer_fhold_sft.cjs). The actual experiment was executed against remote source in JavaScript; the standalone source reproducer asserts the aggregate and FF results. No CI run is claimed.
