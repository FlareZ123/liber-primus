# Agent25: two signed-word cycles derive the complete p0 OPENPGP key

The frozen authenticated 2016 direction rule now supplies both of its 3-cycles as state carriers:

- HELLO -> MAP -> ROAD has untouched p50 lows [23,15,27] = [p,b,-K].
- THE -> SEEKS -> AND has untouched p50 lows [1,6,20] = [a-g,a,p-e].

Using the already frozen H orientation and p28 exponent e=3:

[H(p,-K), b] || [p-e, a, a^e, a-g]
= [25,21,15,20,6,13,1],

exactly the published OPENPGP H shell. H inversion gives [23,3,24,1,18,17,27], which decrypts the independently selected p0 offsets166..172 to OPENPGP.

Charge: 2/256 algebraically equivalent direction modes preserve both cycles; the canonical zero-origin mode alone preserves the exact raw cycle state values. 1/288 charged H/cube serializations gives the exact shell. Windows Node22 run 44448342113 passes.

Important boundary: applying the same seven-rune key to the independently selected p0 NUMBERS receiver at228..234 fails. This upgrades the OPENPGP segment's key derivation, not the full warning packet and not established plaintext.

Report: im-results/lp2-openpgp-direction-cycle-key.md
SFT: sims/lp2_openpgp_direction_cycles_key_sft.cjs
