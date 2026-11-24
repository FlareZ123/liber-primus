# Candidate READ OUT points to a 23-rune p0 receiver

**Status:** conditional receiver geometry; no unknown plaintext recovered. The upstream READ OUT phrase and the interpretation of p50 base-60 values as LP2 rune offsets are not creator-authenticated (see the p50 output-type gate, #1725).

## Result

The p28 cube-layer candidate produces the two-word candidate output **READ OUT**. Under the conditional interpretation that this is an instruction and p50 base-60 values are p0 rune offsets, the GP0/table pointer grammar gives a specific interval on p0:

| Output word | GP0 sum | 256-cell table token | Base-60 value | Base-59 value |
|---|---:|---|---:|---:|
| READ | 55 | 1K | 80 | 79 |
| OUT | 20 | 1g | 102 | 100 |

The base-60 values select p0 rune offsets 80 through 102, inclusive. Both endpoints are exact word boundaries: offset 80 begins p0 word18, and offset 102 ends p0 word21. The selected block therefore contains four complete words of lengths 3, 7, 5, and 8: **23 runes total**.

That length matches the independently reconstructed p28 Diffie–Hellman modulus p=23. The base-59 interpretation gives offsets 79 and 100, a 22-rune interval whose endpoints do not delimit the same four complete words. This discriminates the two tested radix interpretations only if table values are already being treated as rune offsets; it does not authenticate that output type.

The two table addresses also reuse independent anchors in the existing pointer research:
- T[55]=80 is already the p27 DJU/BEI endpoint.
- T[20]=102 is already the 2016 THE pointer landing at the end of p0 word21.

Within that conditional pointer interpretation, the phrase supplies two existing pointer addresses and their outputs delimit a block whose length matches the p28 DH construction. This is more constrained than an arbitrary 23-rune cut, but it does not authenticate the p50 output type or the upstream READ OUT plaintext.

## Exact selected material

One-based p0 word positions and transliteration:

| p0 word | Rune start–end | Length | GP29 transliteration |
|---:|---:|---:|---|
| 18 | 80–82 | 3 | NGAETH |
| 19 | 83–89 | 7 | IAEHXTHPG |
| 20 | 90–94 | 5 | YFNGCJ |
| 21 | 95–102 | 8 | THAMINGIIAY |

Concatenated transliteration:

NGAETHIAEHXTHPGYFNGCJTHAMINGIIAY

GP29 rune indices, zero-based:

[21,25,2,10,25,8,14,2,13,6,26,0,21,5,11,2,24,19,10,21,10,27,26]

The interval crosses a printed line break, but it is word-aligned. It is not a complete printed line.

## What has and has not been established

Established computationally from the canonical corpus and table:
- GP0(READ)=55 and GP0(OUT)=20.
- Global table cells 55 and 20 contain 1K and 1g.
- Under the table's base-60 alphabet these decode to 80 and 102.
- Those offsets delimit exactly p0 words18–21 and 23 runes.
- Under base59 they decode to 79 and 100, which do not delimit that block.
- The 23-rune length matches the p28 DH prime.
- These receiver facts depend on interpreting the p50 base-60 values as LP2 rune offsets; that output type is not creator-authenticated (see `im-results/lp2-p50-rune-offset-output-type-gate.md`, #1725).
- Agent8's separate p15/p53 179-adic cross-artifact fingerprint reselects p0 offset80 as the unique 23-rune window with residue157 and center F. This strengthens the candidate receiver geometry, but the coordinate and p50 integer-output interpretations remain intermediate hypotheses; see `im-results/lp2-p15-p53-dh23-179-adic-read-fingerprint.md`.

The upstream READ OUT plaintext remains a candidate from the p28 investigation, not an independently established manuscript plaintext. The receiver selection does not decrypt the 23 runes. Initial tests of uniform ±K shifts, simple cube powers, H on the whole span and on wordwise nested shells, and a repeating-key Vigenere interpretation did not yield readable plaintext. A later direct transfer of the source-supported p28 power roles also fails: the receiver's sole F is its center, so cube3 can be applied to that singleton and exponent27 is a genuine multiplicative reciprocal on all 22 outer runes; the fixed output is `EWSOWJIASNCMFEGHSDYOEOXM`, or `EWS / OWJIASNC / MFEGH / SDYOEOXM` at the preserved word boundaries. These negative tests do not exclude a different DH-derived reversible operation or the possibility that the block is key material rather than plaintext; however, direct repeating-key use of both the raw receiver and its p28-transformed output on untouched p1–p55 has now also failed under continuous and page-reset clocks (see the Agent17 key-transfer gate below).

See `lp2-readout-p0-center-reciprocal-transfer-gate.md` for the exact transfer and standalone reproducer.

## Direct DH-derived consumers tested (Agent6, 20 November 2026)

### Motivation and fixed input

The conditional receiver is exactly 23 GP29 symbols, while the p28 state candidate is the standard DH23 tuple `(p,g,a,b,A,B,K)=(23,5,6,15,8,19,2)`. This motivates a small human-plausible test: use the shared secret `K=2` as a positional stride, use the generator `g=5` to order the 22 nonzero field elements, or use `K` as a multiplier in the historical BASE29/GP29 register. The p0 input, endpoints, radix and symbol order were frozen; no arbitrary offset, phase, word edit or key search was introduced.

### Tested reversible family

The SFT tests 14 direct consumers:

1. `i -> K*i mod23` and its inverse `i -> 12*i mod23`, under zero- and one-based position conventions (four permutations).
2. The generator-power order of `F23*`, with zero fixed at the beginning or end and both directions (four permutations).
3. The `K`-seeded generator orbit `2, 10, 4, 20, ...` under `x -> 5*x mod23`, followed by the zero position, with both origins and directions (four permutations).
4. The GP29 value maps `x -> 2*x mod29` and inverse `x -> 15*x mod29`, retaining the original word boundaries `[3,7,5,8]` (two substitutions).

All position maps are bijections on the 23 selected positions; both GP29 maps are bijections on the 29-symbol register. The script checks the DH equations, the order-22 generator orbit, every permutation's uniqueness, and the inverse multipliers.

Representative outputs are nonlinguistic:

- `K` stride, zero-based: `NGTHAEXPYNGJAIIYAEIHTHGFCTHMNGIA`
- generator powers, zero first: `NGAEHTHYAEIPMAFGYIIACNGITHXTHNGJ`
- reverse generator powers: `NGJNGTHXTHINGCIAIYGFAMPIAEYTHHAE`
- `K`-seeded generator orbit: `THYAEIPMAFGYIIACNGITHXTHNGJAEHNG`
- reverse `K`-seeded orbit: `HAEJNGTHXTHINGCIAIYGFAMPIAEYTHNG`
- GP29 multiply by `K`: `PNGRLNGTEARYEODFPIOERMNLPLAED`
- GP29 multiply by `K^-1`: `AEIAUCIARWUNGOPFAEBLUEOACAECEAP`

The reverse generator orderings contain the isolated three-rune word `THING` (`TH,I,NG`) in four correlated variants. A deterministic 100,000-shuffle null preserving the exact 23-rune multiset, then applying the same 12 fixed position permutations, produces at least one `THING` **30,220/100,000 times (30.220%)**. This is a conditional familywise diagnostic for that noticed word, not a global p-value. The GP29 `K`-multiplier output contains `TEAR` only as an interior substring; with the original separators preserved, its four words are `PNGR | LNGTEARYEO | DFPIOE | RMNLPLAED`, not plaintext. The inverse multiplier likewise gives no readable four-word output.

### Decision

No tested direct DH positional order or GP29 multiplication recovers a coherent plaintext span or independently verifiable key material. The `THING` hit is not discriminating under the fixed-multiset null, and the `TEAR` substring violates the original word boundaries. Retire these 14 exact direct consumers for this receiver. This does **not** exclude every possible DH-derived cipher; it means another DH consumer should not be searched by widening permutations, phases or affine variants without a new first-party operation selector or an independently selected receiver.
## 179-adic scalar-transfer probe (Agent6, 20 November 2026)

Agent8's p15/p53 fingerprint supplies a second, cross-artifact route to the p0 receiver. Its p0 integer has residue `157 mod179`; the same value is obtained without using the p0 symbols from the DH/READ coordinates:

- `e = b^-1 mod22 = 3`, `GP0(READ)=55`, and public share `A=8`, so `e*55-A = 157`.
- The p53 page has 179 runes and the DH multiplicative group has order `p-1=22`, so `179-22=157`.
- `157 mod29 = 12`, which also equals `K^-1 mod23` for the DH shared secret `K=2`.

Using the 2013 `BASE29` clue, the bounded scalar family was tested on the fixed p0 receiver: shifts by ±12, multiplication by 12 and its inverse 17, and the affine DH map `x -> 3*x-8 mod29` and its inverse `x -> 10*x+22 mod29`. The only notable output is the forward multiplicative map `x -> 12*x mod29`: its first four GP29 symbols transliterate to **LIAR**. The exact raw prefix `[21,25,2,10]` occurs only once in the complete unknown-page corpus, at p0 offset80. The other p0 23-rune window with residue157 (offset156, center T) does not produce LIAR; neither do the independently selected p15 [23,73] and p53 red [128,178] 51-rune controls under the same multiplier or inverse.

This is not a plaintext recovery. The 23-rune output is `LIARINDAJXOEFLTHTAIAAERLRCOE`; with the original word boundaries retained it is `LIA | RINDAJX | OEFLTHT | AIAAERLRCOE`, so the four-rune `LIAR` crosses the first printed word boundary. The remaining stream is nonlinguistic. The inverse17, ±12 shifts and affine3x−8/inverse outputs are also nonlinguistic. A seeded 100,000-shuffle null preserving the exact input multiset and testing both multipliers gives `LIAR` at the start 21 times (0.021%); because the word was noticed after the transform and many possible words/operations exist, this is a conditional diagnostic, not a global significance claim.

Retain the unique `LIAR` prefix as an unresolved marker: it could be a deliberate warning/decoy or a partial clue, but the present evidence does not distinguish those interpretations. Do not add a rail-fence, Vigenere or other second layer without an independent source selector. Agent8's 179-adic result remains an intermediate structural selection, not a decryption or an authenticated p50 opcode.


## Direct key transfer to untouched p1–p55 pages (Agent17, 24 November 2026)

The report leaves open that the selected 23-rune block might be key material rather than plaintext. A bounded test therefore uses it only as a key and applies it to the untouched pages p1–p55.

Two 23-symbol candidates are source-derived:

1. The raw p0 receiver at offsets 80–102.
2. The output of the already documented p28 center-cube / outer-reciprocal transfer on that receiver.

Each is tested as a repeating additive GP29 key, with both signs, under two plausible clocks: one continuous across p1–p55, or reset at each page. No phase fitting, F-hold, extra layer, or alternate alphabet is introduced. All eight variants re-encrypt the original **12,694/12,694** target runes exactly.

The untouched p1–p55 stream has IoC **0.03448065787**; clear p57 has IoC **0.06270996641**; the uniform GP29 baseline is **0.03448275862**. The eight outputs range only from **0.03445228238 to 0.03449416292**. Character-trigram scores against both the Latin Caesar Book I and English Shakespeare controls remain near the ciphertext scores; the best English score is only −11.29694, compared with −7.85722 for clear p57. The decoded prefixes are nonlinguistic.

**Decision:** retire direct repeating additive-key transfer of these two fixed 23-rune candidates to p1–p55 under continuous and page-reset clocks. This does not exclude a different KDF, one-time-pad construction, or other independently selected cipher; it supplies no plaintext or key. Do not add F-hold or fitted phases without a new source selector.

**Reproducer:** \`sims/lp2_readout_p0_23rune_key_transfer_sft.cjs\`.

## Next decisive question

Do not widen direct K/g permutations, the tested 179-derived scalar family, or the direct repeating-key transfers of p0 80–102 on this receiver. The unique `LIAR` prefix is unresolved and crosses a printed word boundary; a second layer needs an independent first-party selector. The next productive direction remains a blind consumer of the frozen 179-adic/base60 operation on an untouched, independently selected original object.

## Reproduction

Run:

`node sims/lp2_readout_p0_23rune_receiver_sft.cjs`

The script recomputes the phrase word sums, table lookups under both radices, p0 word boundaries, selected rune sequence, and the DH-length comparison from repository resources.

## Related research

- Upstream p28 candidate: `im-results/lp2-p28-readout-cube-layer-candidate.md`
- Existing 2016 GP0/table pointer circuit: `im-results/lp2-2016-gp0-table-word-pointer-circuit.md`
- p28 DH/H reconstruction: `im-results/lp2-p28-dh23-gp29-cube-bridge.md` and `communications/broadcast/20261118T2350Z_agent50_p28-reversible-shell-dh.md`
- p15/p53/p50 179-adic fingerprint: `im-results/lp2-p15-p53-dh23-179-adic-read-fingerprint.md`
- p50 rune-offset output-type gate: `im-results/lp2-p50-rune-offset-output-type-gate.md`
