# A reported reciprocal-prime cookie pair as a candidate external key source

**Status, 11 November 2026, Agent 26:** a retrospective archive lead with one exact arithmetic relation and finite failed cross-round digest/table tests. It yields **no decrypted original LP2 ciphertext, authenticated key, or solved destination**. The apparent decimal-reversal operation is not authenticated by a contemporaneous 2013 source. Do not launch an unconstrained cipher or KDF search from these bytes.

## What the later archive reports (original player visibility unestablished)

The [historical 2013 unused-hints archive](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md), repeated in the [later full archive](https://github.com/krisyotam/cicada3301/blob/main/liber-primus/analysis/HINTS-NEVER-USED.md), reports that `p7amjopgric7dfdi.onion` set these two HTTP cookies:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5
```

Both cookie names are **three-digit primes**, and their decimal reversals map exactly into each other: **167 ↔ 761**. A later reconstructed first-onion `server.py` contains a `NUMBER` handler that factors a decimal reversal, but the authenticated 2013 TCP challenge documents `BASE29`, `RAND`, `DH` and `NEXT`—not `NUMBER`, `PRIMES` or `COUNT`. The later command reconstruction is not an authenticated contemporaneous protocol witness, and the repeated archive entry is not independent corroboration. The archives do **not** preserve an authenticated original HTTP response, cookie flags, creation times, or evidence that these values were visible to a solver in a live session or stable rather than participant/session-specific tokens. The reversal is an arithmetic relation; its status as an intended Cicada operation is unverified.

An exhaustive elementary census of every unordered **three-digit prime/reversed-prime pair** gives **14 pairs**. Of these, **(167,761) is uniquely the pair whose sum is divisible by 29**, and the resulting quotient is **32**. This is a finite and reproducible *retrospective* discriminator, not an author-intent significance claim: the analyst noticed the sum after seeing both the cookies and the 32×8 table. It increases the potential specificity of the human solve-path hypothesis while leaving the actual operation unknown.

The cookie *values* each represent exactly **32 bytes** (256 bits) in hex. Their ordered concatenation would be a **64-byte source-derived candidate register**, equal in byte length to the original solved p56 AN END printed digest. The independent [May 2014 byte witness](../resources/cicada2014-anend-binary-witness.json) transcribes that digest as `36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4`. Length agreement is only a candidate pairing, with no original clue ordering cookies or prescribing hashing.

## One finite direct target gate

With the independently printed p56 target fixed, check the two source-natural orders (`167,761` and `761,167`), each cookie read as raw 32 bytes or its literal 64 hexadecimal ASCII characters. In each case, compare the ordered concatenation itself and its **SHA-512**, **SHA3-512**, and **HMAC-SHA-512(first value, second value)** with the exact printed p56 64-byte target. There are **16** declared comparisons; **zero** match. The ASCII/identity case is 128 bytes and automatically cannot equal the 64-byte printed target. This scope makes no claim about the unestablished target hash algorithm, additional historical salt, missing sessions, or other key derivations.

[Self-contained Node.js 22 SFT](../sims/cicada2013_reverse_prime_cookies_p56_sft.cjs) reads the committed original 64-byte digest, asserts the cookie lengths and prime reversals, and performs all 16 byte-exact comparisons. The same direct identity, SHA-512 and HMAC candidate gate was independently checked with Python's `hashlib` and `hmac`; there were no matches.

## Five fixed, reversible original-table byte inverses

There is a second, distinctive arithmetic pairing: **167 + 761 = 928 = 32×29**. The actual LP2 printed numeral table has **32 rows × 8 byte cells**, and the GP alphabet has 29 runes. Each historical hex cookie holds exactly **32 bytes**, so these two source objects supply a *potentially human-observable one-key-byte-per-table-row alignment*. The sum and key-length coincidences were identified retrospectively, and the cookie names themselves might be arbitrary server/session identifiers. They do not prove the artists selected this bridge.

Test five declared, fully reversible bytewise **XOR** registrations on all **256 original printed table bytes**: (i) cookie 167 on even columns and cookie 761 on odd columns; (ii) reverse those assignments; (iii) cookie 167 on the first four columns and cookie 761 on the last four; (iv) swap their halves; (v) XOR both 32-byte cookie values into each of the eight cells of their corresponding row. These layouts use the printed 32×8 form, retain every original byte, and do not optimize keys, rotations or row shifts.

The raw original table contains **103/256 printable ASCII bytes**. The five source-aligned original-table outputs contain **[90, 104, 84, 110, 89]** printable ASCII bytes in the declared order. **None** contains even a run of five consecutive ASCII alphabetic bytes. Each model exactly reverses to the complete **256/256** printed original bytes when the identical XOR is applied twice. Thus none of these precise, inexpensive cookie-to-table interpretations exposes a directly encoded ASCII table plaintext. This does not reject deeper encryption, non-ASCII encodings, different key uses, or the putative historical meaning of the cookies.

A second independent original-source criterion discourages a cookie-XOR table **unmasking** interpretation: the unchanged table has two independently established exact GF29 factors, the 2013 BASE29 example `[11,18,1]` and the p39 marked red factor `[25,10,1]`. The five XOR outputs have nonzero polynomial remainders for **both** factors. For the two factors respectively, the five raw remainder pairs (ascending GF29 coefficients) are `[5,11]/[6,11]`, `[12,1]/[27,20]`, `[6,3]/[9,23]`, `[11,9]/[24,8]`, and `[2,20]/[9,15]`. These source-only exact checks preserve the original table's stronger cross-round algebraic relationships as a reason **against** using cookie XOR as the intended preliminary decoding operation.

The same [standalone SFT](../sims/cicada2013_reverse_prime_cookies_p56_sft.cjs) reproduces all 16 digest comparisons plus the five table layouts and their exact original-byte round trips. All ran successfully in [manual original-input GitHub Actions run 42982948763](https://github.com/FlareZ123/liber-primus/actions/runs/42982948763), including the complete 14-pair emirp enumeration. No unknown GP-rune plaintext or independently authenticated key results.

## Research decision

The two cookies should be preserved as **historically reported, unauthenticated candidate external material**. Their reciprocal-prime labels are an arithmetic fact, and the later reconstructed `NUMBER` handler offers a retrospective explanation, but the authenticated 2013 challenge does not establish that operation or these cookies as player-visible. The currently available sources do **not** tell us to transfer them into Liber Primus, specify whether the bytes were participant-specific, or identify a reversible transformation of the 29-rune ciphertext. A contemporaneous HTTP header capture or a signed Cicada instruction explicitly connecting this onion session and the later book would materially change the assessment; absent that, do not treat the reversal as a source-selected operation or either value as an established key source.

This branch is a source-selection observation and a negative digest identification, **not** evidence of an LP2 cryptographic solution.
