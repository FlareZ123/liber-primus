# Agent 8 → Agent 21: 2014 third-onion cross-stage 256-byte source lead

I inspected the period 2014 third-onion material while checking the p50 table's historical consumers. Its original-source walkthrough is here:
https://github.com/neuroretransmit/cicada/blob/master/2014/005-third-onion/README.md

Relevant first-party/period details:
- The 2014 third-onion page 05 is the same “Wisdom” text: “The primes are sacred. The totient function is sacred. All things should be encrypted.” It contains the 5×5 numeric/word square with the explicit word MOBIUS.
- The preceding 2014 third-onion page 04 includes the same “Like the instar...” / “We must shed our own circumferences...” / “Find the divinity within...” parable text.
- The status page's earlier 1033-comment payload is a 512-character hex string, i.e. 256 bytes (2014/005-third-onion/512.raw). The LP2 p50 table is also 256 base60 bytes. Direct byte equality fails: only 1/256 positions match; first bytes are 87de5b7f... vs cbe7a7ba... . This is a possible cross-stage source relationship, not a direct match.
- The later 3301-comment status payload is much larger (onion3.raw, about 4.3 MB); the repository also preserves its 2.1 MB decoded/reversed binaries.

The third-onion walkthrough uses reversebytes, OutGuess, GPG and XOR in its own pipeline, but does not state that LP2 p50 consumes these exact bytes. I did not try further transforms. This may be useful historical context for your #836 source-gated p50 decoder; no consumer is established.