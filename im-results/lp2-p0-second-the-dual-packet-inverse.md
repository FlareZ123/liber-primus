# P0 offsets235..236: second THE from the dual READOUT state

**Agent4, 19 November 2026. Classification: conditional value-changing recovery on an independently selected p0 receiver. The remaining upstream premise is the READ OUT / READOUT receiver grammar.**

## Independent receiver

The authenticated 2016 boundary grammar was already fixed before this key search:

- `GP0(EMPTY) -> p50/base60 = 236`;
- `GP0(EPIPHANY) -> p50/base60 = 237`.

On p0 those values are the exact end/start boundary between two complete words. The word ending236 is offsets235..236 with original ciphertext:

`[8,5]`.

The later EA109 holdout independently supplies endpoint243 for the following seven-rune word through:

`EA109 -> p0 word24 -> prime-H [K,g]=[2,5] -> BE -> p50/base59 = 243`.

Thus the 2+7 receiver at235..243 is now bracketed by two distinct source-derived routes.

## Frozen dual-packet state

The shared one-based `(A,K)=(8,2)` selector on the two independently selected 23-rune READOUT H packets gives:

- split `READ | OUT` packet80..102 -> `[a,p]=[6,23]`;
- whole `READOUT` packet166..188 -> `[K,A]=[2,8]`.

The whole-packet result was a chronological blind transfer committed after the split selector had been fixed.

## Charged elementary field family

To avoid selecting the required key after seeing a candidate plaintext, charge the same ten elementary field scalars for each packet pair.

For an ordered pair `(x,y)`, the scalar family is:

`x, y, x+y, x-y, y-x, x*y, x/y, y/x, x^y, y^x mod29`.

This gives ten scalars from `[a,p]` and ten from `[K,A]`.

Charge:

- every left scalar × every right scalar: 100;
- both component orders: 2;
- subtraction and addition: 2.

Total: **400** key/order/sign configurations.

The target family is fixed independently as every authenticated 2016 word whose canonical native-GP length is exactly two runes:

- `THE=[2,18]`;
- `IS=[10,15]`;
- `BE=[17,18]`.

Across all 400 configurations there is exactly one target hit:

`[a, K*A] = [6,16]`

with left-right order and subtraction:

`[8,5] - [6,16] mod29 = [2,18] = THE`.

Forward reconstruction is exact:

`[2,18] + [6,16] mod29 = [8,5]`.

No other elementary scalar pairing, pair order, or additive sign yields THE, IS, or BE.

## Why this matters

This recovers the second p0 THE candidate by a value-changing operation whose inputs come from two independently selected READOUT packets. The receiver at235..236 was selected by the authenticated EMPTY/EPIPHANY boundary before the key-family search.

The key also has a direct state interpretation:

- first shift `a=6` is emitted by the split packet;
- second shift `K*A=16` is the product of the whole packet's blind `[K,A]` output.

This supplies a second local plaintext recovery alongside the earlier THE at103..104 and ROAD at105..108.

The evidence remains conditional on the upstream READ OUT / p50 receiver semantics. The 400-case family was charged after the local state relationships were known, so the result should be treated as a bounded cryptanalytic recovery rather than a global cipher specification.

## Next decision

The following word237..243 is already bounded by the EMPTY/EPIPHANY start237 and the independent BE/base59 endpoint243. Its authenticated shape candidate is DEVOTED.

Do not infer the seven-rune key from the plaintext. A decisive continuation needs a fixed state evolution from the recovered `[a,K*A]` or the existing DH23 packet that predicts all seven shifts before evaluating DEVOTED.

## Reproduction

`node sims/lp2_p0_second_the_dual_packet_inverse_sft.cjs`

The SFT reconstructs both H packets, their shared `(A,K)` outputs, the authenticated receiver boundary, the complete 400-case elementary field family, the unique THE hit, and exact re-encryption.
