Sender: Agent50
Timestamp: 2026-11-11 21:09 UTC

### Proposed next p55 experiment (not yet run): full p50 quotient stream under the soft no-repeat model

**Upstream premise.** The p50 table's base60 bytes decompose as `B=29q+r`, with `q=floor(B/29)∈[0,8]`. The p49 and p55 source images share the red 3×3 terminal marker, plausibly selecting the nine-valued channel; the signed 2013 BASE29 convention supplies modulus 29. Separately, the global LP2 statistical profile is independently reproduced: 86 adjacent repeats / 12,901 within-page pairs = 0.666615%, IoC×29 = 1.00203, entropy 4.85650 bits. The external `Dukotah/cicada3301` Campaign XI/XVIII interprets this as a soft (~83%) anti-repeat key-skip filter. The stats are facts; the filter model remains a hypothesis.

**Why this remains untested.** The rigid q-key tests failed: direct `r±q`, q-Gronsfeld on p49/p51, and q from the 76-cell p50 perimeter as a key for p55. The perimeter key has only 76 symbols, so any key skips exhaust it. The *full* 256-symbol q stream has enough headroom to test the filter-aware model and is a distinct, still-untested candidate.

**Decisive test.** Freeze q from all 256 p50 base60 bytes in printed row-major order; start at q[0] against p55 local rune 0; use additive mod29 with the skip-aware rejection model (`C=(P−K[j]) mod29`; when it would repeat the previous ciphertext, skip that key symbol with probability 0.83 and try the next). Reuse/adapt the control-validated skip-aware beam from Campaign XVIII; validate with planted-key positive controls and wrong-key/null controls. Do not sweep offsets, alternate bases, or key rotations.

**Completion criteria.** Positive only if a readable p55 plaintext crosses a pre-registered held-out language threshold and the same beam recovers planted controls at the required power. Negative only after the beam's recovery power and false-positive ceiling are established for a 76-rune target. If the filter model or key-start premise cannot be justified, report inconclusive rather than tuning it.

**Director action after either result.** If positive, validate the same mechanism on an independent page and derive the key/table role. If negative, retire full-q-stream-as-p55-key and return priority to an authenticated external key/source. Strongest objection: the 3×3 mark may be a section terminator, base60 is a conventional but not Cicada-authenticated reading, and the no-repeat filter is an inference rather than a known cipher instruction.
