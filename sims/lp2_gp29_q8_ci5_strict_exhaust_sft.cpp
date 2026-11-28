// Exact strict-sender exhaustion for q8 crib5 after one relaxed leaf appeared.
// Enumerates every relaxed <=2-phase-skip leaf, completes any unassigned key
// phases, then tests the actual GP29 strict adjacent-repeat retry sender.
#include <array>
#include <atomic>
#include <cctype>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <sstream>
#include <stdexcept>
#include <string>
#include <thread>
#include <vector>
using std::array; using std::string; using std::vector;
static constexpr int N=29,Q=8,R=2,M=15;
static int mod29(int x){x%=N;return x<0?x+N:x;}
static vector<int> parseTape(const string& path){
  std::ifstream f(path); if(!f) throw std::runtime_error("cannot open corpus");
  std::ostringstream ss;ss<<f.rdbuf();string s=ss.str();vector<int>o;size_t pos=0;
  while((pos=s.find("\"page\"",pos))!=string::npos){
    size_t c=s.find(':',pos);c++;while(c<s.size()&&isspace((unsigned char)s[c]))c++;
    int pg=0;while(c<s.size()&&isdigit((unsigned char)s[c]))pg=pg*10+(s[c++]-'0');
    size_t ip=s.find("\"indices\"",c),lb=s.find('[',ip),rb=s.find(']',lb);
    if(ip==string::npos||lb==string::npos||rb==string::npos)throw std::runtime_error("bad corpus");
    if(pg<=55){size_t p=lb+1;while(p<rb){while(p<rb&&!isdigit((unsigned char)s[p]))p++;if(p>=rb)break;
      int v=0;while(p<rb&&isdigit((unsigned char)s[p]))v=v*10+(s[p++]-'0');o.push_back(v);}}
    pos=rb+1;
  }
  if(o.size()!=12956)throw std::runtime_error("bad tape length");return o;
}
static vector<int> decode(const string& x){
  const string A="0123456789abcdefghijklmnopqrstuvwxyz";vector<int>p;
  for(char ch:x){auto z=A.find(ch);if(z==string::npos||z>=29)throw std::runtime_error("bad crib");p.push_back((int)z);}return p;
}
struct StrictWitness{
  bool ok=false;int phase0=-1,last0=-2,retries=-1,endPlain=-1;
  array<int,Q> key{};vector<int> retained;
};
static bool strictForKey(const vector<int>&P,const vector<int>&target,const array<int,Q>&K,StrictWitness&out){
  for(int phase0=0;phase0<Q;phase0++)for(int last0=-1;last0<N;last0++){
    int phase=phase0,last=last0,retries=0,j=0;vector<int>idx;
    for(int i=0;i<(int)P.size();i++){
      int z;
      while(true){
        z=mod29(P[i]+K[phase]);phase=(phase+1)%Q;
        if(last>=0&&z==last){if(++retries>R)break;continue;}
        break;
      }
      if(retries>R)break;
      last=z;
      if(z==target[j]){
        idx.push_back(i);
        if(++j==(int)target.size()){
          out.ok=true;out.phase0=phase0;out.last0=last0;out.retries=retries;out.endPlain=i;out.key=K;out.retained=idx;
          return true;
        }
      }
    }
  }
  return false;
}
struct Search{
  const vector<int>&P;const vector<int>&O;std::atomic<bool>&global;
  array<int,Q>key{};uint64_t nodes=0,leaves=0,completions=0;StrictWitness witness{};int witnessT=-1;
  Search(const vector<int>&p,const vector<int>&o,std::atomic<bool>&g):P(p),O(o),global(g){key.fill(-1);}
  bool completeAndStrict(int t,int s,array<int,Q>&K,vector<int>&target){
    if(global.load(std::memory_order_relaxed))return false;
    while(s<Q&&K[s]>=0)s++;
    if(s==Q){
      completions++;
      StrictWitness w;
      if(strictForKey(P,target,K,w)){witness=w;witnessT=t;global.store(true);return true;}
      return false;
    }
    for(int v=0;v<N;v++){K[s]=v;if(completeAndStrict(t,s+1,K,target))return true;}K[s]=-1;return false;
  }
  void dfs(int t,int i,int j,int shifts){
    if(global.load(std::memory_order_relaxed))return;
    nodes++;
    if(j==M){
      leaves++;
      vector<int>target(O.begin()+t,O.begin()+t+M);array<int,Q>K=key;
      completeAndStrict(t,0,K,target);return;
    }
    if(i==(int)P.size()||j+((int)P.size()-i)<M)return;
    for(int extra=0;extra<=R-shifts&&!global.load(std::memory_order_relaxed);extra++){
      int r=shifts+extra,ph=(i+r)%Q,d=mod29(O[t+j]-P[i]),old=key[ph];
      if(old<0||old==d){if(old<0)key[ph]=d;dfs(t,i+1,j+1,r);if(old<0)key[ph]=-1;}
      if((int)P.size()-(i+1)>=M-j)dfs(t,i+1,j,r);
    }
  }
};
static uint32_t xr=0x3301c1cau;
static uint32_t rng(){xr^=xr<<13;xr^=xr>>17;xr^=xr<<5;return xr;}
static int rnd(int n){return int(rng()%uint32_t(n));}
static array<int,Q> makeControlKey(const vector<int>&P,vector<int>&target){
  for(;;){
    array<int,Q>K{};for(int&s:K)s=rnd(N);
    int phase=0,last=-1,retries=0;vector<int>E;
    for(int i=0;i<(int)P.size();i++){
      int z;while(true){z=mod29(P[i]+K[phase]);phase=(phase+1)%Q;if(last>=0&&z==last){retries++;if(retries>R)break;continue;}break;}
      if(retries>R)break;E.push_back(z);last=z;
    }
    if(retries!=R||E.size()!=P.size())continue;
    vector<int>keep(P.size());int cnt=0;
    do{cnt=0;for(size_t i=0;i<P.size();i++){keep[i]=(rnd(36)<29);cnt+=keep[i];}}while(cnt<M);
    target.clear();for(size_t i=0;i<P.size()&&target.size()<M;i++)if(keep[i])target.push_back(E[i]);
    StrictWitness w;if(strictForKey(P,target,K,w))return K;
  }
}
int main(){
  const vector<int>P=decode("7i5o9hik3lo9nhi4a68g"),C=parseTape("resources/liber-primus/lp2-corpus.json");
  int controls=0;for(int z=0;z<8;z++){vector<int>T;auto K=makeControlKey(P,T);StrictWitness w;if(!strictForKey(P,T,K,w))throw std::runtime_error("strict control miss");controls++;}
  const int total=(int)C.size()-M+1;unsigned nt=std::thread::hardware_concurrency();if(nt<2)nt=2;if(nt>8)nt=8;
  std::atomic<bool>global(false);vector<uint64_t>nodes(nt),leaves(nt),comps(nt);vector<StrictWitness>wits(nt);vector<int>ts(nt,-1);vector<std::thread>th;
  for(unsigned k=0;k<nt;k++)th.emplace_back([&,k]{
    Search s(P,C,global);
    for(int t=(int)k;t<total&&!global.load(std::memory_order_relaxed);t+=(int)nt){s.key.fill(-1);s.dfs(t,0,0,0);}
    nodes[k]=s.nodes;leaves[k]=s.leaves;comps[k]=s.completions;wits[k]=s.witness;ts[k]=s.witnessT;
  });
  for(auto&x:th)x.join();uint64_t ns=0,ls=0,cs=0;for(auto x:nodes)ns+=x;for(auto x:leaves)ls+=x;for(auto x:comps)cs+=x;
  std::ostringstream out;out<<"{\"method\":\"q8 crib5 exhaustive relaxed leaves with exact strict GP29 retry validation\",\"controls_strict_passed\":"<<controls
    <<",\"nodes\":"<<ns<<",\"relaxed_leaves\":"<<ls<<",\"key_completions_tested\":"<<cs<<",\"strict_hit\":"<<(global.load()?"true":"false");
  if(global.load())for(unsigned k=0;k<nt;k++)if(ts[k]>=0){auto&w=wits[k];out<<",\"t\":"<<ts[k]<<",\"phase0\":"<<w.phase0<<",\"last0\":"<<w.last0<<",\"retries\":"<<w.retries<<",\"end_plain\":"<<w.endPlain<<",\"key\":[";
    for(int s=0;s<Q;s++){if(s)out<<",";out<<w.key[s];}out<<"],\"retained_plain_indices\":[";for(size_t i=0;i<w.retained.size();i++){if(i)out<<",";out<<w.retained[i];}out<<"]";break;}
  out<<"}\n";std::cout<<out.str();if(const char*p=std::getenv("SFT_OUTPUT")){std::ofstream f(p);f<<out.str();}
}
