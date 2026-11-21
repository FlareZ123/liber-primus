// Original LP2 p0 candidate red-title key, exhaustive finite 32-bit seed gate.
// Hypothetical title EPIPHANY SEEKS is not independently authenticated.
// Build as C++17 with OpenMP support for faster local/Windows execution.
#include <cstdint>
#include <cstdio>
#include <cstring>
#include <cassert>
#include <chrono>
#ifdef _OPENMP
#include <omp.h>
#endif

static constexpr uint32_t PLUS[13]={26,24,8,19,27,24,18,3,0,8,0,16,19};
static constexpr uint32_t MINUS[13]={3,5,21,10,2,5,11,26,0,21,0,13,10};
static constexpr uint64_t SEEDS=1ULL<<32;

static inline uint32_t xorStep(uint32_t x){x^=x<<13;x^=x>>17;x^=x<<5;return x;}
static inline uint32_t lcgStep(uint32_t x,uint32_t a,uint32_t c){return a*x+c;}
static inline uint32_t lcgOut(uint32_t x,int mode) {
    if(mode==0)return x%29;
    if(mode==1)return ((x>>16)&32767u)%29;
    if(mode==2)return (x>>16)%29;
    return (x>>24)%29;
}
static inline uint64_t javaStep(uint64_t s){
    return (s*0x5deece66dULL+11ULL)&((1ULL<<48)-1);
}
static inline uint32_t javaNext29(uint64_t &s){
    for(;;){
        s=javaStep(s);
        uint32_t bits=uint32_t(s>>17),value=bits%29;
        if(int32_t(bits-value+28u)>=0)return value;
    }
}

static bool checkXor(uint32_t seed,int phase,const uint32_t *target){
    uint32_t x=phase?xorStep(seed):seed;
    for(int i=0;i<13;i++){
        if(x%29!=target[i])return false;
        x=xorStep(x);
    }
    return true;
}
static bool checkLcg(uint32_t seed,uint32_t a,uint32_t c,int phase,int mode,const uint32_t *target){
    uint32_t x=phase?lcgStep(seed,a,c):seed;
    for(int i=0;i<13;i++){
        if(lcgOut(x,mode)!=target[i])return false;
        x=lcgStep(x,a,c);
    }
    return true;
}
static bool checkJava(uint32_t seed,int signedSeed,int phase,const uint32_t *target){
    uint64_t input=signedSeed?uint64_t(int64_t(int32_t(seed))):uint64_t(seed);
    uint64_t state=(input^0x5deece66dULL)&((1ULL<<48)-1);
    if(phase)javaNext29(state);
    for(int i=0;i<13;i++)if(javaNext29(state)!=target[i])return false;
    return true;
}

static void controls(){
    const uint32_t s=1234567890u;
    uint32_t y=s;
    uint32_t plantedX[13];
    for(auto &v:plantedX){v=y%29;y=xorStep(y);}
    assert(checkXor(s,0,plantedX));
    y=s; uint32_t plantedL[13];
    for(auto &v:plantedL){v=lcgOut(y,2);y=lcgStep(y,214013u,2531011u);}
    assert(checkLcg(s,214013u,2531011u,0,2,plantedL));
    uint64_t state=(uint64_t(s)^0x5deece66dULL)&((1ULL<<48)-1);
    uint32_t plantedJ[13];
    for(auto &v:plantedJ)v=javaNext29(state);
    assert(checkJava(s,0,0,plantedJ));
}

static uint64_t runXor(uint64_t limit){
    uint64_t hits=0;
    #pragma omp parallel for schedule(dynamic,64) reduction(+:hits)
    for(uint64_t block=0;block<(limit+65535)/65536;block++){
        uint64_t start=block*65536,end=(start+65536<limit?start+65536:limit);
        for(uint64_t i=start;i<end;i++){
            uint32_t seed=uint32_t(i);
            if(!seed)continue;
            for(int phase=0;phase<2;phase++){
                uint32_t first=(phase?xorStep(seed):seed)%29;
                if(first!=PLUS[0]&&first!=MINUS[0])continue;
                bool a=(first==PLUS[0])&&checkXor(seed,phase,PLUS);
                bool b=(first==MINUS[0])&&checkXor(seed,phase,MINUS);
                if(a||b){
                    #pragma omp critical
                    std::printf("MATCH xorshift32 seed=%u phase=%d sign=%s\n",seed,phase,a?"C-P":"P-C");
                    hits++;
                }
            }
        }
    }
    return hits;
}
static uint64_t runLcg(uint64_t limit,const char *name,uint32_t a,uint32_t c){
    uint64_t hits=0;
    #pragma omp parallel for schedule(dynamic,64) reduction(+:hits)
    for(uint64_t block=0;block<(limit+65535)/65536;block++){
        uint64_t start=block*65536,end=(start+65536<limit?start+65536:limit);
        for(uint64_t i=start;i<end;i++){
            uint32_t seed=uint32_t(i);
            for(int phase=0;phase<2;phase++){
                uint32_t x=phase?lcgStep(seed,a,c):seed;
                for(int mode=0;mode<4;mode++){
                    uint32_t first=lcgOut(x,mode);
                    if(first!=PLUS[0]&&first!=MINUS[0])continue;
                    bool p=first==PLUS[0]&&checkLcg(seed,a,c,phase,mode,PLUS);
                    bool m=first==MINUS[0]&&checkLcg(seed,a,c,phase,mode,MINUS);
                    if(p||m){
                        #pragma omp critical
                        std::printf("MATCH %s seed=%u phase=%d out=%d sign=%s\n",name,seed,phase,mode,p?"C-P":"P-C");
                        hits++;
                    }
                }
            }
        }
    }
    return hits;
}
static uint64_t runJava(uint64_t limit){
    uint64_t hits=0;
    #pragma omp parallel for schedule(dynamic,64) reduction(+:hits)
    for(uint64_t block=0;block<(limit+65535)/65536;block++){
        uint64_t start=block*65536,end=(start+65536<limit?start+65536:limit);
        for(uint64_t i=start;i<end;i++){
            uint32_t seed=uint32_t(i);
            for(int signedSeed=0;signedSeed<2;signedSeed++){
                uint64_t input=signedSeed?uint64_t(int64_t(int32_t(seed))):uint64_t(seed);
                uint64_t init=(input^0x5deece66dULL)&((1ULL<<48)-1);
                for(int phase=0;phase<2;phase++){
                    uint64_t st=init;
                    if(phase)javaNext29(st);
                    uint32_t first=javaNext29(st);
                    if(first!=PLUS[0]&&first!=MINUS[0])continue;
                    bool p=first==PLUS[0]&&checkJava(seed,signedSeed,phase,PLUS);
                    bool m=first==MINUS[0]&&checkJava(seed,signedSeed,phase,MINUS);
                    if(p||m){
                        #pragma omp critical
                        std::printf("MATCH Java seed=%u signedSeed=%d phase=%d sign=%s\n",seed,signedSeed,phase,p?"C-P":"P-C");
                        hits++;
                    }
                }
            }
        }
    }
    return hits;
}
int main(int argc,char **argv){
    controls();
    const char *family=argc>1?argv[1]:"smoke";
    uint64_t limit=std::strcmp(family,"smoke")==0?65536:SEEDS;
    const auto t=std::chrono::steady_clock::now();
    uint64_t hits=0;
    if(!std::strcmp(family,"smoke")||!std::strcmp(family,"xorshift")){
        uint64_t h=runXor(limit);hits+=h;
        std::printf("xorshift32: %llu hits\n",(unsigned long long)h);
    }
    struct Engine {const char *name;uint32_t a,c;};
    const Engine engines[]={
        {"ANSI",1103515245u,12345u},{"NumericalRecipes",1664525u,1013904223u},
        {"MSVC",214013u,2531011u},{"Borland",22695477u,1u},
        {"RANDU",65539u,0u}
    };
    for(const auto &e:engines)if(!std::strcmp(family,"smoke")||!std::strcmp(family,e.name)){
        uint64_t h=runLcg(limit,e.name,e.a,e.c);hits+=h;
        std::printf("%s: %llu hits\n",e.name,(unsigned long long)h);
    }
    if(!std::strcmp(family,"smoke")||!std::strcmp(family,"java")){
        uint64_t h=runJava(limit);hits+=h;
        std::printf("Java exact nextInt(29): %llu hits\n",(unsigned long long)h);
    }
    double seconds=std::chrono::duration<double>(std::chrono::steady_clock::now()-t).count();
    std::printf("DONE: seeds=%llu family=%s hits=%llu control=PASS time=%.3fs\n",
       (unsigned long long)limit,family,(unsigned long long)hits,seconds);
    return hits?1:0;
}
