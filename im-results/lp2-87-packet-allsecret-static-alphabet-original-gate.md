# Original LP2 87 nonrepeat packets: every static secret alphabet fails the native-prose gate

**Agent47, 14 November 2026. Classification: key-independent original-cipher exclusion of one source-motivated mechanism. No unknown plaintext, authenticated cryptographic key, or final destination was recovered.**

## Human-visible premise and decisive alternative

The 56 unresolved physical LP2 pages contain **12,956** original GP29 runes. At **86** book-continuous positions the runes are exactly equal to their immediate predecessors, producing **87** nonempty stretches if a new stretch begins at the *second* rune of each equal pair. The lengths range from **6** to **712**. The already solved heading `PARABLE` has Gematria Primus prime sum **449**, which is the **87th prime**. Its clear post-heading p57 text has **88 runes**, giving **87 adjacent transitions**. These are exact, independently visible quantities, but their identification as one cipher packet per transition is a hypothesis. The original source does **not** instruct the solver to use repeats as packet boundaries or the clear p57 transitions as per-packet keys.

A simple readable operation worth testing is to let the 87 clear p57 transitions specify 87 independent shifts or alphabet permutations, applied uniformly to the corresponding 87 unknown nonrepeat packets. This is a whole family of potential hidden-key ciphers, including **every** source-selected constant per-packet GP29 additive shift and **every** completely secret, separate 29-rune substitution alphabet. A direct substitution preserves the frequency of each distinct symbol *within its packet*, up to relabelling, even when the 87 secret alphabets are unrelated.

Consequently **the pooled within-packet index of coincidence is an exact key-independent invariant**. For packet (j), let its original rune length be (n_j) and let (f_{j,r}) count rune (r) within it. The quantity is

[
 I_{87} = \frac{\sum_{j=1}^{87}\sum_{r=0}^{28}f_{j,r}(f_{j,r}-1)}
 {\sum_{j=1}^{87}n_j(n_j-1)}.
]

Any independent bijection on the 29-symbol alphabet of each packet leaves **both numerator and denominator unchanged**. This test is stronger than testing individual Caesar guesses and requires no guessed starting phase, English scorer, or key.

## Entire original and independent native controls

The canonical original ciphertext has **3,659,606** ordered symbol pairs within the 87 packets, of which **125,022** are equal-symbol collisions: exactly **(I_{87}=0.0341626940167876)**. Every packet is by construction free of consecutive identical symbols in its interior; the low within-packet frequency collision score is a separate, stronger-than-adjacency fact.

Three independently preserved English prose controls were converted to native Gematria Primus using the established longest-match transliteration (TH/NG/EO/OE/AE/IA/EA, with QU→CW, V→U, K→C, Z→S). Their GP rune streams were partitioned into **exactly the original 87 packet lengths** and evaluated in nonoverlapping complete 12,956-rune windows, with no lexical reordering, invented word boundaries, or tuned key:

| Reference source | Independent full-length windows | Minimum pooled IoC | Maximum pooled IoC |
|---|---:|---:|---:|
| Shakespeare (216,874 GP runes) | 16 | **0.0571924955855904** | 0.0607163721996302 |
| Gibran (62,550 GP runes) | 4 | **0.0583346950464066** | 0.0593561164781127 |
| Emerson (320,945 GP runes) | 24 | **0.0588418534672858** | 0.0624105436486879 |

Every one of **44 independent, disjoint native-prose controls** lies far above the exact original **0.03416269**. These finite controls diagnose the native register; they do not mathematically exclude specially composed English passages, other languages, compressed binaries, or a subsequent independent cryptographic layer. The 44 reference windows are disjoint *within* their respective sources; cross-source independence is not claimed.

The positive plant takes the first authentic-native Shakespeare window, applies **87 different fixed Caesar shifts**, one independently per original-length packet, and proves that the full pooled collision numerator/denominator remain **exactly unchanged**. This validates the statistic under a true representative of the proposed keyed family, rather than merely interpreting low ciphertext IoC as a failed key search.

## Decision

**Retire all one-stage native-GP prose decoders that apply one fixed 29-symbol bijection to each of the 87 original repeat-delimited packets.** This includes every static per-packet key derived from p57's 87 clear-text transitions, regardless of the keys' values. Even a favorable 29! choice for every packet cannot change the measured statistic. The result does **not** retire within-packet evolving states, a different segmentation, a lossless nonbijective multi-symbol codec, original text with different plaintext statistics, or an encrypted/compressed intermediate. The source coincidence `449 = prime(87)` remains a possible mnemonic, but it supplies no executable decipherment and should **not** initiate further arbitrary 87-key sweeps.

**Reproducer:** [CommonJS source-original standalone test](../sims/lp2_87_packet_allsecret_substitution_sft.cjs). The source-only calculation was separately executed against the complete canonical original GP corpus and the actual three cited reference texts in the connected analysis runtime. The committed Node script reproduces it using repository files and requires no packages or file writes; it has **not** yet been dispatched through GitHub Actions.
