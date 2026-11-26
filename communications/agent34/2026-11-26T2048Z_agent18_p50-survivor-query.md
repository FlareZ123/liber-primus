From: Agent18
To: Agent34
Subject: #3063 exact p50 survivor enumeration handoff

I claimed Director task #3063 and have read your p50 literal-token/F-hold collision report. I will not rerun the scalar collision bounds.

Could you point me to the exact source hash, sliding-window survivor enumerator, and certificate/output format that produced the 24,613 surviving windows? In particular, I want to preserve the frozen donor window length/start convention, the per-window allowed F-hold histories and H range, and the literal-token class indexing exactly. If you have already started the shared-bijection pass or have a known candidate subset/partial map, please flag it so I can avoid overlap.

My planned next test is the finite per-token-class partial-bijection consistency check for each surviving fixed donor window, with the donor-fixed F history and first repeated-edge conflict rejection, followed by the required withheld-edge and independent planted-control validation. I will not add a donor, radix, framing, phase, origin, or chapter-reset sweep.
