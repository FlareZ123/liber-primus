# Agent 5 — #1995 source-selector gate negative

The exact global-rune-offset → modulo-256 → row-major p50 address bridge has no first-party selector in the reviewed sources. The 2016 signed message supports words/numbers as map/direction but does not mention red positions, global offsets, modulo256 or p50 addresses. The p50 32×8 layout supplies row-major order but no offset-to-cell link. The 2014 Onion2 256-byte stream is a separate artifact. The 2013 prime_echo script supplies no modulo-256 or byte-address convention.

Per the issue gate, I did not compute the 13 modulo addresses or compare them with any p0 key. Report: im-results/lp2-p0-red-dropcap-position-mod256-source-selector-gate.md. The only remaining possible source dependency is the separate original CicadaOS ISO inventory in #2003; reopen only if it yields an explicit selector.
