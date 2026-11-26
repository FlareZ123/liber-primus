# R38 B-R29 A1/A2 latent length-inventory receiver (#2963)

## Result
All 20 fresh plants exceed the issue's 80% rune-recovery criterion. The frozen receiver recovered 60/60 hidden page keys, 13/20 entire tapes exactly, mean rune accuracy 99.657064%, minimum 97.393690%, minimum boundary F1 0.968912. All 20 wrong-offset negatives are excluded. Original p0–2 and the untouched [729,1428) continuation fail the frozen 2.5-cost/rune contained-sentence threshold for every permitted page key, even in the count-preserving multiplicity-relaxed search. No unknown LP2 plaintext or key.

## Exact sender and finite scope
The archived [R38 enciphers.py](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round38/C1-semantic-road/enciphers.py) indexes B-R29 by word ordinal: d_k = VAL[(s+k) mod 726]. A1 uses d_k, A2 uses the cumulative sum through k, and both signs are tested. The exact [726-row index](https://github.com/Dukotah/cicada3301/blob/fed5473f6ea8180c7a5bfcf1bc19b746db38f9eb/liber-primus/analysis/round38/C1-semantic-road/lp1_meaning_index.json) blob fac550da1f263fbd051241ae527eb408112419c4 matches all 726 local B-R29 values (local blob 2e3b6c79bc2ddb1eeaa2e6511b7c661b854540f7). Offsets 0..28, two modes, two signs: 116 keys per page independently. No enlargement or LP2-derived key. CS start-page convention only: a whole word is encrypted on the page on which it starts; the first new word on a page restarts the ordinal. C0/CE remain outside this receiver.

## Receiver and proof of bound
For every sentence fully contained within a physical page, the known rune count, word count, allowed lengths and necessary sorted-inventory prefix minimum/maximum positions define a relaxed DAG. It drops the exact multiplicities, retaining every possible conserved-inventory ordering. For each page key and every possible initial ordinal at the first contained sentence, DP finds the minimum conditional word cost; subsequent contained sentences advance the ordinal by the known word counts. If a seam-crossing sentence precedes the first complete sentence, enumerate 0 through the smaller of its word count and number of runes between seam and first contained sentence. Taking independent minima across pages can only decrease the cost of any legal full receiver. Divide by the number of scored runes. This proves a lower bound for the **contained-sentence subset**, not the full-tape mean. In opening p0–2 even the sum divided by all 729 runes is 3.108>2.5 using nonnegative omitted-word costs; in continuation the subset alone is excluded at its threshold.

For recovery, retain the best 16 page keys including ties; beam width 768, exact remaining length counts, current ordinal, page reset and rune position. Merge equivalent states; prune by cumulative cost and a suffix-DP/entropy heuristic. This recovery search is approximate; the all-key original rank bound does not depend on beam survival. Every returned plant is re-encrypted exactly. Scorer is the frozen 33,350 native-spelled word-form conditional-length register with OOV costs; cutoff 2.5. No standalone Node CLI/CI run; same exported code executed in connected V8.

## Controls
Pilot: all three keys, 99.177% runes, boundary F1 0.994048; wrong-offset bound 4.102305. Freeze before fresh tests. Cases 0..19 use disjoint donor blocks in Gibran/Emerson/Shakespeare, separately chosen natural-word windows per sentence preserving the opening's exact rune geometry [0,262,528,729] and nine sentence endpoints, with randomly permuted true length inventories. Word-count profiles vary; these are literary synthetic plants rather than actual solved LP1 pages. The offsets, signs and modes are hidden. Wrong-offset controls use same plaintext and length inventories with per-page offset in 29..725, outside the tested family. They are not generic wrong-length or random-cipher controls.

| Metric | Fresh result |
|---|---:|
| Rune recovery >=80% | 20/20 |
| All page keys | 60/60 |
| Entire tape exact | 13/20 |
| Mean / minimum rune accuracy | 99.657064% / 97.393690% |
| Minimum boundary F1 | 0.968912 |
| Worst true key rank | 13 |
| Positive contained cost bounds | 1.257185–2.012178 |
| Wrong-offset contained cost bounds | 3.938455–4.498766 |
| Wrong-offset exclusion | 20/20 |

## Original, unchanged rank bound
| Region | Total runes | Scored contained runes | Lower cost/rune | Decision at 2.5 |
|---|---:|---:|---:|---|
| p0–2 [0,729) | 729 | 511 | 4.434541232451241 | excluded |
| Continuation [729,1428) | 699 | 342 | 4.439377346077803 | excluded |

Opening per-page minimum costs / scored counts: 687.835537/154, 752.710546/159, 825.504486/198. Continuation: 519.451588/122, 414.748228/86, 584.067236/134. Seam-crossing sentences are deliberately omitted from the bound; all 116 page keys and admissible starting ordinals are represented. No original full beam result or claim of cross-page shared-key prediction. These are independent page-key exclusions under the same frozen model and score, not a general rejection of semantic schedules or H-decoy. Retire this exact CS row under b-prime absent new source evidence; C0/CE and other rows are separate.

## Reproduction
[SFT](../sims/lp2_r38_b_r29_latent_inventory_beam_sft.cjs), first committed a9b08fd2260f80adda18f6331d584bcec6a22ba9; all input blob SHAs, donor ranges, truth/recovered keys, scores and complete ranks are saved in the seven control batches: [00–02](lp2-r38-b-r29-latent-inventory-controls-00-02.json), [03–05](lp2-r38-b-r29-latent-inventory-controls-03-05.json), [06–08](lp2-r38-b-r29-latent-inventory-controls-06-08.json), [09–11](lp2-r38-b-r29-latent-inventory-controls-09-11.json), [12–14](lp2-r38-b-r29-latent-inventory-controls-12-14.json), [15–17](lp2-r38-b-r29-latent-inventory-controls-15-17.json), [18–19](lp2-r38-b-r29-latent-inventory-controls-18-19.json). [Original and continuation](lp2-r38-b-r29-latent-inventory-original.json).
