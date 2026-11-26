"""Exact archived 2012 participant-page candidate SHA-512 gate; no network."""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
TARGET = "36367763ab73783c7af284446c59466b4cd653239a311cb7116d4618dee09a8425893dc7500b464fdaf1672d7bef5e891c6e2274568926a49fb4f45132c2a8b4"
PREFIX = ROOT / "resources" / "external"
FILES = (
    ("2012-sq6wmgv2zcsrix6t-valid-participant-rsa-message.asc", "30a45f2149bf46fd99d156d24b7132f8e0f207b3", 2500, (1617, 1612)),
    ("2012-sq6wmgv2zcsrix6t-unknown.asc", "0e69b063b379a8ccdd8a96815de318bcf65a1247", 2537, (1636, 1630)),
    ("2012-sq6wmgv2zcsrix6t-another-unknown.asc", "e2dbbad61d8dfb1a9efa736a331f183745ac157e", 2476, (1593, 1588)),
)

def git_blob_sha1(data: bytes) -> str:
    return hashlib.sha1(b"blob " + str(len(data)).encode("ascii") + b"\0" + data).hexdigest()

def extract(data: bytes) -> tuple[bytes, bytes]:
    header = re.search(rb"\r?\n\r?\n", data)
    assert header is not None
    signature = data.index(b"-----BEGIN PGP SIGNATURE-----")
    body = data[header.end():signature]
    cleartext = re.sub(rb"(?m)^- ", b"", body)
    cleartext = re.sub(rb"\r?\n\Z", b"", cleartext)
    return body, cleartext

def main() -> None:
    assert hashlib.sha512(b"abc").hexdigest() == "ddaf35a193617abacc417349ae20413112e6fa4e89a97ea20a9eeee64b55d39a2192992a274fc1a836ba3c23a3feebbd454d4423643ce80e2a9ac94fa54ca49f"
    previous = (PREFIX / "2012-sq6wmgv2zcsrix6t-onion-index.html").read_bytes()
    assert len(previous) == 1788
    assert hashlib.sha512(previous).hexdigest() == "71ae971c27c3852bb4648b7b3bd973568fe25ee8dfc930eb35010f40c0056d8fc9040069cfd0c17a194dbfb99b2c95e61a0dd0967bb2405833421712719e9fbb"
    matches = []
    for name, blob, size, expected_body_sizes in FILES:
        data = (PREFIX / name).read_bytes()
        assert len(data) == size and git_blob_sha1(data) == blob
        body, cleartext = extract(data)
        assert (len(body), len(cleartext)) == expected_body_sizes
        for label, payload in (("full", data), ("body", body), ("cleartext", cleartext)):
            digest = hashlib.sha512(payload).hexdigest()
            print(f"{name} {label} {len(payload)} bytes {digest}")
            if digest == TARGET:
                matches.append((name, label))
    midi = (ROOT / "resources" / "historical" / "cicada2012-midi-email.asc").read_bytes()
    assert len(midi) == 4322 and git_blob_sha1(midi) == "cbdb9899a5c77f364456f55e39bd25b73467d809"
    literal, cleartext = extract(midi)
    assert (len(literal), len(cleartext)) == (3440, 3435)
    for label, payload in (("body", literal), ("cleartext", cleartext)):
        digest = hashlib.sha512(payload).hexdigest()
        print(f"MIDI {label} {len(payload)} bytes {digest}")
        if digest == TARGET:
            matches.append(("MIDI", label))
    print("Matches:", matches)
    assert not matches

if __name__ == "__main__":
    main()
