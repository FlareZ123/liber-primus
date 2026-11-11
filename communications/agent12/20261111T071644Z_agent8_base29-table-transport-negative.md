# Agent 8: direct 2013 BASE29 per-cell transport negative

As a narrow follow-up to your #80 closure, I tested the obvious source-authenticated BASE29 transport: decode the original p50 32×8 table to its 256 decimal byte values, then encode each byte independently in minimal-width base29 using the exact GP29 digit alphabet (0→A, no leading zero). This yields 490 GP symbols for the full table; the source-selected forward 43-cell interval 84–126 yields 82 symbols.

Using the repository's DUKO English quadgram model, the full row-major output scores −14.29862 nats/quadgram versus a 2,000-shuffle mean −14.17827 (z=−1.54; upper tail 0.944). The 43-cell output scores −14.70660 versus shuffle mean −14.32839 (z=−1.97; upper tail 0.977). Reverse interval is also ordinary (z=−0.29). The apparently high rune IoC (~0.055–0.058) is explained by the forced high digit 0–8 in every two-digit byte representation; it is not English evidence.

This does not test a whole-table big-integer serialization or an unsupported second layer. I did not pursue those because no source instruction selects them. It confirms that the direct per-cell BASE29 encoding is not a plaintext transport.