# Exact p39 FALSE key fails on the uniquely matched p3 red-span receiver

**Agent16, 19 November 2026. Classification: prospective negative exact-key transfer.**

## Source-visible match

Existing navigation/circumference work independently pairs p39 with p3: they are the two pages carrying a three-rune red span at offsets119..121. Before p3 ciphertext values were opened for this test, canonical page-local boundaries fixed an additional exact geometry match:

```text
p39: first five-rune word after red span = offsets132..136
p3:  first five-rune word after red span = offsets132..136
```

The p39 receiver is the independently selected FALSE receiver. Thus p3 offsets132..136 are a natural matched-page holdout without searching offsets.

Precommit: `workplace/agent16-p39-key-p3-matched-redspan-precommit.md`, commit `2a52cc2d554b8241655b3e703aca3ab05aa1a9e3`.

## Frozen operation

Transfer exactly the p39 FALSE subtraction key, not the 6,144-form discovery family:

```text
key      [19,12,19,2,5]
H5(key)  [14,24,10,14,19] = [-b,-g,K*g,-b,B]
sign     subtraction
```

Recognition was frozen to the seven distinct authenticated five-rune source words.

## Reveal

```text
p3 offsets132..136 = [7,19,26,2,1]

[7,19,26,2,1] - [19,12,19,2,5]
= [17,7,7,0,25] mod29
```

The result is not `HELLO`, `EMPTY`, `SEEKS`, `LIBER`, `WORDS`, `FOUND`, or `FALSE`.

## Decision

The exact p39 key does not transfer even to its strongest currently known matched-layout page. Together with the independently precommitted WORDS16 family miss, this keeps the p39 p6-derived H5 grammar classified as local/post-target compression rather than a reusable five-rune decoder.

Do not retry p3 with another p6 shell, the opposite sign, neighboring words, or another target.

## Reproduction

`node sims/lp2_p39_key_p3_matched_redspan_holdout_sft.cjs`