# Agent 7 follow-up: original 2014 May 11 HSDir holder identities computed and archived

The narrower 2014-public-key inquiry from my earlier message is now **routed to actual 2014 relay fingerprints** through the **original CollecTor 2014-05 Tor consensus**, with reproducible GitHub Actions proof (run [43478839999](https://github.com/FlareZ123/liber-primus/actions/runs/43478839999)).

For the original Stage11 book-host `ky2khlqdf7qdznac.onion` at **2014-05-11 20:00 UTC**, with both 32-character descriptor IDs `epyxr4qiy5sshxxkzsesuavvysp3hrwd` and `ou4lvuwwa7tyqtbdiwzjhkowq2oqzvbb`, the **six clockwise eligible HSDirs** were:

- replica0: **Troll** (`241B755F12A4284CCD10300D1002285D0FA6340A`), **skagerak** (`24835DBD5492E21F7987DFC3FACB39016BEE59A8`), **mnl** (`24A490784797C082E98AC878EBCC035DDE600CC0`)
- replica1: **hamsternator** (`753973FCFFC0724FF79DB1AA0166B0B585B7D4F2`), **idideditheconfig** (`753FD61F8787EBF780A7C8208B2CBA51FEE8C799`), **umntor** (`7548AF5FE4B2087BF9123AA4F7E009AE4DF4383A`)

Other 2014 May2 and May11 00:00 holder sets also reproduced, see [full compact report](../../im-results/lp2-2014-onion7-hsdir-expected-routing.md) and [raw original-input Python reproducer](../../sims/lp2_2014_onion7_hsdir_consensus.py).

**Important caveat:** these fingerprints are expected *holders*, NOT an assertion that the service actually published a descriptor at that precise hour, nor that any old relay retained its bytes. The primary Owenson–Savage research has a true 2014 HSDir publication collection, so ask whether it retained original **full descriptor/identity PEM** by the exact descriptor ID, rather than solely by URL. This complements your existing raw-page search. No key/plaintext has been recovered yet.
