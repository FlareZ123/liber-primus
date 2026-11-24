# Critic — terminal 3301 partition census has a length-only gate

## Finding and decision

The current authoritative synthesis and Director frontier overclassify the p55 43/33 correspondence as an authenticated or source-selected circumference partition. The arithmetic, source parse and field-group exclusions are valid; the claimed manuscript-wide discrimination from the partition checksum is weaker than described.

Let n be a page's rune count and i its number of interior runes after removing each page-local printed fragment's endpoints (count a singleton once). The exterior count is n-i. The checksum tested in `sims/lp2_dh3301_p55_partition_checksum_sft.cjs` satisfies

```
i*n + (n-i) = 3301
(i+1)*(n-1) = 3300.
```

Consequently, before inspecting ANY word boundaries, a hit requires (n-1) to divide 3300 and 0<i<n. I enumerated this length-only gate on the canonical `resources/liber-primus/lp2-corpus.json`, all physical pages including solved controls. **The complete admissible list is exactly [{page:55,n:76,i:43}].** This is reproducible in Node with the parsed canonical corpus:

```js
const eligible = corpus.pages
  .filter(p => p.indices.length > 1 && 3300 % (p.indices.length - 1) === 0)
  .map(p => ({page:p.page, n:p.indices.length,
    i:3300/(p.indices.length-1)-1}))
  .filter(p => p.i > 0 && p.i < p.n);
```

Thus the uniqueness across pages is determined entirely by page lengths, independently of the circumference operation. The actual p55 match is one additional constraint on that page: i=43. With w=17 fragments and s=1 singleton, its interior count is identically n-2w+s=43. The exterior count 33 follows automatically. The quotient-43 census is another length-only test (n=76 is the sole integer length satisfying floor(3301/n)=43). It is not an independent confirmation of the partition. The signed-source count of 43 words is a real external correspondence, but a historical text count does not by itself select how the p55 runes are peeled or consumed.

## Upstream pointer evidence

I also inspected the actual SFT `sims/lp2_dh3301_base59_terminal_pair_sft.cjs`. It defines the two endpoints by decoding the *same* selected token `39` at p50 cell254 in two competing alphabets, yielding 186 and 189, then compares both alphabets starting at the base59-defined 186 and targeting the base60-defined 189. This is a mixed-alphabet receiver; its two addresses are not independently specified by the original DH state. The original table does support a nontrivial exact association:

- base59 path: 186→19→33→112→72→161→214→247→189, then fixed point 189;
- base60 from 186 does not hit 189 in eight hops;
- base60 from its own decoded address 189 instead enters 192→0→203→68→199→47→76→114→197→115→247→192;
- base59 has exactly one fixed point (189); base60 has none.

These observations justify retaining the candidate. They do not establish that a human solver is instructed to decode the same token twice in competing alphabets, to adopt the mixed endpoints, or to interpret later radix digits as physical page addresses. The finite 2..60 radix census is conditional on those receiver decisions, not a familywise audit of the route.

## Research implication

Recommend reclassifying `3301 = 55×59+56` and `3301 = 43×76+33` as exact conditional navigation/count correspondences in the next synthesis reconciliation. Do not count uniqueness of the latter as independent evidence for the shedding operation. The literal p57 shedding instruction and the physical p55 one-rune carry are sufficient to motivate the full-page interpretation as a test, while the page-local 43/32 parse remains a different conditional experiment. Neither is established as the author's cipher framing.

Preserve the exact p55 field-group negative for the full-page 43/33 parse (and the separate 43/32 negative) unchanged. No new brute-force work, workflow or receiver sweep is recommended: the missing input remains a source-selected reversible operation, typed key/message role, or prospective original plaintext prediction. This audit does not claim any recovered unknown text.

References: `results/README.md` §D; `agents/director/memory.md`; `im-results/lp2-dh3301-base59-terminal-p55-p56.md`; the two SFTs named above; `im-results/lp2-p55-shedprime-gp29-subgroup-dh-obstruction.md`.
