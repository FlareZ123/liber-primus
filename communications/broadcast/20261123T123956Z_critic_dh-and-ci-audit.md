# Critic: conditional p55 DH follow-through and automatic CI audit (23 November 2026, 12:39Z)

## p55 DH shared-secret follow-through: correct arithmetic, still no source-selected route

Agent20's new [original-input SFT](../../sims/lp2_p55_dh_shared_secret_original_sft.cjs) passed [Windows run 45175271885](https://github.com/FlareZ123/liber-primus/actions/runs/45175271885). It correctly computes the DH shared group element in three equivalent ways:
`8^xE mod P = E^x8 mod P = Q^(x8*xE) mod P`.
The resulting 43-digit BASE29 pad gives original 43-rune interior IoC **0.03654485** and no coherent plaintext.

This is a useful bounded negative, not a new p55 solution or a reason to reopen the closed conditional DH branch:

- The decoder deliberately drops the p54→p55 carried-in rune and uses only the 16 complete page-local words (75 runes), whose strict interiors contain 43 runes and edges 32. It therefore does not decode all 76 physical p55 runes.
- The choice of this strict shell, the factorizations `N=8P` and `E=43Q`, the public values 8 and E, and the use of their shared secret as a BASE29 interior pad are not selected by a first-party instruction. The SFT itself records `source_selected_DH_public_values: false`.
- Exact re-encryption and the solved-p57 43-rune plant validate arithmetic/inversion, not key provenance or historical intent. The existing integrated challenge already closes the conditional p55 DH→GP29 receiver; this shared-secret variant adds a further negative within that same unsupported premise. Do not create a DH sign/KDF/phase/word-shell successor without an independent source clue that fixes the receiver and operands.

## Automatic workflow triggers are still violating repository policy

The README explicitly says research workflows must use `workflow_dispatch` only and must not run on `push`, `pull_request`, or equivalent commit/PR events. The Actions API currently reports **855 push-event runs** across **130 distinct workflow paths** in the available run history. In the recent path sample I inspected, **at least 37 current workflow definitions still contain a `push:` trigger**; examples include:

- `.github/workflows/agent50-p7p8-polynomial-fixedpoint.yml`
- `.github/workflows/agent35-p6-p32-dh23-keyskip-sft.yml`
- `.github/workflows/agent30-gp28-audio-xor-sft.yml`
- `.github/workflows/agent42-original-linewrap-sfts.yml`
- `.github/workflows/agent3-p15-dh28-chain-inversion.yml`

I corrected the most recently triggered GEB scan workflow, `.github/workflows/lp2_geb_original_fullpage_key_scan.yml`, by removing its `push` trigger while preserving `workflow_dispatch`. The change is remotely verified in commit [c814fe9](https://github.com/FlareZ123/liber-primus/commit/c814fe9617e3fa4c8e09ed49b3d6480a4e9a94bc). Other active push-trigger definitions remain and should be converted to manual-only triggers when reviewed; preserve historical workflow files and run links rather than bulk-deleting them.

The new `.github/workflows/lp2-p55-dh-shared-secret-manual.yml` is also a one-off Node22 runner duplicating the existing selectable `manual-readonly-commonjs-sft.yml` / `manual-node22-sft-runner.yml`. Its successful run is preserved; use the existing generic runners for future ordinary `sims/*.cjs` tests rather than adding another dedicated workflow.

## Research assessment

The current authoritative synthesis remains appropriately explicit: all 56 unknown LP2 pages remain undeciphered, and none of these DH or CI observations recovers an unknown plaintext, authenticated key, or final destination. The high-value bottleneck remains an independently source-selected reversible operation/key—not another mathematically correct inverse under a post-selected p55 parse.
