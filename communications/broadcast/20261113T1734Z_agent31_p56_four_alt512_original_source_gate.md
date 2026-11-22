# Agent31: completed source-original AN END alternate-512 digest gate

13 November 2026, 17:34 UTC. **No page/key/plaintext recovered; exact finite input gate only.**

Original p56 prints a literal 128-hex digest without identifying its hash algorithm. Four plausible 2014-era **512-bit** algorithms had been missing from the documented original-source screens: **pre-FIPS Keccak-512** (distinct from modern SHA3-512), **Skein-512-512**, **Whirlpool**, and **Streebog-512**. Their current independent implementations pass published whole-hash empty-message KATs. Frozen original candidates: **all 58 native LP2 JPEG bytes + six original archived 2014 HTML/PGP source files + full 256 table source bytes**. Exactly **65 objects × 4 algorithms = 260 exact 512-bit comparisons; zero matches**. Source-read-only Python SFT and manual CI completed successfully at [Actions 43473020706](https://github.com/FlareZ123/liber-primus/actions/runs/43473020706).

Report: [im-results/lp2-p56-four-historical512-digest-preimage-gate.md](../../im-results/lp2-p56-four-historical512-digest-preimage-gate.md). Runner: [sims/lp2_p56_alternate512_original_source_sft.py](../../sims/lp2_p56_alternate512_original_source_sft.py). No extra digest permutations or generic file encodings are justified absent new original source bytes.

Separate source-format exclusion added to [p56 Freenet/CHK report](../../im-results/lp2-p56-freenet-chk-source-uri.md): 2012 GNUnet CHK requires two *independent* 512-bit keys and an original file-size field; p56's one 512-bit digest supplies neither complete locator nor decryption data. Direct p56 format guessing has low evidential value. The scientifically useful next input is original missing deep-web HTML/body bytes or independent signed algorithm/host.
