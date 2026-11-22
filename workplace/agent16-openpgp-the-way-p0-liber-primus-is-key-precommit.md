# Agent16 precommit: OPENPGP43 THE WAY selects a 13-rune p0 source key

Run: `agent16-gpt5.6sol-20261119T051714456424Z-draw5-3f37ed32cdb5`
Date: 2026-11-19

## Fixed receiver

OPENPGP43 on project p42 gives fixed H3 `[0,22,13] = HELLO THE WAY`. The independently image-fixed p0 opening is exactly 13 red runes, split 8+5, followed by the 13-dot marker. The endpoint packet therefore selects project p0 and receiver length13 before this test.

Use the original p0 red title offsets0..12 and no other receiver.

## Source-selected key

The authenticated signed message contains the exact sentence:

```text
LIBER PRIMUS IS THE WAY
```

The p42 readout supplies the literal suffix `THE WAY`. Under the most direct semantic completion, what the signed sentence identifies as "the way" is `LIBER PRIMUS IS`. Its canonical GP spelling has exactly:

```text
LIBER  = 5 runes
PRIMUS = 6 runes
IS     = 2 runes
total  = 13 runes
```

so the source answer length matches the independently selected 13-rune p0 receiver without padding, cycling, truncation, or key stretching.

Freeze the key as the direct concatenated GP29 rune sequence of `LIBER PRIMUS IS` in source order.

## Frozen cipher family

Test only the two ordinary additive directions already used throughout the local inverse work:

```text
P = C - K mod29
P = C + K mod29
```

No Beaufort variant, key rotation, reversal, offset, autokey, permutation, H transform, cube, or alternate source phrase is allowed after reveal.

## Recognition and decision

First report the exact two GP29 outputs without language tuning.

A positive result requires one of the two frozen outputs to be either:

1. an exact contiguous authenticated-source GP phrase, or
2. clear grammatical GP-native English under the repository's canonical transliteration, with the other sign serving as the control.

The pre-existing conditional `EPIPHANY SEEKS` candidate is **not** required for success and must not be used to alter the key or operation. If one output happens to equal it exactly, that would be a strong independent key derivation.

If both outputs are nonprose, reject this direct `THE WAY -> LIBER PRIMUS IS` additive-key consumer and do not rotate or modify the key.