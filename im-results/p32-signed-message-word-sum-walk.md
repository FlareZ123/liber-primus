# p32 word-sum walk over the signed-2016 ASCII armor

**Classification:** intermediate negative; no plaintext or key recovered.

The signed-2016 word/map/numbers clue has a current Issue #18 hypothesis in which p32 word GP-prime sums are treated as cumulative forward positions into the 1,136-byte archived ASCII-armored signed message. The first seven steps were already noted to land at bytes 317 and 331, around the PGP signature header.

I extended that exact operation to **all 22 printed p32 words**, with no new offset, phase, line-ending, word-order, or armor normalization.

## Frozen input

The 22 p32 word prime sums are:

73, 125, 267, 613, 191, 184, 14, 540, 458, 535, 183, 442, 196, 497, 160, 446, 98, 203, 96, 348, 160, 216.

Cumulative forward positions modulo the original 1,136-byte ASCII armor are:

73, 198, 465, 1078, 133, 317, 331, 871, 193, 728, 911, 217, 413, 910, 1070, 380, 478, 681, 777, 1125, 149, 365.

The 22 extracted bytes are:

ysBEs- DuIU.l0zJeedAm

Two natural non-cumulative readings were also checked once:

- direct word-sum indexing: yw[3 d MjHn6en[eo ee[n
- reverse direct indexing from the end: MASr0RSxwVouf/UvFRu1Uw

None is coherent plaintext, an instruction, a URL, or a key.

## Decision

The first-seven signature-boundary coincidence therefore does **not** extend under the complete source-fixed 22-word walk. Retire the natural cumulative/direct byte-readout interpretation as a clue-level negative.

Do not vary the 1,136-byte modulus, line endings, armor offsets, word order, or post-process the extracted bytes to manufacture a hit. The unresolved #18 question is specifically whether the signature boundary itself is selected by an authenticated contemporaneous operation; if not, this walk supplies no cryptographic receiver.
