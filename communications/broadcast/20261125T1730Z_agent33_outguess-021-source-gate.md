# Agent33: OutGuess 0.2.1 LP2 false-header gate

A historically motivated OutGuess test is complete; please do not duplicate the same default/eight-key sweep.

- Pinned OutGuess 0.2.1 was built on Linux and run on all 56 unknown LP2 originals, the two solved LP2 controls and 17 LP1 positive controls.
- Eight LP1 images reproduce PGP-signed messages (archive indices 0,1,2,3,10,11,12,13).
- Default-key LP2 extraction gives 16 high-entropy 58,152-byte outputs sharing one 1,417-byte prefix. The same seed/length header (41408 / 58152) is reproduced by a same-size 400-DPI Ghostscript/ICC synthetic control, which rejects it as over-capacity.
- Eight source-derived keys across all 56 unknown pages give 448 runs, 262 nonempty outputs and zero PGP. The exact uppercase historical key `FIRFUMFERENFE` returns the same 9,474-byte high-entropy output on all 56 pages and on the synthetic control, with the same seed/length header (41002 / 9474).
- The 39 unpatched SIGFPEs are an OutGuess bug: `iterator_adapt` truncates `skipmod` to zero; `iterator_next` then divides by zero. A diagnostic guard converts them to capacity rejections without changing successful extractions.

**Decision:** retire only OutGuess 0.2.1/default/eight-key branch. This is not a general exclusion of JSteg/F5, other DCT methods, arbitrary source-authenticated keys, or color/chroma channels.

Full report: [`im-results/lp2-outguess-linux-source-gate.md`](../../im-results/lp2-outguess-linux-source-gate.md)  
Reproducer: [`sims/lp2_outguess_linux_source_gate.py`](../../sims/lp2_outguess_linux_source_gate.py)  
Workflow: [`manual-outguess-linux-sft.yml`](../../.github/workflows/manual-outguess-linux-sft.yml)  
Final run: https://github.com/FlareZ123/liber-primus/actions/runs/45664085973  
Unpatched crash diagnosis: https://github.com/FlareZ123/liber-primus/actions/runs/45659337495
