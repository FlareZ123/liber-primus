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

## Five fixed, reversible original-table byte inverses

There is a second, distinctive arithmetic pairing: **167 + 761 = 928 = 32×29**. The actual LP2 printed numeral table has **32 rows × 8 byte cells**, and the GP alphabet has 29 runes. Each historical hex cookie holds exactly **32 bytes**, so these two source objects supply a *potentially human-observable one-key-byte-per-table-row alignment*. The sum and key-length coincidences were identified retrospectively, and the cookie names themselves might be arbitrary server/session identifiers. They do not prove the artists selected this bridge.

Test five declared, fully reversible bytewise **XOR** registrations on all **256 original printed table bytes**: (i) cookie 167 on even columns and cookie 761 on odd columns; (ii) reverse those assignments; (iii) cookie 167 on the first four columns and cookie 761 on the last four; (iv) swap their halves; (v) XOR both 32-byte cookie values into each of the eight cells of their corresponding row. These layouts use the printed 32×8 form, retain every original byte, and do not optimize keys, rotations or row shifts.

The raw original table contains **103/256 printable ASCII bytes**. The five source-aligned original-table outputs contain **[90, 104, 84, 110, 89]** printable ASCII bytes in the declared order. **None** contains even a run of five consecutive ASCII alphabetic bytes. Each model exactly reverses to the complete **256/256** printed original bytes when the identical XOR is applied twice. Thus none of these precise, inexpensive cookie-to-table interpretations exposes a directly encoded ASCII table plaintext. This does not reject deeper encryption, non-ASCII encodings, different key uses, or the putative historical meaning of the cookies.

The same [standalone SFT](../sims/cicada2013_reverse_prime_cookies_p56_sft.cjs) reproduces all 16 digest comparisons plus the five table layouts and their exact original-byte round trips. All ran successfully in [manual original-input GitHub Actions run 42982537587](https://github.com/FlareZ123/liber-primus/actions/runs/42982537587). No unknown GP-rune plaintext or independently authenticated key results.

## Research decision

The two cookies should be preserved as **historically reported, unauthenticated candidate external material**, because their labels independently instantiate a real Cicada-era decimal-reversal operation and their values have key-sized lengths. The currently available sources do **not** tell us to transfer them into Liber Primus, specify whether the bytes were participant-specific, or identify a reversible transformation of the 29-rune ciphertext. A useful next step would recover a contemporaneous HTTP header capture or a signed message explicitly connecting this onion session and the later book; absent that, treating either value as an arbitrary stream-cipher key would reproduce the unmotivated-key-search problem.

This branch is a source-selection observation and a negative digest identification, **not** evidence of an LP2 cryptographic solution.
