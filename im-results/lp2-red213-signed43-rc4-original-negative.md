# Original LP2: signed-2016 43-word initials + red213 as one RC4 key

**Decision:** The unique compact construction **213 original red GP29 runes + first rune of 43 authentic signed-2016 words = 256 bytes** did not supply an LP2 key via standard RC4. Neither a full original-runic stream decoder nor an unchanged 256-byte p50 binary receiver recovered any recognizable plaintext, authenticated key, file header, or continuation. This is a tested **conditional construction**, not a creator-authenticated RC4 instruction or a disproof of all combined red/2016 operands.

## Upstream evidence and strongest assumption

The literal original red rune count **213** across physical LP2 pages 0,3,6,7,8,15,23,27,33,39,40,53,54 was independently fixed and earlier used in [the direct-additive p50 gate](lp2-red213-signed43-grid256-original-direct-gate.md). The signed 2016 first-party message `resources/historical/cicada2016-4gq25-outguess.asc` has **43 alphabetic words** from `Hello` through `OpenPGP` before the PGP signature. Their natural first GP29 rune gives 43 additional bytes without a fitted selector. Exactly 256 symbols also matches the p50 printed table's 256 cells, and happens to equal the **RC4 key-scheduling array size (256)**. The latter is a standard historical cipher width, but RC4 was not independently identified as the authors' LP2 encryption primitive; the count match alone cannot establish intent, and a 2016 hint postdates the 2014 original LP2.

The narrowly frozen construction sets `key = [the 213 canonical red runic indices in physical page/printed sequence, then 43 signed first-rune GP indices]`; no alternate keys, word masks, reversed orders, PRGA drop lengths, reshaped tables, Iv resets or chosen original cribs. `RC4(K)` is exact standard 256-entry KSA and PRGA starting at state zero. The receivers are two independently source-visible native representations: (1) one continuous runic book GP29 cipher with `P_i = (C_i − RC4byte_i mod 29) mod 29`; (2) bytewise XOR of the original p50's row-major base60 256 bytes `P_i = B_i XOR RC4byte_i`. A line/word reset, special F transparency or historical key derivation other than the one literal concatenation would constitute a **different, source-unselected** hypothesis.

## Frozen original results

The [complete CommonJS standalone SFT](../sims/lp2_red213_signed43_rc4_source256_original_sft.cjs) loads and validates all original inputs and **12,956** intact unsolved ciphertext runes, 213 highlighted runes, 43 signed word initials, exact original p50 256-byte SHA-256 `3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290`. The authentic 2016 original signed message SHA-256 is `aff805ed3c994a1a9e55c117a46b7f19535ac089c9bea5e02d803e48d652096e`. Exact RC4 KSA initial 32 keystream bytes:

```text
1d e9 7b 0b 44 4f 1b d3 5f 21 66 fc 96 95 44 24
14 89 ec 38 19 b0 ec e3 29 b3 47 0c db 61 ec e9
```

The full original output's rune-index coincidence is **0.03447665**, still close to the original random-like ciphertext (~0.03448) and far below the real clear p57 GP29 0.06271. Two prespecified disjoint readable-region expectations fail:

| Original passage | Runes | Decrypted IOC | Original-inverse GP29 prefix |
|---|---:|---:|---|
| p16–21 | 1,613 | .03435486 | `SDJNBIABOETIAFWSEOGTHIAEBSEADAEIASGCEOEOCFJEFD` |
| p40–53 | 3,008 | .03432638 | `ODBYRYYCNEEEJIATHMOECLWINGSEAPPBNEOGLUIJXIGG` |
| p54–55 | 308 | .03449808 | `NDPIBPHSETHLPLOESXHETPANGDONGHDIEANGWLAMUAE` |

The separate XOR of all **256 original p50 bytes** yields SHA-256 `ba877940bf33ade9580bb754dd1674905381141ebf50225b38a515973cd0bcd2`, with only **88/256 printable ASCII bytes**, no recognizable file magic, and first 32 output bytes `d6 0e dc b1 25 a2 65 64 03 d8 fa 22 61 91 f3 f0 6d 43 e3 19 7f 39 d7 b4 44 75 ea 15 4d 23 61 6c`. Both ciphertexts reencrypt exactly. The authentic original solved p57 text, first95 symbols GP29 encoded using the identical keystream, is exactly recovered by the inverse. No original unknown plaintext appears.

**Windows Node22 [PASS 45006127493](https://github.com/FlareZ123/liber-primus/actions/runs/45006127493).** Reproducer controls the original key bytes, cryptographic replay, native p57 known-text planted positive, and all original runic/binary cells. The negative result closes only this source-specific direct RC4 receiver, which was independently motivated by the specific 256-symbol bridge but **not independently selected by an authenticated instruction**. Additional unknown password modes, arbitrary drop lengths or source order permutations cannot be justified by the same failed equality and would repeat the familiar streetlight effect.

## What would change the decision

A first-party 2014–2016 cipher instruction explicitly selecting RC4, a recipient state handoff, or an independently checkable ≥150-runic unknown plaintext island would warrant reexamining a specified different original source operand. Otherwise preserve the source cardinality and end this branch. The 56 physical LP2 encrypted pages remain unread.
