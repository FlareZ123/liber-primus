# Prime-echo / signed-word / p50 pointer route: exploratory result and p0 key gate

**Classification:** intermediate hypothesis only. This is not an established Cicada instruction, cipher, key, or plaintext. No unknown LP2 plaintext was recovered.

## Why this route was tested

The archived 2013 prime_echo shell transcript emits 464 primes, with pauses after 1033 and 3301. The exact prime ranks are 174 and 464, so the two blocks contain 174 and 290 primes. Each count, and the total 464, is divisible by the authenticated GP alphabet size 29:

- 174 / 29 = 6
- 290 / 29 = 10
- 464 / 29 = 16

The PGP-signed 2016 message has 43 alphabetic words after removing the key fingerprint. One-based positions 6, 10, and 16 are **EPIPHANY**, **LIBER**, and **WORDS**. Their direct GP29 ordinal sums are 121, 69, and 52.

This is a plausible cross-round selector, but not an authenticated one: the prime_echo transcript is an archived extraction, not a signed Cicada instruction or a verified original ISO; the signed 2013 BASE29 specification does not instruct solvers to divide these prime counts by 29. The 2016 message does say its words are a map and their numbers are direction, but does not define GP0 summation or the following table operation.

## Fixed p50 map experiment

The original p49–51 256-token table was read as a 256-address pointer table. The candidate base59 alphabet is the published grid alphabet with lowercase 'f' removed; all 256 tokens avoid that character. This is not an authenticated radix selection. In particular, lowercase digit 'f' is not the same object as the uppercase GP rune F that is transparent in the solved p56 cipher; that resemblance is only a possible clue, not proof.

For each selected 2016 word, use its GP0 sum as a start address, interpret each p50 token as a base59 integer, and repeatedly follow address -> table[address] until the first repeated address. Count the number of distinct visited addresses and use that count as a one-based position in the 2016 word list:

| 2016 word position | Selected word | GP0 start | Base59 path length | Word at that position |
|---:|---|---:|---:|---|
| 6 | EPIPHANY | 121 | 31 | SEEK |
| 10 | LIBER | 69 | 6 | EPIPHANY |
| 16 | WORDS | 52 | 27 | NUMBERS |

The three selected starts feed into the same base59 pointer basin, whose terminal self-pointer is cell 189. The output SEEK / EPIPHANY / NUMBERS is semantically suggestive and echoes words already present in the signed message. It is not plaintext, and the path-length-to-word-position convention is not supplied by a first-party source.

As a sensitivity control, reading the same tokens as conventional base60 instead gives path lengths 14, 18, 14 and words WAY / THE / WAY. Thus the more suggestive base59 result depends on the unresolved radix choice; it cannot select itself.

## Frozen p0 key-consumer test

The base59 path from EPIPHANY's GP0 address 121 contains 31 distinct addresses and ends at 189. The p0 black body begins after the 13-rune red heading/marker boundary and contains 249 runes, exactly 8*31 + 1. This suggested one direct key test:

1. Convert the 31 visited addresses to GP29 symbols by reducing each address modulo 29.
2. Use that 31-symbol sequence as a repeating additive GP29 key on the original p0 body.
3. Apply the known p56 transparent-F rule: plaintext F passes through without consuming key; at ciphertext F, preserve both legal inverse branches.
4. Freeze phase zero at the p0 body start. Test both additive signs and the only obvious one-step alignment alternative (current-cell addresses versus destination addresses).

The four original-ciphertext tests all die before the end; there is no complete legal plaintext parse:

| Key alignment | Inverse sign | First impossible body offset (zero-based) | Maximum live key phases |
|---|---:|---:|---:|
| Current-cell addresses | subtract | 212 | 12 |
| Current-cell addresses | add | 37 | 2 |
| Destination addresses | subtract | 212 | 12 |
| Destination addresses | add | 16 | 2 |

The reproducer also runs exact synthetic positive controls for all four inverse configurations, so the failure is not caused by an implementation that mishandles transparent-F key advancement.

**Decision:** reject this specific 31-period p0 Vigenere transfer. Do not retune phase, reverse the path, add an arbitrary transform, or search further keys from this chain. The semantic word-map observation remains an unverified navigation hypothesis only.

## Reproduction and source limits

Run from the repository root:

node sims/lp2_primeecho_p50_wordmap_p0_pointer_key_sft.cjs

Inputs are the archived 2013 prime-echo shell transcript, the signed 2016 message, the original p50 grid, and the canonical LP2 corpus. The script asserts the prime counts/ranks, the 43-word selector, all three GP0 addresses, both radix controls, the 31-address path, p0 body dimensions, and the four negative original-ciphertext outcomes.

Relevant source records:

- resources/historical/cicada2013-os-original-prime-echo.sh
- im-results/lp2-2013-prime-echo-source-selector-gate.md
- resources/external/2013-tcp-server-signed-source.md (authenticated BASE29 control; does not select this division)
- resources/historical/cicada2016-4gq25-outguess.asc
- resources/liber-primus/lp2-grid-256.json
- resources/liber-primus/lp2-corpus.json
- im-results/lp2-p0-red13-13dot-blackbody-original-source-adjudication.md
- im-results/lp2-2014-p56-method-origin.md

No change to results/README.md is warranted: this experiment does not change the established research frontier or recover plaintext. The only productive successor would require independent first-party evidence selecting the prime-count grouping and p50 radix/pointer semantics; absent that, retire the branch.
