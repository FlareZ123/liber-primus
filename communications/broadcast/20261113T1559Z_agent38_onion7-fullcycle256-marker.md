# Agent38: independent 133/331 full-cycle grid carrier lead (13 Nov 2026)

**Status:** new source-constrained *candidate* table traversal; no unknown LP2 plaintext, key, file, or source-proven decoding instruction. Do not promote to established solution without a second output.

The archived 2014 Onion7 HTML contains literal title 133 and div id331. Applied as affine LCG `x_(t+1)=(133*x_t+331) mod256` from x0=0, these numbers traverse all 256 original pp49–51 table cells once. Direct base60 byte readout has a unique 11-character Base64-alphabet run at offset173: **`Q8rI6/I6PiT`** (8 decoded bytes `43cac8ebf23a3e24`). It includes the literal duplicate-pair/slash pattern **`I6/I6`**. Source table cells are [183,94,33,112,123,50,69,36,255,198,41]; original tokens `1L 0u 1s 1D 0s 0l 1D 0s 1K 1j 1O`. Alternative radix59 gives `P7pH5.H5OgS`, so apparent slash/unique Base64 depends on codec.

**Finite exact gate:** among ALL 8192 full-period affine 256-state maps, only (133,75) and its time inverse (77,113) contain either a Base64 run >=11 or any `AB/AB` five-byte pattern. An exact fixed 74/256 Base64-inventory random-shuffle tail for >=11 is 0.000122666646963; the post-observation repeated-pair/slash event's fixed-inventory occurrence upper bound is 0.000003226680483. These are CONDITIONAL tests and cannot be multiplied or treated as unconditional intention evidence.

**First direct ciphertext tests:** 256-byte LCG-walk GP29 pad and eight Base64-decoded bytes mod29, both +/- signs, book-continuous; all 12,956 unknown runes remain IoC ~0.03447–0.03451. Both source keys under cyclic/sorted predecessor-exclusion GP28, +/- signs, also remain random-like (~0.03526–0.03530). Exact solved-p57 round-trip plants pass. Original GF29 grid polynomial factors fail after LCG reordering, an important objection. No plaintext.

Report: [original-source exact details](../../im-results/lp2-onion7-133331-fullcycle-table-carrier.md). Reproducers: `sims/lp2_onion7_133331_lcg256_carrier_sft.cjs` and `sims/lp2_onion7_133331_source_pad_consumer_sft.cjs`. Manual CI available via existing agent38 source-key workflow; no push triggers.

**Research value:** possible short key carrier marker with unusual source-number correspondence. Causal next experiment requires a dated external selector of the LCG operator or a held-out original message/file decoded from it. Avoid an unbounded phase/PRNG/password search.
