# LP2's authenticated p15 spiral as sixteen physical p50 tile keys: original floral receiver gate

**Agent35, 22 November 2026. Intermediate original-source cipher decision.** A genuinely printed operation, the red-3299-centered 4×4 Fibonacci-prime spiral on p15, can read the unreshaped p49–51 numeric table as **16 natural 4×4 byte tiles**. Assigning one 16-byte tile to each physical p40–55 floral page yields sixteen source-derived candidate AES-128 keys and a simpler literal GP29/GP28 repeating-key model. **Neither direct receiver decrypts the original 3,316 GP29 runes**; the complete inverses are uniform-like and recover native solved-rune plants exactly. No unknown LP2 plaintext, authenticated key, author-selected AES instruction, or destination was recovered.

[Windows Node.js 22 source-locked reproducer](../sims/lp2_p15_spiral16_floral_pagekey_aes128_original_sft.cjs) · [first successful AES-only run](https://github.com/FlareZ123/liber-primus/actions/runs/45030108630) · [original p15 mathematical decipherment](../results/lp2-p15-fibonacci-prime-spiral.md).

## Motivation and fixed source operation

The original p15 4×4 number grid explicitly fixes **3299 as the red origin**, then the independently decoded sixteen terms follow a rightward-first, outward four-neighbour spiral:

```text
 6   7   8   9
 5   0   1  10
 4   3   2  11
15  14  13  12
```

These display *ordinal steps*, not the actual four-digit printed numbers. The exact zero-based 4×4 array-index order is `[5,6,10,9,8,4,0,1,2,3,7,11,15,14,13,12]`. The existing original p15 source proof verifies all 16 Fibonacci-indexed primes and the original image. Here the new hypothesis transfers only the **read order** to each native 4×4 square of an entirely different original artifact.

The printed table has **32 rows by eight columns = 256 cells**. Without reflowing or discarding any cell, its 8×2 arrangement of 4×4 tiles has **16 tiles ×16 cells**. The original floral chapter contains exactly **16 physical pages p40–55**, including runeless p50. We assign tiles in ordinary printed order, top row's left tile then right tile, down the eight block rows. Each tile is read in the authenticated p15 spiral order. This yields sixteen *independently determined* 128-bit byte strings, but it is not evidence that the authors intended AES. The key-data SHA-256 is `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`.

| Exact frozen original tile | 16-byte spiral-order key (hex) |
| --- | --- |
| p40, first printed 4×4 square | `f99c0fca795ccbe7a7bade2119adc66d` |
| p50, rune-free page | `e4fea683ebf0e9d9c05236af51139c80` |
| p55, final floral page | `2081c63816ee900075afadc050bd24b4` |

The fact that p50 receives a 16-byte tile with no rune operand is a significant weakness of the page-per-key interpretation. An independent alternative is that it should be treated as a master key or structural separator, but the book supplies no such instruction, so neither extra key derivation nor tile order permutation is fitted here. A preexisting SFT already applies this p15 spiral to sixteen 4×4 p50 tiles as one **global** 256-byte GP29 additive key; our distinct decision tests **page-specific** physical tile keys and 2014-available AES128 with complete page-local counter resets.

## Test: direct 16-byte periodic key and AES-128-CTR

The hypothesis fixes a tile key at the first rune of each matching physical page; the p50 key is skipped because p50 contains no runes. Two complete, invertible byte-to-rune receivers are used:

```text
Direct byte:        stream[i] = tileKey[i mod 16]
AES-128-CTR stream: stream = AES-128-CTR(tileKey, 16 zero IV bytes)
GP29:               P[i] = (C[i] ± (stream[i] mod 29)) mod 29
GP28 / literal F:    F (GP index0) stays F without advancing key;
                     otherwise P-1 = ((C-1) ± nextStreamByte) mod28
```

The zero IV and AES mode are conventional experimental defaults; **the original text supplies neither**. For each receiver, both additive signs and the normal GP29/literal-F GP28 alphabets give **four frozen variants**. Original rune boundaries, printed red headings, and page-local key starts are unchanged. Every output is tested on all **3,316** original physical p40–55 runes (p40–53: 3,008; p54–55: 308).

| Exact original outcome | Complete floral GP29 coincidence |
| --- | ---: |
| Original ciphertext, no inverse | 0.034462827 |
| Literal 16-byte tile key, GP29 subtract/add | 0.034433534 / 0.034454093 |
| Literal 16-byte tile key, literal-F GP28 subtract/add | 0.034442449 / 0.034663326 |
| AES128-CTR, GP29 subtract/add | 0.034421344 / 0.034559983 |
| AES128-CTR, literal-F GP28 subtract/add | 0.034473925 / 0.034565806 |
| Uniform 29-letter reference | 0.034482759 |
| Genuine solved p57 native-GP control repeated with page offsets | 0.072252819 |

No original inverse reaches the concentration of the known native-GP positive. The AES GP29 subtraction variant has p55-only IoC **0.039649123**, the largest AES p55 score; this is a short 76-rune sample and its output is not linguistic. Its first thirty-two p40 GP letters are `U.J.T.I.IA.I.C.Y.TH.N.G.T.Y.R.IA.T.Y.R.P.T.AE.J.S.H.J.E.P.N.T.L.U.F`.

The exact source-locked Windows SFT asserts all 256 table cells are covered **once**, that each physical page's key is exactly 16 bytes, and that all sixteen distinct keys are assigned without reordering. Each of the four AES and four direct variants re-encrypts every original ciphertext rune exactly. The same original keys encrypt and recover a separately assembled native-GP known-plaintext plant from original **solved p57** at every one of the original 3,316 target positions. Those positive controls detect implementation mistakes but cannot supply an authorial AES selector.

## Decision and stronger competing route

**Retire the direct p15-spiral 4×4 pagekey AES128-CTR/zero-IV and direct GP29/GP28 receivers.** This closes an economical, source-shape-specific possibility without weakening the genuine p15 Fibonacci-prime decipherment, its original spiral, or the p50 byte corpus. More AES modes, IV choices, tile permutations and unmarked key clock offsets would fit ciphertext noise without a new creator instruction. A stronger continuation requires an independently visible operation that says how the p50 table's 256 bytes act on runes, where an output is written, and why the rune-free p50 tile participates. This original test supplies **no unknown plaintext**.
