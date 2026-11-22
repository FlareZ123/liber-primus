# Five red-numbered LP2 passages: serial-state handoff lacks a typed source operand

**Agent50, 22 November 2026. Director #2156 source-selector decision:** Original p36–p38 establishes a real five-item ordered enclosure, but its terminal runes and page punctuation supply no independently defined serial key/state transition. The test stops at the missing instruction rather than fitting five private keys. No original plaintext, cipher, or creator key is recovered.

## Source-visible structure and historical player path

Original 2400×3600 scans `53.jpg`, `54.jpg`, `55.jpg` show red decimal numerals **1, 2, 3, 4, 5** at the starts of five ordinary runic text blocks. Two separate red ten-dot marks **bracket the entire five-block passage**, before 1 and after 5. There is no special red state token, arrow, or different type of terminal punctuation *between* successive blocks. Number 4 begins on physical p37 and continues onto p38 before number 5: a printed page boundary is **not** itself a unit terminator. All five exact source intervals were established from independent image readback and preserved in prior studies.

| Literal red number | Original exact source slice | Runes | First GP index (rune) | Last GP index (rune) |
|---:|---|---:|---|---|
| 1 | p36 [99,238) | 139 | 20 (L) | 24 (A) |
| 2 | p37 [0,91) | 91 | 9 (N) | 17 (B) |
| 3 | p37 [91,189) | 98 | 23 (D) | 7 (W) |
| 4 | p37 [189,228) + p38 [0,57) | 96 | 21 (NG) | 19 (M) |
| 5 | p38 [57,186) | 129 | 8 (H) | 5 (C) |

The observed physical signal is a fixed **1→2→3→4→5 presentation order** and no explicit ciphertext cipher operand. The five natural lengths are **139/91/98/96/129**, sum 553; passage 2 prevents any five-lane 100-rune alignment. Exactly one adjacent-equal ciphertext event occurs inside the combined 553-symbol enclosure, entirely within passage 1.

A generic serial handoff could regard each unit's terminal state as the following unit's initial key. At least **four independently different fields** must be fixed before this becomes an original-cipher hypothesis: which of the terminal ciphertext, plaintext, last word, GP prime/ordinal, or whole-message digest constitutes the state; which exact reversible transform consumes it; whether the numeral changes the state; and how to recover the initial state of item 1. None is supplied by the numeral labels or repeated cuneiform header 1033/3301. An arbitrary secret transition can be invented for every desired target without an untouched prediction.

## A fixed boundary-value observation, without key fitting

If one provisionally uses the *simplest* GP29 predecessor transition, the four actual changes across printed item boundaries, with exact no-wrap source edges, are:

```
last C1=24 -> first C2=9  : (9 - 24) mod29 = 14 = X
last C2=17 -> first C3=23 : (23 - 17) mod29 = 6 = G
last C3=7  -> first C4=21 : (21 - 7) mod29 = 14 = X
last C4=19 -> first C5=8  : (8 - 19) mod29 = 18 = E
```

Thus the complete natural four-symbol cross-boundary difference is **X G X E**. There is no complete readable instruction, location, nonce, or agreed initial decoder in that output. Four symbols are too few to infer a changing-state mechanism from language scores, and none of the original red numerals instructs subtraction across a boundary. This is a simple geometry/accounting control, **not a recovered key**. The independent word punctuation and the p37→p38 carry are unchanged by this reading.

## Independent solved and first-party operations already tested on this receiver

Earlier real original-source experiments directly cover the two specific author-motivated transfers relevant to an imagined 1–5 state chain:

- The **2013 historically demonstrated Shamir secret sharing**, with visible item labels as x-coordinates, fails five-message position-aligned degree-two/three reconstruction; degree-four recovers nonprose over the complete common 91-symbol prefix. See [Shamir original test](lp2-five-numbered-shamir-original-gate.md).
- The **authentic p56 prime-totient cipher including literal-F nonconsumption**, started at those printed ordinal labels, has no legal inverse across all five original passages for either sign or any common historical prime-offset phase among 460 choices. See [prime-label and F-transparent test](lp2-cuneiform-five-number-prime-start-ftransparent.md).
- The source-era numeric **1033/3301 DH orbit** is length550 rather than the printed553 and produces no coherent plaintext under 32 source-bounded direct inverses. See [DH-550 original test](lp2-cuneiform-dh550-numbered-passages-original.md).
- A common unknown GP29 additive pad reset exactly at red starts is ruled out under source-native five-message plaintext and independently planted controls. See [full-secret five-way test](lp2-cuneiform-five-numbered-wisdom-inversion.md#five-way-full-secret-shared-pad-plaintext-recovery-agent23-2150-22-november-2026).

The historical 2013 signed continuation messages contain explicit addresses or actions ("knock on the sky", "everything you need") but **no numbered-LP2 passage key update**, and the signed 2014 Stage11 message supplies an onion endpoint, not an opcode for these five 2014 rune texts. A previous round's cryptographic technique does not by itself authorize a state transfer to the red 1–5 labels.

## Decision and what would change it

The intended-player premise (five numbered items must be related) is real; treating the numbers as a *specific serial encryption/key-handoff recipe* currently adds unsupported state. The original images give start and stop boundaries and a presentation order, **but no complete state or transition that can be applied to a prospectively sealed ≥150-rune next passage**. The four boundary differences have no source-selected consumer. Therefore #2156 stops at the **typed operand / first-state selector gap**; running fresh five-key cryptanalysis or testing all 29^5 seed assignments would be pure key fitting.

A genuine successor must first locate a dateable first-party instruction specifying the state object and update equation, or recover an actual message plaintext that instructs a particular next-unit operation. Then apply the fixed state to unit4→5 and at least one other untouched unit boundary, with exact forward reencryption. Until then this is a bounded negative on the *proposed serial interpretation*, not a claim that all five passages are independent texts.

**Reproduction:** exact source indices, literal numeral/page spans and four boundary differences follow solely from `resources/liber-primus/lp2-corpus.json`, using the five slices printed in the table. All have been recomputed on the GitHub source in this invocation. Independent source-image readback and the existing executable consumers are linked above.
