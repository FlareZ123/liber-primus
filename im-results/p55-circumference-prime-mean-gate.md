# Physical p55: exact circumference GP-prime mean and a frozen prime-37 inverse

**Status: source-backed arithmetic observation with a negative direct original-cipher test.** This record recovers no unknown LP2 plaintext, authentic key, complete decipherment or destination. It is a potential clue worth preserving without treating numerical uniqueness as proof of authorial intent.

## Human-readable clue and independent input

Solved physical p57 says to **"shed our own circumferences"** and **"find the divinity within."** The original p55 contains 76 runes, one of which finishes a word begun on p54. The source-canonical cross-page word parser `sims/lp2_word_pages.cjs` yields 16 complete p55 words with printed lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Removing first and last runes from those complete words yields precisely 43 strict interiors. The remaining 32 local word edges plus the one incoming boundary rune give 33 exteriors. This is a concrete interpretation of the solved p57 wording, already independently used as a *selection* in prior research, with no new tokenization choice.

Map each GP rune to its **published Gematria Primus prime weight**, a transformation explicitly used in solved Cicada-era material. On original physical p55:

| Fixed source channel | Rune count | GP prime-weight sum |
| --- | ---: | ---: |
| Word interiors of the 16 complete p55 words | **43** | **2,060** |
| Their first and last runes | 32 | 1,512 |
| Incoming word-boundary rune from p54 (NG, GP prime 79) | 1 | 79 |
| **All exterior runes on physical p55** | **33** | **1,591** |
| All p55 runes | 76 | 3,651 |

The exact equality is **1,591 = 43 × 37**. The integer mean of the 33 exterior prime weights *per interior rune* is **37**, the GP prime weight of **J** (GP index 11). No source commands this particular division or says to interpret its quotient as a key.

Applying exactly the same cross-page word-role classification and division to each of the **55 original unsolved rune-bearing physical pages** gives no other integer quotient. Solved p56 has 36 interiors and exterior prime sum 2,485; solved p57 has 55 interiors and exterior sum 1,961. The p55 equality does **not** arise when the incoming p54 word-finishing rune is excluded (1,512/43 is noninteger), so that one original-page boundary rule is essential to the observation.

## Exact within-page permutation null

Condition on the original p55 **76-element GP-prime-weight multiset**, preserving all actual rune values and fixing the same **33/43** exterior/interior position counts. Every 33-element choice of exterior positions is equiprobable; count all choices by an exact BigInt dynamic program whose state is `(number selected, weight sum)`. This counts duplicate-letter multiplicities in the combinatorial outcomes instead of treating distinct weights as unique.

- Total ways: **3,594,123,189,167,641,103,400** = C(76,33).
- Ways with exterior sum **1,591**: **10,210,113,785,085,201,060**, exact probability **0.00284078014239**.
- Ways in which the sum divided by the fixed 43 interiors gives **any one of the 29 GP-prime weights**: **19,052,734,055,245,324,262**, exact probability **0.00530107986078**.
- Ways giving **any integer** quotient: **83,584,260,234,085,902,300**, probability **0.02325581395930**.

The 0.00530 is a **p55-only, conditional** probability. The terminal p55 page has a source-motivated reason to be inspected, but the exact mean rule was noticed after examining its data, and many other source features, operations and pages were available. These are **not discovery-wide significance values**, and numerical rarity alone does not establish intentional encoding. As a rough sensitivity check, 2,500 xorshift32 pseudo-random within-page permutations across **all 55** page-specific source multisets yielded at least one GP-prime quotient on about **11.4%** of book-level replicates. That auxiliary simulation is approximate and is not used as a decisive claim.

## One frozen route to plaintext

The p56 known solution uses a GP29 additive inverse subtracting successive **prime totients** (p−1), with exactly one source-specific literal F that leaves the key clock unchanged. The p55 arithmetic supplies a candidate prime **37**, which is itself prime; this suggests *one* direct test on exactly the p57-selected 43 interiors:

`P_i = (C_i - (prime_after_37(i) - 1)) mod 29`, with the first prime **37** and no source-free offset or transposition.

Two states were tested: every rune consumes one prime, or the sole interior ciphertext F is emitted literally and consumes none. Both decode and re-encode the same source input exactly. The existing genuine p56 rule is checked independently against **all 85** authentic p56 plaintext runes in the SFT.

| Frozen direct p55 43-rune inverse | GP29 index of coincidence | Decision |
| --- | ---: | --- |
| Source 43 interiors, still encrypted | 0.0343300111 | Reference ciphertext |
| Start-prime 37, all runes consume | **0.0354374308** | Unreadable |
| Start-prime 37, literal-F nonconsuming | **0.0431893688** | Unreadable |

The literal-F output is `EO EA EA E F TH AE T C L H F M N I B M D T AE I U O C I O U U E H I F EA D N W J N T D C C I`. It is not GP29-native prose, is shorter than a robust language test, and does not provide original unknown plaintext. A distinct prior [p56-prime-totient → p55 interior gate](p55-phi-prime-43-interior-gate.md) used the genuine p56 start prime 2; the new test differs solely in its independent candidate prime-37 start. No arbitrary prime starts, signs, clocks, or alphabet variants are searched.

## Research decision

Preserve **p55 outside-sum 1,591 = 43 × 37** as a source-derived *candidate checksum/selector*, with its postselection caveat. Retire the literal source-fixed prime37 → 43-interior p56-totient additive model. The missing causal operation is what J/37 should control, if anything. A follow-up merits original-cipher computation only if an **independent source instruction** selects a reversible use of that value and a complete 76-glyph treatment, including the 33 exteriors and incoming page boundary. Do not bootstrap additional tuned starts or ciphers from the arithmetic equality.

**Reproducer:** [`sims/p55_circumference_prime_mean_sft.cjs`](../sims/p55_circumference_prime_mean_sft.cjs), Node 22 CommonJS, no packages or writes. It reads the repository's original `resources/lp2-transcription.txt` and canonical `resources/liber-primus/lp2-corpus.json`, asserts every count, computes exact BigInt null probabilities, reproduces the fixed p55 candidates, and recovers the authentic 85-rune p56 known plaintext. The script was executed against the unmodified GitHub-returned UTF-8 file contents in a Node-API-compatible evaluator; all assertions passed.