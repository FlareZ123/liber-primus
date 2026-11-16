# 2012 Gibson *Agrippa* original-book running-key test, with unknown rune table and skip drift

**16 November 2026, Agent42. Original-input decision:** The exact William Gibson *Agrippa* poem used by Cicada's **2012** signed book-code stage does **not** produce a registered book-key hit on any of eight 729-rune LP2 unknown-chapter windows under the source-frozen additive GP29 model with an integrated arbitrary letter→rune shift table and the external phase23 q=0.81 anti-repeat skip law. The 2012 source and its original book-coordinate operation are authentic, but **no Cicada clue says its poem is an LP2 running key**. Nothing in the unknown book was decrypted.

## Why this particular source is distinct

The historical source `neuroretransmit/cicada` commit `ade9a02889ef8acbc8cde8edbfd0a785c369f4c3`, file `2012/006-two-book-codes/books/agrippa.txt`, has Git blob SHA-1 **`673ba225d1277945f2d2e5056bf025db8e89bb92`**. The companion [2012 book-code instructions](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/README.md) and [original decoder](https://github.com/neuroretransmit/cicada/blob/ade9a02889ef8acbc8cde8edbfd0a785c369f4c3/2012/006-two-book-codes/books/agrippa.py) specify one-based `line:character` extraction, starting at poem line 1 after five header lines. The period result is `sq6wmgv2zcsrix6t.onion`. The poem is by **William Gibson**, a different work from Heinrich Cornelius Agrippa's occult text.

The published 2026 [phase23 table-free book-key scanner](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/log/phase23_book_key_decoder.md) had screened several other Cicada-referenced books but not this exact Gibson source. The poem's historically demonstrated coordinate use selects a *book*, not the hypothesized GP29 cipher or skip policy. The strongest rival explanation is that Cicada used the book only for its already-completed 2012 address construction.

## Frozen exact original test

- Input is the repository's unchanged `resources/liber-primus/lp2-corpus.json`, SHA-256 `58588725a006432a50a1c8d852b881e5e844ba32073e729b42e0f78074b17338`. Eight **original 729-rune chapter-initial ciphertext windows** cover physical pp0–2, 3–7, 8–14, 15–22, 23–26, 27–32, 33–39 and 40–53. The short final pp54–55 chapter is not tested by this detector.
- Historical Gibson book text is fetched from that exact 2012 Git blob at runtime, SHA-verified and started at the first poem verse (`I hesitated`), omitting its five non-poem header lines. The copyrighted book is not committed or copied into outputs.
- Both source-to-GP29 spellings are separately tried: digraph runes (7,115 key runes inferred from the original-offset grid) and letters as individual runes (7,491 key runes). The 29 source-letter group shifts are integrated out by [the upstream, commit-pinned original phase23 beam](https://github.com/pnotisdev/cicada3301/blob/15200c67abee106913ba01ff504c5b6e88d16cc7/work/book_key_decoder.py), with eight initial pointer states, up to two skipped key symbols per output and 64 beam states. This is more flexible than a fixed GP29 Vigenère table.
- The original published one-sided **729-rune stage1 thresholds** remain frozen: digraph **−0.0112** and letters **−0.0417** nats/rune. The inherited `q=0.81` anti-repeat skip mechanism is hypothetical for LP2 and does not implement the literal-plaintext F bypass demonstrated on solved p56.
- The first [full 32-position-equivalent four-shard run](https://github.com/FlareZ123/liber-primus/actions/runs/43801532490) covered offsets `0,8,…` below `len(key)−3×729`. The [disjoint original suffix run](https://github.com/FlareZ123/liber-primus/actions/runs/43802052452) extended the search through offsets below `len(key)−729−128` (128 source runes reserved for plausible skip drift). Both read the source only once per job and use the same frozen alphabet model and thresholds.

## Original-cipher measurements

| Spelling | First full offsets | Suffix offsets | Total offsets | Best original stage1 score | Threshold | Registered hits |
| --- | ---: | ---: | ---: | ---: | ---: | ---: |
| Digraph | 616 | 166 | **782** | **−0.1470424** | −0.0112 | **0** |
| Separate letters | 663 | 166 | **829** | **−0.1419598** | −0.0417 | **0** |

In total the two spellings screened **12,888** original ciphertext-window/key-alignment combinations, with **zero above-threshold candidates**. The strongest digraph window was source chapter pp8–14 at key offset 3880; the strongest letter window was pp0–2 at key offset 6432, within the newly included suffix. These are weak null-like maxima, **not** partial plaintext. In the identical original-source environment, the same decoder passed **6/6** distinct digraph, **5/6** distinct letters-as-runes positive synthetic plants with source-matched flattening shifts, and rejected all three fixed null types (wrong Gibson offset, wrong Walden book, uniform random keystream). The original four CI shards repeat those same six deterministic plants, so `24/24` in an earlier aggregate printout means **six distinct successful cases repeated four times**, not 24 independent plants. The corrected aggregator reports the distinct six.

## Decision and reproducibility

Retire **the tested forward Gibson poem running key, arbitrary source-letter shift table, q=.81 skip law and first-729-rune chapter starts** unless an independently authored source selects a changed operation or authentic plaintext. In particular, the source's historical 2012 address proves only its coordinate-book role. This negative does not test p56's authentic F-transparent key bypass, alternative editions, backward reading, data-derived keys, a key starting inside a chapter, or plaintext unlike the English model. No p56 preimage, unknown-page plaintext, creator key or destination was recovered.

**Rerun:** `sims/lp2_gibson_tablefree_bookkey_stage1.py`, `sims/lp2_gibson_tablefree_bookkey_aggregate.py` and [manual-only GitHub workflow](../.github/workflows/lp2-gibson-bookkey-stage1.yml). Use `scope=smoke`, `full` and `tail`; the latter two cover disjoint offset ranges. The exact run artifacts contain numerical outcomes and source hashes, not book text.
