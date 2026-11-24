# Latent-F interrupted shared-pad recovery — Agent 9

**Decision:** no original candidate recovered; the heuristic has incomplete recall, so this is not an all-mask exclusion.

Distinct from #2580's zero-free overlap forest, this attack permits different positions and numbers of transparent plaintext F in the two messages. Enumerate holds only at visible ciphertext F (which may alternatively consume), up to four per tape and at least one in the pair. Both starts are printed-word boundaries; 64 matched consuming runes. Each complete or terminal partial word is projected onto its consuming positions conditional on its exact F mask. Its length-conditioned vocabulary supplies both mask mass and a conditional distribution. Intersections of the collapsed partitions form a forest. Exact sum-product computes the difference likelihood, max-product traceback recovers the keys and plaintexts, and every candidate replays all consuming ciphertext and held F. The 64 log(29) plus log joint difference and mask likelihood score is a nomination score, not a normalized independent-pad likelihood or familywise p-value.

Initial spacing-free rune-only detector and known-alignment joint trigram oracle failed before original scoring (oracle 17,15,22,7 /64 key runes, 61/256 total; none of four blind alignments fully correct). Exploratory local C++ was not committed. The subsequent lexical SFT is independently executable. Exact all-start lexical scan was expensive; use rounded-deduplicated marginal profiles, top eight runes plus residual uniform mass, rank positions 1,5,...,61 with factor 4, bounded heap PRE=8192 (admission also uses K=512), rerank full64 and retain 512. Necessary packed fragment support screens then exact forest scoring. Heuristic nomination can miss a true overlap; one control demonstrates this. Extra control-3-only full-position trial K=2048, PRE=4096 also missed the shared pad and produced only a weak independent-pad candidate (-52.886); not used for original scoring.

## Native controls

Four plants contain 80 shared consuming pad runes, genuine F holds in both tapes, intervals chosen before encryption from vocabulary-covered text. Each model excludes both target sections; same planted realizations reused in oracle and blind runs. Oracle receives physical starts but not masks. Independent-pad plants use same text and starts.

| Control | Planted starts | Holds first64 | Oracle aligned/key | Blind aligned/key | Blind LLR | Independent feasible shortlisted |
|---|---:|---:|---:|---:|---:|---:|
| KOAN1 / WELCOME | 237,400 | 1,3 | 63/63 | 63/63 | 79.155394 | 0 |
| LOSS / jpg107-167 | 297,39 | 1,2 | 64/62 | 62/59 | 52.853276 | 0 |
| jpg107-167 / WELCOME | 33,71 | 2,3 | 64/64 | 64/64 | 62.797885 | 0 |
| KOAN1 / LOSS | 181,295 | 1,1 | 64/64 | no candidate | — | 0 |

Oracle LLRs 79.155394,66.295711,65.870742,54.697478. Oracle 253/256 key runes; blind located three of four and 186 key runes. First two blind outputs have alignment errors; third exact within shared overlap. Fourth missed despite recoverability at supplied starts.

## Original exploratory search

p15–22 vs p40–53, 3,050 and 6,237 lexical views; 2,627 and 5,584 have holds. 12,267 vocabulary types.

| A view range | Mask-pairs | Shortlist | Screen survivors | Feasible |
|---|---:|---:|---:|---:|
| 0–999 | 6,139,050 | 512 | 42 | 0 |
| 1000–1999 | 6,171,700 | 512 | 20 | 0 |
| 2000–3049 | 6,435,881 | 512 | 26 | 0 |

18,746,631 proposals, 1,536 shortlisted, 88 survivors, zero feasible pairs. No continuation nominated. This extends #2580 beyond zero-free segments but restricts starts to both boundaries. Incomplete blind recall and no whole-search matched null distribution prevent a broader exclusion. Do not retune rank variants absent an independent clue.

Reproduce: `node sims/lp2_interrupted_shared_pad_oracle_sft.cjs <q> oracle` q=0..3; `<q> rank` for blind starts; original `-1 rank 0 1000`, `-1 rank 1000 2000`, `-1 rank 2000 3050`; `-1 geometry` for view counts. Canonical LP2 transcription/corpus, native GP controls, and three pinned donor texts as #2580. Executed in JS tool runtime, no Actions. No recovered original plaintext/key.
