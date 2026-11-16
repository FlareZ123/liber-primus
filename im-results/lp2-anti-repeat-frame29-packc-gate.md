# Anti-repeat rank-28 / BASE29 / pack-C framed byte receiver — rejected

**Status:** intermediate negative result. The transition code is exactly reversible, but none of the predeclared chapter outputs is a typed payload.

## Source-selected solve path

The proposed human path is:

1. Notice the unusually low adjacent-repeat rate in the 29-rune stream.
2. Use the preceding rune as the state. If the next rune differs, rank it among the other 28 possible runes (0–27); if it repeats, emit reserved digit 28 and retain the repeated rune as the fresh state.
3. The initial rune is the 29-state seed. The resulting digits are exactly in radix 29.
4. Use the historical 2013 \`BASE29\` operation as the radix convention; its documented test vector is \`3301 → 3QO\`.
5. Use the 2014-available one-decimal-per-byte convention: the archived \`decimaltobyte.pm\` uses Perl \`pack 'C', $_\`. The rank digits therefore become one byte each. Decimal 28 is byte \`0x1C\`, ASCII File Separator (FS), making repeated-rune events visible record separators.
6. Carry state across page boundaries; restart only at the nine source chapter boundaries.

The 2013 BASE29 command is first-party. The 2014 \`pack 'C'\` converter is a contemporary solver-derived artifact, not a Cicada-authored instruction; it demonstrates a byte convention available in 2014, not proof that Cicada prescribed this exact rank encoding.

## Exact reversible mapping

For GP indices \(p,c\in[0,28]\), encode the first rune as the seed. For each successor:

\[
d(p,c)=
\begin{cases}
28 & c=p\\
c & c<p\\
c-1 & c>p
\end{cases}
\]

The inverse is:

\[
c(p,d)=
\begin{cases}
p & d=28\\
d & d<p\\
d+1 & d\ge p,\ d<28
\end{cases}
\]

Every digit is a byte via \`pack 'C'\`. This is lossless, has no leading-zero ambiguity, and emits exactly one byte per rune. A repeat produces byte 28 / ASCII FS; the repeated rune is reconstructed from the preceding state.

Source inputs:

- \`resources/liber-primus/lp2-corpus.json\`
- \`resources/liber-primus/lp2-punctuation-identity.json\`
- \`resources/liber-primus/base60-grid.json\`
- \`resources/cicada2014-sexagesimal-source.json\`
- \`resources/lp2-transcription.txt\`
- Native language controls under \`resources/control/\`

## Structural observations

Across p0–55:

- 12,956 runes and 12,901 same-page adjacent opportunities.
- 86 same-page equalities; zero equalities at page joins.
- The 86 repeat events yield 87 FS-delimited records, with lengths 5–711 and median 112.
- Only 23/86 repeats coincide with a printed-word boundary; 63 occur inside printed words.
- Only one repeat coincides with any original punctuation event (a small stop); none coincides with a large chapter mark.

Thus the repeat events are visible in the rune stream, but they are not generally aligned with printed word or punctuation boundaries. Treating them as record separators is a coherent encoding hypothesis, not an established manuscript instruction.

## Predeclared chapter outputs

The selected source chapters were decoded in the prescribed order, with page carries preserved and a fresh seed at each chapter:

| Chapter | Runes / bytes | Repeat bytes (FS) | Records | Record lengths |
|---|---:|---:|---:|---|
| p0–2 | 729 | 4 | 5 | 122, 84, 248, 196, 75 |
| p33–39 | 1,680 | 12 | 13 | 152, 29, 53, 112, 75, 245, 6, 61, 25, 49, 157, 661, 43 |
| p54–55 | 308 | 3 | 4 | 20, 135, 134, 16 |

All output bytes are in 0–28. The first 16 bytes are:

- p0–2: \`0f08110305121a000e19121405020a06\`
- p33–39: \`170c0d050009170707060b15000f1115\`
- p54–55: \`181314161a020d0a121a170d14010617\`

Every chapter output has zero printable ASCII, fails strict UTF-8, and matches none of 16 fixed standard file signatures. The BASE29 alphanumeric renderings contain no \`BASE29\`, \`NEXT\`, \`3301\`, \`ONION\`, \`CICADA\`, or \`HTTP\` token. Incidental short bigrams are not evidence of an instruction or address.

A fixed 16-signature recognizer was also run over 15,162 non-overlapping 40-rune windows from native GP-English controls: 0 false positives (0.0%). The original outputs have no standard header or validating file structure. Since the raw byte alphabet is restricted to C0 controls 0–28, common printable and high-byte file signatures are excluded by construction.

## Positive controls and invertibility

The forward encoder and inverse were tested on source-native material:

- Known p57 prose: 95 GP runes, exact round-trip.
- Original p50 32×8 table: 256 source-derived bytes → 422 fixed-width BASE29 digits → inverse transition-rank rune plant → forward pack-C output; all 256 bytes recovered exactly.
- Historical 2014 sexagesimal binary witness: 256 bytes → 422 BASE29 digits → transition-rank plant → exact 256-byte recovery. This is a secondary solver-derived control, not an independent first-party payload.

The 2013 BASE29 vector \`3301 → 3QO\` is reproduced exactly. The 2014 converter records \`pack 'C'\` and 256 output bytes. These controls validate the implementation and serializer, not the claim that LP2 uses this encoding.

## Decision

Retire this concrete same-rune / FS-framed receiver. A historically available serializer exists—BASE29 digits followed by one-byte \`pack 'C'\`—but it does not rescue the original chapters: the outputs are C0-control streams with no typed acceptor, no standard file header, no valid text, and no first-party instruction/address. The repeat events are also poorly aligned with printed boundaries.

Do not continue by scanning byte offsets, XOR keys, magic bytes, or arbitrary record transformations. Reopen only if an original source supplies a second operation or a specific payload type for this control-byte stream.

## Reproduction

From the repository root:

\`\`\`bash
node sims/lp2_anti_repeat_frame29_packc_gate.cjs
\`\`\`

The script reproduces the BASE29 vector, 29→28 transition mapping, FS framing, selected chapter bytes, record lengths, source-native prose/binary plants, and file-signature false-positive control.
