# Original p15 Fibonacci plaintext-autokey inversion: complete 841-IV negative with three blind native recoveries

**Agent37; 23 November 2026; Director [#2374](https://github.com/FlareZ123/liber-primus/issues/2374).** Tested the exact source-motivated *one-register continuous GP29 plaintext-autokey* on every physical unknown rune from **p16 through p55**, with source-fixed p15 red spiral center as seed and **every one of the 841 possible IV pairs**. This is a source-shaped, key-exhaustive **negative for this exact equation as the direct native-GP English decoder**, not a new plaintext/key or a dismissal of the independently established p15 spiral.

## Physical clue, source reconstruction and frozen receiver

The original p15 [4×4 numerical grid](../results/lp2-p15-fibonacci-prime-spiral.md) reads

```text
3258 3222 3152 3038
3278 3299 3298 2838
3288 3294 3296 2472
4516 1206  708 1820
```

Reading the fixed red-center-first square spiral (right, down, left, left, up, up, etc.) gives exactly `3299,3298,3296,3294,3288,3278,3258,3222,3152,3038,2838,2472,1820,708,1206,4516`. Every cell independently equals `abs(3301-prime[distinctFibonacciOrdinal+1])` with distinct ordinals `0,1,2,3,5,8,13,21,34,55,89,144,233,377,610,987`. The executable code reconstructs all sixteen numbers and asserts each identity, not a substituted transcript. Adjacent red3299 and first following black3298 select **source-frozen** GP29 first-key pair **(22,21)** by direct residue reduction. A source-first alternative is the exhaustive IV set (0..28)². This proposal has *one unverified leap*: transferring the spiral's Fibonacci recurrence into cipher-state feedback; the original p15 does not print that command.

The tested *sole* cipher equation is, for `i=0,1,...`:

```text
C[i] = (P[i] + K[i]) mod 29
K[i+2] = (K[i] + K[i+1] + P[i]) mod 29
```

Start the one continuous register **at the very first rune of original physical p16**, never reset at physical page, word, chapter, mark or section boundaries, and use all **9,194 actual p16–55 original ciphertext runes**, 2,063 original complete words, all 24 cross-page carried words within this interval. Physical p50's rune-free number table consumes no key step. Freeze **one addition orientation** as printed; do not fit coefficient, rune alphabet, word breaks, extra escapes or IV schedules. The direct encoder and sequential inverse operate on unchanged original text; no synthetic word segmentation is substituted at inference time.

## Key insight: this apparent plaintext-Fibonacci recurrence collapses to an observable cipher-only accumulator

Substituting `P[i]=C[i]-K[i]` into the authored recurrence gives the **exact unconditional identity**

```text
K[i+2] = K[i+1] + C[i]       (mod 29)
P[0] = C[0] - K[0]            (mod 29)
P[1] = C[1] - K[1]            (mod 29)
P[i] = C[i] - K[1] - sum(C[j],j=0..i-2)  (mod 29), i>=2
```

Thus the ostensible `29²=841` keys have only **29 distinct 9,193-rune plaintext tails**. Changing `K[0]` changes **only the first output rune**; changing `K[1]` adds one *global GP29 rotation* across all later outputs, hence **every K1 has EXACTLY the same repeated-symbol pair count and index of coincidence** on any holdout not containing position 0. This is stronger than optimizer failure: the full key family cannot change that source-text invariant, regardless of which IV was actually chosen. Every inverse has exact forward replay algebraically, so cipher re-encryption alone is not evidence of native language.

## Original pp16–21 and independently untouched pp40–55

All 841 candidates were explicitly inverted and re-encrypted. Training is **1,613 GP29 runes** from original physical **p16–21** only. The original untouched holdouts are **3,008 runes** from **p40–53**, and **308 runes** from **p54–55**. All IVs have *exact* p16–21 tail IoC **0.03468631446645503**, and p40–53 IoC **0.03453400399068839**, close to the uniform GP29 `1/29≈0.0344828`; no key can improve either statistic. The first original training symbol's effect on an untruncated window changes IoC by just `~1e-5`, not enough to create native prose.

| Freeze | Training pp16–21 IoC | Untouched pp40–53 IoC | Untouched pp54–55 IoC | Training likelihood/runic symbol (independent English lexicon) |
|---|---:|---:|---:|---:|
| p15 red-center `(K0,K1)=(22,21)` | **0.0346948414** | **0.0345340040** | **0.0356402555** | −4.077444 |
| Best *training-only* K1=20, arbitrarily K0=0 | **0.0347002257** | **0.0345340040** | **0.0356402555** | −3.978426 |
| All 841 original IVs, excluding initial rune | **0.0346863145** | **0.0345340040** | (all equal) | No native prose candidate |

The independent training lexicon's top **K1=20** produces **no dictionary-valid 13-rune first word under ANY K0** (all 29 are absent), so `K0=0` is merely an arbitrary tie representative, **not a recovered original key**. The source-frozen `(22,21)` yields:

**Physical p16 first 100 decoded GP-token values:**

```text
AE TH X NG B H B R S EO R P AE P B AE AE U IA S IA F OE O NG P D E TH D I P X L F W M X C R G R L TH OE F S T P R R R U H TH H G R F F P J EA I EA X EO B G TH AE S U H R TH P A R R I G OE H G B U O J Y M Y D G IA IA B O U L
```

**Untouched physical p40–53 first 80 decoded GP-token values, after actually processing all intervening source runes with NO restart:**

```text
O U J N EA M S R A C J I W X OE X U AE EO O O D N X AE P E N IA IA L H L OE TH TH G D G D D NG T F Y B U B E L U F H T R H A D NG Y J M D U B EA T OE L N Y T TH Y E J R EO TH L
```

**Untouched p54–55 first 80 decoded GP-token values:**

```text
M C EO A W B TH AE L E A T U Y J IA S B G T NG I X NG TH B R L U P F Y IA H AE L R D E G S C EA O NG S M B O J EA X EA AE L C NG TH AE G X P L OE E N EO OE R E N T F M O X M U R N
```

None resembles authentic continuous English/solved-Cicada GP29 plaintext. The lone accidental short rune-like sequence `... O U ...` has no decipherment status. Numerically the entire book-length source seed output's GP29 IoC is **0.03446061013**, versus approximately **0.058–0.061** from the independently planted native-prose controls below.

## Three independently blinded source-native positive controls, full original shape

The solver's GP-native English unigram model and word-frequency dictionary are trained **exclusively on independent** `resources/control/english_wordfreq_textblob.txt` (TextBlob/Norvig public lexicon), not on any of the three native donor texts. Each original printed p16–55 word-length slot is populated by an intact donor word of *exactly the same GP29 rune length*, respecting each real page-carry and page rune count; only the first 13-rune word is required in advance to belong to the **independent** reference lexicon so its sole otherwise-unidentifiable initial rune can be calibrated. All donor words and original source page/word geometry survive unchanged; the scorer receives only the resulting ciphertext. For each plant all 841 keys are blindly exhausted; `K1` is selected from the independent training first-1,613-rune distribution, and `K0` from the independent preexisting 13-rune dictionary.

| Entire 9,194-rune native donor | True planted `(K0,K1)` | Blind-recovered `(K0,K1)` | Exact recovered runes | GP29 train / hold pp40–53 IoC |
|---|---|---|---:|---|
| Shakespeare | (4,11) | **(4,11)** | **9,194 / 9,194** | ~0.058–0.060 / ~0.058–0.060 |
| Gibran | (22,21) | **(22,21)** | **9,194 / 9,194** | 0.05851649 / 0.05900439 |
| Emerson | (17,6) | **(17,6)** | **9,194 / 9,194** | 0.05867725 / 0.06029150 |

Each plant recovers the exact first **500 consecutive runes**, all native GP words, the true key's initially unknown first 13-rune word, the original source page and word lengths, and full forward replay. Three wrong-key score gaps are large, with independent native positive calibration. This means the original null is not a solver weakness for this **specific** frozen recurrence: authentic English produced in the same geometry would be detectable, and its GP IoC is key-invariant anyway. **No native donor is secretly identical to the unknown LP2 scoring/holdout text.**

## Causal conclusion and next decoder choice

The source-selected neighboring numerical pair `(22,21)` does not produce a single authentic 300-rune passage on physical p16 or pp40–55. All 841 IVs also fail the more generous English native-prose register gate, and a proof shows no IV can repair the long-output **symbol-coincidence** deficit. **Reject the specific Fibonacci plaintext-autokey equation as direct normal GP-native English p16–55 decoder**. This does not discredit the original p15 Fibonacci-prime spiral mathematics or rule out changing-state ciphers with genuine independent key material, extra source-selected stage, different alphabet, deliberate nonordinary text, or different feedback architecture. Do not commission an unbounded key search or add state coefficients to rescue this failed exact hypothesis.

**Reproduce:** [Standalone original source + three blinded synthetic plants SFT](../sims/lp2_p15_fib_plain_autokey_original_sft.cjs); run in Windows Node22 with the existing `manual-readonly-commonjs-sft.yml` workflow and argument `sims/lp2_p15_fib_plain_autokey_original_sft.cjs`; [Windows GitHub Actions PASS **45121556854**](https://github.com/FlareZ123/liber-primus/actions/runs/45121556854). The script asserts the exact original 16-value source spiral, all 9,194 rune values matching the original body, all 24 original word carries, every candidate's inverse and forward replay, all three exact blind plant key recoveries and 9,194/9,194 plaintext recoveries, GP-native spelling controls, and the key-independent training/holdout IoC bounds.
