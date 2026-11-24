# Blind shared homophonic Bacon recovery (24 Nov 2026)

## Scope and result
The earlier arbitrary **injective** codebook attack did not cover homophones. This experiment allows all 32 five-bit codes to map surjectively to either 26 Latin letters or 29 native GP runes. Six or three extra code assignments, respectively, may be distributed arbitrarily. A fixed unknown binary coloring of all 29 input rune classes is shared across the two original passages; bit 0 is fixed to zero without loss of generality (complementing the color and permuting code labels leaves the decoder equivalent).

Training: original p40–53 after its eight-rune header (600 quintets). Independent continuation: p23–26 after its sixteen-rune header (201 quintets). No continuation symbol was used in ranking, fitting or selecting the winner. This is a constructive recovery algorithm, **not** a proof excluding every homophonic key.

## Search
Enumerate all 268,435,456 canonical colorings. Merging raw code histogram cells into output labels can only increase the largest-k sums and ordered equal pairs. Its smallest-k sums and number of small cells are likewise bounded by the unmerged counts. Apply necessary histogram inequalities from actual 600-symbol sliding-window envelopes: 636,343 Latin windows, or 2,408,087 GP windows (four chart-normalization variants of each of Gibran, Emerson, Shakespeare, plus the individual native solved sections). The native normalization applies QU→CW, V→U, K/Q→C, Z→S, greedy longest chart token, with optional ING→NG and IO→IA. These are empirical prose-envelope assumptions, not universal language theorems.

For each survivor compute excess repeat score using the raw code stream: .05*(B−179101*p²)+(T−178503*p³)+4*(Q−177906*p⁴), where B,T,Q are repeated bigram/trigram/quadgram unordered pair counts and p=(ordered unigram equal pairs+600)/600². The iid subtraction is a ranking heuristic, not a significance test. Retain top 10,000.

Fit surjective output maps by annealing swaps and reassignment of a code whose old label has multiplicity >1. The final scoring model uses conditional quadgrams estimated from TextBlob word counts (within-word and cross-boundary prefix/suffix products), plus a native 10% solved-corpus contribution excluding the two native target sections. Frequency regularization is eight times the multinomial log-probability plus a penalty for any letter count >104. Quantized scores permit exact delta updates. Four restarts × 9,000 proposals for every shortlisted original mask; refine the top 64 with 28 × 24,000. Controls fit the top 512 masks, with the same refinement for native. The preliminary unregularized/absolute quadgram fit favored repetitive text; the final conditional regularized objective was applied to all original candidates and independent plants alike.

## Blind planted controls
Random 14-of-28 nonzero-rune coloring; shuffled complete codebook with prescribed extra labels; independently uniform carrier rune choices within the bit class. The true mask is supplied only to count its rank, never to select or fit. The optimizer receives ciphertext and generic model, not the planted plaintext or codebook. All five training passages and independent continuations decode exactly, notwithstanding ambiguity on unused code labels.

| Seed | Register | True mask | Histogram survivors | True raw rank (1-based) | Train matches | Held-out matches | Held-out conditional log probability / scored symbol |
|---|---|---:|---:|---:|---:|---:|---:|
|3302|Latin|355746526|7,527,875|108|600/600|201/201|-1.893|
|3303|Latin|281484998|7,670,815|1|600/600|201/201|-2.342|
|3304|Latin|356980980|7,447,013|46|600/600|201/201|-1.915|
|3305|GP29|422254500|495,003|1|600/600|201/201|-2.186|
|3306|GP29|108287386|552,988|1|600/600|201/201|-1.817|

Latin sources: Gibran[5000:5600]/Emerson[5000:5201], Emerson[12000:12600]/Shakespeare[18000:18201], Shakespeare[25000:25600]/Gibran[20000:20201], after A-Z filtering. GP controls: native section3[100:700]/section4[200:401], then section4[20:620]/section3[:201]. The TextBlob model is generic and its construction does not read these selected Latin passages. Both native target sections are excluded from the native contribution. Exact control totals: 4,005/4,005 symbols.

## Original results
| Register | Histogram survivors | Output maps optimized | Final selected mask | Train objective | Training conditional logp/symbol | Held-out conditional logp/symbol |
|---|---:|---:|---:|---:|---:|---:|
|Latin|12,230,462|10,000 (+64 refinements)|356059200|-7320492|-3.606|-4.390|
|GP29|1,147,702|10,000 (+64 refinements)|531099214|-7359739|-3.774|-4.540|

Latin map: `ERILSCUKAHDVOYWQNOTMTPGJNBFHTDXZ`. First 90 training letters: `THDUIOEIEIFINYSNETOVTOOJDTEARISETOUTNHSOSSSLIGOLYOOFRASETTREETEEDGDVOIAWNONGSITCESEJSRIPTO`. First 90 continuation letters: `NYRTNEOERNAFERATRCCSOPTSHUIOLCRECAONECINAEGUJENUSMERSDANINNEAEAAERETPRPCEDKEIASAYANRWSRTIE`.

GP map (index encoding 0–9,a–s): `mlbrc6daeqsng52fph0jaak97g1384oi`. First 90 continuation symbols: `i6ro141fh1f3iih9a4iahoohi54oqj49if24a618orpak404iif4339451i3afiboo0o96o44f99f4r38eihffair9`.

Neither continuation is coherent language. All-mask scan is exhaustive only for the stated raw histogram/ranking stage. Output-map optimization is heuristic and limited to the top 10,000 colorings per register. Reject these selected decoder candidates; do not claim the entire family impossible. A stronger original-source constraint would be needed to pursue the millions of remaining colorings. No original plaintext or key recovered.

## Reproduction
Run `python sims/lp2_bacon_homophone_recovery_sft.py OUTPUT_DIRECTORY` (Python+NumPy, g++ with OpenMP). The constituent scans/fits were executed against the original tapes and exact model inputs, not merely proposed. The wrapper reconstructs them from repository resources. Programs: [rank](../sims/lp2_bacon_homophone_rank.cpp), [fit](../sims/lp2_bacon_homophone_fit.cpp), [runner](../sims/lp2_bacon_homophone_recovery_sft.py). 
