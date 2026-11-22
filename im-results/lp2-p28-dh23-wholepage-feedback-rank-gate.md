# P28 literal-DH full-page decipherment: a source-typed feedback test and universal fixed-alphabet obstruction

**Agent8, 22 November 2026; Director #2216. Classification: bounded negative original-cipher result.** The unique literal `DH` line genuinely encodes the previously recovered numerical example, but no authenticated 269-rune p28 or 277-rune p29 plaintext results. No new manuscript key or destination is claimed.

## Source and causal decision

Physical p28 of original source `45.jpg` has 269 GP29 runes on 12 physical lines. Only one line in the unsolved manuscript starts with the literal GP glyph pair `DH`: p28 line6, at zero-based offset117. It has 23 runes in five printed fragments:

`DH | NPA | EORHNNGEAFNF | OMSN | EAAIUL`.

The actual source indices are

`[23,8,9,13,24,12,4,8,9,21,28,0,9,0,3,19,15,9,28,24,10,1,20]`.

The previously established literal-DH/count/outer-H rule reconstructs standard DH `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`. This is source-constrained structural evidence, independently described in [the original line reconstruction](lp2-p28-dh-line6-source-reconstruction.md). The historical signed 2013 protocol makes a one-shot exchange that returns **one integer K=2**, with no prescribed GP29 ciphertext consumer, key derivation, symbol serialization, per-rune state transition, or restart rule ([signed source](../resources/external/2013-tcp-server-signed-source.md)). That is the central operation/operand gap for p28, and new numerical fits do not automatically fill it.

## Frozen complete-page feedback inverse

An exploratory direct use of the line itself as a public key and DH modulus as a feedback lag was [committed before decoding](../workplace/agent8-2216-p28-dh23-recoverable-feedback-precommit.md) (commit `a2487c9`).

- Set `S[-23..-1]` to exactly the 23 printed runes of p28 line6.
- For original physical p28 `C[0..268]`, decode all symbols under two fixed weights `w=1` (minimal lag feedback) and `w=K=2` (literal DH shared value): `P[i]=(C[i]-w*C[i-23]) mod29`. For `i<23`, take `C[i-23]` from S. The exact inverse is `C[i]=(P[i]+w*C[i-23]) mod29`.
- On untouched physical p29 `C[0..276]`, use either the same p28 line6 reset seed or the final 23 actual p28 ciphertext runes as cross-page prehistory. No free phase, key-origin, word repartition, sign selection, reset adjustment or discarded rune is permitted.
- The full original page/word sequence is preserved. A solved p57 ciphertext plant checks exact 95-rune recovery under each weight.

The [complete Node22 source test](../sims/lp2_p28_dh23_line6_autokey_wholepage_sft.cjs) executed successfully on [Windows Actions 45011622915](https://github.com/FlareZ123/liber-primus/actions/runs/45011622915) and performed exact forward replay for all **269/269** p28 and **277/277** p29 runes with both weights and boundary conventions.

| Original target | Weight | GP29 index of coincidence | LP1-native trigram mean (nats/rune) |
|---|---:|---:|---:|
| Raw p28 | n/a | 0.03390113 | −3.42908 |
| p28 feedback inverse | 1 | 0.03584309 | −3.42898 |
| p28 feedback inverse | 2 | 0.03442823 | −3.41782 |
| Raw p29 | n/a | 0.03369434 | −3.43624 |
| p29 with fixed line6 seed | 1 | 0.03429603 | −3.41063 |
| p29 with continuous ciphertext carry | 1 | 0.03379898 | −3.40134 |
| p29 with fixed line6 seed | 2 | 0.03426987 | −3.39113 |
| p29 with continuous ciphertext carry | 2 | 0.03447915 | −3.38326 |
| Solved p57 native | n/a | 0.06270997 | −2.46814 |

Every one of the six inverse outputs remains far below the lowest mean score among length-matched contiguous GP-native LP1 control windows (p28 **−2.46910**, p29 **−2.45956**). The direct decoded outputs are nonlinguistic and no contiguous 150-rune original prose emerges. Positive source-native p57 plants recover **95/95** exact runes for both weights. The test therefore rejects precisely this complete DH23 lagged-ciphertext-feedback model as a direct native-GP English decoder. It does not reject other source-selected evolving-state ciphers.

## An entire class excluded without choosing a key

There is a stronger length-matched original-input obstruction for any source-keyed **rune-position permutation followed by any one globally fixed permutation of the 29 GP rune labels**. Sorting 29 symbol counts eliminates both unknown transformations, including arbitrary DH-generated column orders, layout shuffles, columnar transpositions, a uniform fixed substitution and a constant GP29 power map.

| Exact original target | Count in five most common ciphertext runes | Smallest count in any solved-native LP1 window of the same rune length | Native windows compared | Deficit |
|---|---:|---:|---:|---:|
| p28, 269 runes | **68** | **107** | 1,297 | 39 |
| p29, 277 runes | **69** | **111** | 1,265 | 42 |

Each target has all29 GP29 symbols present, with maximum single-symbol frequency15. A fixed bijective symbol map and any arbitrary character-position permutation must preserve those sorted counts exactly. The native LP1 comparison uses original encoded solved pages from `resources/external/relikd-solved-gp29-native-v1.json`, treating each continuous within-section window at exactly the respective original page length. This is a finite native-language reference-class test, not a proof about every imaginable English string, another language or a binary intermediate. A synthetic solved-native control with reversed character order and a fixed GP29 Caesar symbol permutation preserves **29/29** sorted counts exactly, as required.

The [universal rank SFT](../sims/lp2_p28_dh23_permutation_rank_invariant_sft.cjs) ran [successfully on Windows Actions 45011832384](https://github.com/FlareZ123/liber-primus/actions/runs/45011832384). A narrower word-terminal compatible-transform obstruction was already known manuscript-wide ([earlier word BASE29 work](lp2-word-base29-unit-invariant.md)); the present bounded page-local result concerns the entire page histogram and all arbitrary *position permutations* jointly with one fixed symbol alphabet.

## Direct DH23 field-range obstruction and next decision

A literal rune-wise exponentiation modulo the DH modulus **23** cannot directly emit the original GP29 rune indices: p28 has **60** output symbols in the range23–28, p29 has **50**, and both pages use all29 classes. Any such receiver would require an explicit additional encoding/escape/state channel because `F23` has only23 possible outputs. Reinterpreting `p=23` as a lag and `K=2` as a weight supplies one concrete full-page test, but no signed original source rule requires that interpretation, and its original outputs fail. Arithmetic mod29 fixes the symbol capacity but still leaves the transformation law unstated.

**Decision for #2216:** the literal-DH line reconstructs its own compact worked exchange, not a proved page-body cipher. The two full-page lag-feedback consumers are negative, and the much broader fixed-alphabet/position-permutation class cannot by itself yield normal GP29 native plaintext with reference-like symbol concentration. The source operands needed for the next encryption stage (state update, payload framing or key material) remain missing. Do not branch into arbitrary DH-key KDFs, line-origin sweeps or additional 23-cycle fits without a genuinely new authored instruction.

A **separate independent route** begins with the five visually printed numbered passages on physical pp34–39; those source-visible numerals may identify a sequence of operations rather than another DH key. That question is not a variant of the failed p28 DH consumer and is defined as separate Director Issue [#2215](https://github.com/FlareZ123/liber-primus/issues/2215). No new plaintext or destination is implied by this negative decision.
