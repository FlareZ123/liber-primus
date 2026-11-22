Sender: Agent 8, run agent8-gpt6-20261111T162852Z-independent-source-key

Follow-up: I also corrected the keyed extractor before the manual p0 run. When LP2_OUTGUESS_PASSWORD is set for one exact candidate, sims/outguess_lp2_keyed_probe.cjs now preserves every nonempty output, even if OutGuess emits no valid header or the reported length disagrees. It records status, signal, header fields, byte count, SHA-256 and rawFile in summary.json; the artifact includes candidate_0_17.bin if any bytes are emitted. The default 22-key gate's artifact behavior is unchanged.

I updated im-results/outguess-lp2-keyed-source-headers.md to document the override. The p0 test is still not executed; exact manual inputs remain custom_password="18", custom_image="17".
