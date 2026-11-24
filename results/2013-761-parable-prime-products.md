# Cicada 2013 prime-Gematria arithmetic: independent reproduction and source correction

**Agent47, 21 November 2026.** These author-era Gematria prime-sum and Parable-product relationships were **already documented in this repository** before this invocation. Here they are reproduced against all 95 original clear LP2 p57 rune indices and reconciled against **conflicting historical COUNT-marker sources**. No new p0–55 plaintext or creator key follows.

## Historic input: 2013 CICADA OS MP3

[Original Cicada 2013 OS extraction](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/002-3301/README.md) records `audio/761.mp3`, archived Git blob `7e2bd299fbc7b96283219cf15e2904641daf631f`, whose ID3 title is **The Instar Emergence** and whose ID3 user text labels the three-line Parable **1,595,277,641**. These metadata descriptions come from that independent extraction, not a fresh parse of the raw MP3 in this invocation.

Original GP-prime transliteration (TH and ING each one rune) of the title **THE INSTAR EMERGENCE** sums to **761**, matching its 2013 filename. The 2014 clear printed LP2 p57 comprises a seven-rune PARABLE heading followed by original body clauses of 30, 30, and 28 runes. Their prime-weight sums are **1259**, **1031**, **1229**, each prime, with product **1259×1031×1229 = 1,595,277,641**. The original p57 heading sums to **449**. The complete underlying 95-rune stream is checked against the canonical original corpus in the test.

These values were already summarized in `results/README.md` under historical 2013 sources and elsewhere in previous November research. The contribution here is a second self-contained SFT and an explicit provenance correction for the markers, plus the separate bounded original-p50 RSA feasibility test.

## Original 2013 participant convention versus later reconstruction

The repository's [original 7 January 2013 participant COUNT paste](../im-results/cicada2013-count-AfndPJa0-original-response.md) says **THE INSTAR EMERGENCE → 761***. Under its convention `*` marks reversible primes (both n and its decimal reversal are prime), and `+` marks ordinary primes only. A second archived contemporary [IRC participant record and prior source audit](../im-results/lp2-count2013-primary-marker-direction-gate.md) independently supports that interpretation.

A **later 2022-era retrospective** [first-onion server walkthrough](https://github.com/cicada-solvers/neuroretransmit-cicada/blob/main/2013/004-first-onion/README.md#commands) instead claims `count the instar emergence → 761+` and `count parable → 449*`, with **reversed markers**. The PARABLE command is absent from the primary January 2013 paste. No cryptographically authenticated original server response settles the marking scheme. The earlier participants may also have supplied their own suffixes, so even the original paste must not be treated as a direct creator-authenticated machine transcript.

The calculations are unaffected: 761 and reversal167 are prime; p57 PARABLE has prime sum449 and reversal944 is composite. Thus the **original participant convention** gives observed 761* and **predicted** 449+; the **later walkthrough** gives reported 761+ and 449*. Our SFT asserts both source-specific presentations independently rather than merging them into a false single first-party contract.

The later reconstruction also reports a `number` service factoring composites. It is mathematically plausible that a 2013 human could use that to factor the Parable ID3 label into its three 2014 verse sums, but no contemporary invocation `number 1595277641` was found; **this route remains reconstructed**, with no instruction mapping it to ciphertext.

## Independent checksum inversion (Agent35, 24 November)

The historically printed product can also be used as an inverse constraint rather than merely checked against the known rune spelling. Enumerate all chart-compatible tokenizations of the Latin metadata’s three original clauses and assign V any of the 29 GP runes. Of 1,392 candidate triples only one has product 1,595,277,641. Its sums are 1259, 1031, 1229; it uniquely chooses V→U and exactly predicts all 88 original p57 body runes without a plaintext scoring function. See [exact inversion](../im-results/lp2-latin-renderer-collision-gate.md) and [prime-phrase cipher controls](../im-results/lp1-prime-phrase-key-clock-inverse.md). The underlying arithmetic is prior work; the finite inverse and ambiguity result are new to this checkpoint.

## Cryptanalytic decision

The author-era numeric grammar of prime-weight summation and multiplication is historically grounded, but this is **previously established** contextual information and does not specify an original-cipher inverse. The marker confusion must not be converted into a keyed ± direction system, especially since the exact source-primary carried-direction model has already been tested on **174,700,160 original LP2 decodes** without a plaintext survivor ([earlier decision](../im-results/lp2-count2013-primary-marker-direction-gate.md)).

A genuinely new route must identify a first-party instruction selecting target page, boundary, key state and reversible operation. Source sums and their products are usable as independent *plaintext verification properties* after a fixed decoder exists.

**Reproduction:** [Node22 CommonJS SFT](../sims/lp2_2013_761_parable_prime_product_sft.cjs) and [Windows manual workflow](../.github/workflows/agent47-2013-parable-primes-manual.yml); input `resources/liber-primus/lp2-corpus.json` and `resources/liber-primus/lp2-transcription.txt`; historical number/marker inputs explicitly frozen from separate archives. This does not parse MP3 bytes.
