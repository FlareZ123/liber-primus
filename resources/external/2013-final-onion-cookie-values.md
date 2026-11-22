# The 2013 final-onion cookies: exact values and the missing key selector

**Reference classification (14 November 2026):** an original-era quiz reportedly issued two named 256-bit cookies. Their **names** were consistent with an earlier, independently preserved 2013 clue; their **values** survive only as one participant-reported pair, repeated in later retellings. Whether the values were shared across sessions is unresolved. No original instruction selects either value for an LP2 key, cipher, page, alphabet, or clock.

## The only presently recoverable literal pair

A retrospective report of the final 2013 recruitment site `p7amjopgric7dfdi.onion` records:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6;
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5;
```

Each lowercase-hex string is 64 characters, representing exactly 32 bytes. They are *reported cookies*, not a retained `Set-Cookie` HTTP response: no contemporary raw header, `Cookie` request, browser database, original web application or second independently recorded session has been located. The original service's source code is unavailable.

## Source chronology and independence

1. [Uncovering Cicada wiki, *What Happened Part 2 (2013)*](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_%282013%29) and [*Possible hints never used*](https://uncovering-cicada.fandom.com/wiki/Possible_hints_never_used) are the participant-story witnesses. Their prose places both cookies in a **timed, individualized questionnaire** after the shared-secret-sharing final onion, followed by email submission. Neither presents a captured HTTP header or repeated visits. The wiki pages are retrospectively edited; a web-index publication age is not the date of a 2013 capture.
2. [scream314/cicada3301 initial Git commit `fa795931b7e50bbb3b90322c8e456bcad8f5f034`](https://github.com/scream314/cicada3301/commit/fa795931b7e50bbb3b90322c8e456bcad8f5f034), **24 January 2018**, contains the exact same pair in both [`hints_never_used.md`](https://github.com/scream314/cicada3301/blob/fa795931b7e50bbb3b90322c8e456bcad8f5f034/hints_never_used.md) and [`2013.md`](https://github.com/scream314/cicada3301/blob/fa795931b7e50bbb3b90322c8e456bcad8f5f034/2013.md). Those two pages are one archived narrative, not two independent session samples. Git revision inspection shows the later 2022 amendment did not first introduce them.
3. [neuroretransmit/cicada original `2013/007-fourth-onion/README.md` revision `5a1068deee1289665db4305033cab63d05702ecd`](https://github.com/neuroretransmit/cicada/blob/5a1068deee1289665db4305033cab63d05702ecd/2013/007-fourth-onion/README.md), **6 December 2022**, reproduces the same pair in a modern retrospective reconstruction. Its historical TCP log and server exercise belong to the subsequent 2013 stage; it contains no raw quiz `Set-Cookie` headers. Later krisyotam and other research copies also reproduce this same published pair.
4. The contemporary [2013 `761.MP3` binary and complete ID3 audit](../../im-results/audio761-original-id3-frame-inventory.md) supply an *independent* clue for the cookie **names**: filename 761, approximately 167-second audio, and GP-prime sum 761 of `THE INSTAR EMERGENCE`. That historical audio does not contain either cookie value and gives no operation mapping the values to later LP2 ciphertext.

A search across the available exact-hex GitHub source occurrences, period archive paths and public indexed accounts exposed copies of this **one** pair only. There is no independently acquired second cookie pair by which to measure stability or ascertain whether the service generated the hex values per visit. This is an **evidence gap**, not a demonstration that the values were random or stable.

## Complete operator gate and decision for LP2

The preserved signed 2013 TCP-server specification defines RAND, QUINE, BASE29, CODE, KOAN, DH, NEXT and GOODBYE, but **does not mention either cookie, either hex string, or an LP2 consumer**; see [signature-valid source analysis](2013-tcp-server-signed-source.md). The 2014 LP2 publication occurs later, and no recovered first-party handoff says to derive an unknown-page key from the cookies. Their 256-bit formatting is equally consistent with ordinary application state. With no historical target, reversible cipher, key-expansion rule or page/word clock, there is no uniquely defined original-cipher test.

The prior [bounded F5 password test](../../im-results/2013-source-cookies-original-lp2-f5-key-gate.md) attempted the two decimal names and their literal hex strings on all 58 original LP2 JPEGs, with native positive controls, and recovered **zero** authentic payloads. This rules out only that narrow exploratory carrier-password use. Other automatic XOR, AES, KDF or Vigenère reinterpretations would amount to a new choice unsupported by any original instruction and are deliberately not enumerated here.

**Research decision:** the author-visible use of 167/761 as names is historically plausible; the **32-byte cookie values have no authenticated stable, reusable status or LP2 key role**. Source discovery would reopen the question only with an independently dated raw 2013 HTTP/session capture, server code showing derivation and reuse, or a contemporaneous creator-selected mapping from these exact bytes to an original LP2 receiver/clock. Nothing is decrypted or claimed to be an authenticated LP2 key by this audit.
