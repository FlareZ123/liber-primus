# Terminal 256-rune unknown-shell inverse from the original degree-238 table factor

**15 November 2026, Agent 5. Classification: decisive conditional original-source negative for one fixed full-rank decoding architecture; no unknown LP2 plaintext or key.** This is an **erasure-recovery attack on unknown p55 plaintext**, and therefore stronger in a different direction than treating the existing p55 ciphertext as part of a common factor.

## Causal solve-path hypothesis and source selection gap

The original numerical table across physical LP2 pp49–51 contains **256** two-digit cells laid out 32×8. The original terminal physical pages contain **76 p55 unknown runes + 85 p56 cipher runes with a published exact plaintext + 95 clear p57 runes = 256**. The p57 parable instructs its readers to shed circumferences, so the p55 76 positions could hypothetically be the outer 32×8 ring and the other 180 cells the three inner rings of sizes 68,60,52. The first p55 rune actually completes the last word from p54, a genuine source obstacle to interpreting p55 as an independent plaintext block.

Independent [source-grid factorization](lp2-grid-complete-gf29-factorization.md) identifies a **unique monic irreducible degree-238 factor**, \`Q238(X)\`, of the original table's descending base60-byte-residue polynomial over GF29. Its 239 normalized high-to-low coefficients have SHA-256 \`9cb443bed228623bbd522efcd73888d3a4870c3db0ddcc147011765f3c8a9eb3\`. The original 256 source bytes have SHA-256 \`3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290\`.

**Hypothesis to challenge:** terminal p55–57 *plaintext* is a second codeword divisible by the **same** degree-238 factor. If true, all 256 terminal GP29 symbols could be recovered through \`T(X)=A(X)Q238(X)\` with **degree A≤17**, i.e. only 18 GF29 coefficients. The independently solved **180** suffix symbols should then select \`A\` *without knowing a single p55 plaintext rune*. The first eighteen linearly independent source-ordered known cells determine A; the remaining **162** are a high-power independent prediction, and all 76 p55 symbols follow uniquely.

This is plausible as a *testable human-visible algebraic hypothesis* because of the exact factor and the source's terminal perimeter prose, though there is no authenticated Cicada instruction requiring two separate source objects to share the same Q238 factor or telling the player to use GF29 polynomial factorization as a 2014 decoding step. Its source-selection premise is an explicit hypothesis rather than a discovered original cipher.

## Exact implementation

[Original-source CommonJS SFT](../sims/lp2_terminal256_q238_erasure_sft.cjs) uses only \`resources/liber-primus/lp2-grid-256.json\` and \`lp2-corpus.json\`.

1. Rebuild the **exact** published source factorization (with its unit 28), discard the grid's formal leading zero coefficient, derive the fixed monic Q238 and assert its 239-byte SHA-256 plus exact source-table forward multiplication. No Q238 coefficient is inferred or fitted from terminal data.
2. Obtain p56's **all 85** genuine GP29 plaintext symbols by inverting the first 84 prime-minus-one shifts and the single literal-F bypass at original p56 index56, with strict reencryption. P57 is taken directly from its 95 original GP29 symbols. Also test the distinct p56 original-cipher register so the result does not assume the terminal text shares p56's encipherment.
3. Independently test **nine complete source layouts**: 256 slots in their natural printed page order, or 32×8 nested-ring arrangements beginning at each of four corners in either direction. The 76 slots assigned to p55 remain **completely hidden**; only p56 and p57 supply equations.
4. For each of nine layouts × two p56 registers, construct the 180×18 GF29 coefficient matrix fixed by cell positions. Greedily select the first **18 independent coefficient rows** by rank, regardless of their GP values. Fit the unique A and predict every other known cell **once**, with no optimization or phase adjustment. A correct codeword must match 162/162. The original native-geometry codeword plant reconstructs all **256/256** positions, including its 76 withheld outer symbols, and predicts 162/162 held-out known cells.

## Original holdout outcomes

| Source layout | p56 source-cipher register (matches of 162) | p56 authentic plaintext (matches of 162) |
| --- | ---: | ---: |
| Printed 256-slot order | **4** | **5** |
| Ring top-left clockwise | 4 | 6 |
| Ring top-left counterclockwise | 6 | 7 |
| Ring top-right clockwise | 9 | 4 |
| Ring top-right counterclockwise | 5 | 7 |
| Ring bottom-right clockwise | 5 | 7 |
| Ring bottom-right counterclockwise | 11 | 7 |
| Ring bottom-left clockwise | 5 | 1 |
| Ring bottom-left counterclockwise | 8 | 6 |

All **18** original-source layouts have full coefficient rank18 and grossly fail the required 162 known-symbol predictions, even before checking a single purported p55 plain rune. The best original match is 11/162, while the exact source-derived positive control predicts 162/162 and exactly reconstructs its complete 256-symbol codeword. This eliminates *all* 29^18 multiplier values under each exact layout: the first18 independent known equations force the only possible one, and that unique choice contradicts 151–161 untouched known runes.

## Distinction from earlier work and next decision

The [earlier full-table polynomial coprimality gate](lp2-grid-complete-gf29-factorization.md#original-terminal256-versus-the-entire-table-exact-coprimality-gate-agent-1-12-november-2026) used actual **p55 ciphertext** as the leading 76 coefficients, and so did not exclude a Q238-coded but **encrypted** p55 plaintext. The [original H/G parity-only gate](lp2-terminal256-hg-original-parity-gate.md) allowed unknown p55 plaintext but had just **four** equations, leaving 29^72 hypothetical candidates. The present attack both withholds all 76 p55 plaintext symbols and uses the independent **full degree-238 source factor** to test a uniquely decodable 18-parameter candidate against the known true terminal runes. Other [source-inner all-secret matrix and code-family tests](lp2-terminal256-knowninterior-ring-gate.md) use different operators; none supplies this missing authorial instruction.

**Decision:** Retire the direct terminal plaintext \`Q238\` codeword model on printed/ring original geometry. No solution can be obtained by changing p55's putative prose, by changing its F mask, or by optimizing unknown p55 glyphs within this family: the contradiction is entirely in the independently known p56/p57 symbols. A different factor, nonlinear transform, or nonstationary code still requires a creator-supplied selector and a new original-input prediction. No unknown plaintext/key or Cicada destination was recovered.

**Reproduce:** the complete self-contained CommonJS program in [\`sims/lp2_terminal256_q238_erasure_sft.cjs\`](../sims/lp2_terminal256_q238_erasure_sft.cjs) runs under Node22 using the original JSON corpus and prints each frozen 162-position holdout. It includes factor integrity and planted full-codeword positives.
