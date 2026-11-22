# P54–55 complete-word SHED: full 86-rune and core52 original numerical-panel receivers

**22 November 2026 · Agent16 · Director #2272 · Bounded original-input negatives.** The physically correct whole-word SHED instruction leaves **52 true interior GP29 runes and 34 exterior runes** across the complete 86-rune p54→p55 terminal window. Three source-constrained recipient designs were executed: the 52 interior runes as literal 250-bit BASE29 AES key against all 256 original table bytes; the table's exact 52-cell innermost geometric ring as GP29 additive pad on the original 52 true interior runes; and a **new complete 86-rune inverse** using all 256 original table values, where its remaining outer 204 values are grouped into six-value checksums for the 34 true word-shell runes. **None produces native prose.** The third candidate is a full reversible mechanism over all 86 source runes, though it is not authenticated by any surviving first-party Cicada instruction.

## Original source and candidate operand

The original p54 page ends with a ten-rune fragment, and p55 begins with one completing `NG`; this forms **one eleven-rune complete word**. Correctly counting all seventeen terminal whole words gives lengths `[11,4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Discard the first and last symbol of each complete word, as p57's authentic **SHED OUR OWN CIRCUMFERENCES** text suggests. Keep the 34 removed symbols for exact original reconstruction, retaining the 52 inner GP digits in their printed order. The split exactly regenerates all **86/86** source runes; no original word carries are treated as two words.

One natural **integer** consumer is already historically motivated: Cicada explicitly used BASE29 in the 2013 round. Interpret the 52 GP indices as one big-endian base29 integer. Its actual value is **250 bits**, so left-pad to a full 32-byte AES-256 key:

`0300f516a85f52950f3ec2bddbf98c224b0684e1d31988c710f71996b1b7a1e1`

Test **one** literal modern-2014-available inverse: AES-256-ECB, no IV and no padding, on the complete **256 unchanged printed numerical-panel bytes** in source row-major base60 order. This is an explicitly provisional cross-page key interpretation; the author did not label p55 as AES key material, specify byte padding, authenticate AES as LP2's cipher, or say that `SHED` acts on this terminal 86-rune window instead of all words.

## Original 256-byte AES-256-ECB output

[Original-source complete-key CommonJS SFT](../sims/lp2_p54p55_52core_base29_aes256_p50_sft.cjs) passed [Windows Node22, run45031338656](https://github.com/FlareZ123/liber-primus/actions/runs/45031338656). The source-bound result is:

| Original p50 AES-256-ECB output | Value |
| --- | --- |
| Plaintext SHA-256 | `c4cfd4d907cdc9425385ca209de17327eaae1bb73e2cd05d4dfb56100f273055` |
| First 16 plaintext bytes | `5aaaf64778e191075871fffd32b58d50` |
| Printable ASCII bytes | **102/256** |
| Longest uninterrupted printable segment | **5 bytes** |
| Empirical entropy | **7.0775 bits/byte** |
| Recognizable header / clear instruction | **None** |
| Exact source ciphertext re-encryption | **256/256** |
| Known original-source-phrase plant | **256/256** |
| Original 86-rune full word-regeneration | **86/86** |

No source word, embedded file header, authentic plaintext or keying instruction appears. The 256-byte AES output looks like ordinary wrong-key material. The exact cipher replay demonstrates a correct implementation of a *hypothesized* bijection; it does not validate a decrypting key. The key/IV choice is not author-authenticated and this test does not purport to decrypt p54/p55 as runic ciphertext.

## Original panel-inner-ring52 → exact core52 GP29 inverse

The **same printed p49–p51 32×8 numeric table** contains an independent, source-visible **26×2 rectangle =52 cells** after **three literal circumference layers** are shed. Retrospectively, **the signed 2016 JPEG's image height569 minus width563 is exactly six**, an independently source-fixed possible instruction to trim three cells per edge of each original table dimension; this connection was noticed after the target52 shape and is not a creator-authenticated peel opcode. The signed image postdates the original 2014 LP2 pages, so it could guide only a later solver. Starting at the inner rectangle's upper-left cell (row3,col3, zero based), traverse the remaining 52 positions clockwise. Their exact 52 original byte values modulo29, without fitting, serve as one consecutive key `K[i]` for the GP29 additive inverse **`P[i]=(core52[i]−K[i]) mod29`**, in the authentic p56 direction. This is a more immediate interpretation of p57's SHED command than AES, because it uses **three exact 52-sized objects**: the p55 true whole-word core, the p50 unambiguously oriented inner ring, and the independently solved p57 last52 from `SHED` to `EMERGE`.

One literal clockwise perimeter reading of those remaining original 52 cells gives:

`WJGTMNHHIASXIAIIWXIDTAEUCHEAECXLLBCNGREOEOBOEJOEIIFYYJEAAENGHRAEH`

Its GP29 IoC is **0.032428356**, compared to **0.066365008** for the authentic original solved p57 52-rune refrain; only **3/52 positions** match p57, with no continuous native plaintext. An alternative **original printed row-major** reading keeps the *exact same 52 source cells* in the page's table order (rows3–28, columns3–4). Subtracting this key without a fitted phase yields `WJNGEOUOWSFNGTOAEEOEARPFOXFADCNGNPHWTNTHMPDOEWCSEOGIFNGIAAEIAECDM`, IoC **0.030920060**, and only **4/52** positions equal to the independently known clear p57 closing refrain. The SFT asserts its exact **52/52** original forward replay alongside clockwise's 52/52. Thus the historical row-major reading also has no prose.

The separate direct original **p56 φ(consecutive primes) with literal F-bypass** operation on that same exact known p57 52-rune phrase predicts just **1/52** of the true p55 inner52 ciphertext runes. The authenticated φ rule consumes **50 prime keys** for the 52-character refrain because two printed F runes pass transparently. Thus neither of these *specific* historically executable original-source laws turns the terminal core into the known solved instruction.

[One-operation inner-ring52 CJS SFT](../sims/lp2_p54p55_core52_p50_inner52_p57_refrain_source_sft.cjs) and [successful Windows Node22 run45031777609](https://github.com/FlareZ123/liber-primus/actions/runs/45031777609) assert exact original 52-source-key positions, complete source 86-rune partition, **52/52** original output replay and **52/52** solved native-GP plant. The [AES-source SFT](../sims/lp2_p54p55_52core_base29_aes256_p50_sft.cjs) also records the p56 φ phrase comparison and [Windows PASS45031651253](https://github.com/FlareZ123/liber-primus/actions/runs/45031651253). None of these exact reversible controls authenticates the intended decoding rule.

## New complete original 86-rune key schedule: 204 outer numeric cells / 34 word endpoints

The corrected whole-word split has **52 interior runes and 34 endpoint runes**, while peeling exactly three circumferences from the original 32×8 numeric panel leaves **52 inner cells and 204 exterior cells**. The exterior register divides without remainder into **34 blocks of six original bytes**. This is a fully length-accounted **256 original source numeric cells → 86 original ciphertext runes** transfer grammar: each word-interior rune consumes its own printed-order inner cell, and each of the 34 endpoint runes consumes one distinct, consecutive six-byte block from the outer register.

To avoid fitted coefficients, use one literal arithmetic rule for each endpoint: the **sum of its six unmodified source bytes modulo29**, a GP29 shift. Each interior uses its single unchanged source byte modulo29. Use the authentic solved-p56 inverse direction `P=C−K mod29`, retaining the original 17 complete printed word boundaries and source-order pairing. The outer and inner cells are taken in the original **printed row-major order**, never an optimized permutation or tuned phase. All **256 original source numeral cells are consumed exactly once**, and all **86 original p54→p55 runes are decoded, preserved and reencrytable**.

The 86-rune output in the seventeen original complete-word positions is:

`TWJNGEOUOWSH / PFNGN / WJ / LNG / AETOAEEOIA / CEARPFC / SNG / NGOXFADCNGNPHWNG / OTNTHML / EOPDM / UL / GOEWCSEOW / TGIFNGIAX / DA / AEAEIAECOE / ADEA / OMOE`

Full GP29 index of coincidence is **0.035294117647**, against **0.036114911081** before decoding, and authentic clear p57 IoC approximately 0.063. The output is not coherent GP-native prose. The exact all86 bijective forward replay and a separate 86-rune authentic solved-p57 donor plant both pass. [Self-contained original source SFT](../sims/lp2_p54p55_86_source_256_ring52_204six_shell_sft.cjs) and [Windows Node22 PASS45032386390](https://github.com/FlareZ123/liber-primus/actions/runs/45032386390).

This is a genuine complete *hypothesis* with no missing receiver positions, but its failure cannot justify new permutations or checksum coefficients. **The missing source input is still the authored operation**: p57's SHED describes the data partition, but does not command a six-byte additive checksum or instruct conversion of the p50 grid into the terminal-word GP29 shifts. The six-byte shell alignment and the 2016 six-pixel dimension difference may be coincidental despite their exact arithmetic.

**Decision:** retire the literal BASE29→AES256→p50 consumer and both untouched 26×2 table readouts (clockwise and printed row-major) as direct GP29 additive inverses of the core52. Keep the **52/34** physical word partition and source-authored SHED command as separate facts. To solve #2272's actual terminal **86-rune** prose, a first-party instruction must select a valid rune-value-changing operation from source and predict a ≥100-rune original disjoint holdout. The complete all86 source-keyed model above is reversible but rejected on its full original output. Do not expand the negative into a guessed padding/IV/KDF/mode grid.
