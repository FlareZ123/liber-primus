# Precommit: IS THE ROAD source numbers as LP2 pages 21–23

**Agent22, 19 November 2026. Frozen before inspecting LP2 pages 21, 22, or 23 in this invocation.**

## Upstream source-selected premise

The authenticated 2016 source route now fixes:

- `q=4`, `K=2`, `p=23`;
- `WORDS/THEIR/ROAD` at source indices `15,19,23`;
- the fixed `GP0 -> p50/base60 -> mod29 -> source index` image `THE/ROAD/IS`;
- left rotation by the already recovered `K=2` gives the exact contiguous signed phrase `IS THE ROAD` at source indices `21,22,23`;
- among all 35 three-term `q=4` source triples, this is the sole fixed image/rotation that lands on any contiguous signed trigram.

The signed sentence itself says `their numbers are the direction`. The cheapest literal next interpretation is therefore to treat the newly recovered phrase's authenticated source numbers `21,22,23` as LP2 page numbers.

The page-number triple has a state identity fixed before page inspection:

```text
21 = p-K
22 = p-1
23 = p
```

## Frozen test

Inspect original LP2 pages 21, 22, and 23 as one ordered three-page packet. Do not search other pages for a better fit until this test is resolved.

Allowed consumers are operations already established upstream of this precommit:

1. literal visible page structure: headings, line/word counts, punctuation, red/black marks, numbering, margins, illustrations;
2. canonical GP0/GP29 arithmetic;
3. the fixed p50 row-major table with base60 and the explicitly charged base59 rival;
4. the fixed outside-in `H(x,y)=(x-y,x+y) mod29` transform;
5. the independently established cube map `x -> x^3 mod29`;
6. already established solved-page serializers only when their input type matches exactly.

No new per-page affine constants, arbitrary subsequences, free permutations, dictionary scoring, or target-selected expression templates are allowed.

## Success / rejection rule

**Strong success:** one pre-existing allowed operation, applied uniformly to the ordered pages or to a source-visible feature common to them, yields either:

- the phrase/state labels `IS/THE/ROAD`;
- the exact state triple `[p-K,p-1,p]=[21,22,23]` in a nontrivial content-derived way; or
- a deterministic instruction/key fragment that makes an untouched receiver prediction before that receiver is opened.

**Useful partial:** the packet contains one independently meaningful source instruction that explains why page23 is the endpoint and prospectively selects a next object, with no page search or fitted constants.

**Reject literal page-direction interpretation:** no uniform source-visible feature on the three pages survives the allowed operations, or every apparent hit requires a new tuning choice learned after viewing the pages.

This precommit is a decision gate, not evidence that pages 21–23 contain plaintext `IS THE ROAD`.
