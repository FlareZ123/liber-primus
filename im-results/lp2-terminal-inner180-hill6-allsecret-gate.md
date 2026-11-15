# Original terminal table interior to solved pp56–57: arbitrary-secret 6×6 affine Hill key-recovery gate

**Agent12, 15 November 2026. Evidence class: complete, original-input algebraic exclusion for one source-aligned affine block cipher family; no unknown plaintext or historic key.** The read-only [Node22 CommonJS SFT](../sims/lp2_terminal_inner180_hill6_allsecret_sft.cjs) passed on [Windows CI run 43773232903](https://github.com/FlareZ123/liber-primus/actions/runs/43773232903), job exact-source.

## Observable premise and the key-recovery opportunity

The manuscript's original pp49–51 numeral table is a **32×8** rectangle with exactly **256 printed entries**. Its one-cell circumference has **76** entries, matching the **76 original GP29 runes** of unsolved physical p55. Its interior is **30×6 = 180** entries, the exact combined length of solved **p56 (85 runes)** and printed-clear **p57 (95 runes)**. Solved p57 itself says to *shed our own circumferences*. This layout presents a literal opportunity to learn an operation from source-labeled inner180 data and use it on the outer76.

An earlier test excluded **every stationary single-cell byte→GP29 shift lookup** that maps the inner180 to the authentic p56/p57 shift sequence, even allowing arbitrary secret lookup values, because equal input bytes demand contradictory shifts ([source geometry and stationary inverse](lp2-terminal-32x8-outer76-inner180-source-gate.md)). The present experiment tests a **genuinely different mapping**, where all six entries of a table row jointly determine six GP29 outputs under **an arbitrary secret affine 6×6 transformation over GF29**, permitting diffusion and 42 free coefficients.

The weakest causal premise is unchanged: nothing signed or printed explicitly says to align table interior with known p56/p57 or to apply a Hill cipher. Their true historical cipher treatments differ: p56 uses a prime-totient stream with literal-F key bypass; p57 is unencrypted. The test therefore addresses an executable, source-shaped hypothetical route to **key material**, without claiming historical authentication.

## Exact arbitrary-secret cipher and original inputs

Read all **256 original source byte values** from [the original-referenced 32×8 transcription](../resources/liber-primus/lp2-grid-256.json) without editing any printed symbol, reduce them modulo29 and retain the actual rectangular interior, discarding only the perimeter. Test four fixed full-interior traversals: row-major and its complete reverse, column-major and its complete reverse. Each is exactly 180 GP29 values, split in printed order into 30 consecutive source blocks \`X_t\` of six symbols.

Two separate, source-grounded candidate receivers \`Y_t\` each provide 180 GP29 symbols, likewise grouped into 30 sequential blocks of six:

1. **Authentic known plaintext:** original p56's independently solved 85 GP runes plus p57's printed clear 95 GP runes. The exact established p56 inverse consumes the first 84 ordinary primes minus one, bypassing one literal plaintext F at original offset56 without key advance, yielding the known **85/85** source text.
2. **Printed rune receiver:** original p56's 85 *ciphertext* GP runes plus p57's 95 clear GP runes, retaining original printing instead of using a proposed semantic decoding layer.

Under each pairing assume there exists one completely secret stationary six-column affine Hill rule:

\`\`\`text
Y[t,j] = ( b[j] + sum_i A[j,i] * X[t,i] ) mod 29
for t = 0..29; j = 0..5; A arbitrary 6×6, b arbitrary length6
\`\`\`

This is a full **42-free-key-coefficient** family. For every output component form the 30×7 input matrix **[X | 1]**, append the 30 target GP values to form the 30×8 augmented system, and compute ranks by exact GF29 Gaussian elimination. A solution exists if and only if **rank[ X | 1 | Y_j ] = rank[ X | 1 ]** for all j; the theorem holds regardless of secret A or b, and permits singular as well as invertible matrices.

For an operational, blinded demonstration select the first seven original input blocks whose seven-dimensional coefficient rows are linearly independent, recover each secret affine output row using only those seven known pairs, and then predict all **23 remaining held-out six-rune blocks**, without tuning the key or changing the original alignment.

## Result on original, unchanged source

**For each of the eight source-aligned cases, the 30×7 input matrix has exact GF29 rank7, while appending any one of the six authentic outputs raises rank to 8.** Every original candidate is thus **mathematically impossible** for every secret 6×6 affine matrix and every six-symbol bias vector under its specified input/receiver pair. Every seven-block training fit exists and matches those seven blocks, so held-out disagreement is decisive rather than a failure to infer a key.

| Original table interior order | Held-out authentic plaintext p56+p57 | Held-out original-printed p56+p57 |
| --- | ---: | ---: |
| Printed row-major | **4 / 138** | **3 / 138** |
| Reverse row-major | **10 / 138** | **4 / 138** |
| Printed column-major | **6 / 138** | **9 / 138** |
| Reverse column-major | **5 / 138** | **5 / 138** |

These are exact GP29 symbol matches under the uniquely fitted seven-row key in each pairing, out of **138 independent held-out symbols**. No one of the **23 entire held-out six-rune blocks** matches all six target positions under any of eight cases. The contradiction does not rely on an English model, an exhaustive secret-key search, a particular affine coefficient guess, a claimed original p55 plaintext, or a marginal frequency threshold.

**Secret-key positive:** using the unchanged 30×6 original input, plant a separate *invertible upper-triangular six-by-six secret matrix* and six nonzero bias terms. The exact same key-blind solver infers all 42 coefficients from the first seven independent source blocks and predicts **138/138** held-out planted GP29 symbols. All six augmented ranks remain7, as required for a true affine relationship. The full original table/corpus inventory and the authentic original p56 key bypass are asserted before analysis.

The [single runnable SFT](../sims/lp2_terminal_inner180_hill6_allsecret_sft.cjs) is read-only, requires Node22 built-ins alone, logs every original rank, selected training block, held-out score, first contradiction and the planted-key recovery. It passed the complete [Windows CI job](https://github.com/FlareZ123/liber-primus/actions/runs/43773232903/job/132993598074) together with prior Agent12 source assertions.

## Next decipherment decision

**Retire all stationary secret affine 6×6 GP29 table-interior-to-terminal mappings at the four specified source-natural readings**, whether the receiver is the historical p56+p57 plaintext or their displayed runes. The source cannot teach a unique 42-parameter Hill key for p55 through that alignment because no such key exists.

Other block sizes, changing affine keys, permutation of selected source positions, nonlinear or state-dependent encoders, external inputs and a different relationship between the table and final pages are outside this theorem. Such changes need new source clues; an arbitrary hidden nonlinear table would trivially memorize the 30 training pairs and give no independently selected p55 key. The exact 76/180/256 terminal geometry remains a recoverable source constraint, while the cipher operation and original p55 plaintext remain unknown.
