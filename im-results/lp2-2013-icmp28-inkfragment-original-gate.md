# Original 2013 ICMP packet bytes against the 2014 LP2 13-dot fragments

**Classification:** independent cross-round decoder hypothesis, directly tested in the two original packet-byte consumers and in a separate fixed historical packet-identifier address readout. The test produced no recovered unknown plaintext, key, or continuation. The observed numerical correspondence is **not** an established authorial clue.

## What would lead a contemporary player here?

Cicada's separately signed January 2013 hint instructed solvers to "knock on the sky and listen." A preserved ICMP echo responder transmitted a gzip stream as **28 ordered data packets**. The historical hex reconstruction contains **27 rows of 28 bytes and one final row of 22 bytes**, totalling 778 bytes. The recovered packet content is a compressed signed message belonging to the already understood 2013 chain. Its line breaks arise from the original packet transport and are useful as possible historical key boundaries, though no source explicitly gives them an LP2 role. See [the independently reconstructed ICMP source](2013-icmp-echo-packet-reconstruction.md).

The original 2014 LP2 manuscript has **31 thirteen-dot punctuation layers**, dividing its complete 58-page rune stream into **32 slots**. The **first 28 slots end exactly at the boundary between unknown physical p55 and solved p56**; they contain the entire **12,956-rune unknown corpus**, including two zero-length slots numbered 8 and 11. The final four slots contain the 180 already-solved runes. Thus an ordered 28-row packet register can map to all 28 unknown fragment slots without inventing additional fragments, provided two packet rows are left unused at source-empty slots.

LP2's isolated original red triads on physical pp3/p39 also produce the provisional Atbash reading \`SCY\` and \`UDP\`. This is at most a clue that might motivate examination of earlier packet history: the 2013 responder used **ICMP, not UDP**, and no original source instructs solvers to use its payload as LP2 key material. The strongest competing explanation is that the two 28 counts arise from unrelated framing choices. The source-aligned operation therefore requires an **unproved cross-round key reuse premise**.

## Frozen inverse

No keys or alignments were fitted to English. Use the existing physical order, original 13-dot positions, and historical ICMP packet line order. Within fragment slot \`r\`, repeat its exact historical packet bytes \`K[r]\` from byte zero. For each rune ordinal \`j\` test the following independently reversible consumers:

1. **GP29 additive:** \`P[j] = (C[j] ± (K[r][j % len] % 29)) mod 29\`.
2. **GP28 nonzero-step:** decode fragment \`j=0\` as above; at every subsequent position a repeated ciphertext rune maps to symbol 28, otherwise \`P[j] = ((C[j] - C[j-1] mod 29) - 1 ± (K[r][j % len] % 28)) mod 28\`. The encoder reconstructs the current ciphertext rune from the prior output and selected positive step.

These four original-input cases exhaust the stated *direct repeating packet-byte* hypothesis for the two stated GP transports and two signs. They deliberately avoid phase fitting, packet permutations, AES/KDF guesses, and alternative line grouping.

## Exact original-cipher result

| Predeclared decoder | GP29 index of coincidence over all 12,956 recovered candidates |
| --- | ---: |
| Raw original manuscript, before decoding | **0.03447839786450569** |
| GP29, subtract packet bytes | **0.03449641448913158** |
| GP29, add packet bytes | **0.03449009913790690** |
| GP28 nonzero-step, subtract packet bytes | **0.03532069889728010** |
| GP28 nonzero-step, add packet bytes | **0.03526101287032833** |

The standalone script completed on the actual GitHub Node.js 22 runner in **[CI run 43396569956](https://github.com/FlareZ123/liber-primus/actions/runs/43396569956)**, with every original-cipher and planted-language round-trip passing. Its independent heldout native Shakespeare control has IoC **0.0575830031**, and native GP trigram log-score **−2.409059**, whereas the four direct ICMP candidates score only **−6.185731, −6.170956, −6.179783, −6.180184**. Those scored outputs are far from authentic native prose under this specific model. The heldout control uses the legacy GP token inventory; the independently corrected source orthography (ING and IO contractions) is an additional language-model sensitivity, and the negative here primarily rests on the much larger source-versus-output IoC and trigram differences. All four packet-key candidates remain near the 29-way uniform alphabet baseline of 1/29. None produces recognizable GP prose. This is a decisive negative for the exact fixed-increment/repeating-byte consumers above; it does **not** exclude a hidden, separately instructed cryptographic function driven by the historical packets.

The test preserves both empty ink slots and the original 28 fragment boundaries, with no ciphertext deletion. Every original candidate re-encodes exactly to the 12,956 original runes, and an independently generated GP-English positive plant is encrypted and decrypted across the same fragment lengths under each of the four algorithms. Those round trips validate the implementation and cannot by themselves identify a historical method.

Reproducer: [the source-exact Node.js 22 CommonJS SFT](../sims/lp2_2013_icmp28_fragment_inverse_sft.cjs). Sources are \`resources/historical/cicada2013-second-onion-icmp-echo.hex.txt\` (Git blob \`4007ca0792f8084a53b4b4f289571ae35e2b4b22\`), \`resources/liber-primus/lp2-corpus.json\` (Git blob \`054f2a0f780b7d46901acbe3d9bf4f0ac1801165\`) and \`resources/liber-primus/lp2-ink-annotations.json\` (Git blob \`3c52f209ce6bd7b138eaa2d4a9323526952ba9f9\`). The SFT also computes a smoothed native-GP trigram score for independent adjudication.

## Independent 2013 ICMP identifier → LP2 fragment-address decision (15 November 2026, Agent 29)

A different source-authentic **piece of the 2013 ICMP transport** is the numerical identifier field, rather than the packet payload. Three preserved actual reply identifiers are **3457, 3461, 3463** for packet lines 19–21. As documented in [the original packet reconstruction](2013-icmp-echo-packet-reconstruction.md), they fit the consecutive-prime schedule after 3301: **28 predicted identifiers from 3307 through 3527**. **Only those three are actually observed.** The other 25 identifier values and any cross-round use are hypotheses.

Map the first 28 original 2014 thirteen-dot slots, in physical order, one-to-one to those 28 packet ordinals. Take the GP rune at zero-based position `identifier mod slot_length` within its own slot. This is an explicit, cheap readout of the integer packet identifiers: no historical key, invented byte offset, plaintext crib, cipher or free rotation. The two original empty slots **8 and 11** consume packet indices but contribute no rune. The 28th slot ends exactly at the p55/p56 boundary, so **26 GP runes** are extracted from the 12,956 unknown runes.

The resulting complete canonical GP transliteration is:

`MWTIATHNGEOWOIAEANTXWEEOEOYIESNJIF`

The 26 selected runes contain **17 distinct GP symbols**. A direct GP Atbash, the simplest authenticated LP1 operation that can be transferred without a new key, also fails to give recognizable plaintext. A native known-text 26-GP-rune plant, inserted at the same 26 exact original addresses while leaving all other source positions fixed, is extracted **26/26**; the address readout therefore functions but lacks meaningful actual text.

**Decision:** this exact *historically predicted ICMP prime ID → original 13-dot slot → one direct rune* navigation fails to recover an original LP2 instruction. Neither this short source-conditional readout nor its Atbash image is a cryptographic disproof of all possible key material hidden at the same positions. The first missing original instruction is why a 2013 **ICMP header counter** should index a 2014 manuscript fragment, especially when 25 packet IDs are reconstructed by hypothesis rather than directly preserved. Do not reintroduce arbitrary selector offsets or a second unchosen cipher to force English.

[Standalone Node22 original-JSON SFT](../sims/lp2_2013_icmp_primeid_28fragment_selector_sft.cjs) asserts all 31 authentic thirteen-dot marks, the p55 boundary, the three actually witnessed ICMP prime IDs, the two empty slots, the exact original extraction, and 26/26 planted recoverability. It is a bounded human-solvable source-selector test, separate from the 778-byte repeating payload decoder reported above; **no unknown original LP2 plaintext, key or historical continuation is recovered**.

## Research decision

Do not expand the original 2013 ICMP rows into arbitrary password derivations or packet permutations from this 28-slot count alone. An independent 2014 source instruction selecting ICMP bytes, fragment offsets, a state/nonce, or another lossless operator would justify reopening this route. This negative tells us **where an obvious cross-round reuse fails**, rather than specifying the actual LP2 cipher. Priority remains original plaintext, an authentic source-derived key, or an independently selected reversible operation.
