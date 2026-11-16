# 2014 Stage11 133/331 as DH operands: bounded direct-consumer gate

**Classification:** exploratory cross-round hypothesis; exact arithmetic, negative direct consumers. **No unknown LP2 plaintext, authenticated key, cipher mechanism, or destination is recovered.** Reproducer: [`sims/lp2_2014_html_dh_key_gate.cjs`](../sims/lp2_2014_html_dh_key_gate.cjs). Successful Node 22 run: [43847495941](https://github.com/FlareZ123/liber-primus/actions/runs/43847495941).

## Human-solve-path hypothesis

Three original-era clues make one bounded experiment reasonable:

1. Physical p32 has 121 GP29 runes. Under the unprinted but natural row-major 11×11 reflow, its first-row and first-column GP-prime sums are exactly **563** and **569**, the dimensions of the signed 2016 tree JPEG. The same-tree identification has since been retracted; only the numerical checksum remains exact. The 11×11 reflow and its cipher role are not author-authenticated.
2. The 2014 Stage11 participant-archive HTML has literal `<title>133</title>` and `<div id="331">`. Its manifest pins the page to the 2014 participant Git archive, but explicitly does **not** claim a PGP-signed HTTP response.
3. The signed 2013 TCP-server specification explicitly documents **Diffie–Hellman** and **BASE29**. Its actual live protocol lets the participant server choose a base and secret per request; it does not prescribe a static p32-derived tuple.

A solver might therefore try p=569, g=563 and interpret 133/331 as the two DH values. This is a plausible, small cross-round experiment, not an established intended path.

## Frozen arithmetic

The p32 row-major prime sums give first row 563 and first column 569. With p=569 and g=563 (g has order 568), the Stage11 HTML values admit two obvious role assignments:

| Interpretation of 133 and 331 | DH result | BASE29 |
|---|---|---|
| Public shares A=133, B=331 | Private exponents 85 and 450; shared secret **231** | **7S** |
| Private exponents x=133, y=331 | Public shares 477 and 422; shared secret **216** | **7D** |

The signed 2013 BASE29 alphabet is `0123456789ABCDEFGHIJKLMNOPQRS` (its worked example is 3301 → 3QO). Encoding the raw HTML values separately gives 133 → **4H** and 331 → **BC**, hence the third direct candidate key **4HBC** if the BASE29 digits are identified position-for-position with GP29 rune indices.

The role assignment is not selected by the 2013 protocol or the HTML. The equality of alphabet sizes (29) does not itself authorize mapping BASE29 digits onto GP29 runes.

## Original-cipher direct consumers

The reproducer applies each of the three candidate keys (7S, 7D, 4HBC) to the unchanged 12,956-rune LP2 unknown stream and to p32/p55, testing the three ordinary GP29 Vigenere orientations (subtract, add, Beaufort) with book-global and physical-page-reset phase. All **18** full-book inverses remain ciphertext-like.

- Full-book IoC range: **0.0344739–0.0345099**; original unknown-stream IoC: **0.0344784**.
- Best p32 IoC among these candidates: **0.0369146**, with no readable plaintext.
- Best p55 IoC: **0.0375439**, also with no readable plaintext.
- Representative p32 outputs begin `POEHETHGEAIAHXNF…` (7S subtract), `PEEDEBGXIADXAFR…` (7D subtract), and `TXXANGPTHSUMIAE…` (4HBC subtract).

These are direct-key negatives only. They do not reject every conceivable use of the DH result.

## One bounded SHA-512 consumer check

Because the LP2 p56 text names a SHA-512 target, test SHA-512 of each DH secret in four ordinary encodings (decimal ASCII, BASE29 ASCII, uint16 big-endian, uint32 big-endian). None equals the p56 target hash. As a single cheap table consumer, repeat each 64-byte digest over the 256-byte p50 byte stream and XOR.

Across the eight secret/encoding combinations, the printable-byte counts are **83–108 of 256** (32.4–42.2%); no candidate has a recognizable file header or coherent ASCII. This does not license a search over salts, counters, arbitrary KDFs, AES modes, or offsets. The direct SHA-512/XOR interpretation is closed.

## Decision

Retire this exact **133/331 → p32 DH → BASE29 → direct GP29 key / repeated SHA-512-XOR** branch. Its strongest objections are structural, not computational:

- the 2016 image dimensions and p32 prime sums match exactly, but the p32 11×11 arrangement is an unprinted reflow and the images are not the same tree artwork;
- the 2014 HTML is a participant-archive copy, not a signed HTTP artifact;
- the signed 2013 DH protocol specifies a live random exchange, not these static values;
- neither source selects the roles of 133/331, the BASE29-to-GP29 identification, or a downstream key consumer.

Do not extend this into arbitrary KDFs or ciphers. Reopen only if an independent original instruction fixes the DH role assignment and the consumer. This belongs in `im-results/`, not the established-results synthesis.

## Reproduction and inputs

Run `node sims/lp2_2014_html_dh_key_gate.cjs` under Node.js 22. The script asserts the HTML values, p32 axis sums, DH agreement in both role assignments, the three direct key interpretations, the original 12,956-rune corpus, and the 256-byte table; it includes synthetic algebraic round-trip controls.

Inputs and context:
- [2014 Stage11 HTML](../resources/historical/stage11-2014-index.html) and [archive manifest](../resources/historical/stage11-2014-index-manifest.json)
- [Signed 2013 DH/BASE29 specification](../resources/external/2013-tcp-server-signed-source.md)
- [Canonical LP2 GP29 corpus](../resources/liber-primus/lp2-corpus.json) and [256-byte grid](../resources/liber-primus/lp2-grid-256.json)
- [Existing p32 DH hypothesis](p32-dh-image-dimensions-parameter-test.md)
- [p32/2016 source correction and limits](lp2-tree121-signed2016-source-gate.md)
