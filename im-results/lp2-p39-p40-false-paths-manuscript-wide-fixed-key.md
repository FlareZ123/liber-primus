# Fixed p39/p40 keys uniquely localize adjacent FALSE PATHS

**Agent19, 28 November 2026. Classification: conditional manuscript-wide receiver-disambiguation result. This strengthens the p39 FALSE and p40 PATHS local candidates after their exact keys are accepted; it does not independently authenticate the retrospectively identified key grammars.**

## Inputs

Use only the two already published exact additive keys and the untouched unknown LP2 manuscript:

~~~text
p39 key = [19,12,19,2,5]
p40 key = [20,20,12,6]
~~~

For each key arity, scan every contiguous window wholly contained in an unknown physical page, both additive signs, against every distinct authenticated 2016 source spelling of that arity.

No page, receiver start, target word, or word boundary is supplied to the scan.

## P39 five-rune result

There are 12,736 five-rune windows and seven distinct authenticated five-rune source spellings. Across both signs:

~~~text
12,736 * 7 * 2 = 178,304 comparisons
~~~

Exactly one authenticated event appears:

~~~text
physical p39
start132
cipher [19,7,10,17,23]
- key [19,12,19,2,5]
= [0,24,20,15,18]
= FALSE
source index39.
~~~

Thus, conditional on the exact p39 key, neither receiver selection nor word segmentation is needed to localize FALSE.

## P40 four-rune result

The analogous already established four-rune screen has 12,791 windows and nine authenticated spellings:

~~~text
12,791 * 9 * 2 = 230,238 comparisons
~~~

Again there is one event:

~~~text
physical p40
start71
cipher [4,15,14,21]
- key [20,20,12,6]
= [13,24,2,15]
= PATHS
source index40.
~~~

## Joint held structure

The two independent fixed-key screens therefore preserve two order relations simultaneously:

~~~text
physical pages:  p39 -> p40
source indices:  39  -> 40
source phrase:   FALSE PATHS
~~~

The p39 receiver was prospectively fixed by the first complete g=5 word after its sole red span; p40 now also has p6-only receiver-address grammars. The manuscript-wide scans are stronger in a different way: once each exact key is accepted, they remove all local receiver and segmentation freedom.

This does **not** turn FALSE PATHS into established plaintext. Both exact key grammars were recognized after the targets were known, so adjacency is a conditional consequence of those keys rather than a blind discovery.

## Key-space null boundary

Singleton outputs are common enough that uniqueness itself cannot authenticate either key.

For the p39 five-rune screen over all `29^5 = 20,511,149` possible keys:

~~~text
hit count   key count
0           20,333,679
1              176,640
2                  826
3                    4
~~~

The exact p39 key is one of the 176,640 singleton keys.

For the p40 four-rune screen over all `29^4 = 707,281` keys:

~~~text
hit count   key count
0              510,501
1              166,764
2               26,842
3                2,920
4                  244
5                    6
6                    4
~~~

The exact p40 key is one of the 166,764 singleton keys.

Therefore the result is best used as **receiver localization and cross-page coherence conditional on source-derived keys**. It does not supply a discovery-wide probability and does not justify more target-conditioned key algebra.

Reproducer: `sims/lp2_p39_p40_false_paths_fixed_key_sft.cjs`.
