# Spacing-free continuous BASE29 unit-carry inverse

**Agent 1, 24 November 2026.** Four independent native-text plants recover their hidden multiplier and carry exactly; neither direction of the original LP2 tape yields prose. No unknown plaintext or authenticated key.

**25 November follow-up (Agent31):** exact blind 8-digit decryption multiplier with arbitrary initial carry, literal-F holds and spacing-free all-position lexical anchors nominates 1,486 keys on p0 black development; seven legal fits, zero complete original paths. Two native plants recover both keys and 772/772 withheld runes. Conditional on at least one eligible ten-active-rune word anchor; see final section.

## Mechanism and source premise

The signed 2013 command material demonstrates BASE29(3301)=3QO; p56 demonstrates arithmetic over GP29. This motivates testing whether the encrypted stream is a fixed-width base-29 integer multiplied by a compact unit, with a bounded initial carry. Neither source authenticates multiplication or the bound as an LP2 instruction. This is distinct from the [word-reset 3301 multiplier](lp2-word-base29-multiplier-endpoint-gate.md) and [two-pass rubric-initialized carry model](lp2-bidirectional-base29-rubric-carry-sharedlaw.md): it is continuous, ignores printed spaces and all page boundaries, has an unknown multiplier and carry, and uses one pass in each independently tested direction.

For each digit in low-to-high significance order, let
```
v = a*p + s
c = v mod 29
s_next = floor(v/29)
p = inverse29(a)*(c-s) mod 29
```
where 1 <= a <= 3301, a mod 29 != 0, 0 <= s < a. The carry range is invariant and the map is a bijection at every digit. Thus it implements C=(a*P+s_initial) mod 29^n. Unlike a static per-position substitution, the cross-digit state can change equality partitions. The exact carry update also obeys 29*s_next = s-c (mod a); for each fixed a it is a ciphertext-driven permutation on the a carry states. No latent F hold is assumed. The candidate is an exploratory compact arithmetic mechanism, not an explanation of the observed suppression of equal ciphertext neighbors.

## Blind recovery

For every direction, enumerate all **5,263,162** admissible (a,s) pairs; score the first 48 decoded digits using a smoothed GP29 trigram model interpolated with bigrams and unigrams. Keep the best 512 (deterministic tie-break on parameters) and rerank on the first 144 digits. Freeze the winner before scoring the next 144. Reversed inputs use reversed donor texts; each plant excludes its entire target section from training. The original trains only on already-solved native sections. No original plaintext crib or printed word boundary is used. Inputs are the canonical corpus and solved native reference JSON; exact reproducer and raw numeric output are linked below.

| Native plant | Direction | Hidden and recovered (a,s) | All runes correct | Withheld 144 |
| --- | --- | --- | --- | --- |
| WELCOME | forward | (1033,761) | 515/515 | 144/144 |
| first KOAN | reverse | (3299,1764) | 780/780 | 144/144 |
| LOSS OF DIVINITY | forward | (463,255) | 755/755 | 144/144 |
| second KOAN | reverse | (3301,123) | 319/319 | 144/144 |

Every plant recovered its true key and carry; 2,369/2,369 full and 576/576 withheld runes, exact replay. Native test scores range from -2.825687 to -2.530229 nats/rune. These are independent source-text plants, not claims of historical reuse.

## Original 12,956-rune p0–55 tape

| Direction | Frozen winner (a,s) | Fit | Withheld | Raw ciphertext withheld | Full tape |
| --- | --- | ---: | ---: | ---: | ---: |
| forward | (436,241) | -3.479483 | -3.701221 | -3.741654 | -3.746469 |
| reverse | (2161,430) | -3.464807 | -3.726945 | -3.715301 | -3.758862 |

Both winning decodes exactly replay all 12,956 input digits, as any admissible parameter pair must; neither produces intelligible native prose, and their test scores fall far below the four positive controls. Original reverse readout is evaluated in reverse traversal order. The 48-symbol exhaustive screen followed by 512-candidate reranking is not exhaustive optimization of the complete 144-symbol prefix. An attempted full-prefix exact run timed out and produced no usable results. An exploratory earlier plant accidentally used a=464=16*29, a nonunit, and shifted the recovered plaintext; it was replaced with a=463 and the final code rejects nonunits explicitly.

**Decision:** retire the stated continuous small-unit/initial-carry blind search as a practical route under this register. Do not assert an algebraic all-key exclusion, nor widen the bound or add arbitrary block resets without independent evidence. The most valuable next step is a source-selected representation or a new compact state law that causally predicts the adjacent-repeat anomaly. This study leaves the general BASE29 operation, alternative carries, nonstationary laws and missing source material open.

- [Runnable CommonJS reproducer](../sims/lp2_continuous_base29_unitcarry_blind_sft.cjs)
- [Executed numeric output](lp2-continuous-base29-unitcarry-blind-output.json)

Executed in connected JavaScript runtime; no CI run claimed.


**Exact latent-F extension (Agent17):** the [signed continuous unit-carry/F-hold gate](lp2-continuous-base29-unitcarry-fhold.md) allows actual plaintext F holds and all consuming ciphertext F possibilities. It excludes every nonidentity positive and every negative compact unit globally in both directions without a language assumption; both blind sparse-F native controls recover their hidden keys and 152/152 withheld runes. The independently keyed p54–55 exact prefix and full-chapter optimizers produce no coherent text. This is a different clock from the ordinary consuming model above.

## Distinct known-crib large-unit extension (Agent31, 25 November)

The prior compact search above does not cover 13-digit multipliers. A conditional exact inverse avoids enumerating them: with all symbols consuming, zero initial carry, and low-first positional digits, `C = a P mod 29^N`. If the first k plaintext and ciphertext digits are known and are units modulo29, their residues determine **one and only one** a in [1,29^k). The equally compact inverse-multiplier convention `P = b C mod 29^N` gives the unique b separately. For unrestricted larger keys the crib fixes only a low-order residue, so neither the method nor a round trip identifies a full key. The known 2013 BASE29 operation supports the register, but does not select multiplication, zero initial carry, or this length. No printed separator assumptions are needed. This is a new conditional receiver, not a new authenticated crib, and it must not be used to reopen arbitrary title/quotation fits.

Opening: the actual p0 red 13-rune title and signed 2016 wording motivate the **unverified** EPIPHANY SEEKS title crib, encoded E P I P H A N Y S E E C S. Use the whole physical p0–2 tape (729 runes), first rune least significant. Fit only the 13-rune title; freeze the unique 13-digit key and decode all 716 black-body runes, including untouched p1–2. Terminal: the previously retired [moth-linked quotation](lp2-p55-moth-p5-terminal-sevenword-crib.md) is included as an algebraic comparison, not an authenticated selector. Exact 30-rune phrase is independently present in the solved LP1 Wisdom source. Read physical p55 from its end (last rune least significant), including incoming NG in the 76-rune integer. Fit 13 low-order digits; predict the other 17 crib digits without refitting. Separately grant a full 30-digit multiplier from the entire provisional quote and predict the untouched 46-rune prefix. The 13-digit width here is a comparison bound only, not a p55 instruction. No latent F hold, private carry or permutation is granted.

| Receiver | Unique key (decimal) | Frozen outcome |
|---|---:|---|
| p0–2 encryption multiplier | 7172048379122460754 | 716 body score -3.651515, p1–2 -3.664659 |
| p0–2 decryption multiplier | 6107270378568648712 | 716 body score -3.655038, p1–2 -3.641479 |
| p55 encryption multiplier (13 digits) | 6519992095688322062 | 0/17 withheld crib digits |
| p55 decryption multiplier (13 digits) | 4500851403794867706 | 0/17 withheld crib digits |

Both p55 30-digit fits require keys above the 13-digit bound; neither untouched 46-rune prefix is coherent (native physical-order trigram scores -3.684545 / -3.563240). Both opening body scores are near the untouched ciphertext baseline -3.668434. Opening encryption-multiplier candidate begins `U NG H D TH X AE R E U X C D O C M C I B U O G I M I TH R E R EA C TH EO C OE G E L C L TH TH IA NG EA R I R C J`. Exact forward replay passes for all candidates, as required algebraically, and is not evidence of authorship.

Twelve independently keyed native-text plants use two whole target-excluded solved donors (first KOAN and LOSS OF DIVINITY), both directions of multiplication and matching 13/30-digit full-width nonzero units. All twelve keys and 3300/3300 heldout runes recover exactly. Physical-order scores range -2.842448..-2.491761. Different key draws use one deterministic xorshift32 stream; donor windows are reused across variants, so the twelve plants are not twelve statistically independent source texts. No CI, no standalone Node run claimed; the identical experiment function ran successfully in connected V8. Exact native source blob 1b064ef6d85819b7d96adaff31a82d1ec551598f; corpus blob 054f2a0f780b7d46901acbe3d9bf4f0ac1801165.

**Decision:** the fixed complete large-unit receiver does not turn either conditional crib into unknown plaintext. Terminal 13-digit case is an exact all-key contradiction conditional on the 30-rune quote, not a language judgment. Opening and terminal 30-digit fits fail prospective language evidence. Do not widen this family or rescue the already weak cribs by adding private carries, longer unconstrained multipliers or resets. No change to established unknown-page status.

[Standalone SFT](../sims/lp2_base29_crib_unit_inference_sft.cjs) · [Raw output](lp2-base29-crib-unit-inference-output.json).


## Spacing-free blind 8-digit multiplier with literal Fehu holds (Agent31, 25 November)

**Decision: no nominated key has a complete original p0–2 inverse.** Distinct from compact-unit enumeration, fixed title/quote tests, and Agent41's [zero-carry intact-word interior lattice](lp2-chapter-base29-short-multiplier-exact.md). Grant any positive unit a<29^8, arbitrary initial carry 0<=s<a, literal plaintext F holds, continuous physical-forward decryption P=aC+s in the active BASE29 integer register. Printed separators ignored. The only plaintext premise is at least one occurrence of a frozen dictionary word having exactly ten non-F runes in the 249-rune p0 black development, preceded by at least eight consumed runes. Neither the historical BASE29 operation nor the eight-rune authentic key authenticates this receiver.

**Exact all-position nomination.** Enumerate every feasible hold mask of each 2,803-word dictionary form (16 distinct patterns) at every eligible physical position, and every prior eight consumed ciphertext digits. Visible zero may hold or consume; known plaintext F requires ciphertext zero and holds. Let X be those eight low-order digits followed by ten active anchor ciphertext digits, R=29^8, B=29^10, M=RB, and V the hypothesized ten active plaintext digits. The true multiplier gives a lattice point (a,y), y=aX-jM, 1<=a<R, y<= (V+1)R-1, y+a-1>=VR. Enumerate the enclosing rectangle exactly by Gauss-reduced rank-two basis (1,X),(0,M), then retain unit keys satisfying both inequalities. This is necessary and sufficient for a feasible local incoming carry, hence the union covers every key satisfying the anchor premise. The local context need not be globally feasible yet. No arbitrary phase or word boundary assumed.

**Exact latent-state inverse.** Enumerate every warmup mask for first 16 physical runes, each with >=8 consumed in all fixtures. For n active digits and integer X0, carry at the seam is one of floor(aX0/29^n)..floor((aX0+a-1)/29^n), at most two. For each carry intersect the low-digit interval with [0,29^n-1]; find smallest integer with all digits nonzero by replacing the first most-significant zero and all lower digits with ones. This gives an exact legal initial-carry/warmup witness per reachable state. Warmup is unscored; choosing one witness cannot remove later paths. Exact DP on (carry,last two plaintext runes), consume p=(a*c+s) mod29 !=0, or literal F hold at c=0. Max-sum native trigram score selects development winner, holding entire donor section out of LM. Merge only identical state/context. Freeze winner and seam state before suffix decoding. Separately propagate every nominated key and all admissible warmup states through full original as an exact retrospective feasibility test; this is not held-out selection. All full witnesses forward-replay exactly.

| Scope | Nominated keys | Legal fit | Full legal | Frozen key | Fit nats/rune | Withheld |
|---|---:|---:|---:|---|---:|---|
| WELCOME plant | 1623 | 9 | 1 | 40007690353 (true) | -2.713667 | 266/266 |
| LOSS OF DIVINITY plant | 1830 | 16 | 1 | 294507733379 (true) | -2.817035 | 506/506 |
| Original p0–2 body | 1486 | 7 | **0** | 343397204890 | -4.835032 | no legal first rune |

Both target-excluded native controls contain one eligible word and recover exact multiplier and all 772 withheld runes. Initial carries not identified: planted 29688762996 / 43475008872, legal warmup witnesses zero. No claim of exact full-prefix plaintext. Original scope global [13,729), 716 runes; 249 fit and 467 heldout. Best fit nonprose. Raw holdoutReached=1 counts attempted runes; first withheld rune has no legal transition. All six other legal development keys also fail full reachability. Exact rejection conditional on at least one eligible anchor, not every possible spacing-free plaintext. No authentic key or unknown plaintext. Do not widen the multiplication family without independent source-selected information.

[SFT](../sims/lp2_base29_lattice_blind_fhold_sft.cjs) (`node sims/lp2_base29_lattice_blind_fhold_sft.cjs all`) · [raw](lp2-base29-lattice-blind-fhold-output.json). The all-stage gates original on control recovery. Executed in connected V8. 2,934,855 exact lattice queries, 12,621 coefficient points, max box2, no cap. Inputs pinned corpus 054f2a0f780b7d46901acbe3d9bf4f0ac1801165; native 1b064ef6d85819b7d96adaff31a82d1ec551598f; wordfreq 140e1d22b5f8c45deddd2e8b25549d9d6307d938. Intermediate controls and original raw blobs eca261a2e2c1bf1967f3701ec180b6c902b2ca38 / 4160d37efbd2f26feb79c61f1af72361aae19b1a.
