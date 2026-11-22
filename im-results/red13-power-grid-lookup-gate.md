# 13-power grid lookup from the 13/24/97/256 relation

**Evidence class:** exact source arithmetic; a source-constrained but retrospective key hypothesis; bounded negative on the original LP2 input. **No unknown LP2 plaintext, authentic key, cipher mechanism, or destination recovered.**

## Human solve-path hypothesis

A player could notice four source values that fit one compact operation:

- The left tree ornament has a filled-dot mask read as **13**.
- The enlarged Ac on physical p54 is GP index **24**.
- Ac's Gematria Primus prime weight is **97**.
- The printed numerical table has **256** byte cells.

The exact relation is:

\[
13^{24} \equiv 97 \pmod{256}.
\]

Across the 29 GP alphabet positions, index 24 is the **only** index i for which 13^i mod 256 equals the corresponding GP prime weight. This is a real arithmetic cross-link, but it is not by itself evidence that exponentiation is the intended operation: the relation was noticed retrospectively among several already studied source quantities.

A natural operational reading is to map a GP rune index i to a byte-table address 13^i mod 256. The 31 thirteen-dot marks and 225 red runes form a chronological 256-event stream, so I tested the corresponding grid-byte sequence as a period-256 additive GP29 key.

## Frozen test

For each of the 256 chronological events:

- Red rune: exponent is its zero-based GP index i in [0,28].
- Thirteen-dot stencil: test the two source-natural readings e=0 (delimiter/no symbol) and e=13 (dot count).
- Table address: 13^e mod 256.
- Key byte: original grid byte at that address, using both the canonical base-60 interpretation and the documented base-59 alternative.
- GP29 key reduction: either b mod 29 or floor(29b/256).
- Cipher: direct additive GP29, both signs, with either one book-global period-256 clock or a physical-page reset.

This is a **32-model** finite family: 2 table readings x 2 marker readings x 2 reducers x 2 signs x 2 clocks. It tests one specific reversible use of the arithmetic map; it does not search arbitrary offsets, bases, or key schedules.

The input is the canonical **12,956** original unknown-page runes on physical pp0–55 (p50 has no runes), with exact original word and page boundaries. The base-59 conversion deletes the absent lower-case f from the supplied base-60 digit alphabet.

## Results

- The fixed-point relation is exact: 13^24 mod 256 = 97, and it is the only same-index match in the 29-entry GP prime array.
- The 256-event key streams contain 27 distinct byte values under each table/marker reading.
- The direct 29-symbol map i -> grid[13^i mod 256] is not a permutation: it has only 18–19 distinct GP outputs under the tested base/reducer combinations. Thus it cannot itself be a reversible monoalphabetic substitution.
- Original ciphertext reference: IoC **0.03447840**; Shakespeare-trained word-aware bigram score **−7.39585152 nats/rune**.
- Independent Shakespeare holdout (first 240,000 characters train; remaining 60,000 held out): IoC **0.05868925**; bigram score **−2.93753014 nats/rune**.
- Best of the 32 original inverses: base-59 table, marker exponent 0, scaled-29 reducer, sign −1, page reset. It gives IoC **0.03445191** and bigram score **−7.33707017 nats/rune**. The score lift over raw ciphertext is only **0.05878 nats/rune**; the candidate remains **4.39954 nats/rune** below independent English holdout. Its opening is nonlinguistic: E AE NG P E O H R E EA NG D AE G S T G S EA A D P O G EA H OE EO T OE A X AE Y W F I X S N OE OE J AE IA EO AE T B ...
- All 32 candidates exactly re-encrypt the original input after decoding, and all 32 recover an independently encrypted Shakespeare holdout plant exactly. These are implementation checks, not evidence selecting a historical key.

**Decision:** the direct period-256 additive-key interpretation of the 13^i mod 256 lookup is negative under every frozen table, marker, reduction, sign, and clock choice. The arithmetic relation remains a potentially useful source clue, but this tested lookup does not decrypt LP2.

## Reproduction and scope

Run:

    node sims/red13_power_grid_lookup_gate.cjs

The script reconstructs the event sequence from the original ink annotation, checks every red rune against the canonical corpus, parses both table editions, verifies the exact 13^24=97 fixed point, reproduces the word/page parsing, runs all 32 original inverses, and checks the source-disjoint positive plants.

This excludes only the declared 13^i mod 256 grid-byte lookup used as a repeating additive GP29 key with the two marker conventions, two table editions, two reducers, both signs, and book/page clocks. It does **not** exclude a genuinely stateful/nonlinear use of the power map, a different source-derived operation, a non-GP intermediate register, or an independently sourced external key. Do not repeat this family with cosmetic parameter changes; reopen it only if a new original-source instruction fixes a materially different operation.

No change to results/README.md is warranted: this is a bounded negative, not a change to the established manuscript state.
