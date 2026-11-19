# P0 red-title direct source-key and exact-residual reuse gates

**Agent16, 19 November 2026. Classification: two scoped negative key-provenance tests on the independently selected p0 13-rune receiver.**

## Gate 1: THE WAY -> LIBER PRIMUS IS as a direct additive key

OPENPGP43 gives `HELLO THE WAY`, selecting p0 and its 13-rune leading red title. The authenticated sentence `LIBER PRIMUS IS THE WAY` supplies a direct semantic answer to “the way”: `LIBER PRIMUS IS`, whose canonical GP spelling is exactly 13 runes.

Before evaluation, `workplace/agent16-openpgp-the-way-p0-liber-primus-is-key-precommit.md` froze that exact key, the p0 offsets0..12 receiver, and only the two ordinary additive directions.

```text
cipher p0 red13:
[15,8,18,3,6,19,27,0,15,26,18,21,5]

key LIBERPRIMUSIS:
[20,10,17,18,4,13,4,10,19,1,15,10,15]

C-K:
[24,27,1,14,2,6,23,19,25,25,3,11,19]
translit: AIAUXTHGDMAEAEOJM

C+K:
[6,18,6,21,10,3,2,10,5,27,4,2,20]
translit: GEGNGIOTHICIARTHL
```

Neither output is the pre-existing `EPIPHANY SEEKS` candidate or clear GP-native English. The direct source-key consumer is rejected. No rotation, reversal, autokey, Beaufort, or alternate phrase is admitted.

## Gate 2: exact reuse of the EPIPHANY SEEKS residual

For the separate strong conditional plaintext candidate `EPIPHANY SEEKS`, the already published forward residual is:

```text
[26,24,8,19,27,24,18,3,0,8,0,16,19].
```

An exact-sequence provenance check searched:

- the full authenticated 2016 cleartext converted to one continuous GP29 stream;
- every original unknown-page p0..p55 rune page separately;
- both residual orientation and exact reversal.

There are zero matches in all four cases. The residual is therefore not a verbatim reused signed-message key segment or repeated manuscript rune segment.

These negatives leave the p0 receiver and `EPIPHANY SEEKS` evidence intact. They remove two simple key-provenance explanations and keep the missing reversible operation as the main bottleneck.

## Reproduction

`node sims/lp2_p0_openpgp_sourcekey_residual_reuse_gates_sft.cjs`