// Exhaustive source-motivated test of Perl 5.14.2's default-seed
// drand48-backed rand() against the 2014 Cicada onion-2 256-byte stream.
//
// Perl 5.14.2 pp.c: pp_rand() and argument-less pp_srand() call seed().
// util.c: Perl_seed() reads a U32 from /dev/urandom by default (unless
// PERL_NO_DEV_RANDOM is defined), falling back to time/PID/stack data.
// This program tests the 32-bit seed space under a POSIX drand48 backend;
// it does not assume the historical onion-2 service actually used Perl.
#include <array>
#include <algorithm>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <vector>
using namespace std;

static constexpr uint64_t MASK=(1ULL<<48)-1;
static constexpr uint64_t A=0x5deece66dULL, C=0xbULL;
static const string TARGET_HEX=
"634292ba49fe336edada779a34054a335c2ec12c8bbaed4b92dcc05efe98f76abffdc2389bdb9de2cf20c009acdc1945ab095a52609a5c219afd5f3b3edf10fcb25950666dfe8d8c433cd10c0b4c72efdfe12c6270d5cfde291f9cf0d73cb1211140136e4057380c963d70c76948d9cf6775960cf98fbafa435c44015c5959837a0f8d9f46e094f27c5797b7f8ab49bf28fa674d2ad2f726e197839956921dab29724cd48e1a81fc9bab3565f7513e3e368cd0327b47cf595afebb78d6b5bca92ba021cd6734f4362a0b341f359157173b53d49ea5dff5889d2c9de6b0d7e8c615286ce596bfa83f50b6eeabd153aaf50cd75f39929ba11fb0f8e8d611442846";
static const array<int,31> SOURCE_K={1,4,1,2,3,3,2,1,5,3,3,1,4,1,4,1,1,3,2,7,2,1,2,3,1,1,3,5,3,3,2};
static constexpr int FIRST_POS=152; // 1-based

static vector<uint8_t> decode_hex(const string& h) {
  vector<uint8_t> v; v.reserve(h.size()/2);
  for(size_t i=0;i<h.size();i+=2)
    v.push_back((uint8_t)strtoul(h.substr(i,2).c_str(),nullptr,16));
  return v;
}
static inline uint64_t step(uint64_t s) { return (A*s+C)&MASK; }
static inline uint8_t out_value(uint64_t s,int scale) {
  return (uint8_t)(((__uint128_t)s*(unsigned)scale)>>48);
}
static inline int out_interval(uint64_t s) {
  return (int)(((__uint128_t)s*7)>>48)+1;
}

struct Affine { uint64_t m,a; };
static Affine compose(Affine f,Affine g) {
  return {(f.m*g.m)&MASK,(f.m*g.a+f.a)&MASK};
}
static Affine lcg_power(uint64_t n) {
  Affine r{1,0}, b{A,C};
  while(n) {
    if(n&1) r=compose(b,r);
    b=compose(b,b);
    n>>=1;
  }
  return r;
}
static uint32_t inv32(uint32_t a) {
  uint32_t x=a;
  x*=2u-a*x; x*=2u-a*x; x*=2u-a*x; x*=2u-a*x; x*=2u-a*x;
  return x;
}
static uint64_t inv48(uint64_t a) {
  uint64_t x=a;
  x*=2ULL-a*x; x*=2ULL-a*x; x*=2ULL-a*x;
  x*=2ULL-a*x; x*=2ULL-a*x; x*=2ULL-a*x;
  return x&MASK;
}
static uint64_t inv_step(uint64_t s) {
  static const uint64_t IA=inv48(A);
  return (IA*(s-C))&MASK;
}

struct SeedMap {
  uint32_t m32,add32,inv_m32;
  uint16_t low16;
};
static SeedMap seed_map_at_draw(uint64_t draw_n) {
  const Affine f=lcg_power(draw_n);
  const uint64_t b=(f.m*0x330eULL+f.a)&MASK;
  const uint32_t m=(uint32_t)f.m;
  return {m,(uint32_t)(b>>16),inv32(m),(uint16_t)(b&0xffff)};
}
static uint32_t seed_for_high32(uint32_t x,const SeedMap& m) {
  return m.inv_m32*(uint32_t)(x-m.add32);
}
static uint64_t state_for_high32(uint32_t x,const SeedMap& m) {
  return ((uint64_t)x<<16)|m.low16;
}

// Enumerate exactly the high-32-bit state values that produce output y.
// For a fixed draw count, high32(state) is a bijective affine function of
// the 32-bit seed because the drand48 multiplier is odd.
static pair<uint64_t,uint64_t> x_range_for_output(int scale,int y,uint16_t low16) {
  const __int128 T=(__int128)1<<48;
  const __int128 den=(__int128)scale*65536;
  const __int128 lo_num=(__int128)y*T-(__int128)scale*low16;
  const __int128 hi_num=(__int128)(y+1)*T-1-(__int128)scale*low16;
  __int128 lo=lo_num<=0?0:(lo_num+den-1)/den;
  __int128 hi=hi_num<0?-1:hi_num/den;
  if(lo<0) lo=0;
  if(hi>(__int128)0xffffffffULL) hi=0xffffffffULL;
  if(lo>(__int128)0xffffffffULL || hi<lo) return {1,0};
  return {(uint64_t)lo,(uint64_t)hi};
}

struct SearchStats {
  uint64_t candidate_states=0,prefix2=0,prefix3=0,prefix4=0;
  uint64_t first_interval_passes=0,full_matches=0;
  vector<uint32_t> prefix4_seeds,full_seeds;
};

static SearchStats search_direct(const vector<uint8_t>& target,int scale) {
  SearchStats z;
  const SeedMap m=seed_map_at_draw(1);
  auto [lo,hi]=x_range_for_output(scale,target[0],m.low16);
  z.candidate_states=hi>=lo?hi-lo+1:0;
  for(uint64_t xx=lo;xx<=hi;xx++) {
    const uint32_t x=(uint32_t)xx;
    const uint32_t seed=seed_for_high32(x,m);
    uint64_t s=state_for_high32(x,m);
    if(out_value(s,scale)!=target[0]) continue;
    s=step(s); if(out_value(s,scale)!=target[1]) continue; z.prefix2++;
    s=step(s); if(out_value(s,scale)!=target[2]) continue; z.prefix3++;
    s=step(s); if(out_value(s,scale)!=target[3]) continue;
    z.prefix4++; z.prefix4_seeds.push_back(seed);
    bool ok=true;
    for(int i=4;i<(int)target.size();i++) {
      s=step(s);
      if(out_value(s,scale)!=target[i]) { ok=false; break; }
    }
    if(ok) { z.full_matches++; z.full_seeds.push_back(seed); }
  }
  return z;
}

static bool full_interleaved_match(uint32_t seed,const vector<uint8_t>& target,
                                   int scale,int order,const array<int,31>& kvals) {
  uint64_t s=((uint64_t)seed<<16)|0x330eULL;
  for(int i=0;i<(int)target.size();i++) {
    if(order==0) { // byte then delay
      s=step(s);
      if(out_value(s,scale)!=target[i]) return false;
      s=step(s);
      if(i>=FIRST_POS-1 && i<FIRST_POS-1+(int)kvals.size())
        if(out_interval(s)!=kvals[i-(FIRST_POS-1)]) return false;
    } else { // delay then byte
      s=step(s);
      if(i>=FIRST_POS-1 && i<FIRST_POS-1+(int)kvals.size())
        if(out_interval(s)!=kvals[i-(FIRST_POS-1)]) return false;
      s=step(s);
      if(out_value(s,scale)!=target[i]) return false;
    }
  }
  return true;
}

static SearchStats search_interleaved(const vector<uint8_t>& target,int scale,
                                      int order,const array<int,31>& kvals) {
  SearchStats z;
  // Byte 152 is draw 303 for byte->delay and draw 304 for delay->byte:
  // 151 earlier events each consume exactly two rand() calls.
  const uint64_t byte_draw=(order==0)?303:304;
  const SeedMap m=seed_map_at_draw(byte_draw);
  auto [lo,hi]=x_range_for_output(scale,target[FIRST_POS-1],m.low16);
  z.candidate_states=hi>=lo?hi-lo+1:0;
  for(uint64_t xx=lo;xx<=hi;xx++) {
    const uint32_t x=(uint32_t)xx;
    const uint32_t seed=seed_for_high32(x,m);
    const uint64_t s=state_for_high32(x,m);
    if(out_value(s,scale)!=target[FIRST_POS-1]) continue;
    const uint64_t first_interval_state=(order==0)?step(s):inv_step(s);
    if(out_interval(first_interval_state)!=kvals[0]) continue;
    z.first_interval_passes++;
    // Replay from the first byte, checking all 256 bytes and all 31 intervals.
    if(full_interleaved_match(seed,target,scale,order,kvals)) {
      z.full_matches++;
      z.full_seeds.push_back(seed);
    }
  }
  return z;
}


static bool full_interleaved_suffix_match(uint32_t seed,const vector<uint8_t>& suffix,
                                          int scale,int order,const array<int,31>& kvals) {
  uint64_t s=((uint64_t)seed<<16)|0x330eULL;
  for(int i=0;i<(int)suffix.size();i++) {
    const int pos=143+i;
    if(order==0) {
      s=step(s);
      if(out_value(s,scale)!=suffix[i]) return false;
      s=step(s);
      if(pos>=152&&pos<=182 && out_interval(s)!=kvals[pos-152]) return false;
    } else {
      s=step(s);
      if(pos>=152&&pos<=182 && out_interval(s)!=kvals[pos-152]) return false;
      s=step(s);
      if(out_value(s,scale)!=suffix[i]) return false;
    }
  }
  return true;
}
static SearchStats search_interleaved_suffix(const vector<uint8_t>& suffix,int scale,
                                             int order,const array<int,31>& kvals) {
  SearchStats z;
  // Suffix starts at byte 143. Byte 152 is its tenth event: draw 19 or 20.
  const uint64_t byte_draw=(order==0)?19:20;
  const SeedMap m=seed_map_at_draw(byte_draw);
  const int idx=152-143;
  auto [lo,hi]=x_range_for_output(scale,suffix[idx],m.low16);
  z.candidate_states=hi>=lo?hi-lo+1:0;
  for(uint64_t xx=lo;xx<=hi;xx++) {
    const uint32_t x=(uint32_t)xx;
    const uint32_t seed=seed_for_high32(x,m);
    const uint64_t state=state_for_high32(x,m);
    if(out_value(state,scale)!=suffix[idx]) continue;
    const uint64_t interval_state=(order==0)?step(state):inv_step(state);
    if(out_interval(interval_state)!=kvals[0]) continue;
    z.first_interval_passes++;
    if(full_interleaved_suffix_match(seed,suffix,scale,order,kvals)) {
      z.full_matches++;
      z.full_seeds.push_back(seed);
    }
  }
  return z;
}
static vector<uint8_t> generate_interleaved_suffix(uint32_t seed,int scale,int order,
                                                   array<int,31>& kvals) {
  vector<uint8_t> out; out.reserve(114);
  uint64_t s=((uint64_t)seed<<16)|0x330eULL;
  for(int i=0;i<114;i++) {
    const int pos=143+i;
    if(order==0) {
      s=step(s); out.push_back(out_value(s,scale));
      s=step(s);
      if(pos>=152&&pos<=182) kvals[pos-152]=out_interval(s);
    } else {
      s=step(s);
      if(pos>=152&&pos<=182) kvals[pos-152]=out_interval(s);
      s=step(s); out.push_back(out_value(s,scale));
    }
  }
  return out;
}

static vector<uint8_t> generate_direct(uint32_t seed,int scale) {
  vector<uint8_t> out; out.reserve(256);
  uint64_t s=((uint64_t)seed<<16)|0x330eULL;
  for(int i=0;i<256;i++) { s=step(s); out.push_back(out_value(s,scale)); }
  return out;
}
static vector<uint8_t> generate_interleaved(uint32_t seed,int scale,int order,
                                            array<int,31>& kvals) {
  vector<uint8_t> out; out.reserve(256);
  uint64_t s=((uint64_t)seed<<16)|0x330eULL;
  for(int i=0;i<256;i++) {
    if(order==0) {
      s=step(s); out.push_back(out_value(s,scale));
      s=step(s);
      if(i>=151&&i<=181) kvals[i-151]=out_interval(s);
    } else {
      s=step(s);
      if(i>=151&&i<=181) kvals[i-151]=out_interval(s);
      s=step(s); out.push_back(out_value(s,scale));
    }
  }
  return out;
}
static bool contains(const vector<uint32_t>& xs,uint32_t x) {
  return find(xs.begin(),xs.end(),x)!=xs.end();
}
static void print_stats(const char* name,const SearchStats& s) {
  printf("%s: candidates=%llu prefix2=%llu prefix3=%llu prefix4=%llu "
         "first_interval_passes=%llu full_matches=%llu",
         name,(unsigned long long)s.candidate_states,
         (unsigned long long)s.prefix2,(unsigned long long)s.prefix3,
         (unsigned long long)s.prefix4,
         (unsigned long long)s.first_interval_passes,
         (unsigned long long)s.full_matches);
  for(uint32_t x:s.prefix4_seeds) printf(" prefix4_seed=0x%08x",x);
  for(uint32_t x:s.full_seeds) printf(" full_seed=0x%08x",x);
  printf("\n");
}

int main() {
  const vector<uint8_t> target=decode_hex(TARGET_HEX);
  if(target.size()!=256) { fprintf(stderr,"bad target length %zu\n",target.size()); return 2; }

  // Known fixture from the prior Perl_drand48 time-seed test.
  const array<int,8> fixture={3,0,170,175,27,131,197,178};
  uint64_t fs=((1389060782ULL&0xffffffffULL)<<16)|0x330eULL;
  for(int i=0;i<8;i++) {
    fs=step(fs);
    if(out_value(fs,256)!=fixture[i]) { fprintf(stderr,"drand48 fixture mismatch at %d\n",i); return 3; }
  }

  // Positive controls: recover a planted 32-bit seed exactly.
  const uint32_t plant=0x12345678u;
  for(int scale:{256,255}) {
    const auto p=generate_direct(plant,scale);
    const auto z=search_direct(p,scale);
    if(!contains(z.full_seeds,plant)) { fprintf(stderr,"direct positive control failed scale=%d\n",scale); return 4; }
    printf("positive_control_direct_scale_%d: recovered=0x%08x matches=%llu\n",
           scale,plant,(unsigned long long)z.full_matches);
  }
  for(int order:{0,1}) {
    array<int,31> pk{};
    const auto p=generate_interleaved(plant,256,order,pk);
    const auto z=search_interleaved(p,256,order,pk);
    if(!contains(z.full_seeds,plant)) { fprintf(stderr,"interleaved positive control failed order=%d\n",order); return 5; }
    printf("positive_control_interleaved_order_%s: recovered=0x%08x matches=%llu\n",
           order==0?"byte-delay":"delay-byte",plant,(unsigned long long)z.full_matches);
  }


  // The timing corpus begins at byte 143, not at byte 1. Test the
  // source-supported alternative that the PRNG stream begins with this suffix.
  const vector<uint8_t> suffix(target.begin()+142,target.end());
  for(int scale:{256,255}) {
    auto p=generate_direct(plant,scale); p.resize(114);
    auto z=search_direct(p,scale);
    if(!contains(z.full_seeds,plant)){fprintf(stderr,"suffix direct positive control failed scale=%d\n",scale);return 6;}
    printf("positive_control_suffix_direct_scale_%d: recovered=0x%08x matches=%llu\n",scale,plant,(unsigned long long)z.full_matches);
  }
  for(int order:{0,1}) {
    array<int,31> pk{};
    auto p=generate_interleaved_suffix(plant,256,order,pk);
    auto z=search_interleaved_suffix(p,256,order,pk);
    if(!contains(z.full_seeds,plant)){fprintf(stderr,"suffix interleaved positive control failed order=%d\n",order);return 7;}
    printf("positive_control_suffix_interleaved_order_%s: recovered=0x%08x matches=%llu\n",order==0?"byte-delay":"delay-byte",plant,(unsigned long long)z.full_matches);
  }

  printf("source_target_sha256=05acf0d8e2ba7d851e2b4bbc32b85e461a1bd41576a50504487f33d4c1522c56\n");
  printf("target_first4=");
  for(int i=0;i<4;i++) printf("%02x",target[i]);
  printf(" target_pos152=%02x\n",target[151]);

  const auto t0=chrono::steady_clock::now();
  for(int scale:{256,255}) {
    const auto z=search_direct(target,scale);
    char name[80]; snprintf(name,sizeof(name),"original_direct_int_rand_%d",scale);
    print_stats(name,z);
  }
  for(int scale:{256,255}) for(int order:{0,1}) {
    const auto z=search_interleaved(target,scale,order,SOURCE_K);
    char name[100];
    snprintf(name,sizeof(name),"original_interleaved_scale_%d_order_%s",
             scale,order==0?"byte-delay":"delay-byte");
    print_stats(name,z);
  }

  printf("suffix_start_pos=143 suffix_length=%zu suffix_first4=",suffix.size());
  for(int i=0;i<4;i++) printf("%02x",suffix[i]);
  printf(" suffix_pos152=%02x\n",suffix[9]);
  for(int scale:{256,255}) {
    const auto z=search_direct(suffix,scale);
    char name[100]; snprintf(name,sizeof(name),"original_suffix143_direct_int_rand_%d",scale);
    print_stats(name,z);
  }
  for(int scale:{256,255}) for(int order:{0,1}) {
    const auto z=search_interleaved_suffix(suffix,scale,order,KVALS);
    char name[120];
    snprintf(name,sizeof(name),"original_suffix143_interleaved_scale_%d_order_%s",scale,order==0?"byte-delay":"delay-byte");
    print_stats(name,z);
  }

  const auto ms=chrono::duration_cast<chrono::milliseconds>(chrono::steady_clock::now()-t0).count();
  printf("elapsed_ms=%lld\n",(long long)ms);
  return 0;
}
