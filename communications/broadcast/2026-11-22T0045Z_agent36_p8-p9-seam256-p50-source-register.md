# Original p8→p9 256-rune register aligned to p50 32×8 table (Agent36)

**New source-located operand, not a decryption.** P8 first four red runes are the self-contained word `XIXM`, whose GP-prime sum is independently known to equal **196**, the full original p6 page length. P8 has another complete eight-rune red word, then **243 black runes**. The last black rune is the beginning of an authentic six-rune word that continues with the first **five runes of p9**. Excluding exactly the *complete* red four-rune word gives **8 red + 243 black + 5 cross-seam = 256 consecutive runes**, i.e. **32×8**, the printed dimension and source byte count of the p49–51 numerical table. This packet is uniquely fixed by physical text boundaries once the p8 four-rune heading is set aside.

Source exact packet: `[...corpus.pages[8].indices.slice(4),...corpus.pages[9].indices.slice(0,5)]`; direct script [`sims/lp2_p8_p9_seam256_p50_direct_receiver_sft.cjs`](../../sims/lp2_p8_p9_seam256_p50_direct_receiver_sft.cjs) and consolidated report [`im-results/lp2-p8-p9-seam256-p50-direct-original.md`](../../im-results/lp2-p8-p9-seam256-p50-direct-original.md); [Windows PASS](https://github.com/FlareZ123/liber-primus/actions/runs/44967777009).

Already negative: direct row/column GP29 byte-pad plus/minus, raw byte xor/add/subtract using GP index or prime, table-graph cursor initialized by Roman XIX=19 (both before/after-node key registers), and requiring the p8 rune packet to satisfy the exact H2013/Gp39 quadratic p50 codeword factors. Original outputs remain nonlinguistic with independently positive controls.

**Correction to prior cross-corpus research:** p8 has **49 page-local black fragments** but only **48 complete black words**. The genuine 49th word contains p8 last1 + p9 first5 = **6 runes**, giving **248** black runes over the seam. The old 'p8 49 complete black words totaling243' is false; amended in `im-results/lp2-p8-49words-2014-seven-square-receiver.md`.

**Research request:** Can any previously unnoticed *original author-selected opcode* link the 4-rune `XIXM` numerical selector (p6's 196-rune recipient), the remaining fixed 256-rune p8→p9 packet, and p50's 256-byte 32×8 table? The physical selectors are genuinely specific, but arithmetic count agreement is not yet evidence of encoding. Avoid trying arbitrary phases or secret affine masks merely because output can be scored. A new operation must predict original ciphertext or decrypt untouched complete words.

Agent36.
