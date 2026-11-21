# Solved terminal rune text as a byte key for the p50 interior

**21 November 2026, Agent10. Bounded negative original-ciphertext test; no recovered unknown plaintext.**

## Human-selected receiver and independent interpretation

The original numerical table prints 32 rows by 8 columns. The already-solved p57 plaintext says to **SHED OUR OWN CIRCUMFERENCES**. Removing exactly the visible one-cell outer ring leaves a 30×6 interior of **180 base60-derived bytes**. The last two independently solved runic pages contain **85+95=180 original GP29 glyphs**. These are unusually direct selectors of two equal-length real source objects. The perimeter-to-p55 pad and inner180-byte-as-key mappings have already failed; those are the *opposite* data direction.

Here the 180 authentic known plaintext runes are proposed as a **key** to decrypt the printed 180 numeric inner values into a previously hidden ASCII message. This directly produces candidate message bytes and does not posit unknown LP2 plaintext or fit a secret substitution. The source-authored 2014 Cicada puzzles used byte XOR; simple modulo-256 arithmetic supplies a bounded alternative that can be decisively tested.

## Actual inverse

The Node22 SFT reproduces solved p56 from its original 85 ciphertext indices using consecutive prime totients and the literal transparent-F at rune index56 (without advancing the clock). Its plaintext is independently asserted as `ANENDWITHINTHEDEEPWEBTHEREEXISTSAPAGETHATHASHESTOITISTHEDUTYOFEUERYPILGRIMTOSEECOUTTHISPAGE`. It appends all 95 clear p57 runes. No candidate key text is invented.

Four ways to traverse the *printed* 30×6 interior are tested: row-major, reversed rows, column-major, and reversed columns. For each, encode the known rune as either its zero-based GP index, one-based index or published GP prime weight. Test literal byte XOR and the three directions of arithmetic `grid+key`, `grid-key`, `key-grid` modulo256. This is **4×3×4=48 fully enumerated complete 180-byte candidates**.

| Fixed original measurement | Outcome |
| --- | --- |
| Most printable ASCII bytes, across all 48 readouts | **75/180** |
| Winner | Reversed row-major interior, one of the two GP index serializations, byte addition |
| Longest consecutive printable ASCII run, across 48 | **8 bytes** |
| Any continuous 180-byte readable instruction | **No** |
| Independently planted 180-byte all-printable English text under known GP-prime XOR | **180/180 exactly restored** |

These measurements are evaluated on all bytes, with no selectively trimmed prefixes, languages fitted to outputs or private key seed search. The original results are indistinguishable from randomized binary data for ordinary ASCII text. Since a 180-byte plaintext instruction would be printable throughout in this exact interpretation, this **retires the natural direct byte-message consumer** and avoids using the apparent 76+180 geometry to claim an invented solution.

The test does not exclude compressed/encrypted bytes, differently positioned plaintext, dynamic key state, or an entirely unrelated role for the numbers. Those possibilities need a separate source instruction before consuming research time.

**Reproducer:** [`sims/lp2_p50_inner180_solved_tail_byte_readout_sft.cjs`](../sims/lp2_p50_inner180_solved_tail_byte_readout_sft.cjs), locally runnable Node22 CommonJS, with asserted original p56 inverse, source geometry, all four natural orders, all 48 outputs, and an exact 180-byte planted control. **Remote execution:** [GitHub Actions 44942807814](https://github.com/FlareZ123/liber-primus/actions/runs/44942807814), both original-cipher investigations **PASS**.
