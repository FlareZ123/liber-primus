// Python-compatible 32-bit MT19937 integer-seed timestamp search on the
// published LP2 p49–51 256-cell table, conditional on its base60 conversion.
// The byte array is the original-source-checked lp2-grid-256.json bytes,
// SHA256 3b9b07d9a26e6d55c432d94d2661fdff3c2b348daed06821f2bdb23184a4b290.
// Cross-platform C++17; no third-party libraries.
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <chrono>

static constexpr int N=624;
static uint32_t mt[N];
static uint32_t temper(uint32_t y){
  y^=y>>11; y^=(y<<7)&0x9d2c5680U;
  y^=(y<<15)&0xefc60000U; return y^(y>>18);
}
static void init(uint32_t seed){
  mt[0]=19650218U;
  for(int i=1;i<N;i++) mt[i]=1812433253U*(mt[i-1]^(mt[i-1]>>30))+(uint32_t)i;
  int i=1,j=0;
  for(int k=N;k>0;k--){
    mt[i]=(mt[i]^((mt[i-1]^(mt[i-1]>>30))*1664525U))+seed+(uint32_t)j;
    ++i;++j;
    if(i>=N){mt[0]=mt[N-1];i=1;}
    if(j>=1)j=0;
  }
  for(int k=N-1;k>0;k--){
    mt[i]=(mt[i]^((mt[i-1]^(mt[i-1]>>30))*1566083941U))-(uint32_t)i;
    ++i;
    if(i>=N){mt[0]=mt[N-1];i=1;}
  }
  mt[0]=0x80000000U;
}
static void twist(){
  for(int k=0;k<N;k++){
    const uint32_t y=(mt[k]&0x80000000U)|(mt[(k+1)%N]&0x7fffffffU);
    mt[k]=mt[(k+397)%N]^(y>>1)^((y&1U)?0x9908b0dfU:0U);
  }
}
static uint32_t out(int i){return temper(mt[i]);}
static constexpr uint8_t TARGET[256]={
203,231,167,186,97,237,126,183,92,249,156,222,247,4,183,212,121,202,15,33,102,137,59,87,109,198,173,25,150,66,141,133,115,114,197,39,54,80,133,5,80,84,28,73,230,107,199,76,253,16,47,59,86,171,156,80,254,118,146,69,106,196,124,51,122,255,25,192,199,73,169,108,164,79,205,177,114,144,46,82,142,58,201,193,173,28,111,65,211,220,198,49,236,84,56,35,222,150,72,34,83,229,32,206,122,63,31,218,14,184,32,115,73,143,197,247,54,171,35,184,42,237,86,54,13,20,163,193,201,179,86,120,169,141,72,171,10,129,233,13,245,46,160,152,125,210,92,173,246,174,153,189,231,33,14,112,52,251,249,248,233,217,192,82,105,18,250,248,240,228,254,54,148,117,209,18,235,131,166,175,144,40,167,81,128,156,19,81,38,192,170,33,0,155,159,89,176,115,105,47,110,74,209,68,194,76,127,21,57,175,6,61,70,150,251,84,142,219,148,59,58,52,51,151,68,52,73,249,144,0,117,175,106,234,196,121,238,32,129,173,144,141,42,214,22,56,198,192,113,158,172,230,180,36,189,80
};
static uint32_t next32(int &position){
  if(position>=N){twist();position=0;}
  return out(position++);
}
static bool matches_full(int mode){
  int pos=0;
  for(int i=0;i<256;i++){
    uint32_t x;
    if(mode==2) {
      do{x=next32(pos)>>23;}while(x>=256U); // Py3 randrange(256)
    } else if(mode==3) {
      x=next32(pos)>>24;
      next32(pos); // Python 2/3 floor(random()*256) consumes two MT words
    } else {
      x=next32(pos);
      x=mode==0 ? x>>24 : x&255U;
    }
    if(x!=TARGET[i])return false;
  }
  return true;
}
int main(int argc,char**argv){
  if(argc!=3){std::fprintf(stderr,"Expected two integer bounds: begin end (UTC epoch seconds)\n");return 2;}
  const uint64_t begin=std::strtoull(argv[1],nullptr,10);
  const uint64_t end=std::strtoull(argv[2],nullptr,10);
  unsigned long long a[4]={0},ab[4]={0},abc[4]={0},full[4]={0};
  const auto started=std::chrono::steady_clock::now();
  for(uint64_t seed=begin;seed<end;seed++){
    init((uint32_t)seed);twist();
    const uint32_t u0=out(0),u1=out(1),u2=out(2);
    if(seed==3301U) std::printf("POSITIVE MT seed3301 first=%08x second=%08x third=%08x\n",u0,u1,u2);
    for(int mode=0;mode<4;mode++){
      uint32_t x[3];
      if(mode==0){x[0]=u0>>24;x[1]=u1>>24;x[2]=u2>>24;}
      else if(mode==1){x[0]=u0&255U;x[1]=u1&255U;x[2]=u2&255U;}
      else if(mode==2){
        int position=0;
        for(int j=0;j<3;j++){
          uint32_t v;
          do{v=out(position++)>>23;}while(v>=256U);
          x[j]=v;
        }
      } else {x[0]=u0>>24;x[1]=out(2)>>24;x[2]=out(4)>>24;}
      if(x[0]!=TARGET[0])continue;
      a[mode]++;
      if(x[1]!=TARGET[1])continue;
      ab[mode]++;
      if(x[2]!=TARGET[2])continue;
      abc[mode]++;
      init((uint32_t)seed);twist();
      if(matches_full(mode)){
        full[mode]++;
        std::printf("FULL MATCH mode=%d seed=%llu\n",mode,(unsigned long long)seed);
      }else std::printf("3-BYTE CANDIDATE mode=%d seed=%llu; full mismatch\n",mode,(unsigned long long)seed);
      init((uint32_t)seed);twist();
    }
  }
  const double seconds=std::chrono::duration<double>(std::chrono::steady_clock::now()-started).count();
  std::printf("Scanned %llu..%llu (exclusive), seconds %.3f\n",(unsigned long long)begin,(unsigned long long)end,seconds);
  for(int i=0;i<4;i++) std::printf("mode%d first=%llu first2=%llu first3=%llu full=%llu\n",i,a[i],ab[i],abc[i],full[i]);
  return 0;
}
