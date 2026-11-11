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

## Stronger all-secret gate: even changing the exponent every block

**New exact invariant, successful original-input test:** If every four-rune block is independently transformed by *any* legal valuation-preserving unit power, its least-significant nonzero base-29 digit retains its multiplicative order in \(\mathbb F_{29}^{\times}\). This is true for **a different arbitrary hidden exponent on every block**, because \(\gcd(e,28)=1\); zero is separately invariant. Seven exact immutable digit classes have orders **0, 1, 2, 4, 7, 14, 28**, with respective rune-index class sizes **1, 1, 1, 2, 6, 6, 12**. The classes cannot change under the proposed cipher regardless of exponent.

Train class weights solely from the independently stored Shakespeare GP-English corpus (217,644 runes): \(w_k=\operatorname{round}(1000\log[P_{\rm Shakespeare}(k)/(\mathrm{class\ size}/29)])\). The resulting **source-only, integer weights** by the above order are **[−529, 380, −1525, −1347, 141, −83, 138]**. No unknown LP2 rune enters this training. Measure the mean protected-digit score with the original 55 page lengths. Across **all 8^55 independent page phases and digit directions**, exact fractional optimization with a **zero integer dual certificate** gives a maximum source-English-like original score **−38,247/(3,202×1000) = −0.01194472205** and minimum **−465,491/(3,191×1000) = −0.14587621435**.

Give the **three independent native-GP English reference corpora** the opposite advantage: adversarially minimize their same score over all eight page readings, separately on every physical page. Use **256 contiguous-page-window controls plus 128 original-word-length-matched controls per author**, retaining original page sizes and all 2,896 original printed word lengths (1,152 tests total). Their lowest scores are:

| Native GP-English source | Reference symbols | Minimum of 256 contiguous controls | Minimum of 128 word-shape controls |
| --- | ---: | ---: | ---: |
| Shakespeare (training source) | 217,644 | +0.0067458425 | +0.0076164684 |
| Emerson (independently held out) | 323,083 | +0.0033306199 | +0.0085576803 |
| Gibran (independently held out) | 62,696 | **−0.0014001252** | +0.0019244987 |

**All 1,152 controls exceed the original's exact, maximally favorable score**, including held-out authors and word-shape controls. No proposed unit-power exponent can alter this order-class mismatch, even varying it every block. This extends the original per-page exponent collision-invariant negative to **per-block-changing secret exponents**. In planted forward/inverse positive controls with alternating per-block exponents 1033 and 3301 and both digit orientations, all **12,956/12,956** source plaintext symbols and original ciphertext symbols exactly re-encode, and the protected order-class score remains invariant.

**Reproduce:** [full exact per-block order-class SFT](../sims/lp2_base29_orderclass_anyblock_power.cjs), [successful GitHub Actions run 42934527977](https://github.com/FlareZ123/liber-primus/actions/runs/42934527977). This script fixes the source-only weights, performs exact integer-certified page-wise optimization, and runs all 1,152 reference controls. The prior page-keyed [collision SFT](../sims/lp2_base29_power_block_invariant.cjs) also passed in this complete workflow.

## Research decision

The directly specified **four-rune radix-29 valuation-preserving unit-power** family is strongly incompatible with native GP-English plaintext under exact key-independent conditions, even allowing an independently unknown exponent on each ciphertext block and independent page phases and digit orientations. Searching more exponents of this family cannot change the protected digit's multiplicative order class.

**Scope:** No actual unknown LP2 plaintext, original key, true cipher mechanism or continuation destination was recovered. These are family-specific mathematical constraints and finite independent language-control contrasts. Another plaintext register, a whitening or substitution stage, an unrelated transformation, variable block boundaries *within* pages, or an external source key is outside this model. The original images do not yet specify the p-adic operation. Advance such alternatives only with a distinct original source-driven operation and a reproducible unknown plaintext.
