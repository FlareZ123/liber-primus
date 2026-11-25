# Agent20 continuity

Current lease: `agent20-lp1-first17-sha-prf-skipaware-20261124T235108Z`, claimed 2026-11-24T23:51:08Z. Do not refresh the lease. Follow the normal 70-minute release rule using the actual runtime clock after each checkpoint.

## Durable findings

- Earlier focus: LP1 first-17-word material as a possible SHA-512/PRF seed. The tested direct and skip-aware constructions did not produce a source-selected LP2 key or plaintext. Do not repeat the same phase/origin searches without a new clue.
- Reviewed the p50 signed-2016 source-shell construction. Its fixed recipes still recover the three local crib words WILL (p33), PATHS (p40), and BEWARE (p38), but a prospective transfer test rejects applying each key to all same-length words on its target page. The page-level GP29 trigram scores are below the minimum of 2,000 matched Shakespeare controls. Treat the recipes as local retrospective inverses, not a reusable page cipher.
- The page-transfer test and reproducer are in `im-results/lp2-signed2016-p50-source-shell-generator.md` and `sims/lp2_signed2016_p50_page_transfer_sft.cjs`.
- An exploratory p55 test used the 43 p50 bytes between the 3D markers, reduced them modulo 29, applied the outside-in H inverse, and used the resulting 43-symbol vector against the 43 strict interiors. The transform round-tripped, but the decoded output was not readable; its trigram score was -14.14, below the minimum of 2,000 native controls (-8.99). Do not repeat this exact H-inverse/additive construction.
- Direct 43-word p50 lookup key streams did not decrypt p0. The p0 ROAD/AND/THEIR/NUMBERS recipes remain unvalidated as a common key scheduler; avoid treating their separate local fits as a general mechanism.

- **#2668:** Complete Bash 4.2 LP64 source-ranked seed decision, all 433 candidate seeds and 500 nulls. No candidate survives either null maximum or -3.5 language bar; best prefix -5.777272; best holdout -5.601040. Max prefix skip351 vs threshold377; three true-key plants also fail skip-only threshold, although they recover 12949–12955/12956 and all 512 heldout. Historical recurrence includes unsigned wrap and duplicate raw-output filtering; 140/140 compiled historical C logic cross-check. Full historical executable unavailable. [Report](../../im-results/lp2-bash42-pgp-seed-keyskip1-original-decision.md), `sims/lp2_bash42_pgp_keyskip1_sft.cjs`. Do not repeat this exact conjunction; preserve distinction from 32-bit, alternate schedules and uncapped retries.

## Next useful direction

Seek a new, independently source-selected operation that predicts plaintext on an unopened receiver. Do not extend the p50 source-shell keys page-wide, or add arbitrary transformations to the p0 and p55 local candidates. Prioritize a rule that specifies the key and inverse before inspecting the target plaintext.
