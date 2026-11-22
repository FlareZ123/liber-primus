# LCG/XOR mixing of the 256 original ink events with the 256-byte table

**Classification:** bounded source-derived key candidate; original-input negative. No unknown LP2 plaintext, authentic key, complete cipher mechanism, or destination recovered.

## Source-motivated construction

The original source provides:

- 225 red rune events and 31 thirteen-dot punctuation events, giving a chronological stream of 256 values;
- a 32×8 base-60 table, giving 256 bytes;
- a repeated five-dot border whose retrospective top-first clockwise solid/hollow reading gives masks 13 (left) and 31 (right);
- an archived OutGuess extraction of the signed 2016 image reporting **seed 230** and **payload length 1,136 bytes**.

The 13/31 values define a full-period byte LCG:

`state = start; repeat 256 times: use table[state], then state = (13*state + 31) mod 256`.

The recurrence visits all 256 table positions exactly once. Pair the chronological event stream `E_i` with the table byte at that state and XOR them:

`K_i = grid[state_i] XOR E_i`.

A red rune contributes its canonical GP index 0–28; each thirteen-dot mark contributes 29. This produces one deterministic 256-byte key from the exact 256-event stream and the original table.

Two starts were tested, with no other seed search:

- **0**, the natural zero-state baseline;
- **230**, the archived OutGuess seed. This is additionally compatible with the numerical identity `230 = 256 - 2*13`, using the table size and left five-dot mask. That identity is suggestive, not proof that the OutGuess seed should be reused as an LP2 state.

Neither the 13/31 numeric interpretation nor the XOR mixing is explicitly instructed by the manuscript. The 230 seed is archive-reported; this invocation inspected the archived extraction/README but did not independently rerun OutGuess.

## Tested inverse

The reproducer asserts the original event count and ordering, the 256-byte table, both full-period LCG traversals, and the 32 punctuation-delimited fragments. The first 28 fragments contain all 12,956 unknown runes.

The 32 fixed variants test each start under:

- direct additive GP29 or the solved-p56-style GP28 predecessor-exclusion register;
- byte reduction by remainder or proportional scaling;
- both additive signs;
- either a book-global key clock or a key clock reset at each thirteen-dot fragment.

The GP28 previous-ciphertext state resets at each source fragment in both clock modes. No key bytes, LCG start beyond 0/230, event order, fragment boundary, alphabet order, or ciphertext offset are fitted.

## Original-input result

All **32** variants exactly re-encrypt all **12,956** original runes. As the tested registers are bijective, this verifies implementation consistency only.

The original ciphertext IoC is **0.0344783979**. Across both starts, the 16 direct-GP29 outputs have IoC **0.0344288998–0.0345064476**, essentially the uniform 29-symbol baseline `1/29 ≈ 0.03448276`. No output is readable prose.

The best direct-GP29 candidate is the zero-start, fragment-clock, remainder-projection, positive-sign model (IoC **0.0345064476**); its prefix is:

`OEEOEOOPOPMNGOMXRNSFAEWAHOESHIJGSNGPCGOFOROEORALROEIADLYHNGEOLAEOINGMFBYIAOEEAEDFNGAEOGYFTHGHNGHEAGLPTUDAEIAAEAFTHAWHJPAEEOETHUJJLIAPPXNAEFWONGLUGPEOSUUB`

The OutGuess-seed-230 best direct-GP29 candidate is book-clock, remainder projection, positive sign (IoC **0.0344982972**); its prefix is:

`NIADYPWUXJAJAESSLBIAEAOEXGPCRFCNGTIAEDNGDXAEERNYNGMYXOEORTWMSAWGNGSNAHIACOEMEOGHGXMAENLIAIAJMDEASEAJCGIEOWEATAEJYXEAJNOEWPJTHSOEONGBJIASAEMNGNGEASEODYGIANGADFWCTJOJYFGIAONGNXTHIAJMBLEAMEAFDRNNEOEOEOSJRDTR`

The 16 GP28 outputs have raw IoC **0.0352579744–0.0353249409**. Because this register includes a distinguished transparent marker, raw IoC is not an ordinary uniform-GP28 language statistic. Neither start produces readable prose. The best raw GP28 output is the zero-start, book-clock, remainder-projection, negative-sign model (IoC **0.0353249409**); the seed-230 best is the book-clock, scaled-projection, positive-sign model (IoC **0.0353134303**).

The script plants mechanics-only GP29 and GP28 source sequences under every tested mode and verifies exact recovery; these plants validate the encoder/decoder, not the authenticity of the derived key.

## Decision and scope

This is a **bounded negative** for the direct additive GP29 and predecessor-exclusion GP28 uses of this specific 13/31-LCG/XOR key, under both the natural zero start and the only source-reported alternative start, OutGuess seed 230. The relation `230=256-2*13` is a plausible reason to test that start, but its failure does not authenticate or refute the 2016 clue.

This advances the 256-event/table investigation beyond direct event keys, table pads, stationary one-symbol mappings, and the earlier start-zero XOR candidate. It does not authenticate the retrospective event/table correspondence or the 13/31 reading. Nonlinear or evolving state, different event-to-table mixing, an outer encoding, a different plaintext register, and other source-derived operations remain open. Do not expand this into a free byte-operation, clock, or seed search without a new independent clue.

## Reproduction

Run from repository root with Node.js 22:

```sh
node sims/red256_lcg_xor_grid_event_key_inverse.cjs
```

The script reads the canonical LP2 corpus, original ink annotations and base-60 grid; reconstructs the exact 256-event sequence and fragment boundaries; derives both 256-byte LCG/XOR keys (starts 0 and 230); tests the 32 fixed variants; verifies exact original re-encryption; and checks mechanics-only positive plants. It has no third-party dependencies.
