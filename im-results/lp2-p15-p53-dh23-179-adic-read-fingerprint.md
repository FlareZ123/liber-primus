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

## Interpretation and limits

This is a new cross-object arithmetic fingerprint tying the p28 DH coordinates, p15, the p53 red span, and the p50 base60 table. It gives a second route to the numerical READ address and is consistent with the existing p0 80–102 receiver geometry. The exact match is stronger than a language-score coincidence and survives a whole-unknown-corpus window census.

It is **not** a decryption of either 51-rune operand. The crucial interpretive steps remain:
1. reading DH \(b,p\) as page and rune-offset coordinates;
2. converting the two 51-rune streams to positional GP29 integers;
3. treating the p50 base60 byte stream as one printed-order big-endian integer;
4. using the quotient/residue relationship as a navigation fingerprint.

The base59 and orientation controls favor the conventional base60/printed reading, but the separate creator-authentication objection to interpreting table byte values as LP rune offsets remains open. The p0 receiver is still ciphertext, and the p0 H→cube output's initial LONG is not a recovered page plaintext. The new residue check validates receiver selection, not its decryption. No additional transform was fitted to rescue either p15 or p53; direct H-shell→cube tests on these 51-rune operands were nonlinguistic.

## Decision and next research action

Retain this as an **intermediate source-constrained route to READ**, not as established plaintext or a general p50 opcode. It materially narrows the p50 question: base60 printed order is the only tested natural representation that participates in this 179-adic crosslink, while base59 fails.

The next useful step is a blind, independently selected consumer of the frozen 179-adic/base60 operation that predicts an untouched original-ciphertext object or a new destination **without reusing p0 80–102**. Do not extend the p50 quotient's remaining digits into a word stream: the immediate next digit already fails the known OUT value.

## Reproduction

Run **node sims/lp2_p15_p53_dh23_179adic_read_sft.cjs**.

The SFT reads the canonical GP29 corpus, original ink annotations, signed transcription, and 256-token table; reconstructs the DH23 tuple; checks both 51-rune operands and their exact base29 integers; scans all 10,206 unknown-page windows; charges base59 and eight table orientations/two byte orders; and verifies the READ value, p0 receiver residue, and center-F uniqueness. The original version passed GitHub Actions manual SFT run 44699886093; the p0-residue extension is being run separately. It does not score candidate plaintext.
