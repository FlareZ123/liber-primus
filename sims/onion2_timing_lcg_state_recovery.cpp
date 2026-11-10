// Original 2014 Cicada onion-2 byte-arrival side-channel state-recovery test.
// C++17, standard library only. Source: resources/cicada2014-onion2-timing.json.
// Two reliable contiguous evidence intervals: positions [152,189] and [192,256].
// 80 exact 32-bit LCG hypotheses: 4 recurrences x 4 byte lanes x 5 clocks.
// All 2^24 internal states consistent with the first observed 8-bit byte
// are enumerated for every hypothesis; no heuristic search or fitted plaintext.
// A separate planted full-length stream must recover its unique hidden state.
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstdio>
#include <vector>

struct Observation {
  const char* name;
  std::vector<int> delays;
  std::vector<uint8_t> bytes;
};
const Observation ORIGINAL[] = {
  {"positions152-189", {1,4,1,2,3,3,2,1,5,3,3,1,4,1,4,1,1,3,2,7,2,1,2,3,1,1,3,5,3,3,2,3,2,2,2,1,1,2}, {0x26,0xe1,0x97,0x83,0x99,0x56,0x92,0x1d,0xab,0x29,0x72,0x4c,0xd4,0x8e,0x1a,0x81,0xfc,0x9b,0xab,0x35,0x65,0xf7,0x51,0x3e,0x3e,0x36,0x8c,0xd0,0x32,0x7b,0x47,0xcf,0x59,0x5a,0xfe,0xbb,0x78,0xd6}},
  {"positions192-256", {2,1,1,3,3,1,1,3,2,1,2,4,5,2,1,2,1,1,4,1,1,3,5,1,1,2,1,2,1,3,2,2,2,1,2,1,6,1,2,1,1,1,2,2,1,3,1,3,3,2,1,1,2,1,1,1,3,2,1,2,1,2,1,1,2}, {0xa9,0x2b,0xa0,0x21,0xcd,0x67,0x34,0xf4,0x36,0x2a,0x0b,0x34,0x1f,0x35,0x91,0x57,0x17,0x3b,0x53,0xd4,0x9e,0xa5,0xdf,0xf5,0x88,0x9d,0x2c,0x9d,0xe6,0xb0,0xd7,0xe8,0xc6,0x15,0x28,0x6c,0xe5,0x96,0xbf,0xa8,0x3f,0x50,0xb6,0xee,0xab,0xd1,0x53,0xaa,0xf5,0x0c,0xd7,0x5f,0x39,0x92,0x9b,0xa1,0x1f,0xb0,0xf8,0xe8,0xd6,0x11,0x44,0x28,0x46}}
};
struct Model {const char* name; uint32_t multiplier, increment;};
constexpr Model MODELS[] = {
  {"ANSI-C",1103515245u,12345u},
  {"Numerical-Recipes",1664525u,1013904223u},
  {"MSVC",214013u,2531011u},
  {"Borland",22695477u,1u}
};
inline uint32_t construct(uint32_t remaining,uint32_t byte,int shift) {
  if(shift==0) return (remaining<<8)|byte;
  if(shift==8) return ((remaining>>8)<<16)|(byte<<8)|(remaining&255u);
  if(shift==16) return ((remaining>>16)<<24)|(byte<<16)|(remaining&65535u);
  return (byte<<24)|remaining;
}
inline int advances(int delay,int clock) {
  switch(clock) {
    case 0: return 1;                // one state per published byte
    case 1: return delay;            // one state per five-minute tick
    case 2: return delay+1;          // extra output draw on publication
    case 3: return 2*delay;          // two draws per tick
    default: return 2*delay+1;      // two draws plus output draw
  }
}
struct Recovery {
  int longest=0;
  uint32_t firstState=0;
  uint32_t complete=0;
  uint64_t prefix5=0;
};
// Exhaustive: the first published 8-bit output leaves precisely 2^24 states.
Recovery recover(const Observation& obs,const Model& model,int shift,int clock) {
  assert(!obs.bytes.empty() && obs.bytes.size()==obs.delays.size());
  Recovery answer;
  const auto& c=obs.bytes;
  for(uint32_t unknown=0;unknown<(1u<<24);unknown++) {
    uint32_t state=construct(unknown,c[0],shift);
    size_t i=1;
    for(;i<c.size();i++) {
      const int count=advances(obs.delays[i],clock);
      for(int j=0;j<count;j++)state=state*model.multiplier+model.increment;
      if(static_cast<uint8_t>(state>>shift)!=c[i])break;
    }
    if(static_cast<int>(i)>answer.longest) {
      answer.longest=static_cast<int>(i);
      answer.firstState=construct(unknown,c[0],shift);
    }
    if(i==c.size())answer.complete++;
    if(i>=5)answer.prefix5++;
  }
  return answer;
}
void run(const Observation& obs) {
  assert(obs.bytes.size()>=38);
  int overallLongest=0;
  int configurations=0;
  for(const auto& model: MODELS)for(int clock=0;clock<5;clock++)
  for(int shift: {0,8,16,24}) {
    const Recovery found=recover(obs,model,shift,clock);
    assert(found.complete==0 && "Historical bytes fit a declared LCG model");
    if(found.longest>overallLongest)overallLongest=found.longest;
    if(found.prefix5) std::printf("Unexpected 5-byte original prefix: %s %s %d %d\n",
                                  obs.name,model.name,clock,shift);
    configurations++;
  }
  assert(configurations==80 && overallLongest<=4);
  std::printf("ORIGINAL %s bytes=%zu models=%d max_contiguous=%d complete=0\n",
              obs.name,obs.bytes.size(),configurations,overallLongest);

  // Plant uses the same attested clock gaps, under actual Numerical Recipes LCG.
  Observation planted=obs;
  const Model& model=MODELS[1];
  uint32_t state=0x3301f13du;
  uint32_t expectedFirst=0;
  for(size_t i=0;i<planted.bytes.size();i++) {
    for(int j=0;j<planted.delays[i];j++)
      state=state*model.multiplier+model.increment;
    planted.bytes[i]=static_cast<uint8_t>(state>>24);
    if(i==0)expectedFirst=state;
  }
  const Recovery correct=recover(planted,model,24,1);
  assert(correct.complete==1 && correct.longest==(int)planted.bytes.size());
  assert(correct.firstState==expectedFirst && "32-bit state not recovered");
  std::printf("PLANT %s recovered=%zu/%zu full_state=%08x exact=1\n",
              obs.name,planted.bytes.size(),planted.bytes.size(),
              correct.firstState);
}
int main() {
  const auto begin=std::chrono::steady_clock::now();
  for(const auto& obs:ORIGINAL)run(obs);
  const auto end=std::chrono::steady_clock::now();
  std::printf("elapsed_s=%.3f\n",std::chrono::duration<double>(end-begin).count());
}
