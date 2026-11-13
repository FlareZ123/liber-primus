"""Identify May-2014 HSDir relays for the signed Cicada Stage11 onion.

Consumes only public Tor Metrics historical network-status consensuses.
The consensus indicates intended descriptor holders, not proof of receipt or
archived descriptor/public-key retention.

Run: python sims/lp2_2014_onion7_hsdir_consensus.py
"""
from __future__ import annotations

import base64
import bisect
import hashlib
import io
import json
import re
import tarfile
import urllib.request

ONION = "ky2khlqdf7qdznac"
PERMANENT_ID = base64.b32decode(ONION.upper())
ARCHIVE = (
    "https://collector.torproject.org/archive/relay-descriptors/"
    "consensuses/consensuses-2014-05.tar.xz"
)
SAMPLES = [
    ("2014-05-02-00-00-00", 16192),
    ("2014-05-02-20-00-00", 16193),
    ("2014-05-11-00-00-00", 16201),
    ("2014-05-11-20-00-00", 16202),
]


def descriptor_id(period: int, replica: int) -> bytes:
    """Historical Tor v2 no-cookie descriptor ID, SHA-1 of fixed fields."""
    assert 0 <= replica <= 1
    secret = hashlib.sha1(period.to_bytes(4, "big") + bytes([replica])).digest()
    return hashlib.sha1(PERMANENT_ID + secret).digest()


def decode_consensus(raw: bytes) -> tuple[str, list[dict[str, str | bytes]]]:
    """Read HSDir-flagged running/valid router statuses in a v3 consensus."""
    text = raw.decode("ascii", errors="replace")
    match = re.search(r"(?m)^valid-after (\d{4}-\d\d-\d\d \d\d:\d\d:\d\d)$", text)
    assert match, "This file is not a full network-status consensus"
    valid_after = match.group(1)
    relays = []
    pending = None
    for line in text.splitlines():
        if line.startswith("r "):
            fields = line.split()
            assert len(fields) >= 9, f"Malformed r line: {line!r}"
            identity = base64.b64decode(fields[2] + "=" * (-len(fields[2]) % 4))
            assert len(identity) == 20
            pending = {
                "name": fields[1],
                "identity": identity,
                "fingerprint": identity.hex().upper(),
                "ip": fields[6],
                "orport": fields[7],
            }
        elif line.startswith("s ") and pending:
            flags = set(line[2:].split())
            if {"HSDir", "Running", "Valid"} <= flags:
                relays.append(pending)
            pending = None
    assert 100 <= len(relays) <= 10000, f"Implausible HSDir count {len(relays)}"
    relays.sort(key=lambda entry: entry["identity"])
    return valid_after, relays


def expected_holders(
    relays: list[dict[str, str | bytes]], descriptor: bytes
) -> list[dict[str, str]]:
    """Three clockwise HSDirs with closest identity digests."""
    identities = [entry["identity"] for entry in relays]
    start = bisect.bisect_left(identities, descriptor)
    return [
        {
            "name": str(relays[(start + offset) % len(relays)]["name"]),
            "fingerprint": str(relays[(start + offset) % len(relays)]["fingerprint"]),
            "ip": str(relays[(start + offset) % len(relays)]["ip"]),
            "orport": str(relays[(start + offset) % len(relays)]["orport"]),
        }
        for offset in range(3)
    ]


def main() -> None:
    assert len(PERMANENT_ID) == 10
    assert PERMANENT_ID.hex() == "5634a3ae032fe03cb402"
    print("Fetching historical public May 2014 Tor relay consensuses.", flush=True)
    with urllib.request.urlopen(
        urllib.request.Request(ARCHIVE, headers={"User-Agent": "liber-primus-archive-locator/1.0"}),
        timeout=120,
    ) as request:
        compressed = request.read()
    print("archive_bytes", len(compressed), "sha256",
          hashlib.sha256(compressed).hexdigest(), flush=True)
    sample_map = {name: period for name, period in SAMPLES}
    seen = set()
    with tarfile.open(fileobj=io.BytesIO(compressed), mode="r:xz") as archive:
        for member in archive:
            if not member.isfile():
                continue
            matched = [name for name in sample_map if name in member.name]
            if not matched:
                continue
            for name in matched:
                if name in seen:
                    continue
                fileobj = archive.extractfile(member)
                assert fileobj is not None
                raw = fileobj.read()
                valid_after, relays = decode_consensus(raw)
                expected = name.replace("-", "", 0)  # names retained below
                assert valid_after == name[:10] + " " + name[11:13] + ":" + name[14:16] + ":" + name[17:19], (
                    valid_after, name
                )
                period = sample_map[name]
                rows = []
                for replica in (0, 1):
                    did = descriptor_id(period, replica)
                    rows.append(
                        {
                            "replica": replica,
                            "descriptor_id": base64.b32encode(did).decode("ascii").lower().rstrip("="),
                            "expected_HSDirs": expected_holders(relays, did),
                        }
                    )
                print(json.dumps(
                    {
                        "source_member": member.name,
                        "valid_after": valid_after,
                        "consensus_sha256": hashlib.sha256(raw).hexdigest(),
                        "eligible_hsdirs": len(relays),
                        "onion": ONION,
                        "period": period,
                        "replicas": rows,
                    },
                    sort_keys=True,
                ), flush=True)
                seen.add(name)
        assert seen == set(sample_map), f"Missing original consensus moments: {set(sample_map)-seen}"


if __name__ == "__main__":
    main()
