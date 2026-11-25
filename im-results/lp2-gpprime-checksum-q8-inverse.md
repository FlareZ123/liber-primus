# GP-prime cumulative ciphertext q8 inverse

Agent7, 25 November 2026. Scoped intermediate negative; no unknown LP2 plaintext, source-selected key or authentic cipher.

## Frozen receiver

Use original GP29 chart prime weights and visual chapter boundaries. With all runes consuming, set s=0 at each chapter start; emit c=(p+k[s]) mod29; update s=(s+GPprime[c]) mod8. The previous ciphertext prefix fixes the state before each emission, so inversion p=(c-k[s]) mod29 is causal and exact. Key length eight is motivated by the authentic WELCOME period, and prime sums by the historical 761 naming/checksum convention, but neither selects this composition. The prior [mod29 running-checksum study](lp2-running-checksum-anyalphabet-capacity.md) tests a distinct public-state partition: reduction modulo29 cannot recover reduction modulo8. #2746 uses previous-symbol occurrence counts, not cumulative chart-prime sums. No spacing assumptions, F bypass, boundary reset within chapters, or alternate clocks.

## Exact all-key obstruction and held-out inverse

For each state s count ciphertext occurrences h_s(c). Each key component k independently shifts these counts. Thus the maximum E, maximum E+O, minimum J+EO and maximum unigram log likelihood are exact over all 29^8 keys. The latter is sum_s max_k sum_c h_s(c) log p(c-k), divided by the length. Gibran's pinned text between its Gutenberg markers, normalized to 47,629 GP runes with chart aliases, supplies the frozen add-0.5 unigram and bigram model. Every length-matched contiguous window of that same reference is scored; this is a finite reference-envelope test (not a statistically independent corpus or all-language theorem). The exact unigram upper bound is below even the minimum reference-window score in all nine original chapters. First eight also fail both E+O and J+EO capacity separately. The terminal unigram bound closes its weaker count-only survival.

| Original physical chapter | n | Max E+O vs reference min | Min J+EO vs reference max | All-key unigram max vs reference min (nats/rune) | First-page fit→frozen continuation bigram score |
|---|---:|---:|---:|---:|---:|
| p0–2 |729|88/106|14/8|-3.882943/-3.037142|-3.930092→-4.727408|
| p3–7 |1145|130/185|34/10|-3.985235/-3.013544|-3.882668→-4.648504|
| p8–14 |1729|174/291|62/11|-4.110886/-2.995290|-3.932154→-4.630225|
| p15–22 |1903|190/317|73/12|-4.082587/-2.996187|-3.755404→-4.590007|
| p23–26 |1021|117/160|29/9|-3.974196/-3.015245|-3.846471→-4.668884|
| p27–32 |1433|161/237|49/11|-4.035572/-3.001685|-3.950426→-4.611368|
| p33–39 |1680|173/282|64/11|-4.067805/-2.995693|-3.875560→-4.708471|
| p40–53 |3008|303/530|125/13|-4.124703/-2.986196|-3.897546→-4.587105|
| p54–55 |308|47/41|1/4|-3.758233/-3.076735|-3.940402→-4.948512|

Fit each first physical page using 256 deterministic multistarts and exact coordinate ascent of pairwise bigram factors; no suffix information in key optimization. This is a heuristic joint estimator, not exact global bigram optimization. Four target-excluded plants (two actual Blake source excerpts after removing metadata, two normalized LP1 reference excerpts; independent of Gibran training) recover 4/4 exact hidden keys and 1,086/1,086 held-out runes, heldout scores -2.7524, -2.5331, -2.4165, -2.6202. Source-native transliteration is approximate GP normalization for Latin controls, not independently adjudicated authentic LP1 ciphertext. Every original and plant forward replay passes, as expected for any correct inverse in a bijective family. All original candidates are nonprose; the terminal trained key [12,24,23,23,19,12,17,15] gives a nonlinguistic 76-rune p55 prediction. The algorithmic suffix is held out from fit, not manuscript-global untouched data.

**Decision:** retire this exact exploratory clock under the finite reference envelope and calibrated predictor. No nearby clock or modulus variants without independent source selection.

## Reproduction

Run `node sims/lp2_gpprime_checksum_q8_inverse_sft.cjs` from repo root. Core executed against the four GitHub source blobs in connected V8; standalone Node/CI not separately run. Input blobs in order corpus/Gibran/Blake/LP1: `054f2a0f780b7d46901acbe3d9bf4f0ac1801165`, `df260a07d56bf5998d40a6360b6132c35c252d10`, `c8d8afda002f2585ce64a959c26c20d24a5c990b`, `8ed037a6ddeef2b20a10bd6a84830e7cf9f43f7d`. Script commit e6b9b5bae5953fb425ada78ad758ecd1551bd73d.
