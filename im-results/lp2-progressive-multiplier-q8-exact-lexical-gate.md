# #2651 — progressive multiplicative affine q8 exact lexical inverse

## Decision

No member of the frozen family admits an intact-group lexical solution on the first 162 original p40–53 runes (global 9640, 37 complete groups). All 27 nonidentity multipliers and all eight visible-zero masks fail before DFS. This is a finite-register rejection, not a proof against every possible out-of-register plaintext or resegmentation.

Freeze C=a^floor(j/8)*P+K[j mod8] mod29 for nonzero P, with literal F emitting 0 and holding j. Initial j=0; no private phase slopes or additional progression. Prior #2641 tested additive drift, not this multiplicative family.

## Exact constraints

For each of the eight visible-zero masks the consuming clock j is determined. Since P must be nonzero, K[j mod8] cannot equal the observed consuming ciphertext rune, regardless of multiplier. Intersect these necessary per-phase exclusions across the entire prefix. For each of the 27 multipliers and each group, enumerate every allowed native spelling of the exact printed length. Its consuming positions prescribe K[phase]=C-a^floor(j/8)*P mod29; repeated phases must agree. Held positions must be F, consuming positions must not. Intersect with the necessary offset masks. Enforce pairwise arc consistency on common phase assignments, followed by exhaustive DFS if needed.

The frozen 33,394-entry native-register dictionary includes two documented GP tokenization alternatives, solved native words and all 29 one-rune forms, so the singleton assumption is permissive. Original: 216 branches, 216 domain/arc rejections, zero DFS nodes, zero cap, zero solutions. There is no key to freeze for an original continuation; no later original text was scored.

## Calibration

Fit uses target-excluded dictionaries; the heldout decoder uses only target-excluded native trigram counts. Each key is planted independently; all 28 possible nonzero multipliers (including 1) are searched in controls. Freeze the complete recovered (a,K,active index) before continuation. 

| Native section | a | Order | Fit | Legal full fit histories | Distinct key/terminal states | Heldout exact |
|---|---:|---:|---:|---:|---:|---:|
| WELCOME |28|2|121|2|1|74/74|
| KOAN 1 |7|7|120|1|1|50/50|
| JPG107–167 |2|28|121|1|1|47/47|
| WELCOME ordinary comparison |1|1|121|1|1|74/74|

Three progressive plants: 171/171 withheld runes; ordinary comparison 74/74; all exact replay. Order-two fit has two local F histories (held position 40 versus 41), but both recover the same complete key, multiplier and terminal clock. An additional 131-rune fit still has two local histories and uniquely fixes the key-state, yielding 77/77 withheld. This overlapping calibration refinement is not counted as another independent plant. All plants have consuming ciphertext zeros as well as literal Fs. No target OOV fit words. No caps.

## Reproduction

`node sims/lp2_progressive_multiplier_q8_exact_lexical_sft.cjs`

Raw: `im-results/lp2-progressive-multiplier-q8-exact-output.json`. Exact function executed in JS runtime and saved as standalone Node SFT. No Windows CI execution claimed.

Retire the specified intact-group native-register model only. No new plaintext or key.
