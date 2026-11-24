# DH23-selected p15 window and p53 red span share a p50 179-adic READ fingerprint

**Agent8, 20 November 2026. Classification: intermediate cross-artifact structural result. No unknown plaintext, authentic key, or general p50 output type is established.**

## Result

The source-selected p28 DH23 tuple supplies

\[
(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)
\]

and the source-derived inverse exponent

\[
e=b^{-1}\pmod{p-1}=15^{-1}\pmod{22}=3.
\]

A bounded coordinate interpretation uses \(b=15\) as a physical page and \(p=23\) as a zero-based rune offset. It selects the 51-rune p15 window at offsets **23–73**. The original p53 ink annotation independently selects a red span of **51 runes**, offsets **128–178**. Both are converted as positional GP29 base-29 integers:

\[
W_{15}=23575534487345237434223232159733310648696652184321025115659730463484599424
\]

\[
R_{53}=216896999039209920679488145700323741587121856985828471118893469697329957334.
\]

The exact equality is

\[
W_{15}\equiv R_{53}\equiv 29,535
=179\cdot165
\pmod{179^2}.
\]

Thus both operands are divisible by 179 and

\[
\frac{W_{15}}{179}
\equiv
\frac{R_{53}}{179}
\equiv165
=3\cdot55
\pmod{179}.
\]

The p53 page has exactly **179 runes**. The canonical p50 256-token table spans physical pages49–51 and is printed as a 32×8 grid. Under its conventional base60 two-character byte interpretation, read in printed row-major order as a big-endian 256-byte integer \(N_{60}\),

\[
v_{179}(N_{60})=2,\qquad
\frac{N_{60}}{179^2}\equiv55\pmod{179}.
\]

The value **55** is independently the canonical GP0 sum of **READ**:

\[
\operatorname{GP0}(\mathrm{READ})
=R+EA+D
=4+28+23
=55.
\]

The 256-token table then gives table[55] = 1K, whose base60 byte value is **80**. This is the start of the already identified p0 receiver **80–102**, a 23-rune interval with exact center F. The existing OUT address is GP0(OUT)=20, and table[20]=1g gives102. The receiver's own positional GP29 integer is 3254642621893011102773814959809308, with residue **157 modulo179**; this independently satisfies (157=ecdot55-A=55+102pmod{179}), using the DH exponent (e=3), public share (A=8), and the two table outputs. Scanning all 240 23-rune windows on p0 finds only offsets80 and156 with residue157; their center runes are F and T respectively. The p28 DH line6 is also 23 runes with center F, so the combined coordinate, residue, and center constraint selects offset80 uniquely.

The relation can be summarized compactly:

\[
\boxed{
\frac{W_{15}}{179}
\equiv
\frac{R_{53}}{179}
\equiv
e\cdot
\frac{N_{60}}{179^2}
\equiv165
\pmod{179}
}
\]

with the table quotient's residue \(55=\operatorname{GP0}(\mathrm{READ})\).

## Original-source and family controls

- The p28 DH line6 is the unique literal-DH line and supplies \(p=23\), while the independently reconstructed p28 word28 has five runes and the line number is six. Its first two runes [23,8] map under the already calibrated outer-pair operation \(H(x,y)=(x-y,x+y)\bmod29\) to [15,2]=[b,K]. Standard DH verifies the complete tuple. See [the source reconstruction](lp2-p28-dh-line6-source-reconstruction.md) and [the exponent source gate](lp2-p28-exponent-source-gate.md).
- The p15 window is a **rune-offset** extraction, not a word-aligned excerpt: it starts inside the p15 word span [20,24) and ends inside [71,76). The page/offset mapping \(b\to15,\ p\to23\) is an interpretation, not an explicit instruction.
- The p53 red span is source-marked by original ink and contains 12 complete printed words with lengths [5,4,4,11,2,3,2,6,5,5,2,2].
- A complete scan of all **10,206** contiguous 51-rune windows on unknown pages0–55 finds exactly **two** windows with the target remainder 29,535 modulo 179²: the source-marked p53 red span [53,128] and the DH-coordinate-selected p15 window [15,23]. Seventy windows are divisible by179, so divisibility alone is not the discriminator; the shared residue is. This is a finite corpus census, not a calibrated probability or a pre-registered significance test.
- The drop-f base59 interpretation does not reproduce the p50 factorization: its big-endian integer has remainder **20,664** modulo179² and is not divisible by179.
- Across the eight natural dihedral orientations and both byte orders, the only cases reproducing \(v_{179}=2\) and quotient residue55 are printed row-major/big-endian and its exact reverse-equivalent 180°/little-endian representation. This supports the natural printed order; it does not prove that the creator intended the big-endian integer operation.
- The next 179-adic digit of \(N_{60}/179^2\) is **96**, not GP0(OUT)=20. The calculation therefore returns a local **READ** fingerprint, not a decoded READ OUT stream.

## New GP29 factor and prime-ordinal selector (Agent1, 20 November 2026)

The earlier audit stopped at the 179-adic quotient residue. A complete visual audit of all 256 p50 table cells against original archive images 66–68 now confirms the exact token transcription in `resources/liber-primus/lp2-grid-256.json`; the image hashes match the repository manifest. The 32 visually checked rows are pinned in the reproducer `sims/lp2_p50_17929_prime_ordinal_direction_sft.cjs`.

Let `N` be the 256-byte integer obtained from the printed row-major table using the conventional base-60 alphabet, interpreted big-endian, and let `q=N/179²). The exact arithmetic is:

- `v179(N)=2`.
- `q mod 179 = 55 = GP0(READ)` (the previously reported result).
- `v29(q)=1): the quotient has exactly one factor of 29, the GP29 alphabet size.
- `(q/29) mod 179 = 113).
- 113 is the **30th prime**.

This is a separate division by the newly observed GP29 factor, **not** the next 179-adic digit of `q`. That next digit remains 96 and still fails the known `GP0(OUT)=20) comparison; do not merge the two observations or extend 96 into a word stream.

The authenticated 2016 signed cleartext has 43 alphabetic words. Its 30th one-based word (zero-based index 29) is **DIRECTION**, followed by **SEEK**. The 30th-prime selector therefore independently reselects DIRECTION. Under the existing, still conditional GP0→p50 base-60 pointer interpretation:

- `GP0(DIRECTION)=98`; p50 table cell 98 is `1C`, whose base-60 value is 72.
- The preceding word `THE` is word 29; `GP0(THE)=20`; p50 table cell 20 is `1g`, whose base-60 value is 102.

These reproduce the already observed p0 boundaries 72 and 102. The intervening p0 runes are offsets 73–102 inclusive: 30 runes in seven printed words of lengths `[2,2,3,3,7,5,8]`. The final four words occupy offsets 80–102, exactly the existing 23-rune p0 receiver; the preceding three words form a seven-rune prefix. As a secondary, post-discovery alignment, `113 mod 29 = 26), equal to the first rune value at p0 offset 73. This is corroboration, not an independent test.

The following word `SEEK` has `GP0=56); p50 cell 56 is `4E`, base-60 value 254. If the same candidate pointer type is retained, DIRECTION→SEEK gives a larger p0 span of 182 runes, and `182=179+3). This is only a candidate extension: no source rule currently selects a three-rune trim, a 179-rune subspan, or an operation on that span.

**Controls and limits.** Across eight dihedral orientations, both byte orders, and base-60/base-59 interpretations, only printed row-major/base-60/big-endian and its equivalent 180°/little-endian representation retain the joint signature `v179(N)=2`, `q mod 179=55`, `v29(q)=1`, and `(q/29) mod 179=113`. The 2014 participant-derived decimal table differs at ten cells and does not reproduce the factors. The tempting hexadecimal readings `1C=28` and `4E=N` are not retained: no source-authenticated mixed-radix output type selects them, and the same untyped hex-pair rule also yields ROAD/AND→42/N in the 2016 word list. The current candidate output type remains base-60 values as p0 offsets, which is itself not creator-authenticated.

This is an intermediate cross-artifact selector, not plaintext, a global cipher key, or a complete decryption.

## Interpretation and limits

The 179²/base-60 fingerprint now has a second arithmetic layer: the quotient contains one GP29 factor, and dividing it out yields 113, the 30th prime. That ordinal selects the 30th one-based word DIRECTION in the authenticated 2016 message. Its existing GP0→p50 mapping reselects p0 boundary 72; the preceding THE maps to 102. This is a distinct arithmetic route to an already known navigation endpoint and strengthens the p28→DIRECTION→p29 chain.

It does **not** recover plaintext or specify a reversible operation for p29. The 29 factor is exact for the visually audited original table under the conditional printed-row-major/base-60 interpretation, but the manuscript does not provide an explicit base-60 digit legend or byte serialization. The 30th-prime→30th-word mapping is a plausible source-constrained selector, not an explicit instruction in the signed message. The GP0→p50→p0-offset typing remains a working interpretation rather than creator-authenticated fact.

Keep the following distinctions:
1. The p50 integer's 179² divisibility, quotient residue 55, and new GP29 factor are exact arithmetic observations on the audited table.
2. The 113→30th-prime→DIRECTION selection is an intermediate cross-artifact interpretation; it is not itself a decryption.
3. The p0 interval 73–102 and its nested 23-rune receiver are a source-linked object, but the seven-rune prefix has no selected decoder.
4. The 182-rune DIRECTION→SEEK span and its 179+3 length are only a candidate extension. Do not trim three runes without an independent directional rule.
5. The untyped hex interpretation of table cells is rejected as nonunique; retain the current base-60 pointer hypothesis only conditionally.



## Direct p53-red → p15 one-use GP29 pad test (Agent48, 20 November 2026; Director Issue #1977)

The p15/p53 fingerprint suggests a natural, falsifiable consumer: use the visibly red 51-rune p53 span as a one-use GP29 key for the DH-coordinate-selected 51-rune p15 window. The extraction was frozen exactly as in the preceding report: p15 rune offsets [23,73] (inside printed words at both ends), p53 red offsets [128,178] (12 complete printed words). No rotation, reversal, phase, repetition, skip, or second layer was permitted.

The source-native sign control is the authenticated 2014 Stage04 Vigenère inverse with key **WELCOME PILGRIM TO THE GREAT**. Its original runic onion ciphertext recovers the known **AUOWYFGL5LCSFJ3 NONIAN** output, fixing \(P=C-K\pmod{29}\). The opposite sign was retained only as the issue's explicit control.

| Candidate | Complete 51-rune output | LP1 GP29 trigram score | IoC |
|---|---|---:|---:|
| Original p15 window | UOEAEJFAEUGXEOPXYEALAXOEXIATHHEANACUGNPENTHOUIIARTIBEOCFGOTHAIPH | -3.44877302 | 0.03059 |
| Source-exact \(C-K\) | XNEEAXEPDEOOCHSAOEUTLMBMEOXEEOGOJIACXWENMEAIATIAIAWYGOTYDGFEA | -3.44763783 | 0.03451 |
| Opposite-sign \(C+K\) | BGODSOEETNGNGLHOEEEOANHXRPFWREAULNGOEJSYEOTHUITOEWBPDNMWAEXYB | -3.44325285 | 0.02431 |

Both signs re-encrypt exactly. The small score changes are negligible beside authentic controls: solved p56 plaintext scores **-2.43618991** and clear p57 scores **-2.48574591** on the same LP1 GP29 trigram reference. Neither output contains coherent GP-native plaintext. The source-exact sign is not even the best-scoring sign; that does not rescue the opposite-sign control.

**Decision:** reject the direct p53-red→p15 one-use additive pad. Retain the shared 179² residue only as an intermediate structural fingerprint. Do not try alternate offsets, pairings, rotations, reversals, or another arithmetic layer. See [the reproducer](../sims/lp2_p15_p53_direct_pad_sft.cjs).

## Direct p29 root-factor quotient (Agent17, 24 November 2026)

The DIRECTION-selected p29 page has 277 GP29 runes. Under the conventional high-degree-first reading of printed polynomial coefficients, reverse the rune vector to obtain ascending coefficients over GF(29). The resulting polynomial P satisfies:

- P(3)=0, P'(3)=26: a simple root at 3.
- P(24)=0, P'(24)=0: a root of multiplicity at least 2 at 24.
- The third division by x-24 has nonzero remainder 27, so the multiplicity at 24 is exactly 2.

Thus the source-shared cubic Q(x)=(x-3)(x-24)^2=x^3+7x^2+24x+12 (mod 29) divides P(x) exactly. This gives a natural reversible consumer: divide the p29 polynomial by Q, without fitting coefficients or offsets.

**Result:** the quotient has 274 coefficients, but it is not plaintext. In printed high-degree-first order its IoC is **0.03363546**, with Caesar-Latin and Shakespeare-English character-trigram scores **-11.55077** and **-11.54940**. Reversing the quotient does not help (scores **-11.44252** and **-11.49335**). The outputs remain nonlinguistic and far below the clear p57 control. The exact factor relation is therefore a structural constraint, not a recovered p29 message under direct factor removal.

**Decision:** reject P/Q as the direct p29 plaintext consumer. Preserve the exact Q-factor relation; do not continue with arbitrary polynomial transforms or quotient variants absent a new source instruction.

**Reproducer:** `sims/lp2_p29_root24_factor_quotient_sft.cjs`.

## Decision and next research action

Retain the p50 179²/GP29/prime-ordinal result as a promising source-constrained selector. It independently reselects DIRECTION, which is already the endpoint of the p28 local readout and selects p29; it also reselects the existing p0 72/102 interval. This materially improves the causal path to a target, but it does not supply an unknown-page plaintext or a p29 decoder.

The direct p53-red→p15 one-use additive GP29 pad is now rejected: both signs in original order and phase zero produce nonlinguistic outputs, and the native LP1 trigram scores remain at the original ciphertext level and far below p56/p57. Do not try rotations, reversals, shifts, or another pairing. Retain the 179² equality and p50/READ/prime-ordinal selectors as intermediate structure only. The direct source-selected p29 factor consumer has now been tested: the high-degree-first page polynomial is divisible by Q=(x-3)(x-24)^2, but the exact quotient is nonlinguistic. Retain the root relation as structural evidence; do not reopen polynomial translations or factor-removal variants. A further p29 attack requires a different independent source selector and a predicted plaintext consequence. Do not reopen broad p50 cipher menus or repeat the p0 80–102 readout. The p0 73–102 interval may be examined only with a predeclared operation that explains the seven-rune prefix as well as the 23-rune core. The 182=179+3 observation is not permission to discard three runes. The next 179-adic digit 96 remains a failed OUT prediction and must not be repurposed.

## Reproduction

Run **node sims/lp2_p15_p53_dh23_179adic_read_sft.cjs**.

The SFT reads the canonical GP29 corpus, original ink annotations, signed transcription, and 256-token table; reconstructs the DH23 tuple; checks both 51-rune operands and their exact base29 integers; scans all 10,206 unknown-page windows; charges base59 and eight table orientations/two byte orders; and verifies the READ value, p0 receiver residue, and center-F uniqueness. The original version passed GitHub Actions manual SFT run 44699886093; the p0-residue extension is being run separately. It does not score candidate plaintext.
