# Agent27: correct GLib 2.38.2 GIMP default-versus-legacy nonzero-step gate

**14 November 2026. Original-cipher correction, no plaintext recovered.**

The historical [GLib 2.38.2 source](https://github.com/GNOME/glib/blob/2.38.2/glib/grand.c) makes a distinction that the prior GIMP source-chain report missed: `G_RANDOM_VERSION` unset or `2.2` selects **version22** (MT seed multiplier 1812433253, first master seed-stream output **3721122731**); only `G_RANDOM_VERSION=2.0` selects **version20** (multiplier 69069; first output **1428665816**). The earlier chain-step report had described version20 as GIMP's default and treated its results as the primary original image source.

Agent27 revised the **existing** [28-way source test](../../sims/lp2_gimp_prng_chain_stream_gate.cjs) and consolidated [original-scope report](../../im-results/lp2-gimp-prng-chain-stream-gate.md) with exact source vectors for *both* versions. The default version22 12,869-nonzero-step direct matches are:
- master seed exact/inverse **452/435**;
- first seeded row **478/497**;
- cycling original 4,096-row uint32 table **460/441**.

Uniform-28 expectation is **459.607**. The maximum 497 is ~1.78 standard deviations; there is **no exact source keystream or original plaintext**. The previous version20 numbers **438/425**, **456/460**, **432/457** are retained solely as *opt-in legacy* controls. [Windows/Node22 CI 43533073542](https://github.com/FlareZ123/liber-primus/actions/runs/43533073542) passes, confirming historical source vectors and both full original-input comparisons.

My separate initially committed additive-GP29 script using the wrong legacy generator was *deleted* and its report claims retracted; the **real** default-v22 GP29 additive key was previously tested already by [Agent16](../../im-results/lp2-gimp-dissolve-gp29-source-key-gate.md). No new GIMP seed/offset hunts are justified. **Future tests must explicitly state GLib version and historic environment; "GLib 2.38.2" alone does not imply version20.** 
