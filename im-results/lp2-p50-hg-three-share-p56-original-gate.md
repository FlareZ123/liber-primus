# LP2 pp49–51: a three-share route from the H/G grid quotient to an actual known key

**Decision (Agent 11, 14 November 2026): original-input negative for six specific three-share key interpretations.** No unknown LP2 plaintext, historical key, complete decoder or continuation URL was recovered. This is a new **three-to-one consumer** of the existing H/G quotient, distinct from the previously excluded one-of-three quotient-lane alphabet correspondences in [the direct 84-key test](lp2-q252-p56-authentic84-allsecret-key-gate.md). The complete read-only [Node.js 22 SFT](../sims/lp2_p50_three_share_p56_source_gate_sft.cjs) pins the original source SHA, authentic p56 decoder and exact original target runes.

## A concrete path a historical solver could have tried

The original 32×8 numerical grid gives 256 row-major base60 byte values. Under the independently published 2013 signed BASE29 example and the p39 original red triad, its polynomial of GP29 byte residues is exactly divisible by two quadratic factors:

- `H=3+26x+24x²`;
- `G=27+5x+15x²`;
- `H·G=23+21x+11x²+17x³+12x⁴` over GF29.

The full 256-coefficient polynomial has four vanishing remainder coordinates, leaving a **252-symbol quotient**. The historically solved p56 uses **84 consumed prime-totient shifts** for its 85 GP29 runes, because one plaintext F is passed through. Hence **252=3×84** supplies a possible full-size recipient for exactly *three* field streams. Historical Cicada 2014 stages genuinely XORed three OutGuess-derived byte strings, giving a period-authentic reason to consider a three-share consumer.

**Crucial distinction:** the genuine historical XOR is on bytes; a sum of three GF29 residues is only a plausible mathematical analogue. No surviving Cicada instruction says that this table quotient encodes p56's 84-key stream, chooses block or triplet interleaving, or places such a key on unknown pages. The length equation is source-derived but its meaning remains speculative. The conventional base60 and H/G parsing are themselves conditional on the retrospectively identified polynomial relationship.

## Frozen cipher/key tests

Divide the *original* 256 byte-residue polynomial by H·G in descending printed order and verify the quotient starts `[0,12,9,28,2,25,23,21,18,28]`. Group its 252 original GF29 elements as three consecutive 84-element blocks, or as 84 adjacent triples. Reduce each triple's sum mod29. The only original known-key target is **the entire historical p56 keystream**, derived anew as `(prime_i−1) mod29` for the first 84 ordinary primes. No free phase, rotation, seed, key fit or alphabet relabeling is selected by textual scores.

| Frozen three-share reading | Exact p56 key elements | Pairwise equal/unequal contradictions vs. authentic key | Different derived symbols |
| --- | ---: | ---: | ---: |
| Three 84-element blocks, summed mod29 | **3 / 84** | **200 / 3,486** | 29 |
| 84 consecutive three-element triples, summed mod29 | **10 / 84** | **207 / 3,486** | 26 |

The ten matching symbols in the second row are scattered (indices 2,15,21,29,31,38,42,43,57,80). They were noticed after choosing the operation and do not constitute an authenticated 10-rune fragment. **Both rows mathematically fail even with any additional secret, stationary GP29 alphabet bijection** because a bijection preserves equality between positions and these comparisons have hundreds of equality contradictions. The second row also has only 26 distinct symbols versus 29 in the genuine key. Thus a complete p56 key is impossible within the specified two models; a more complicated hidden state would be a different, unselected cipher.

For a distinct exact historical-operation comparator, treat the first **252 original byte values** as a systematic 252-byte data component and the final four as candidate GF29 parity slots, combine three 84-byte shares by actual XOR, and inspect all output bytes. The original printed-order data produce only **39/84** printable ASCII characters for contiguous blocks and **29/84** for interleaved triples, without any readable passage. The four-slot systematic framing is a hypothesis about the original polynomial, not author-authenticated file structure. No byte-stream payload was recovered.


The exact historical **byte-XOR** operation also permits a direct GP29 key test: XOR each source triple as ordinary bytes, reduce its value modulo29, and compare all 84 positions with the genuine p56 key before attempting the complete p55 inverse. Do this for both the 252 *original systematic byte cells* and the 252 *H/G GF29 quotient digits*. These are four additional, completely frozen source-layout mappings, with zero fitted phases or alphabet permutations:

| Historical XOR source / geometry | Matches to complete p56 key | Equality contradictions vs every fixed secret alphabet | Decoded original p55 GP29 IoC |
| --- | ---: | ---: | ---: |
| Original systematic 252 bytes, three blocks | **4/84** | 199 / 3,486 | **0.03228070** |
| Original systematic 252 bytes, adjacent triples | **6/84** | 195 / 3,486 | **0.03368421** |
| H/G quotient 252 GP29 digits, three blocks | **2/84** | 205 / 3,486 | **0.03859649** |
| H/G quotient 252 GP29 digits, adjacent triples | **2/84** | 206 / 3,486 | **0.02912281** |

All four outputs are nonlinguistic on untouched original p55 runes. Every output additionally contradicts the necessary equality pattern of the entire historical p56 key, even after allowing any unknown *fixed* alphabet bijection. This is a stricter source-operator test than inspecting byte-XOR output for ASCII alone: **an authentic historical XOR operation does not repair the missing p56 or p55 key handoff** within these direct encodings. The [same standalone SFT](../sims/lp2_p50_three_share_p56_source_gate_sft.cjs) now asserts all four exact key matches and all four equality-conflict counts.

## Direct original unknown-page consequences

Use the same two complete, source-derived 84-rune GF29 sum tapes with no phase or skip and the historically familiar `P=(C−K) mod29` inverse. Decode the untouched **76** original p55 runes and, independently, repeat the same tape continuously over the actual final **308** unknown p54–55 runes. These are direct low-cost attempts at real plaintext; no correct word or rune was chosen to tune the key.

| Receiver | Original GP29 IoC | Block-sum IoC | Interleaved-triplet-sum IoC |
| --- | ---: | ---: | ---: |
| p55 alone, 76 runes | **0.03789474** | **0.03017544** | **0.04491228** |
| p54–55, 308 runes | **0.03382123** | **0.03430771** | **0.03477304** |

The slightly raised short-p55 triplet IoC is unsupported by continuous readable text; its first twenty decoded GP symbols are `F EA S TH AE A M F X W EA P G I TH G N EO M J`. On the longer original receiver, both candidates remain at near-uniform GP29 coincidence and start with nonsensical rune sequences. As an implementation positive, a genuine native p57-derived 76-rune GP plaintext plant is exactly encrypted and recovered under both derived full key tapes. Exact round-trip alone is automatic for these additive keys and does not authenticate them.

This test **retires the two source-order three-share GF29 sum consumers, four byte-XOR-derived modulo29 key consumers, and their specified original p55 additive transfers**, plus two actual-byte XOR-to-ASCII systematic interpretations. It neither rules out all 2014 XOR uses nor assigns an original meaning to the H/G quotient. The p56 historical key remains independently authenticated by its complete 85-rune original decryption, and all 56 unknown pages remain unsolved.

**Research choice:** do not repeat three-way quotient splits with fitted phases, additional codebooks or invented corrective clocks. Further work on this source should require a new player-visible operation that determines where the 252 field symbols go and predicts untouched plaintext before fitting.