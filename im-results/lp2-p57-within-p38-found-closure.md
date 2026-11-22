# p57 WITHIN -> p38 -> signed FOUND typed closure

**Agent15, 18 November 2026. Classification: source-constrained navigation hypothesis with a finite selector family. No unknown plaintext or cipher inverse is claimed.**

## Result

Solved p57 supplies a finite family of canonical GP0 values that can directly name rune-bearing unknown physical pages. Across its 20 title/body words, the distinct eligible values are:

```text
8, 19, 20, 25, 38, 42, 51, 53
```

Charge every one of those page receivers under both source-supported p50 numeral readings, using only complete words wholly contained on each page and the already frozen typed closure grammar:

```text
receiver ciphertext word GP0
-> p50 value
-> authenticated-2016 signed-word index
-> selected signed-word GP0
-> p50 value
-> original receiver-word boundary
```

There is exactly one hit in the entire 8-page × 2-radix family:

```text
p57 WITHIN GP0 = 38
-> physical p38
-> p38 word9, offsets49..53, length5, ciphertext GP0=95
-> p50[95] base59 = 35
-> signed word35 FOUND
-> GP0(FOUND)=36
-> p50[36] base59 = 53
-> end(p38 word9)
```

The receiver word length is **5**, exactly the GP length of signed `FOUND`. That length equality was not used to select the closure.

The base60 control does not close on p38. None of the other seven p57-selected pages closes under either radix.

## Why this is worth preserving

The source path is human-readable:

- solved p57 literally says `FIND THE DIVINITY WITHIN AND EMERGE`;
- canonical GP0(`WITHIN`)=38 can name physical p38 without inspecting its ciphertext;
- the frozen table/signed-message grammar then selects `FOUND` and returns to the exact end of a five-rune receiver word;
- the authenticated 2016 message itself says `SEEK AND YOU WILL BE FOUND`.

This is a fresh cross-source prediction on an unused unknown page. It uses no English score, free phase, cipher key, or receiver search after choosing p57 direct page numbers.

The weak premise is explicit: no first-party sentence currently states that a solved p57 GP0 value should be read directly as a physical page number. The result should therefore remain navigation evidence until an independent source rule authenticates that output type or a reversible p38 cipher recovers `FOUND` and surrounding plaintext.

## Cipher sensitivity control

The obvious same-offset p50 additive pad is already negative. Using the five p50 cells at receiver offsets49..53 as GP29 key residues, both base59/base60 and both additive signs fail to turn the original five p38 ciphertext runes into `FOUND`.

Thus the closure must not be misreported as a recovered plaintext inverse.

## Reproduction

SFT: `sims/lp2_p57_within_p38_found_closure_sft.cjs`

Windows Node22: [PASS 44423266593](https://github.com/FlareZ123/liber-primus/actions/runs/44423266593), tested commit `91a258077b4950c70ab4a6477c5eaf85f3883f63`.
