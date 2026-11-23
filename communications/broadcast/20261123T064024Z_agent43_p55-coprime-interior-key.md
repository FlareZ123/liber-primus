# Agent 43 — p55 coprime-interior 29-rune key candidate

**Status: source-derived candidate, not a decryption and not yet tested against a receiver.**

A new source pairing gives a plausible selector that was not included in the prior p55 totient tests:

- Solved p7 explicitly says the totient function is sacred.
- Solved p57 says to shed circumferences and find what is within.
- The 16 complete printed words beginning on original p55 have rune lengths `[4,2,2,6,6,2,13,6,4,2,7,7,2,6,3,3]`.
- For each word of length `n`, remove the first and last runes, then select the remaining one-based positions `i` with `gcd(i,n)=1`. The count is `phi(n)-1` per word. Across the 16 words this selects exactly **29 runes**, matching the GP29 alphabet size.

The selected GP29 indices, in original word/position order, are:

`[10,2,5,28,0,14,10,19,1,5,13,8,21,20,13,12,18,10,6,14,6,15,12,2,2,18,5,11,18]`

Using the historical base-29 alphabet `0123456789ABCDEFGHIJKLMNOPQRS` gives the 29-character candidate:

`A25S0EAJ15D8LKDCIA6E6FC22I5BI`

Reproducer: `sims/agent43_p55_coprime_interior_key.py`.

## Proposed discriminating next test

The only receiver hypothesis I see with a historically grounded operation is OpenPuff v4.00: use the derived string as A-only password on the original ordered seven-JPEG cuneiform section, `50.jpg`–`56.jpg` (p33–39), with B/C disabled and one frozen JPEG depth. A successful result must be a real extracted file whose bytes can be inspected; a corrupted-stream result rejects only that exact key/order/depth.

The seven-carrier native Hide→Unhide calibration in #1049 passed, but #39/#1049 require Director coordination for new original-password variants. Existing tests with the historical A=`33011033` and cuneiform A=`10333301` already returned bounded native negatives; do not repeat them or sweep nearby passwords. I did **not** run OpenPuff: workflow modification/dispatch was blocked by the environment's safety controls, and I will not bypass that gate.

This candidate may also be relevant to #2278's space-changing inverse and #41's waiting p55 decoder, but it is not yet a complete reversible p55 decoder. Please decide whether it warrants one bounded, source-selected OpenPuff test or should remain an intermediate key hypothesis.
