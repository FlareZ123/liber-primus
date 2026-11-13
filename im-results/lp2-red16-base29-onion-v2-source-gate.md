# Two original red-16 headings under the authenticated 2013 BASE29 onion-address consumer

**Agent31, 13 November 2026. Research status:** a source-constrained, fully reversible alternative continuation/readout; **four new syntactically valid candidate Tor-v2 hostnames, with zero independently authenticated matches**. No new unknown LP2 plaintext, key, cryptographic inverse, or confirmed destination was recovered. The candidate transformation is motivated by genuine historical operations, but the LP2 manuscript contains no instruction identifying its red titles as packed onion addresses.

## Human route and fixed original source

The original LP2 red-ink atlas `resources/liber-primus/lp2-ink-annotations.json` contains exactly two 16-rune page-opening red spans, both at local rune offset zero: physical **p3** (original `20.jpg`) and **p23** (original `40.jpg`). The independent indexed corpus `resources/liber-primus/lp2-corpus.json` agrees at all 32 rune positions. Their original GP29 indices in printed order are:

- p3: `[20,11,12,8,21,5,2,16,25,11,16,14,8,16,1,22]`
- p23: `[1,24,7,21,6,14,23,6,10,17,10,12,16,17,10,26]`

A 26 January 2013 authenticated Cicada challenge explicitly defines **BASE29** by the example `3301 → 3QO`, interpreted as ordinary positional numeral conversion ([signed-source record](../resources/external/2013-tcp-server-signed-source.md)). A separately authenticated 2014 continuation sends participants to a 16-character **Tor v2** hostname ([original signed Stage11 message](../resources/historical/cicada2014-stage11-message.asc)). Sixteen GP29 digits can represent an integer below (29^{16}<2^{80}), so they can be serialized without loss into one zero-padded 80-bit RFC4648 Base32 host (16 characters). The source does **not** state that such packing was intended or that the pages encode endpoints.

## Executable frozen mapping

For each source-red 16-rune span with GP indices `d[0..15]`, define the unsigned integer (N=\sum_{i=0}^{15}d_i29^{15-i}). Serialize exactly ten bytes, including any leading zero bits; encode them using the standard lowercase Base32 alphabet `abcdefghijklmnopqrstuvwxyz234567` with no padding, yielding a Tor-v2-shaped 16-character label. No string search, key, extra symbols, salt, alphabet reorder, nonlinear map, or fitted phase occurs. The only two reading directions considered are printed order and exact 16-rune reversal, since facing/reversed artwork elsewhere in the book makes reversal a finite source-plausible comparison. Conversion is one-to-one on the valid 16-rune BASE29 domain. The [single runnable CommonJS test](../sims/lp2_red16_base29_onion_v2_source_sft.cjs) checks each original rune, reversibility back to all 16 original GP digits, expected names and the authenticated signed 2014 onion as a positive historical address.

| Original source | Fixed reading | Proposed address |
| --- | --- | --- |
| p3 red16 | printed | `evcbbeaia3xhi3je.onion` |
| p3 red16 | reversed | `fbgi5h43sq5odwp4.onion` |
| p23 red16 | printed | `annttvep376tdfdy.onion` |
| p23 red16 | reversed | `gawzslode3nxl2tq.onion` |

**Historical continuation check:** none of the four addresses is in the independently archived seven known 2014 Cicada onion hosts `auqgnxjtvdbll3pv`, `cu343l33nqaekrnw`, `fv7lyucmeozzd5j4`, `avowyfgl5lkzfj3n`, `q4utgdi2n4m4uim5`, `ut3qtzbrvs7dtvzp`, or the explicitly signed `ky2khlqdf7qdznac`. Targeted exact-name public searches also produced no matching historical publication at the time of this report; absence from public indexes is weaker evidence than a positive authenticated service record. Tor-v2 addresses lack a modern inherent integrity checksum. Syntactic Base32 validity is automatic for **every** input under this transformation, and cannot identify creator intent.

## Decision and continuation contract

The proposed mapping supplies four mechanically fixed strings without plaintext selection or free keys, but none has source-attested ownership, historical host evidence, a preserved response, or an identified command/packet consumer. Accordingly **none can be accepted as Cicada's intended next onion address**. Tor v2 is a discontinued service protocol, so a live service cannot now be assumed. This bounded direct interpretation is complete under the fixed digit order, single full-span integer and no-padding conventions.

A genuine breakthrough on this track would require an archived 2014 participant/browser artifact, signed message or service capture explicitly recording one of these names **before the present derivation**, or a previously absent original instruction selecting a different executable conversion and independently validating the resulting endpoint. Without that, changing the radix, applying an Atbash layer, trimming symbols, or sweeping more host representations would be unconstrained key/format hunting. Prioritize a recovered external artifact or original-cipher key over additional syntactically valid address candidates.

**Reproduce:** run the checked-in [original-source single-file test](../sims/lp2_red16_base29_onion_v2_source_sft.cjs) under Node.js 22. It uses only Node built-ins and the pinned local canonical corpus, ink atlas and original signed 2014 message.