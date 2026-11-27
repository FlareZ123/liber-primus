"""Historical explicit-format gate, separate from any OAEP private-key search."""
import base64, re, zlib, json
B64 = """eJwBswBM/zEwADE2MgBDeXBoZXJ0ZXh0LE2jxJS1EzMc80kOK+hra1GKnXgQKQgVitIy8NgA7kxn
2u8jNQDvlu0uymNNiu6XVCCn66axGH0IZ9w4Af3K/yRgjObsfA1Q7QqpXNALJ9FFPgYl5rh07cBP
M9kbSH6DynU/5cYgQod2KymjWcIvKx3FkjV4UOGakDnBf1eQp1uwvn3KxDVwTyzPqbMnZvOA06Ec
AfKtyz1hEK/UBXkeMeVrnV5SQQ=="""
# neuroretransmit/cicada@ade9a02889ef8acbc8cde8edbfd0a785c369f4c3,
# 2014/002-first-onion/1033.jpg.asc, signed public modulus and ciphertext.
N = 7557912574608535164426718292058021255641310207187633095795069445700059210248050757270234679993673844203148013173091173786572116639

def check(member, n=N):
    try:
        d = zlib.decompressobj()
        raw = d.decompress(member, 1 << 20)
    except zlib.error:
        return 'zlib', None
    if not d.eof or d.unused_data or d.unconsumed_tail:
        return 'member_boundary', None
    m = re.fullmatch(rb'10\x00([1-9][0-9]*)\x00Cyphertext(.*)', raw, re.S)
    if m is None or int(m[1]) != len(m[2]):
        return 'serialized_field', None
    data = m[2]
    width = (n.bit_length()+7)//8
    if len(data)%width:
        return 'block_width', None
    blocks = [data[i:i+width] for i in range(0,len(data),width)]
    if any(int.from_bytes(b, 'big') >= n for b in blocks):
        return 'representative_range', None
    return 'valid_intermediate', blocks

def main():
    member = base64.b64decode(''.join(B64.split()),validate=True)
    raw = zlib.decompress(member)
    status, blocks = check(member)
    assert status == 'valid_intermediate' and len(blocks) == 3 and len(blocks[0])==54
    header=raw[:-162]
    controls = {
        'trailer': member+b'X',
        'truncated': member[:-1],
        'wrong_field': zlib.compress(raw.replace(b'Cyphertext',b'Ciphertext',1)),
        'wrong_count': zlib.compress(raw.replace(b'162\0',b'161\0',1)),
        'valid_count_wrong_width': zlib.compress(b'10\0' + b'161\0Cyphertext' + b''.join(blocks)[:-1]),
        'valid_count_out_of_range': zlib.compress(header + N.to_bytes(54,'big')+b''.join(blocks[1:])),
    }
    result={
        'actual':{'member_bytes':len(member),'decompressed_bytes':len(raw),'header_hex':header.hex(),'payload_bytes':sum(map(len,blocks)),'modulus_bits':N.bit_length(),'block_width':len(blocks[0]),'block_count':len(blocks),'status':status},
        'controls':{k:check(v)[0] for k,v in controls.items()},
        'prior_original_transports':{str(n):{'bytes':n,'remainder_mod54':n%54} for n in (256,153,43)}
    }
    assert list(result['controls'].values()) == ['member_boundary','member_boundary','serialized_field','serialized_field','block_width','representative_range']
    print(json.dumps(result,indent=2))

if __name__=='__main__': main()
