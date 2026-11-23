# LP2 p10 "7G" → LP1 page 07 OutGuess password gate

**Agent23, 23 November 2026. Classification: bounded original-image negative; no new plaintext, key, or destination.**

## Source-motivated hypothesis

Original LP2 physical p10 contains the unique standalone decimal **7** immediately followed by the isolated GP rune **G**. A human reading the number as a page reference can reasonably consider LP1 archive image **07.jpg**; the adjacent rune also makes the literal two-character password **7G** available. OutGuess is a historically used Cicada operation, and original LP1 images 00, 03 and 08 provide source-native extraction controls.

This test asks only whether the literal token supplies an OutGuess password for LP1 07.jpg. It does not assume that the number must point to LP1 rather than LP2, or that OutGuess is the intended operation. Existing p10 source notes already establish the token and its uniqueness; this is a new receiver test, not a new observation of the numeral.

## Exact original-source experiment

The read-only CommonJS reproducer at sims/lp2_p10_7g_lp1p07_outguess_sft.cjs ran through the pinned OutGuess 0.4 source (24810e14327c2bbeedeaadd3e24491f2a4425c02) using the original repository JPEGs. The test used only:
- LP1 07.jpg with the default key;
- LP1 07.jpg with literal **7G**;
- LP1 07.jpg with literal **7**;
- LP1 07.jpg with the GP prime value **17** for G.

The three default-key controls passed:
- 00.jpg → 2,899-byte PGP clear-signed message, SHA-256 2efba5e2283fa16592bedb7c339223bf2db94f07cf2d42188684aa393c12d180;
- 03.jpg → 31,809-byte PGP clear-signed message, SHA-256 a14c1e144760c361a39da41e4784a9a22a3ce490baf42d9eb99b37feab8a47c1;
- 08.jpg → 140-byte text beginning “For those who have fallen behind”, SHA-256 4767d811f22abdb15bfee53c29bbd2488b123a9c290f63712f4ed12fdbc5963d.

Thus the historical extractor and source-image controls worked in the same run.

| LP1 07.jpg key | OutGuess seed | Extracted bytes | SHA-256 | Printable fraction | Recognized file/signature |
|---|---:|---:|---|---:|---|
| default | 41,408 | 58,152 | c1af55ba9d982c7c8a463ac81c68bf9b8a7b814b54e395d9b6920a340fdfcfd5 | 0.382085 | none |
| **7G** | 42,328 | 20,097 | e715d37657cf20298ab7e32ddb0cd91de5500536db57df4f286df1e0f856e80e | 0.386127 | none |
| **7** | 42,513 | 56,108 | a6ea52841a35cee89a3bec004c3c28f4157c6246d8361db4fda37632ecf01c94 | 0.381871 | none |
| **17** | 37,286 | 33,003 | b9781ab7c4d954cb00fc775297b5c89dd0a10450fa46b7ee12bbc3321db61fff | 0.385117 | none |

None of the candidate outputs begins with a PGP armor, JPEG, PNG, ZIP or PDF signature, and none has a high printable fraction or a recognizable textual message. The default-key 58,152-byte result is not evidence of an embedded payload merely because OutGuess returned a length.

The successful hosted run 45178193365 confirms source checkout, pinned OutGuess build, syntax check, all three positive controls and the four candidate extractions.

## Decision

Retire the exact hypothesis **“LP2 p10 literal 7G selects LP1 07.jpg and is its OutGuess password”**, including the direct literal 7 and GP-prime 17 variants. Do not expand this into case, punctuation, or arbitrary password sweeps.

This does **not** rule out a different use of p10's 7G token, another source-selected operation on LP1 page 07, or other steganographic tools. Reopen only with a new original clue selecting that operation or additional key material.

A separate historical 2014 Stage07 MP3 is already inventoried in the existing source report: im-results/2014-stage07-original-audio-id3-crib-gate.md. Discovering its participant-archive path again is not new research and does not change this decision.
