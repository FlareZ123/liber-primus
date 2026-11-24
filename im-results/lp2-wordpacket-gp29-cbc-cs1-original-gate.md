# Carried GP29 word-packet ciphertext stealing

Agent28, 24 November 2026, Director [#2478](https://github.com/FlareZ123/liber-primus/issues/2478). **One fully reversible nonlinear block mechanism with blind finite key recovery is rejected on the original. No unknown plaintext.**

## Independent construction and source limits

NIST's pre-LP2 [2010 SP800-38A Addendum, section 2](https://doi.org/10.6028/NIST.SP.800-38A-Add) documents CBC-CS1: a partial final block borrows the missing suffix of its preceding ciphertext block, so no extra transmitted symbols are needed. This is historical availability, not a first-party Cicada selection. The adaptation uses GP29 componentwise addition/subtraction instead of XOR, a two-rune block, and a fixed 3-round nonlinear toy Feistel (L,R) -> (R,L+R²+k_i mod29), with three shared GP29 round keys. It is intentionally small enough for exhaustive key inference; it is not NIST-approved cryptography. IV begins at (0,0), then carries the final complete transmitted ciphertext pair from every packet into the next. No independent packet nonce, private key, secret padding or changing word boundaries.

Freeze public framing before opening original values: consume one whole printed word unless it has one rune, in which case include the next complete word(s) until the packet has at least two runes. If the final packet would contain a lone rune, append it to the preceding packet. Preserve all original word separators and rune lengths, including 32 real cross-page words; partition original 2,896 words / 12,956 runes into **2,813 packets**, 83 multiword packets, 1,368 odd-length packets. The stolen tail can straddle the original printed seams of merged packets.

Even packet: ordinary two-rune CBC. Odd packet: CBC encrypt all prior complete pairs; for the last full plaintext pair compute U=E(Ppair+IV), then V=E((Ptail,0)+U); emit U[0],V[0],V[1]. Recover Z=D(V), U=(transmitted U[0],Z[1]), Ppair=D(U)-IV and Ptail=Z[0]-U[0] modulo29. The last two transmitted symbols are V and are the next known IV. This proves lossless inverse for every 29^3 key. No shared stationary whole-word map: even identical plaintext words can differ through the ciphertext-known IV. Unlike #2278, the printed word boundary tape itself is preserved, and unlike fixed block feedback, the public final partial-block rule changes layout at real word boundaries. No exact CBC-CS1 model was found in the current issue/synthesis search.

## Blind inference

Use only 177 length1–3 words of the 413 complete words in p0–7, in 173 training packets wholly inside that region. Score decoded short words under independent Gibran/Emerson length-conditioned frequencies with pseudocount .25. Enumerate 29^3 = 24,389 common keys. Training packets use known preceding ciphertext pair as IV; no independent future plaintext. Freeze winner and decode full original, evaluate independent p16–21 and p40–53 whole words.

Two original-shape native solved-Cicada and one Shakespeare plant, independently keyed, all recover exact true triple uniquely and 12,956/12,956 plaintext runes each. Winner margins 1063.31–1123.62 nats. Actual clear p57 95-rune positive also replays exactly. The heldout plants recover all 171/284 short words' actual symbols; lexical dictionary coverage may be below 100% because native spelling/OOV is allowed.

## Original result

The unique best training candidate [25,15,22] has a 12.0687-nat margin. It is a noise-fit triple, not an authenticated key.

| Scope | Original lexical count | Short lexical count | Original short mean log | IoC | Plant IoC range |
|---|---:|---:|---:|---:|---:|
| p0–7 | 23/413 | 23/177 | -10.6626 | .034290 | .060145–.062116 |
| p16–21 sealed | 10/372 | 10/171 | -11.1117 | .034841 | .060619–.061775 |
| p40–53 sealed | 16/669 | 16/284 | -11.1520 | .034560 | .060130–.061346 |

Native controls attain ≥168/171 and ≥281/284 short-word lexical counts in heldout. Original previews are nonlinguistic (training starts ONOEAXRNGP NGASCL MEJOE IAIAEA YDS PBOTDEOULUAENG). All original 12,956 glyphs exactly reencrypt; this is automatic for every key and therefore only checks the implementation.

**Decision:** This particular 2-rune primitive, one fixed CS1 adaptation, public greedy grouping and continuous ciphertext IV do not recover original prose. Historical CTS by itself does not select that cipher/key/packet receiver. Retire only the frozen architecture; no arbitrary block-mode/IV/Feistel menu. A different independently selected decoder or frame is required.

[Reproduction CJS](../sims/lp2_wordpacket_gp29_cbc_cs1_sft.cjs), executed against six exact repository inputs in the connected V8 runtime, including native controls; no independent Windows CI result claimed. Run from repository root with `node sims/lp2_wordpacket_gp29_cbc_cs1_sft.cjs`.
