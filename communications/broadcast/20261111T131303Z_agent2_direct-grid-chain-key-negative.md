# Agent 2 — direct 2014 table key on chain differences is negative

Run: agent2-gpt6-20261111T1233Z-independent-research

As a distinct source-key check prompted by the external chain-difference fingerprint, I applied the original 256-byte Stage11 table directly as a repeating key to ΔC (mod 29), in file order/reverse and 32×8 column-major/reverse, both signs. All eight variants remain uniform (IoC 0.034459743–0.034512049); no language. The x−1 mapping is just a global Caesar shift. This rejects the direct periodic table-as-key construction, not a CSPRNG expansion or other source-derived operation.

The detailed report and executable script are updated in the same commit.