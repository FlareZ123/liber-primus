# Four-rune radix-29 power cipher: all-secret original-input exclusion

**Classification (Agent 50, 11 November 2026): reproducible, exact key-independent necessary condition with independent native-GP reference controls.** This test recovers **no unknown Liber Primus plaintext, authentic key, original cipher or destination**. The original-image 4×4 numerical square and the published emphasis on rune primes and totients motivate considering a four-symbol prime-power interpretation. No surviving manuscript instruction actually specifies the p-adic cipher below; it is an explicitly bounded candidate.

## Question and algebraic obstruction

Could each group of four printed runes be a radix-29 integer, transformed by modular exponentiation with unknown exponents? A usual power map is not invertible on all residues modulo a prime power: exponentiating a multiple of 29 changes its 29-adic valuation. To give the hypothesis the strongest **lossless** realization, preserve the valuation and exponentiate the remaining unit:

\[
T_e(0)=0,\qquad
T_e(29^v u)=29^v\bigl(u^e\bmod29^{4-v}\bigr),\quad
29\nmid u,\;0\le v<4.
\]

Here \(e\) is any integer coprime to \(\varphi(29^4)=28\cdot29^3\). The inverse is the same operation with the modular inverse of \(e\) modulo \(28\cdot29^3\); there are no discarded symbols. The authentic 2014 numerical clues **1033 and 3301** are legal example exponents, but do not establish that this operation was intended.

For each four-rune block \(P\), the least significant base-29 digit of its output satisfies

\[
T_e(P)\bmod29=
\begin{cases}
0,&P\bmod29=0,\\
(P\bmod29)^e\bmod29,&\text{otherwise}.
\end{cases}
\]

Because the right-hand map is a permutation of all 29 rune indices, **every equality and inequality between protected digits within one constant-exponent domain is exactly preserved**, regardless of the secret exponent. This supplies a key-independent original-ciphertext test without guessing any exponent, deriving a plaintext key or optimizing a language decoder.

The strongest permitted alternate implementation independently chooses for **each physical page** (i) any of four starting phases and (ii) either big- or little-endian digit order. Each page may also have its own completely secret valid exponent. The resulting \(8^{55}\) combinations do not require enumeration. For each page/phase/orientation calculate its protected-digit collision numerator \(A_i=\sum_j n_{ij}(n_{ij}-1)\) and denominator \(B_i=N_i(N_i-1)\). Maximize or minimize the pooled index \(\sum A_i/\sum B_i\) exactly using fractional selection; the program verifies the optimum with **integer dual residual zero**.

## Original 12,956-rune evidence and controls

The original source is the 55 rune-bearing unsolved physical LP2 pages 0–55, omitting the runeless table page 50, in [the canonical GP-index corpus](../resources/liber-primus/lp2-corpus.json). The test also retains the original 2,896 printed word lengths for controls; punctuation, printed word boundaries and physical page lengths are unchanged.

| Original all-secret setting | Protected-rune collision numerator / denominator | Index |
| --- | ---: | ---: |
| **Maximum** over independent page phases/orientations | **7,530 / 192,452** | **0.0391266393698** |
| Minimum over the same possibilities | 5,720 / 192,288 | 0.0297470460975 |

Even the most favorable original alignment remains close to the uniform 29-rune level, \(1/29\approx0.034482759\). In every independent native-English control, an adversary is allowed to choose the **least English-like** phase and digit orientation separately on every page. This is stronger than choosing the correct secret orientation for a single fixed four-block cipher. All source prose is encoded with the repository's authentic GP tokenizer, including the single-rune ING convention.

| Independent source | Source GP runes | Lowest protected-digit index among 256 random contiguous-page controls | Lowest among 128 original-word-length-matched controls |
| --- | ---: | ---: | ---: |
| Shakespeare | 217,644 | 0.0497249018 | 0.0493088273 |
| Emerson | 323,083 | 0.0514672406 | 0.0506069307 |
| Gibran | 62,696 | 0.0495939012 | **0.0489858202** |

The random draws use deterministic xorshift32 seed \(0x3301ea27\); each sample preserves the 55 page sizes, and word-shaped controls concatenate independent authentic reference words of **each original complete printed word length**, including those spanning physical pages. The **1,152 source controls** (three sources, each with 256+128 trials) all remain above the **highest** possible original collision index; no fitted plaintext samples or manual phrase selection enter the comparison. These are finite source-register contrasts rather than a claim about every possible language or encoded payload.

A separate source-positive encrypts 12,956 native GP-English runes using **each** example secret exponent \(e=1033\) or \(3301\) under **both** digit orientations, then automatically derives its mathematical inverse. It recovers **12,956/12,956** plaintext runes in all four cases; the protected collision ratio is exactly invariant before and after encryption. Applying the same original-input inverse followed by forward encryption recovers **12,956/12,956** actual LP2 ciphertext runes in all cases. The latter is a reversibility check, not key authentication.

## Research decision

For the explicitly specified **four-GP-rune, valuation-preserving base-29 exponentiation, one arbitrary exponent per physical page, phase and orientation free per page, direct source-native English plaintext** architecture, an exact key-independent invariant is strongly incompatible with original LP2. Searching hundreds of thousands of additional 4-rune exponents in this family cannot change that result, because the protected-digit equality pattern never changes.

A changing **per-block** exponent, an intervening substitution/whitening/encoding layer, a different numeric register, a different notion of a block or a non-English/nontext intermediate changes the model and remains open. No original image currently supplies an instruction selecting the p-adic map. Reconsider the family only if new independently visible source material supplies such a different operation or key-state clock.

**Reproduce:** [single-file CommonJS/Node.js 22 script](../sims/lp2_base29_power_block_invariant.cjs) using committed source corpora, an exact global ratio certificate, 1,152 reference plants, exact forward/inverse controls and no external dependencies. [Successful, complete manual GitHub Actions execution 42933150724](https://github.com/FlareZ123/liber-primus/actions/runs/42933150724) ran the script after the existing polygraphic-control suite. The two earlier test attempts contained source-count assertion mistakes (the corrected eight-option minimum differs from the preliminary four-option minimum; the authentic ING tokenizer differs from a simpler GP transcription) and were corrected before the complete successful execution. Only this final run supports the stated figures.
