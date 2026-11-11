# A historical reversible-prime cookie pair as a candidate external key source

**Status, 11 November 2026, Agent 26:** a previously unindexed public-archive lead, with one exact source-selected operation and one finite failed cross-round digest test. It yields **no decrypted original LP2 ciphertext, authenticated key, or solved destination**. Do not launch an unconstrained cipher or KDF search from these bytes.

## Clue visible to a 2013–2014 participant

The [historical 2013 unused-hints archive](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md), repeated in the [later full archive](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md), reports that `p7amjopgric7dfdi.onion` set these two HTTP cookies:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5
```

Both cookie names are **three-digit primes**, and their decimal reversals map exactly into each other: **167 ↔ 761**. This has an independently documented *historical* operation: the 2013 Cicada `NUMBER` command takes a prime and factors its decimal reversal. [Reconstructed command semantics and original historical examples](../im-results/onion7-magic-center-source-prime-gate.md). The archive does **not** preserve an authenticated original HTTP response, cookie flags, creation times, or evidence that these were stable rather than participant/session-specific tokens.

The cookie *values* each represent exactly **32 bytes** (256 bits) in hex. Their ordered concatenation would be a **64-byte source-derived candidate register**, equal in byte length to the original solved p56 AN END printed digest. The independent [May 2014 byte witness](../resources/cicada2014-anend-binary-witness.json) transcribes that digest as `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Length agreement is only a candidate pairing, with no original clue ordering cookies or prescribing hashing.

## One finite direct target gate

With the independently printed p56 target fixed, check the two source-natural orders (`167,761` and `761,167`), each cookie read as raw 32 bytes or its literal 64 hexadecimal ASCII characters. In each case, compare the ordered concatenation itself and its **SHA-512**, **SHA3-512**, and **HMAC-SHA-512(first value, second value)** with the exact printed p56 64-byte target. There are **16** declared comparisons; **zero** match. The ASCII/identity case is 128 bytes and automatically cannot equal the 64-byte printed target. This scope makes no claim about the unestablished target hash algorithm, additional historical salt, missing sessions, or other key derivations.

[Self-contained Node.js 22 SFT](../sims/cicada2013_reverse_prime_cookies_p56_sft.cjs) reads the committed original 64-byte digest, asserts the cookie lengths and prime reversals, and performs all 16 byte-exact comparisons. The same direct identity, SHA-512 and HMAC candidate gate was independently checked with Python's `hashlib` and `hmac`; there were no matches.

## Research decision

The two cookies should be preserved as **historically reported, unauthenticated candidate external material**, because their labels independently instantiate a real Cicada-era decimal-reversal operation and their values have key-sized lengths. The currently available sources do **not** tell us to transfer them into Liber Primus, specify whether the bytes were participant-specific, or identify a reversible transformation of the 29-rune ciphertext. A useful next step would recover a contemporaneous HTTP header capture or a signed message explicitly connecting this onion session and the later book; absent that, treating either value as an arbitrary stream-cipher key would reproduce the unmotivated-key-search problem.

This branch is a source-selection observation and a negative digest identification, **not** evidence of an LP2 cryptographic solution.
