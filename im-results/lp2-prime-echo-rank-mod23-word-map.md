# Prime-count mod-23 → 2016 word-map candidate

**Decision (20 November 2026): bounded negative.** The arithmetic alignment is reproducible, but no first-party instruction selects modulus 23 for the pause-defined prime counts, and the one frozen original-LP2 receiver test returns **ITG**, not plaintext. Retain this as an intermediate cross-artifact observation only. It is not a decryption, key, or established continuation.

## Candidate construction

The archived resources/historical/cicada2013-os-original-prime-echo.sh emits consecutive primes through 3301. The two two-second pauses follow 1033 and 3301:

- 1033 is prime ordinal 174;
- 3301 is prime ordinal 464;
- first block: 174 primes;
- trailing block: 290 primes;
- total: 464 primes.

The proposed selector takes the natural ordered counts [total, first, trailing] = [464,174,290] and reduces them modulo 23:

[464,174,290] mod 23 = [4,13,14].

In the zero-based 43-word list of the authenticated 2016 signed message (resources/historical/cicada2016-4gq25-outguess.asc), these positions are:

- 4 → **EMPTY**
- 13 → **WAY**
- 14 → **ITS**

The 2016 message later says: “Its words are the map, their meaning is the road, and their numbers are the direction.” This is genuine support for a word-level map as a general solving idea. It does not state that prime ranks or pause counts should be reduced modulo 23.

## Existing p50 correspondences (not a decryption)

Under the candidate GP0-sum → p49–p51 256-cell table lookup:

| Signed word | GP0 address | Printed token | Conventional base60 value |
|---|---:|---|---:|
| EMPTY | 92 | 3u | 236 |
| WAY | 57 | 1w | 118 |
| ITS | 41 | 1O | 84 |

The WAY address enters the already-known 57 → 56 MAP → 48 HERE route. The EMPTY address reaches cell 68, token 3J, base60 value 199. The resulting residue correspondences are:

| Table cell/value | mod 23 | 2016 word | mod 29 | 2016 word |
|---|---:|---|---:|---|
| 92 / 236 | 6 | SEEKS | 4 | EMPTY |
| 57 / 118 | 3 | LIES | 2 | PATH |
| 68 / 199 | 15 | WORDS | 25 | THEIR |
| 41 / 84 | 15 | WORDS | 26 | NUMBERS |

The same values at cells 92, 57, and 68 give [6,3,15] modulo 23, matching the private-exponent values a=6, e=3, b=15 in the signed 2013 DH23 worked example. The base59 alternative does not reproduce this same set of word-map/DH correspondences. These are conditional matches under the conventional base60 interpretation of the table, not proof of a global radix rule or of a cipher.

## Frozen independent original-LP2 receiver test

To test whether the three selected words actually direct the solver to unknown original ciphertext, I froze the most direct book-coordinate reading of the 2016 instruction:

1. use the selected zero-based signed-word indices as zero-based LP2 page indices: pages 4, 13, 14;
2. use the corresponding p50 base60 values as zero-based rune offsets: 236, 118, 84;
3. read one original-corpus rune at each page/offset.

The original lp2-corpus.json returns:

| Signed word | LP2 page | p50 offset | Original rune index | Transliteration |
|---|---:|---:|---:|---|
| EMPTY | 4 | 236 | 10 | I |
| WAY | 13 | 118 | 16 | T |
| ITS | 14 | 84 | 6 | G |

The frozen prediction is therefore **ITG**. It is not a recognizable plaintext word, and no source supplies a second operation that turns it into one. This receiver test fails. No alternate index origin, offset convention, permutation, or post-hoc transform was tried.

Reproduction from the preserved JSON inputs:

    pages = {p["page"]: p for p in corpus["pages"]}
    word_indices = [4, 13, 14]
    addresses = [92, 57, 41]
    offsets = [grid["bytes"][a] for a in addresses]
    runes = [pages[p]["indices"][o] for p, o in zip(word_indices, offsets)]
    # offsets == [236, 118, 84]
    # runes == [10, 16, 6]
    # corpus["translit"] lookup == ["I", "T", "G"]

## Does a first-party source select p=23 for these counts?

No such selector was found.

- The prime_echo executable and its custody are covered by im-results/lp2-2013-prime-echo-source-selector-gate.md. The preserved script is byte-identical to the pinned third-party archive extraction at commit ade9a02889ef8acbc8cde8edbfd0a785c369f4c3, blob SHA-1 65a569cf1b3eecb0f7c17ffc569a54ed8ecdf649. Its literal commands specify 462 sleeps of 0.05 seconds and two sleeps of 2 seconds, after primes 1033 and 3301. The wrapper does not turn those pauses into an audio or timing payload. The source is an archived extraction, not a newly verified physical-ISO chain of custody.
- The authenticated 2013 TCP challenge (resources/external/2013-tcp-server-signed-source.md) includes a worked DH23 exchange with p=23, g=5, public shares 8 and 19, and shared value 2. The same complete toy tuple is documented in a Cibertec cryptography deck self-dated 17 April 2012. Thus the signed challenge proves that participants were shown the example; it does not make 23 a Cicada-specific parameter. The signed protocol has BASE29 and DH commands but no NUMBER, PRIMES, or COUNT command, and does not connect DH23 to prime_echo block counts.
- The p28 23-rune DH line and the p0 DH-state reconstruction are independent reasons that 23 is relevant elsewhere in LP2. Neither instructs a solver to reduce the prime_echo counts modulo 23.
- The 2016 signed sentence supports using words and word-associated numbers as a map. It does not identify the prime_echo pause counts as inputs, choose 23 as their modulus, or specify the page/offset interpretation tested above.

The p50 lookups mostly revisit known navigation correspondences, and the exponent match reuses the same DH23 tuple that motivated the modulus. They are not an independent source selector. The ITG receiver test supplies no unknown plaintext.

## Controls already completed elsewhere

Do not repeat the source/timing audit or broaden this candidate by trying other moduli, offsets, and layouts:

- im-results/lp2-2013-prime-echo-source-selector-gate.md establishes the exact 464-event program, pause locations, and absence of a separate timing payload; it also records the source-custody limitation.
- im-results/2013-prime-echo-totient-key-blocks-gate.md tests the full 464-prime stream, the 174- and 290-prime blocks, repeated streams, and source-inspired page/column projections against original LP2 ciphertext. No key or receiver was selected.
- The signed TCP source note documents the DH23 example's pre-Cicada pedagogical provenance and the participant-controlled DH role split.

## Final classification

The exact chain prime ranks → mod 23 → EMPTY/WAY/ITS → p50 is a reproducible numerical correspondence. It has no first-party instruction connecting its inputs to that modulus, and its frozen independent receiver yields ITG rather than plaintext. **Reject it as a source-selected LP2 cipher or key route.** Preserve the correspondence for historical context, but do not promote it to results/ or use it to justify further dependent searches. No unknown LP2 plaintext, key, or final destination is recovered.
