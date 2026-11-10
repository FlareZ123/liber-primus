// Bounded source-motivated test of Perl's POSIX drand48-backed rand()
// against the 2014 Cicada onion-2 256-byte growing string.
#include <array>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <string>
#include <unordered_map>
#include <vector>
using namespace std;

static constexpr uint64_t MASK=(1ULL<<48)-1;
static constexpr uint64_t A=0x5deece66dULL, C=0xbULL;
static constexpr uint64_t FIRST_SEED=1388793600ULL; // 2014-01-04 00:00:00 UTC
static constexpr uint64_t LAST_SEED =1389398400ULL; // 2014-01-11 00:00:00 UTC
static constexpr int MAX_OFFSET=1024;

static vector<uint8_t> decode_hex(const string& h) {
  vector<uint8_t> v; v.reserve(h.size()/2);
  for(size_t i=0;i<h.size();i+=2) v.push_back((uint8_t)strtoul(h.substr(i,2).c_str(),nullptr,16));
  return v;
}
static inline uint8_t byte_out(uint64_t s) { return (uint8_t)(s >> 40); }
static inline int interval_out(uint64_t s) { return (int)(((__uint128_t)s*7)>>48)+1; }
static inline uint64_t step(uint64_t s) { return (A*s+C)&MASK; }

int main() {
  const string hex="634292ba49fe336edada779a34054a335c2ec12c8bbaed4b92dcc05efe98f76abffdc2389bdb9de2cf20c009acdc1945ab095a52609a5c219afd5f3b3edf10fcb25950666dfe8d8c433cd10c0b4c72efdfe12c6270d5cfde291f9cf0d73cb1211140136e4057380c963d70c76948d9cf6775960cf98fbafa435c44015c5959837a0f8d9f46e094f27c5797b7f8ab49bf28fa674d2ad2f726e197839956921dab29724cd48e1a81fc9bab3565f7513e3e368cd0327b47cf595afebb78d6b5bca92ba021cd6734f4362a0b341f359157173b53d49ea5dff5889d2c9de6b0d7e8c615286ce596bfa83f50b6eeabd153aaf50cd75f39929ba11fb0f8e8d611442846";
  const vector<uint8_t> target=decode_hex(hex);
  if(target.size()!=256) { fprintf(stderr,"bad target length %zu\n",target.size()); return 2; }

  // Reconciled multi-witness intervals for byte positions 152..182 inclusive.
  // k means a delay of 5*k minutes associated with that byte.
  const array<int,31> kvals={1,4,1,2,3,3,2,1,5,3,3,1,4,1,4,1,1,3,2,7,2,1,2,3,1,1,3,5,3,3,2};
  constexpr int FIRST_POS=152, N=31;

  // Perl 5.40 on the test host reports randfunc='Perl_drand48'.
  // Fixture: srand(1389060782); int(rand(256)) x 8.
  const array<int,8> perl_fixture={3,0,170,175,27,131,197,178};
  uint64_t fixture_state=((1389060782ULL&0xffffffffULL)<<16)|0x330eULL;
  for(int i=0;i<8;i++){ fixture_state=step(fixture_state); if(byte_out(fixture_state)!=perl_fixture[i]) { fprintf(stderr,"drand48 fixture mismatch at %d\n",i); return 3; } }

  unordered_map<uint64_t,vector<int>> target5;
  target5.reserve(512);
  for(int p=0;p+5<=(int)target.size();p++){
    uint64_t h=0; for(int j=0;j<5;j++) h=(h<<8)|target[p+j];
    target5[h].push_back(p);
  }

  const int state_count=MAX_OFFSET+(int)target.size();
  vector<uint64_t> states(state_count);
  int best_direct=0, best_direct_pos=-1, best_direct_offset=-1;
  uint64_t best_direct_seed=0, direct_hits5=0,direct_hits6=0,direct_hits8=0;
  uint64_t inter_first=0,inter_second=0,inter_full=0,hit_seed=0;
  int hit_offset=-1,hit_order=-1;
  const auto t0=chrono::steady_clock::now();

  for(uint64_t seed=FIRST_SEED;seed<=LAST_SEED;seed++){
    uint64_t s=((seed&0xffffffffULL)<<16)|0x330eULL;
    for(int i=0;i<state_count;i++){ s=step(s); states[i]=s; }

    // Direct stream: any five-byte target substring may match at any stream offset.
    for(int off=0;off<=MAX_OFFSET;off++){
      uint64_t h=0; for(int j=0;j<5;j++) h=(h<<8)|byte_out(states[off+j]);
      auto it=target5.find(h); if(it==target5.end()) continue;
      for(int pos:it->second){
        int n=5;
        while(off+n<state_count && pos+n<(int)target.size() && byte_out(states[off+n])==target[pos+n]) n++;
        direct_hits5++; if(n>=6) direct_hits6++; if(n>=8) direct_hits8++;
        if(n>best_direct){best_direct=n;best_direct_seed=seed;best_direct_offset=off;best_direct_pos=pos;}
      }
    }

    // Interleaved stream: each update uses delay then byte, or byte then delay.
    // Delay model: floor(rand(7))+1 five-minute units.
    for(int off=0;off<=MAX_OFFSET;off++) for(int order=0;order<2;order++){
      auto event_matches=[&](int e)->bool{
        const uint64_t x=states[off+2*e], y=states[off+2*e+1];
        const int k=(order==0)?interval_out(x):interval_out(y);
        const int b=(order==0)?byte_out(y):byte_out(x);
        return k==kvals[e] && b==target[FIRST_POS-1+e];
      };
      if(!event_matches(0)) continue; inter_first++;
      if(!event_matches(1)) continue; inter_second++;
      bool ok=true; for(int e=2;e<N;e++) if(!event_matches(e)){ok=false;break;}
      if(ok){inter_full++;hit_seed=seed;hit_offset=off;hit_order=order;}
    }
  }

  const auto ms=chrono::duration_cast<chrono::milliseconds>(chrono::steady_clock::now()-t0).count();
  printf("Perl_drand48 time-seed search\n");
  printf("seed_seconds=%llu (%llu..%llu; 2014-01-04..2014-01-11 UTC)\n",(unsigned long long)(LAST_SEED-FIRST_SEED+1),(unsigned long long)FIRST_SEED,(unsigned long long)LAST_SEED);
  printf("rand_call_offset=0..%d inclusive\n",MAX_OFFSET);
  printf("direct_byte_stream: best_match=%d target_pos=%d stream_offset=%d seed=%llu hits5=%llu hits6=%llu hits8=%llu\n",best_direct,best_direct_pos,best_direct_offset,(unsigned long long)best_direct_seed,(unsigned long long)direct_hits5,(unsigned long long)direct_hits6,(unsigned long long)direct_hits8);
  printf("interleaved_delay_byte: positions=%d..%d (multi-witness), order=delay-byte|byte-delay, k=floor(rand(7))+1\n",FIRST_POS,FIRST_POS+N-1);
  printf("interleaved_candidates_after_1_event=%llu after_2_events=%llu full_31_event_matches=%llu\n",(unsigned long long)inter_first,(unsigned long long)inter_second,(unsigned long long)inter_full);
  if(inter_full) printf("interleaved_hit: seed=%llu offset=%d order=%s\n",(unsigned long long)hit_seed,hit_offset,hit_order==0?"delay-byte":"byte-delay");
  printf("elapsed_ms=%lld\n",(long long)ms);
  return (best_direct>=5 || inter_full)?1:0;
}
