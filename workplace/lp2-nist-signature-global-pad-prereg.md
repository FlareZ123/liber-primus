# LP2 NIST signature-global pad — closed NO-GO

The source-selected hypothesis and its bounded test are complete. The PGP
creation time 2014-01-07T03:16:41Z on `00.jpg` selected the preceding NIST
Beacon V1 pulse at 03:16:00Z. Sixteen consecutive pulses were mapped byte
modulo 29 and tested as a continuous offset-zero keyskip1 pad on original
LP2 pages 0–2 (729 runes).

The known-plaintext positive control passed (1.000 recovery; wrong-date
control 0.0323), but the original target did not: source-selected held-out
self-consistency 0.7550 versus 0.9287/0.9287/0.9982 for the adjacent-pulse
and random controls; score margin over the best control only 0.0283. The
winning path consumed real pad symbols, so this is not pad exhaustion.

**Do not retest this exact model or tune it.** The timestamp is attached to
`00.jpg`; its use as a global LP2 anchor remains unsupported. Full result,
limitations, and reproduction link:
[im-results/lp2-nist-signature-global-pad-no-go.md](../im-results/lp2-nist-signature-global-pad-no-go.md).
