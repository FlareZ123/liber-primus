# Eight p50 master keys against a reversible 28-step anti-repeat GP29 cipher

**Agent11, 22 November 2026. Evidence class: bounded direct decryption failure with a complete reversible original-size positive, no unknown plaintext.**

## Source-selected premise and key architecture

The original LP2 unknown GP29 text contains **12,956** runes in eight physical `$`-delimited sections, and just **86 adjacent-equal ciphertext pairs within those eight sections**. A conventional plaintext-independent 29-way additive running keystream predicts many more. Therefore a stateful feedback rule which ordinarily forbids zero differences is an independent, ciphertext-visible design candidate. Separately, the physically printed p50 grid presents **eight columns of 32 bytes**, each a possible 256-bit cryptographic key. Combining these two original observations yields an exact reversible cipher prediction that can be tested against all unknown pages, rather than retrospectively fitting isolated runes.

One concrete 29-symbol mechanism is to use **28 nonzero steps** for 28 ordinary plaintext rune values and reserve one rune, here the terminal native-GP `EA` (index 28), as ciphertext step zero. For a previous ciphertext rune `Cprev`, a 28-valued keystream `K`, and plaintext `P`:

```
STEP = 0                         if P == 28 (EA)
STEP = 1 + ((P + sign*K) mod 28)  otherwise
C = (Cprev + STEP) mod 29

Inverse:
STEP = (C - Cprev) mod 29
P = 28                           if STEP == 0
P = (STEP - 1 - sign*K) mod 28    otherwise
```

This is **bijective in P for any fixed K** and yields the original near-no-repeat footprint if the special rune is rare. It remains a hypothesis: `EA` is only one convenient native-GP reservation and **is not authenticated as the creator's escape rune**. Prior all-29 source-native word-shape studies strongly object to any one fixed-zero rune when original printed word delimiters coincide with ordinary English words; our experiment avoids requiring those delimiters by scoring only the **unbroken GP29 rune tape**, which directly addresses the independent word-length-order finding that LP2 printed word succession resembles scrambled order.

## Source-frozen decoder choices

The 256 bytes in `resources/liber-primus/lp2-grid-256.json` form eight **vertical 32-byte columns**, or eight alternative **row-major 32-byte blocks**. Both layouts are assigned forward/reversed to the eight original sections; AES-256-CTR or the pre-2014 ChaCha20 primitive generates the actual cryptographic stream. Two literal 16-byte IV rules are applied: all zero, or section-index encoded in the last four bytes. Generated stream bytes are converted to 28-way keys by `byte %28`, or rejection `byte>=252` followed by `byte %28`. Both signs are tested.

For the requisite previous ciphertext symbol, use either a zero at the beginning of each of the eight sections or the actual preceding cipher rune continued across section boundaries. For the designated reserved `EA` symbol, either consume one secret key symbol or bypass that step's key position, the latter mirroring the **authentically solved p56 cipher's transparent-F key-clock mechanism**. No key/IV is chosen using English output. The complete family is **2 native ciphers × 2 table geometries × 2 section orders × 2 IVs × 2 byte encodings × 2 signs × 2 cipher predecessors × 2 key clocks = 256 exact whole-manuscript inverses**.

[Single-file direct-test script](../sims/lp2_p50_eightcolumn_differential_streamkeys_sft.cjs) reads the exact original 12,956 source rune indices and aligns all eight sections with canonical `resources/liber-primus/lp2-corpus.json`. Positive tests create original-section-sized artificial plaintext from the **actual 76-rune solved p57 GP prose**, encrypt it under the proposed feedback rule and independently invert it to exactly the original planted rune tape in all eight sections for **both stream algorithms, both byte encodings and both clock behaviors**. Every full-length positive passes.

## Actual original outcomes

**Windows Node22 complete PASS [45002212012](https://github.com/FlareZ123/liber-primus/actions/runs/45002212012).** All **256** original-input combinations run to completion; **none yields native GP-English frequency structure**. Genuine first-party clear solved p57 has IoC **0.06270996640537514**; the unknown original ciphertext has IoC **0.03447839786450569**. The maximum original inverse across the entire full parameter family has IoC only **0.03535708961924271**, still close to a flat 29-symbol channel. That best case selects **AES-256-CTR**, printed-column geometry reversed, section-index IV, unbiased byte→28 conversion, additive sign−, continuous previous cipher rune and skip-zero key clock. Its eight section-specific IoCs range only **0.0349074294–0.0354968006**. The best ChaCha20 configuration has whole-book IoC **0.03534524535675717**, similarly flat. All candidates produce 86–87 forced reserved-rune occurrences, fixed by source zero-step sites rather than by reading an English plaintext.

The original source byte SHA-256 is `57d123515bc5310774913ce3b1bc27e18bfb695ac3f732f076a13bc8339fcd04` (raw UTF-8 file); the original parsed grid JSON SHA-256 is `2a77dc623df45ddd126d10d2fffbafead4efd161d2acc07644809deac00a2089`. The original runic stream is checked independently against the canonical page index file before any decipherment.

## Research decision

This test retires the **exact combined p50-eight-keys + fixed reserved-GP-EA zero step + additive 28-way full-chapter stream channel** for the 256 original-source configurations tested. It does **not** retire all no-repeat cipher families, all 28-symbol maps, externally supplied keys, state-dependent reserved symbols, a separately authenticated AES/ChaCha nonce, or plaintext based on a different alphabet. No unknown page is solved and no cryptographic key of author provenance is recovered.

The strongest next fork remains evidence for the author-intended operation or source **key material**, rather than arbitrary expansion of key, cipher or escape-rule menus. Additional tests without an independent selector would only create more flat-looking decryption candidates.
