# Longest red span intersects the sole surviving 79/78 packet phase

**Agent 9, 10 November 2026. Classification: exploratory source/cryptanalytic alignment, for independent investigation. It is neither a decipherment nor evidence that the 79/78 model is authentic.**

## Two previously independent observables

The [source ink annotation](../resources/liber-primus/lp2-ink-annotations.json) identifies exactly one **51-rune red span** in the unsolved LP2 ciphertext: physical **page 53, local rune positions [128,179)**, extending to its final rune. It is the longest of the 16 red spans on LP2 pages 0–55. The normalized canonical physical-page corpus [`lp2-corpus.json`](../resources/liber-primus/lp2-corpus.json) has exactly **12,956** unsolved cipher runes, without spaces or punctuation in its `indices` arrays.

Summing the actual rune lengths of every earlier physical page yields **12,469** rune positions before page53. Thus:

```text
p53 red begins  = 12,469 + 128 = 12,597 (global zero-based rune offset)
red begins - 1  = 12,596 = 79 × 159 + 35
p53 red ends    = 12,647 inclusive
p54 begins      = 12,648
```

The previously reported [exact 79/78 packet CSP](../im-results/prime79-radix29-packet-gate.md), which uses the prime79/totient78 numerical clue and allows an arbitrary secret 29-rune cyclic order, excludes **157/158** candidate global phase/direction models by exact source constraints. Its **sole survivor is global phase35, forward digits**. For that pre-existing phase, one 79-rune candidate packet starts at **12,596**, immediately before the beginning of the distinct 51-rune red span at 12,597.

This gives a *possible* independently visible packet-boundary selection rule: select the immediately preceding black rune as the packet's first output, immediately followed by the longest source-marked red passage. Under this rule the source annotation predicts **phase35 mod79** without using the enumerated CSP witness. It also gives a specific point where a packet may cross between page53 and page54: the putative packet is **[12,596,12,675)**, with its first 52 outputs on page53 and its final 27 on page54.

## Decisive limitation in the same original packet

The 79-rune packet starting at 12,596 is **not clean under the hypothesized predecessor-excluding encoder**. At global position **12,668**, near the start of page54, the observed ciphertext rune equals its predecessor. Thus the exact 79-to-78 base-conversion inverse conservatively **discards this packet** along with other doublet-bearing packets. The entire 51-red-rune span cannot yet be decrypted by the sole surviving strict no-repeat model. Any special red-span handling, escape, packet repair or alternate clock would require an explicit reversible transformation and independent evidence.

The question is whether the red boundary is an intentional alignment cue to the 79/78 code, or one selected coincidence among many possible sources, positions, offsets and moduli. There are **16 independently annotated red spans**, and the single longest span was noticed after the phase35 search; an informal 1-in-79 agreement cannot be given a discovery-wide p-value. The source alone does not instruct subtracting one rune from the red beginning. The 79/78 model does not yet explain the book's **86 adjacent ciphertext doublets**, does not recover true original LP2 plaintext, and does not provide an authentic cyclic alphabet.

## Direct source-red alphabet tests on the surviving clock

The ink annotation covers all **29** distinct GP rune symbols across its **213 red runes** on unsolved LP2 pages. This permits genuinely source-derived secret cyclic orders, independent of fitting the ciphertext: (a) first appearance in original red-reading order, (b) reverse red-reading/last appearance, (c) first occurrence starting with the distinctive p53 red51 span, completing the missing symbols from the remaining red ink, or (d) decreasing red-rune frequency with canonical GP-order ties.

[The exact CommonJS inverse](../sims/red_source_79_phase35_order_gate.cjs) applies each frozen order to the **95** repeat-free original phase35 packets. It computes the entire BigInt base-28 packet value, rejecting any output with value at least **29^78**. No plaintext model is fitted. The results from [successful source and positive-control CI run 42818698045](https://github.com/FlareZ123/liber-primus/actions/runs/42818698045) are:

| Original-source cyclic rune ordering | Numerically valid original packets | Numerically impossible packets |
| --- | ---: | ---: |
| First red rune occurrence | **55/95** | **40/95** |
| Reverse red occurrence | **52/95** | **43/95** |
| Exceptional p53 red51 span first | **50/95** | **45/95** |
| Descending red-rune frequency | **43/95** | **52/95** |

The same script explicitly GP-encodes and round-trip packs an independently sourced **936-rune Shakespeare plant** into **948 no-doublet ciphertext runes** using the first-red source order and exactly decodes every one of the 936 plaintext runes. Thus the exact numeric capacity gate has a working positive case.

**These four red-ink-derived alphabets are mathematically excluded as the complete single static cyclic key for the strict 79/78 packet code at phase35.** The source-red boundary arithmetic itself remains unchanged. A more complex source-driven key derivation, section-changing cyclic order or escape handling is outside this screen.

## Productive follow-on

Test independently constrained packet-clock hypotheses in which the single black rune preceding the exceptional red51 passage is a header, synchronizer or separate state event. A credible forward generator must explain why packet [12,596,12,675) contains a doublet at 12,668 without deleting or changing unknown plaintext, and must hold across other source red spans and page boundaries. Pair this test with source-derived key/permutation proposals rather than language-only fitting to candidate plaintext. Do not promote a 51-rune red passage or phase alignment to a key before full original-cipher re-encryption.
