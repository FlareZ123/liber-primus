# P15's 16 printed cells and the adjoining chapter's 16 punctuation fragments: an exact original alphabet-capacity gate

**Agent 10, 22 November 2026. Classification: source-selected count, conditional all-secret cipher-family exclusion. No unknown plaintext or key.**

## New original juxtaposition with an important seam caveat

The original physical LP2 p15 (archive 32.jpg) has exactly **16 numeric cells** in a proven Fibonacci-prime spiral. The next six original physical pages **p16–p21 have 15 literal printed full stops**, defining exactly **16 punctuation-separated rune fragments**. The 16 original fragment lengths are:

`[87, 35, 123, 86, 41, 14, 48, 50, 127, 115, 121, 105, 69, 184, 375, 33]`

They total **1,613 unchanged GP29 ciphertext runes**. **These are not sixteen complete sentences:** the first fragment continues the red page-15 section across the original page seam, and the last fragment continues into p22. No comma, dash, line break, page boundary or carried-word separator was added or removed. The count match is a simple, physically inspectable potential route from the 4×4 key square to the adjacent book text; it is **not an instruction from the puzzle author**.

As a rough descriptive control, only three of the **51 overlapping possible six-page windows p0–55** have exactly 15 original full stops (starts p16, p23, p48). This 3/51 is an observed inventory, **not a probability of intentional design**: the windows overlap, punctuation rate varies across chapters, and the first/last fragments of this physically cut corridor are incomplete.

## Exact unlimited-secret decipherment test

The most generous fixed sentence/fragment-level symbolwise interpretation is one independent **29! arbitrary permutation of GP29 plaintext rune identities per physical punctuation fragment**, selected by the corresponding sixteen p15 cells. This includes the simple expected reading `plaintext rune = ciphertext rune - square cell value mod 29` and every other additive/nonlinear secret 29-rune alphabet choice on each fragment. No secret key or matrix orientation is searched.

For fragment j, let its original 29-bin ciphertext histogram be h[j]. A bijection can change which letters occupy those bins but cannot change its ordered count multiset. Therefore, for **every** possible assignment of the 16 full secret alphabet permutations, the **global top-five recovered GP29 plaintext rune count** is upper-bounded by the sum of the five largest bins in each fragment. This yields an exact necessary-condition capacity, with no statistical fitting:

| GP29 plaintext global rank prefix | Maximum count permitted by original 16 fragments |
| --- | ---: |
| Most frequent rune (top 1) | **112** |
| Top 2 | **212** |
| Top 3 | **305** |
| Top 5 | **475** |
| Top 8 | **707** |

The exact original ciphertext by itself contains 328 positions among its five most frequent observed runes; the **475 upper bound already assumes the unknown decryptor independently aligns the most favorable five different rune identities in every single fragment**. Thus ordinary alphabet-key retuning cannot overcome this upper bound.

## Language calibration and reversible positive

Use 60 complete original-book-length, GP29-authentic **word-length-matched plaintext sources** from each of three pinned corpora: Gibran *The Prophet*, Shakespeare, Latin Vulgate. Generate genuine words in the existing LP1-calibrated solved GP spelling convention, retaining exactly the **2,896 whole printed LP2 word lengths** including the original **32 cross-page continuations**. From each 12,956-rune donor, take exactly the same p16–p21 original positions (1,613 runes) and apply the identical fixed 16 punctuation-fragment cuts. No scoring-based selection of candidate text or key is used.

All 180 authentic GP donor texts exceed **both original top-one ceiling 112 and top-five ceiling 475**; the lowest top-five source occupancy is at least 622/1,613. In a constructive positive, a full-length original-shaped Gibran donor is encrypted with **16 completely secret shuffled 29-rune permutations, one independently per punctuation fragment**; the correct inverse recovers **1,613/1,613 original-shaped genuine GP rune positions** and satisfies the mathematically necessary top-k bound on its own ciphertext. This prevents confusing lack of code inversion with the original-text language mismatch.

**Decision:** If the p15 key square were meant to supply **one stationary rune alphabet per one of the sixteen immediately following punctuation-separated fragments**, no possible secret assignment of the sixteen alphabets can decode the original p16–p21 corpus into GP-native ordinary prose comparable to any of these source corpora. The count clue may therefore be decorative or choose another **evolving, inter-fragment, polygraphic or external-key** operation. The exact source does not tell a reader to interpret the 16 cell positions as sixteen punctuation-fragment alphabet rows. This is a bounded conditional original receiver, no first-party decryption and no evidence for an authenticated 16-piece author instruction.

**Prior art and novelty:** Agent25's [13 November sixteen-**rune-phase** all-secret original gate](lp2-p15-period16-allsecret-source-gate.md) already excludes the stationary 16-phase clock. This test is genuinely different: the **six-page punctuation determines 16 unequal contiguous fragment spans**, and the algebra allows 16 **independent full secret alphabets**, one per span. The [earlier Agent10 rank-envelope restatement](lp2-p15-16phase-allsecret-original-prose-capacity.md) did not evaluate this punctuation-reset model. Although the rank proof form is the same, this is a distinct physically selected clock. Both results agree that GP-native prose requires a source-selected value-changing mechanism with more than a fixed table for each printed 16 cell.

**Reproduce:** [Complete Node22 CommonJS source-data SFT](../sims/lp2_p15_16punctuation_units_allsecret_sft.cjs) and [Windows GitHub Actions PASS run 45015057610](https://github.com/FlareZ123/liber-primus/actions/runs/45015057610). Inputs are unchanged canonical `resources/liber-primus/lp2-transcription.txt`, `resources/liber-primus/lp2-corpus.json`, p15 32.jpg and the three pinned source-native control corpora.
