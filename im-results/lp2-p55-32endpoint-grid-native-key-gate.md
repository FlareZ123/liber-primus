# P55 complete-word endpoints as direct GP29 selectors into the 32×8 table

**Agent 23, 16 November 2026. Original-input, source-geometric negative; no unknown LP2 plaintext, authenticated key, or intended table operation recovered.** The full source-shape inverse and genuine solved-text positive passed the [Windows Node 22 SFT run 43983609310](https://github.com/FlareZ123/liber-primus/actions/runs/43983609310). Exact source and reproducer: [`sims/lp2_p55_32endpoint_grid_native_sft.cjs`](../sims/lp2_p55_32endpoint_grid_native_sft.cjs).

## Why this finite consumer is worth testing

The original solved LP2 p57 PARABLE instructs the pilgrim to **shed circumferences** and seek what lies **within**. The last unknown page, p55, prints 76 GP29 runes. Its first rune belongs to a word carried over from p54; the remaining 75 runes form exactly sixteen complete printed words with lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`. Taking the first and last runes of each complete word in original reading order yields **32 endpoints**; removing these leaves **43 unmodified interiors**. The separately original-printed pp49–51 numerical table consists of **32 rows × 8 cells**, making a one-source-endpoint-per-row selector conceivable. GP29 indices and GP prime weights are actual historical encodings, and modular GP29 addition is established on solved pages.

This tests the **direct native-runic key** route. The [existing endpoint-grid AES-256-CTR gate](lp2-p55-32edge-grid-aes256-ctr-gate.md) uses the same original 32/43 geometry but interprets its 32 selected bytes as a 256-bit block-cipher key, and the 16 original word lengths as an IV. The present inverse does not invoke AES, a nonce, byte-packing of 43 runes, or an extra key generator. **The manuscript never states that endpoint runes index the table or that row-selected values form a repeated additive key.** That is the weakest, unverified premise.

## Complete source-locked inverse

Read the 256 source cells under the existing conditional conventional-base60 byte interpretation, in **printed row-major** order, with byte value `T[8*r+c]`. Let `E[r]` denote the source GP index of the rth of the 32 endpoint runes. Freeze the only two unfit selectors:

* **Index:** `col(r) = E[r] mod 8`.
* **Prime:** `col(r) = GPprime(E[r]) mod 8`.

For either, `K[r] = T[8*r+col(r)] mod 29`, producing 32 GP29 key symbols. At the 43 source p55 interiors, test exactly `P[i] = C[i] ± K[i mod 32] mod 29`. This formula is bijective and covers **all 43 original interiors**, retaining source word order. No key shift, unknown phase, page reset, row reorder, human-supplied plaintext, or score-based selector is fitted. Independently transfer the already solved p56 **plaintext-F transparent** convention: a true plaintext F emits F and does not consume any key. The one interior ciphertext F is at **zero-based offset 11**; the exact inverse explores both its legal literal/nonliteral possibilities and rejects any key-consuming zero plaintext from a nonzero ciphertext. This evaluates every legal mask, not the flawed heuristic of skipping every ciphertext F.

| Literal selector | Arithmetic sign | Ordinary 43-rune decoded IoC | Exact legal plaintext-F paths |
| --- | ---: | ---: | ---: |
| GP index modulo8 | − | **0.0287929125** | **1**, F skipped at 11 |
| GP index modulo8 | + | **0.0299003322** | **2**, skip at 11 or no skip |
| GP prime modulo8 | − | **0.0454042082** | **2**, skip at 11 or no skip |
| GP prime modulo8 | + | **0.0365448505** | **0**, impossible under p56-F rule |

The highest ordinary IoC, the negative prime-selector case, starts with the native rune sequence `X L L IA E P U TH NG TH N N B C N TH N AE U AE TH X OE N...`, with no coherent GP-native passage. The four complete 43-rune ordinary readouts are in the SFT output. All **five** legal transparent-F outputs likewise fail a full native readable passage; the one model with **zero** legal clocks is categorically incompatible with the borrowed p56 rule. The ordinary models' IoCs range **0.02879–0.04540**, while 43 independent authentic p57 clear runes have IoC about **0.05648**. This is a concrete original-cipher language diagnostic, not a proof that a nonstandard or still-encrypted intermediate register is absent.

For each of all four key/sign combinations, take **the first 43 authentically clear GP29 runes from original p57**, encrypt under the same full plaintext-F skipping encoder, then apply the exact ambiguous-F inverse. All four positive controls contain the original **43/43** plaintext solution in their legal state set. Each ordinary inverse also reencrypts the original source 43/43. These positive tests establish decoder correctness and mask enumeration, while they cannot authenticate the source-to-table association.

## Decision and next gate

**Retire only the two literal source-endpoint selectors used as repeating 32-rune GP29 additive keys, with or without the borrowed authentic p56 plaintext-F rule.** They cannot explain the original p55 interior as an ordinary coherent GP-native passage; one F-transparent variant is impossible outright. The table's printed byte alphabet is itself **provisionally** decoded, and the 32/43 geometry alone selects no cipher operation, so no stronger statement about the table's meaning is warranted. Do not test arbitrarily shifted table rows, altered words, fitted rune-to-byte maps or unrelated cipher families on this match without an independent authorial selector.

The credible next decision is upstream: recover a first-party instruction or actual plaintext crib that identifies how these original word endpoints and the numerical table are supposed to interact, or pursue an independently motivated alternative explanation of the source's unusual 86 adjacent-doublet events. No new deciphered unknown rune is claimed.
