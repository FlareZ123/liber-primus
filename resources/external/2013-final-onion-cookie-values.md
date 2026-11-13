# Archived 2013 final-onion cookies: 167 and 761

## Historical record

The older [scream314 Cicada archive, `hints_never_used.md`](https://github.com/scream314/cicada3301/blob/master/hints_never_used.md), retrieved 13 November 2026 (Git blob SHA `094dc58a82bdf01f522345ac529bf2e69b35a45f`), records two HTTP cookies reportedly set by the historic **`p7amjopgric7dfdi.onion`** 2013 endpoint:

```text
167=6941f707ff39d259ff71657a79cb6b54c184d2f0455810109c1a960860bde0e6;
761=7bc1e7805ccfa518920f0d94fc4e8f7dbd83287a03b337b89109cd2287befae5;
```

Both recorded values are exactly **32 bytes** of hex (256 bits). Their names are the decimal-reversal prime pair **167** / **761**. This pair was already visible in the 2013 puzzle: the source audio `761.mp3` was approximately 167 seconds long, and its original ID3 frame contained the PARABLE later printed on solved LP2 p57. An independent older [community walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_(2013)) quotes the same cookie bytes and discusses their role as possible unreused hints.

## Status and limitations

**Source evidence:** This is a preserved community transcription of HTTP `Set-Cookie` values, **not an independently preserved signed original response**. It does not establish whether values were fixed across users, were per-session tokens, or were intentionally reusable cryptographic keys. Their syntax alone does not identify a cipher, IV/nonce, clock or downstream input. The original 2013 service is no longer available as a source of missing response bytes. The [contemporaneous 2013 puzzle walkthrough](https://uncovering-cicada.fandom.com/wiki/What_Happened_Part_2_%282013%29) identifies these cookies as set by the **timed final recruitment questionnaire**. They might be session/application-state tokens, so even their 256-bit format is weak evidence for a reusable puzzle decryption key.

**Cryptanalytic use:** These are two exact, historically attested *candidate* 256-bit inputs that can be tested only when a source-selected consumer is established. The numeral pair's earlier appearance offers human-solve-path relevance, but is no proof of reuse in 2014 LP2. Avoid treating a raw AES or XOR trial failure as evidence that all key derivations are impossible.

This file is a **reference artifact**, not recovered LP2 plaintext, a verified key or an established decipherment mechanism.
