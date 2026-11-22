# Nine-chapter Q252 as a 28-point GF29 Fourier key readout

**Agent18, 15 November 2026. Source-exact direct decoding experiment:** The original p49–51 numerical table's established 252-element GF29 quotient was interpreted as nine blocks of 28 coefficients. The manuscript's p39 red coefficient **15** is a primitive root of GF29's 28 nonzero elements, which defines the standard **28-point number-theoretic transform without a guessed key**. Both the forward and inverse readouts are nonlinguistic, and the original 252-symbol output retains approximately uniform GP29 symbol frequencies. No unknown LP2 plaintext, authentic key, cipher or destination is recovered.

## Input and source-motivated exact operation

The canonical original source table is 32×8 two-character values, decoded under the explicitly conditional standard base60 alphabet. Its 256 byte values have SHA256 **3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290**. Reducing bytes mod29 defines the descending GF29 polynomial P. The independent signed 2013 BASE29 3301→3QO example and original p39 red triad supply two factors:

- H(X)=3+26X+24X²;
- G(X)=27+5X+15X² = 15(X−24)².

Their product in descending coefficient order is **F=[12,17,11,21,23]**, and exact GF29 long division yields a formal **252-slot** quotient Q with a four-zero remainder. The original page images contain **nine illustrated chapters**. Thus grouping Q into nine 28-tuples is a source-shaped candidate, and GF29* has exactly **28 elements**. The p39 printed coefficient **15** has multiplicative order28 mod29.

For a 28-symbol block q[j], let ω=15 and compute, over GF29,

\[
Y[k]=\sum_{j=0}^{27}q[j]\,\omega^{jk},\qquad
q[j]=28\sum_{k=0}^{27}Y[k]\,\omega^{-jk}.
\]

Because 28 ≡ −1 mod29, the inverse scaling factor is also **28**, giving a completely exact 28-symbol bijection. This is a direct 252-symbol readout hypothesis: if the table stores *spectral coefficients* of native GP runes or nine human-readable key phrases, the inverse NTT should reveal that text. As a directional control, forward NTT also reads an encoded coefficient vector as polynomial values at the 28 nonzero field elements. Read the quotient in natural high-degree source order and whole-vector reversed order; there is no fitted key or cipher offset.

**Important interpretation limit:** Neither the original book nor the 2013 signed TCP example explicitly names the NTT, arranges the quotient into nine blocks, or directs Fourier decoding. The mathematical group order and source primitive root make the operation natural enough to test once, but cannot authenticate a hidden instruction.

## Entire original-quotient readout and actual control

The nine source blocks span all **252/252 GF29 quotient symbols**. Four source-frozen variants, as read as GP29 runes, give:

| Coefficient order | NTT direction | 252-rune IoC | Source first 28-rune readout |
| --- | --- | ---: | --- |
| Natural quotient order | Forward | **0.035666856** | NG P X J EA U L A AE M L H M TH H N EO P P X J C X E N C AE AE |
| Natural quotient order | Inverse | **0.035666856** | H R TH G P NG P Y EA B R F Y J O S I F N IA C M E T EO R B X |
| Reversed block order | Forward | **0.035160944** | NG NG P J EA AE Y TH O C U TH Y I NG AE J D EA U A TH P I N C E NG |
| Reversed block order | Inverse | **0.035160944** | H H I J T X M G Y W W H A AE M I NG X F U O W S TH C J D E |

The 28-symbol inverse NTT is a reversed/scaled forward transform, so the **same overall rune IoC in each direction is an exact invariant**, not an independent statistical replication. Native-GP language is absent from the original full output in all four cases. The original results remain close to uniform GP29 background **1/29 ≈ 0.03448**, versus known p57 native GP output IoC about **0.06271** over its own shorter authentic 95-rune passage. These are descriptive diagnostics, not a global hypothesis-search p value.

The [source-exact standalone CommonJS SFT](../sims/lp2_q252_ninechapter_root15_ntt_sft.cjs) asserts the byte hash, original 32×8 layout, exact quotient first16 and zero remainder; verifies 15 is primitive modulo29; checks the exact NTT inverse on all nine original blocks; and plants **252 original solved p57 GP runes repeated to length**, then verifies forward/inverse recovery at all nine 28-rune blocks. Reconstructed native text is **252/252 correct**, while original table readout does not resemble native text. The final corrected SFT passed [Windows Node22 manual CI run 43672038493](https://github.com/FlareZ123/liber-primus/actions/runs/43672038493). A first run 43671973265 caught and corrected a stale expected-inverse IoC constant; the NTT code and output roundtrip were correct, and the repaired version asserts the exact inverse-frequency invariant.

## Cryptanalytic decision

Retire a **direct nine-chapter ×28 spectral/NTT-native-GP key text** reading of the Q252 field quotient with original GF29 primitive root15 and the two physically natural coefficient orders. This does not refute the exact source polynomial factors or any other independent use of the numeric table. In particular, a hidden language-transformation layer could obscure an NTT output, but source clues currently do not select one and fitting another arbitrary cipher to 252 pseudo-random readout symbols would be weak evidence. No inference is made about the 12,956 original encrypted runes beyond the unchanged absence of an authenticated key.
