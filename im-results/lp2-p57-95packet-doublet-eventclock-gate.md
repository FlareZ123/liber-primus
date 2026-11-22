# Solved-p57 95-rune key and the original 95 doublet-separated packets

**Decision (14 November 2026, Agent13).** One source-grounded event clock uses the 86 rare repeated ciphertext rune events and the nine original visual-chapter starts to select exactly **95** successive key slots, equal to the length of genuine clear LP2 p57. Two frozen constant-key and one source-indexed, within-packet prime-totient additive consumer yield near-uniform, visibly nonprose GP29 outputs on the complete **12,956-rune original unknown corpus**. A stronger original-input invariant rules out **every fixed, independently secret bijective 29-symbol alphabet per event packet** for all **89** matched Shakespeare, Gibran, and Emerson native-GP English control windows. No original plaintext or author-supplied event/key-operation instruction was recovered. The 95-slot correspondence remains a source-observed hypothesis cue.

## Original source-selected numbers and strongest competing explanation

The complete original physical LP2 pages p0–55 contain 12,956 ciphertext runes over nine image-supported visual chapters of lengths **729, 1145, 1729, 1903, 1021, 1433, 1680, 3008, 308**. The ciphertext has only 86 identical adjacent GP29 runes inside these chapter streams. They occur in chapter counts **4, 6, 9, 10, 11, 13, 12, 18, 3**; splitting a chapter after each repeated output creates **5, 7, 10, 11, 12, 14, 13, 19, 4** possible packets, exactly **95 total**. Independently, the p57 PARABLE solved plaintext contains **95 GP29 runes**, beginning with the seven-rune clear title. These are authentic source quantities.

The strongest rival is **arithmetic coincidence**: 95 follows tautologically from *86 observed repeat events plus nine chosen chapter restarts*. The equality was noticed after both quantities were known. Neither p57 nor an authenticated earlier instruction identifies repeated ciphertext letters as key-advance events, or its own 95 clear glyphs as a keystream. The separate [base28/COBS packet investigation](lp2-antirepeat-base28-cobs-original-gate.md) already records the 95 possible packets; this experiment asks a distinct question about using the real p57 runes as an **explicit source tape**, rather than rechecking binary framing.

## One reversible online cipher and two fixed key readings

Using the original LP2 chapter starts, let `K[0..94]` be the 95 clear p57 GP29 indices in printed order. At each chapter start select the next unused source key glyph, with no fitted offset. For every ciphertext rune `C[i]`, decrypt:

`P[i] = (C[i] - K[event]) mod 29`.

After processing each ciphertext rune, **advance the key event if and only if the current output repeats the immediately previous ciphertext rune in the same chapter**. At the next source chapter start advance again. A repeated symbol is still a plaintext-bearing rune; the event changes the key for *the following position*. The encoder, on receiving plaintext, computes `C[i]=(P[i]+K[event]) mod 29`, compares this emitted ciphertext with the previous emitted ciphertext, and updates the same event state. Induction gives exact reversible online recovery, with no sidecar, synthetic rune repair or hidden matching-mask choice. The original corpus uses precisely K0 through K94.

Two finite, predeclared key interpretations have original Cicada precedents: **(a)** direct GP29 rune ordinals, used in earlier plaintext-as-key Vigenère stages, and **(b)** each p57 rune's published Gematria Primus prime weight minus one, the totient of that prime, modulo 29 (as in the historical prime-totient operation). The sign is `P=C−K` from the authenticated solved p56. No seed, phase, alphabet orientation, skip mask, page-wise key reset or key search was fitted to original output. The model does not assume the p56 transparent-plaintext-F bypass, which requires a separate first-party selection for these unknown pages.

## Original runes, exact positive plant and rejection

| Source-derived 95-slot key | Original decoded GP29 index of coincidence | Decoded E runes / 12,956 | First 16 decoded glyph identities |
| --- | ---: | ---: | --- |
| p57 GP29 ordinal | **0.03445237385115718** | **452** | TH · A · C · M · OE · G · X · T · TH · P · C · H · NG · E · IA · OE |
| p57 GP prime-totient mod29 | **0.034465540762672796** | **465** | TH · A · C · M · OE · G · X · T · TH · P · C · H · NG · E · IA · OE |

The original clear p57 itself has GP29 IoC **0.06270996640537514** and **15/95 E runes**. Both original candidate streams are essentially uniform and not a contiguous readable runic-English message. The standalone [original-input SFT](../sims/lp2_p57_95packet_eventclock_sft.cjs) checks every exact chapter length, every repeat count, the 95-key consumption, the original 12,956-rune encrypt/decrypt identity, and a **95/95-rune authentic-clear-p57 planted plaintext** under the same online clock. The plant is an implementation control and not a recovered ciphertext decipherment.

## Source-indexed prime-totient variation within packets

The packetwise permutation obstruction suggests a cheap next decipherment that *does* change the alphabet at each rune: carry the original solved-p56 `prime−1 mod29` subtraction through each source-observed packet, **resetting its prime index to the GP29 ordinal of the corresponding authentic p57 rune** at each event. The first key for packet j is therefore `(prime[p57Ordinal[j]]−1) mod29`; subsequent runes advance to consecutive primes in that packet. The following ciphertext output doublet (or visual chapter start) advances to the next p57 source rune and resets the prime index. This is a human-followable, completely typed composite of the **established p56 operator** and the **observed p57/95 alignment**; its packet handoff remains analyst-hypothesized, with no source-authenticated instruction. No free initial phase, F-bypass, seed, reversal, language fit or other key adjustment is allowed.

On all **12,956 untouched ciphertext runes**, this full stateful operation gives GP29 IoC **0.034452564503269625**, **469 E runes** and nonprose beginning **TH·L·A·O·R·J·S·S·A·TH·B·EO·NG·T·NG·X**. The full ciphertext encrypt/decrypt roundtrip succeeds, as does a positive encryption/decryption plant using all **95 actually solved p57 runes**. Its strict source input tests and native control passed on Windows Node22 in [CI run 43648167348](https://github.com/FlareZ123/liber-primus/actions/runs/43648167348), using the [same consolidated SFT](../sims/lp2_p57_95packet_eventclock_sft.cjs). This rejects **one exact within-packet evolving operation**, not every possible hidden state machine or the actual p56 F-transparent variant if independently selected.

## A key-independent exclusion of all 95 hidden packet alphabets

This strengthens the initial direct-key negative without guessing any more keys. Suppose **each of the 95 original ciphertext-defined packets has its own completely arbitrary and secret permutation** of the 29 Gematria Primus rune identities. The permutation can differ between every packet, with no algebraic relation to p57 or any other known key. The bijection preserves **every** same-symbol pair inside its packet, not merely adjacent doublets:

`C[i] = C[j] ⇔ P[i] = P[j]` for any i and j in the same event packet.

The original packet boundaries are fixed **before** the proposed decryption by the red chapter starts and repeat-after-output clock. For an arbitrary secret substitution, the hypothetical plaintext's own equal-adjacent positions need not independently mark the same boundaries: crossing into the next alphabet can create or remove a coincidence. The invariant deliberately compares **all within-original-packet pairs** only.

Across 95 packet lengths (minimum **6**, maximum **662**), there are exactly **1,653,451** within-packet unordered position pairs. The complete unchanged original corpus has only **56,482** same-rune pairs, rate **0.034160068849938705**. Every secret packetwise symbol bijection has exactly that same pair count.

| Native-GP original-language register (frozen 12,956-rune windows, stride 6,478) | Windows | Fewest same-rune pairs | Median | Most |
| --- | ---: | ---: | ---: | ---: |
| **Original unknown LP2** | 1 | **56,482** | 56,482 | 56,482 |
| Shakespeare | **32** | **97,001** | 100,457 | 102,881 |
| Gibran | **8** | **99,357** | 101,213 | 101,898 |
| Emerson | **49** | **100,937** | 103,618 | 107,066 |

The **same 95 original packet lengths** are applied to every unmodified, separately sourced reference window after the repository's established greedy native-GP transliteration (with standard `QU→CW`, `K/Q→C`, `V→U`, `Z→S` normalization). For all **89 independently indexed windows**, none has a packet collision count as low as the original ciphertext. This is a finite comparison to three genuine English registers, **not an impossibility theorem for arbitrary messages, engineered low-repeat prose, unrelated languages or data**. The formula itself is an exact, key-independent obstruction for any hypothesized target text with a different within-packet pair count.

The same [single-file original-source CJS test](../sims/lp2_p57_95packet_eventclock_sft.cjs) asserts every original packet count and every reference minimum, then constructs 95 independent secret GP29 permutations, decrypts the entire authentic ciphertext under them, and forward-reconstructs **all 12,956 original runes exactly**. It also encrypts and decrypts **all 95 genuine clear p57 runes** under those same hidden permutations as an implementation-positive plant. Both roundtrips pass, while the original's fixed-packet pair count remains **56,482** for the arbitrary-secret decode. This test **passed on original files in Windows Node.js 22 GitHub Actions [run 43647957890](https://github.com/FlareZ123/liber-primus/actions/runs/43647957890)**.

The exclusion covers a broad, previously unfitted per-event Caesar, Vigenère, monoalphabetic or fully secret alphabet family, conditional on the exact source-observed event clock and a fixed bijection within each packet. A **within-packet evolving cipher state**, multi-rune encoding, length-changing transduction, sidecar exception register, independent unknown target language, or a different clock remains outside the proof.

## Next cryptanalytic decision

The equality of 95 event slots with p57's 95 source runes is a compact potentially human-observable **hypothesis cue**, yet it lacks an original instruction selecting a reversible consumer. The two fixed-key and the natural source-indexed prime-totient readings fail directly, and **even independently secret alphabets for each entire packet are constrained by the keyless original 56,482-pair invariant**. There is no evidence for the further **within-packet changing-state or non-bijective** mechanism needed to evade that native-English obstruction. **Do not scan free phases or arbitrary per-packet substitutions to rescue the count match.** Reopen only if a first-party source selects a changing cipher operation/key and an exact held-out original plaintext prediction. The broader manuscript remains unresolved.
