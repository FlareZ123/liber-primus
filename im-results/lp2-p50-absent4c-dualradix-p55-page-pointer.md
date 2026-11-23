# Conditional missing `4C` cross-radix pointer from the original p50 table to LP2 p55

**Agent25, 23 November 2026. Classification:** exact original-source finite census; unverified navigation hypothesis. **No recovered LP2 unknown plaintext, cryptographic key, or authenticated decoder.** The original 56 unsolved LP2 pages remain unsolved.

## Original observable and proposed human move

The 2014 original physical pp49–51 (JPEG `66.jpg`–`68.jpg`) print **32 rows of eight two-character alphanumeric tokens**. The existing [spatial-successor report](lp2-p50-highband-spatial-successor-chain.md) finds physically adjacent increasing sequences `48→49→4A→4B` and `4D→4E→4F`, with **`4C` missing** from the entire 256-cell original table. The current test accepts those observations without re-running the many existing spatial shuffles.

There is an exact second reading of the same absent literal token:

1. As hexadecimal ASCII, `0x4C = 76`, which is the letter **L**.
2. Under the repository's conventional, *provisional* base-60 interpretation of the printed numerals, `4C = 4×60+12 = 252`; `252 mod 29 = 20`, exactly **GP29(L)** in the original Gematria Primus index order.
3. Of the **58** LP2 physical pages, only **p55 has exactly 76 printed runes**. Thus the ASCII code of this source-absent glyph is an exact, unambiguous *page-length selector*.
4. Original physical **p32 starts with the GP rune L**. Separately, p32 and p55 contain the strongly registered blurred/sharp illustrations of the same tree; see [original-image correspondence](lp2-p32-p55-blurred-tree-correspondence.md). The first-rune observation is weaker than the numerical identity because **four** LP2 pages start with L (p3, p4, p17, p32).

The **full grid geometry** strengthens the *conditional receiver* without decoding it: the 32×8 printed panel has an **outer circumference of exactly 76 cells**, while the three final LP2 pages have **76+85+95=256** printed runes. Peeling the outer 76 cells leaves **180** interior cells, matching solved p56+p57's **85+95** runes. This exact outer/inner partition and the p57 cleartext's "shed our own circumferences" clue are **established prior work** in [the terminal-256 original source gate](lp2-terminal256-grid-p56-knowntext-allsecret-lookup-gate.md); the only new conjunction here is the missing `4C` dual-radix pointer. That prior gate already rejects all eight natural row-major/reverse/peel byte-to-GP shift lookups, even with arbitrary secret 256-byte lookup keys, against genuine p56 known plaintext. This prevents interpreting the new numeral coincidence as if the matching 76-cell ring had been deciphered.

These are reproducible coincidences between *different observable source registers*. Reading an absent table token as an instruction to visit a page is a hypothesis. The source does not supply that instruction, and the cross-radix reading was noticed after the spatial bands and page counts were already known. Do not attach a discovery-wide chance probability to the conjunction.

## Complete fixed candidate census, including rivals

Hexadecimal ASCII uppercase letters A through O produce literal two-character tokens `41`…`4F` and are the full uppercase letter set whose hex spelling could fit the actual panel's single-digit high glyph `4`. For each of these **15 candidates**, enumerate all 256 original printed tokens, convert its hypothetical token to base60, reduce modulo29, and compare to the canonical GP index of its ASCII letter (K aliases C). Do this also for **present** tokens, so the missing `4C` is not tested alone.

| Candidate | Exact original result |
| --- | --- |
| **Self-indexing base60-to-GP letter** | **L only**: `4C → 252 → 20 = GP(L)` |
| Missing among the 15 hypothetical ASCII tokens | **A, B, C, D, L** |
| Absent ASCII tokens whose decimal code is a physical LP2 rune-page length | **B→66→p49; L→76→p55** |
| Simultaneously self-indexing, absent and uniquely matched to a page length | **L→p55 only** |
| p32's first GP letter | **L** (p3, p4 and p17 also start with L) |
| Same `4C` token under alternative radix59 | **248 mod29 = 16**, different from GP(L)=20 |

The last row is an important **radix sensitivity**. The ASCII reading of `4C` is stable, but the 29-index self-match only exists if the speculative source convention is exactly **base60**, rather than the nearby base59 interpretation studied elsewhere in the repository. It therefore cannot be used as independent validation that base60 is correct without circularly assuming the intended cross-radix connection.

This full finite comparison sharpens the newly observed missing-L pattern and connects it conditionally to the **pre-existing** exact outer-ring76 / inner180 receiver. The outer-ring arithmetic is visible in original physical geometry, but the eight prior natural stationary lookup decoders fail independent p56 plaintext. It does not independently establish a key, source instruction, sequential traversal, or a decoded rune. The other absent letters and B→p49 count are explicit rivals to selecting p55 from absence alone.

## Existing source-motivated table-pointer operation: new missing-value start

The 2016 signed sentence **“their numbers are the direction”** already motivates, and prior [full table-graph research](lp2-p50-functional-graph-2016-wordmap.md) independently specifies, the simplest source reading: from zero-based address `i`, follow the actual base60 byte `T[i]` as the next address. That report identified the authentic signed `DEVOTED` GP0 value **102** navigating to **p32** because `T[102]=32`, as well as the exact 11- and 2-cycles. None of the *operation*, its full graph, or the signed-word→p32 endpoint is new here.

**New fixed candidate start:** the literal absent token `4C` itself gives canonical base60 integer **252**. Starting the *already established* pointer procedure at this one address, without fitting an offset, direction, or receiver, yields this complete authentic-source trajectory:

```text
252 → 180 → 144 → 125 → 20 → 102 → 32
                                  → 115 → 247 → 192 → 0 → 203 → 68
                                  → 199 → 47 → 76 → 114 → 197 → 115 ...
```

- `T[252]=180`, exactly the number of **inner** cells in the printed 32×8 rectangle after shedding its 76-cell circumference. **Cell 252 is the only one of all 256 source addresses with printed-byte output 180.** This is an exact cross-geometry identity, while the choice to equate the byte with the inner-cell count remains post hoc.
- The path later visits `102→32`, which is the **previously independently identified 2016 signed DEVOTED→p32 endpoint**, at exactly six steps from the newly chosen start. Physical p32 begins with GP rune L and carries the blurred tree associated with p55.
- The path joins the existing eleven-cycle and includes address **76**, equal to original p55 length. **This particular end-of-cycle match is weak**, since **252/256** starting addresses enter that same 11-cycle; it must not be counted as independent confirmation of the new start.

An exact all-starts source control qualifies the convergence claim: **93/256** table starts, and **29/95** byte values *absent from the 256 printed outputs*, eventually pass through address32. Thus *reaching32* by itself is common. The distinct testable novelty is the **source absence choosing start252 together with its unique immediate 180-byte output**, and the coincidence with the already independently mapped 102→32 step, not discovery of a new 11-cycle or solved plaintext.

**Causal limitation:** no Cicada message instructs a player to treat a missing hexadecimal ASCII letter as a base60 *address*, nor to interpret `T[252]=180` as a key, delete it, or choose which 76 p55 runes to decrypt with it. The signed 2016 hint comes after the original 2014 delivery. Every pointer-step identity here is completely reproducible, but no reversibly decoded unknown rune is established. The proposed single-start path is substantially more constrained than a fitted cipher search, yet remains a **conditional navigation hypothesis**. A stronger next step would require a first-party consumer or a complete fixed original-rune prediction rather than another post-selected numerical bridge.

## Reproducible original-input test

[Single-file read-only Node.js CommonJS original-data SFT](../sims/lp2_p50_missing4c_dualradix_page55_sft.cjs) reads `resources/liber-primus/base60-grid.json` and `resources/liber-primus/lp2-corpus.json`, asserts all **256** token-to-byte source conversions, enumerates all **15** qualifying ASCII letters, validates the exact self-index/absence/page-length conjunction and the base59 counterexample. Its revised graph section asserts the entire source-exact **252→180→102→32→76** trajectory, unique direct180 predecessor, and the 93/256 and29/95 independent-start baselines. The complete source-positive claim is arithmetic and census only: no reversible decoder is proposed or plant falsely called a plaintext verification. The original source-data calculation was independently executed directly on GitHub-fetched JSON.

## Decision and prospective requirement

Retain this as an *exploratory navigational conjunction*: the numeral panel may mark a missing **L** that points to **p55** and its 76-cell outer-ring counterpart, while **p32** has the same rune at its first position and shares the illustrated tree motif. A human can reconstruct the arithmetic without unbounded cipher-key search, but the decisive missing element is **an original creator-selected operation consuming L or the p55 page**.

A useful next step requires either a historical first-party instruction prescribing the dual base60/ASCII/GP reading or a **frozen full-original p55 inverse** derived independently from this `L` pointer that recovers natural text and predicts untouched material, including the authentic p54→p55 word carry. Do not optimize shifts, KDFs, page rotations, alphabet alternatives or image thresholds until that operation is independently selected. Nothing here warrants changing the established solution status in `results/README.md`.
