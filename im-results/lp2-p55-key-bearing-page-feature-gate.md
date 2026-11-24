# LP2 p55 page-role and word-circumference gate

## Verdict

No independently supported key-bearing page marker and no successful receiver were established. LP2 p55 remains a plausible special/key-bearing page because its word structure is singled out by the following page's circumference instruction, but the fixed 4x4 Hill receiver tested here fails. Keep this as an intermediate result, not in \`results/\`.

Reproduction: \`sims/lp2_p55_word_circumference_receiver_gate.cjs\`.

## Original-artifact observations

- LP2 p55 is physical image \`resources/liber-primus/72.jpg\`; LP2 p57 is \`resources/liber-primus/74.jpg\`. P55 has a pale central tree/butterfly illustration and a 13-dot red marker. P57 has a dragonfly illustration and a distinct 21-dot red marker.
- The transcription's p55 page contains 17 rune groups when the incoming one-rune carry is included. Removing that carry leaves 16 complete words. Removing each complete word's first and last rune leaves 43 interior runes; retaining the two boundary runes per word gives 32 shell runes.
- P57's prose gives a direct reason to examine word circumferences and interiors. This makes the 43/32 split a motivated candidate, rather than an arbitrary segmentation.
- The red dot count is not a unique page selector: similar small red-dot clusters occur elsewhere in the original page set. The tree/butterfly motif is visually distinctive, but no solved first-party stage establishes that this illustration itself marks a cryptographic operand.
- LP1 physical image \`resources/liber-primus/16.jpg\` contains an explicit 5x5 numeric matrix and insect imagery. The LP1 p14–16 triptych is a first-party solved-stage output. This is a genuine precedent for a visually distinct numeric matrix acting as operand material, but it does not establish that p55's word circumferences or an imposed 4x4 grouping are operands.

## Frozen receiver test

**Candidate key construction:** take the 16 complete p55 words in transcription order, strip each word's first and last rune, sum the Gematria Primus prime values of the remaining runes in each word, reduce each sum modulo 29, and place the 16 values row-major into a 4x4 matrix. This is an imposed 4x4 arrangement; the original page does not print a 4x4 word grid.

The resulting key matrix is:

\`\`\`
15  0  0  7
17  0  1  2
 6  0  5 26
 0 21  8  9
\`\`\`

Its determinant is 20 modulo 29, so it is invertible.

**Receiver prediction:** the entire p50 32x8 / 256-byte numerical table is the ciphertext. Reduce each byte modulo 29 and apply standard column-vector Hill decryption with the inverse 4x4 matrix, in consecutive blocks of four. This predicts 256 GP29 plaintext symbols with no padding or fitted offsets.

**Result:** the output is not coherent plaintext. Its GP29 index of coincidence is 0.0339767, close to a near-uniform stream. Applying the same fixed matrix to the 32-symbol p55 shell also produces no readable text. Reject this specific Hill receiver; do not rescue it by changing byte mappings, matrix orientation, word ordering, or padding after seeing the output.

## Related p55 DH observation — provisional, not a solution

The separate p55 split reported in \`im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md\` gives candidate values \(P=N/8\) and \(Q=E/43\), where \(N\) is the base-29 integer of the 43-rune interior and \(E\) the base-29 integer of the 32-rune shell. The two interior D runes occur at zero-based positions 5 and 23; D has GP ordinal 23. Interpreting these as the DH tuple fields gives \(p=23,g=5,a=6,b=15,A=8,B=19\), matching the p28/2016 DH example.

Using Q as generator and exponents 6 and 15 gives \(S=Q^{90}\bmod P\), with \(S\bmod29=2\), matching the small example's shared secret. The 43-digit base-29 representation of S, subtracted from the p55 shell, yields the isolated four-rune substring FOLD at zero-based offsets 12–15; the rest is not coherent plaintext. Direct subtraction on the 43-rune interior also fails.

This is a provisional cross-link, not an established cipher. The divisor choices, D-position role assignments, and large-group interpretation remain assumptions; the isolated FOLD substring does not identify a receiver. The p50 receiver test above is negative. Earlier p55 DH follow-through work also found no plaintext under a different public-value construction; avoid broad KDF/mode sweeps without a source-selected consumer.

## Conclusion for issue #2491

P55 is a plausible special page, and the circumference instruction is a real source cue. However, the visible marker is not unique, the closest solved-stage precedent is only an analogy to explicit numeric matrices, and the fixed p50 receiver test fails. No independently meaningful feature has yet established which LP2 pages contain key material rather than message text. This issue is therefore completed as a documented negative, with the p55 DH cross-link retained as a provisional lead.
