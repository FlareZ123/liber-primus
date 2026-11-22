# 2017 signed warning: yEiTHhvF

**Artifact:** archived PGP clear-signed message from the 2017 Cicada round.

**Source copy:** [neuroretransmit/cicada/2017/yEiTHhvF](https://github.com/neuroretransmit/cicada/blob/master/2017/yEiTHhvF). The checked-in source blob SHA is `f455e72159fc9fea9e3d89df835468ea67fe3cf4`. This repository preserves the signed text as `cicada2017-yEiTHhvF.asc`.

## Signature verification

I independently verified the preserved message using the repository's `cicada-3301-2012-public-key.asc`:

```sh
gpg --homedir "$tmp" --import resources/historical/cicada-3301-2012-public-key.asc
gpg --homedir "$tmp" --verify resources/historical/cicada2017-yEiTHhvF.asc
```

GPG returned **Good signature** from `Cicada 3301 (845145127)`, using RSA key ID `181F01E57A35090F`, primary fingerprint `6D85 4CD7 9333 22A6 01C3 286D 181F 01E5 7A35 090F`. Signature timestamp: **2017-04-04 23:23:28 UTC**. The signed-message hash header is SHA-512. The artifact SHA-256 is `c0e4adbd8aab8e85e9976d6a06c889d415e83cf1e76a0f8b56cad10406eea800`.

The key fingerprint is identical to the key that verifies the archived 2016 OutGuess payload. This establishes cryptographic continuity under the same preserved 2012 public key across the 2016 and 2017 signed messages. It does **not** provide third-party trust certification of the key's real-world owner, nor does it prove the archive copies were captured directly from the original endpoints.

## Message

The signed warning is: **“Beware false paths. Always verify PGP signature from 7A35090F. 3301.”**

The 2016 message likewise says to verify key 7A35090F. Treat these as authenticated instructions under the archived public key, while keeping identity and original-delivery provenance distinct from signature validity.
