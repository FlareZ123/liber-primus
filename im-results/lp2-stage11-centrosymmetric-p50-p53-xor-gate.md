# Historical centrosymmetry and XOR as one p50→p53 decipherment candidate

**Agent36, 15 November 2026. Classification: new bounded original-input negative.** This route recovers **no original unknown-page plaintext, author-selected key, cipher or destination**. It tests one human-executable operation against the unmodified book rather than seeking XOR rotations or arbitrary password values.

## Why a contemporary solver might try this

The authentic 2014 OpenPuff magic-square output contains three 180-degree **centrosymmetric** squares, with centres **809, 331, 91**. The archived Stage11 HTML displays the reversed pair **title 133 / element id 331**; their causal connection to a cipher remains unproved. Another genuine 2014 Cicada operation recovered a message by **XOR-combining separate hidden image payloads**. These supply an old-operation candidate: read opposed cells after a physical half-turn, XOR their bytes, and inspect the result.

Original LP2 pp49–51 display a complete **32×8, 256-byte** base60 table. Such a rectangle has **128 antipodal pairs** under a 180-degree turn. P53 (70.jpg) independently begins with exactly **128 black** GP29 ciphertext runes before its **51 red** runes. Thus the table and marked p53 region supply an exact, visibly selected 128-to-128 match without truncation, padding, secret offset or a fitted destination.

The missing premise is consequential: neither original manuscript nor signed instructions say to rotate the numerical table, XOR its mirrored cells or use the result to key p53. The matching length is a reason to test this hypothesis, not evidence that it is the intended route.

## Single frozen inverse

Flatten the unchanged table as printed, rows from top to bottom and columns left to right, giving original bytes \`B[0..255]\`. For \`0≤i<128\`, define the single candidate key byte

\`\`\`text
K[i] = B[i] XOR B[255-i]
P[i] = (C_p53_black[i] - K[i]) mod 29
\`\`\`

This is a concrete *direct* GP29 consumer, taking the manuscript's normal number-to-rune modulus and the signed historical XOR precedent. No free alphabet, byte mask, reverse key direction, physical page phase, optional F skips or other ciphers are fitted to the output.

The fixed original-byte source yields **128** XOR bytes with **97** distinct values and **44** printable ASCII values. Their first eight hex bytes are \`9B 5A 83 0E 87 41 E0 C6\`. There is no recognizable file/text prefix. The unchanged p53 black128 GP29 IoC is **0.035433070866**, and the decoded GP29 IoC is **0.033218503937**, close to a uniform 29-symbol distribution and far from the original solved p57 native GP prose (**0.062709966405**). The decoded opening 40 GP values begin

\`TH OE P J W D IA E O C J EO EA C N AE X X N NG C R T S P X I Y P A G J S D OE M C U X D\`.

No coherent word or recovered plaintext appears. A positive source-native GP29 plant composed of 128 already-solved p57 runes, encrypted under this *exact* original 128-byte XOR key, is recovered **128/128**, so the inverse and table alignment are executable rather than simply proposed.

## Decision

The historical 180-degree squares plus XOR operation and the p50/p53 128-pair alignment form a short, original-clue-shaped candidate, but **the direct bytewise antipodal-XOR GP29 pad does not decrypt the 128 original p53 black symbols**. It does not exclude a concealed intermediary, a different source-selected consumer, another use of XOR, or a ciphertext register outside native English. The original clue supplies no reason to search other rotations, word phases, offsets or nonlinear byte projections.

**Reproduce:** [single-file CommonJS test](../sims/lp2_p50_centrosymmetric_xor_p53_sft.cjs) reads the historical magic-square text and HTML, canonical 256-byte table and original rune corpus, asserts the matching counts and IoCs, and checks a planted 128-rune exact inverse. Existing separate grid/ring, p50 XOR, and 2014 source reports remain authoritative for their own tested mechanisms.
