// Fixed q8 shifts, canonical GP29 ciphertext, completely unknown input alphabet.
// Exact word domains, partial bijections, bitset propagation with OOV budget.
#include <algorithm>
#include <array>
#include <bit>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <limits>
#include <numeric>
#include <random>
#include <stdexcept>
#include <string>
#include <unordered_set>
#include <vector>
using namespace std;
constexpr int Q=29,N=8,BUDGET=3,L=14;
constexpr uint32_t FULL=(1u<<Q)-1;
const string SYM="0123456789abcdefghijklmnopqrs";
int mod(int x){x%=Q;return x<0?x+Q:x;}
int ix(char x){auto i=SYM.find(x);if(i==string::npos)throw runtime_error("GP symbol");return int(i);}
vector<string> lines(const string&f){ifstream i(f);if(!i)throw runtime_error("open "+f);vector<string> v;string w;while(i>>w)v.push_back(w);return v;}
using Assign=array<int8_t,Q>;
struct Option {Assign a;uint32_t labels=0;};
struct Group {
 string c;uint32_t labels=0;vector<Option> opts;size_t W=0,offset=0;
 array<int,Q> pos{};vector<uint64_t> U,V,E;
 void index(){
  pos.fill(-1);int n=0;for(uint32_t m=labels;m;m&=m-1)pos[countr_zero(m)]=n++;
  W=(opts.size()+63)/64;U.assign(n*W,0);V.assign(Q*W,0);E.assign(n*Q*W,0);
  for(size_t i=0;i<opts.size();i++){const auto&o=opts[i];size_t j=i/64;uint64_t b=1ull<<(i%64);
   for(uint32_t m=o.labels;m;m&=m-1){int c=countr_zero(m),p=pos[c],v=o.a[c];U[p*W+j]|=b;V[v*W+j]|=b;E[(p*Q+v)*W+j]|=b;}
  }
 }
};
struct State {Assign B;uint32_t assigned=0,used=0;uint64_t done=0;int omit=0;vector<uint64_t> alive;array<int,47> counts{};State(){B.fill(-1);}};
struct Stats {uint64_t nodes=0,branches=0,roots=0,fail=0,guaranteed=0,complete=0,assigns=0,wordOps=0,omits=0,values=0;};
class Solver {
 array<int,N> k{};unordered_set<string> lex;array<vector<string>,L+1> by{};vector<Group> gs;vector<int> order;vector<int> anchors;
 Stats stat;chrono::steady_clock::time_point t0,deadline,last;bool timed=false,found=false;size_t totalW=0;int anchor=-1;
 unordered_set<string> seen; Assign resultB{};vector<string> resultWords;vector<int> resultPhases;int resultSupport=-1;int maxDepth=0;
 void build(const string&lf,const string&cf){
  for(auto&w:lines(lf)){lex.insert(w);if(w.size()<=L)by[w.size()].push_back(w);}
  auto C=lines(cf);if(C.size()!=47)throw runtime_error("expected 47 complete training groups");
  for(const auto&c:C){Group g;g.c=c;vector<int> cv;for(char x:c){int z=ix(x);cv.push_back(z);}
   for(const auto&w:by[c.size()]){vector<int> p;bool ok=true;for(int i=0;i<(int)c.size();i++){int z=ix(w[i]);if(!z&&cv[i]){ok=false;break;}p.push_back(z);}if(!ok)continue;
    for(int ph=0;ph<N;ph++){
     Option o;o.a.fill(-1);uint32_t used=0;int j=ph;ok=true;
     for(int i=0;i<(int)c.size();i++){if(!p[i])continue;int z=p[i],v=mod(cv[i]-k[j]);j=(j+1)%N;
      if(o.a[z]>=0){if(o.a[z]!=v){ok=false;break;}}else{if(used>>v&1){ok=false;break;}o.a[z]=v;o.labels|=1u<<z;used|=1u<<v;}
     }
     if(ok){g.labels|=o.labels;g.opts.push_back(o);}
    }
   }
   sort(g.opts.begin(),g.opts.end(),[](const Option&a,const Option&b){return a.a<b.a;});g.opts.erase(unique(g.opts.begin(),g.opts.end(),[](auto&a,auto&b){return a.a==b.a;}),g.opts.end());
   g.index();g.offset=totalW;totalW+=g.W;gs.push_back(move(g));
  }
  order.resize(gs.size());iota(order.begin(),order.end(),0);sort(order.begin(),order.end(),[&](int a,int b){return gs[a].c.size()!=gs[b].c.size()?gs[a].c.size()>gs[b].c.size():a<b;});
  for(int i:order)if(count_if(gs[i].c.begin(),gs[i].c.end(),[](char c){return c!='0';})>=8)anchors.push_back(i);
  sort(anchors.begin(),anchors.end(),[&](int a,int b){return gs[a].opts.size()!=gs[b].opts.size()?gs[a].opts.size()<gs[b].opts.size():a<b;});
  if(anchors.size()<4)throw runtime_error("insufficient anchors");anchors.resize(4);
  cerr<<"domains lex="<<lex.size()<<" totalOptions="<<accumulate(gs.begin(),gs.end(),size_t(0),[](size_t n,const auto&g){return n+g.opts.size();})<<" bitsetWords="<<totalW<<" anchors=";
  for(int a:anchors)cerr<<a<<":"<<gs[a].opts.size()<<" ";cerr<<"\n";
 }
 void log(const char* s){cerr<<s<<" sec="<<chrono::duration<double>(chrono::steady_clock::now()-t0).count()<<" anchor="<<anchor<<" roots="<<stat.roots<<" nodes="<<stat.nodes<<" branches="<<stat.branches<<" complete="<<stat.complete<<" fail="<<stat.fail<<" guaranteed="<<stat.guaranteed<<" assigns="<<stat.assigns<<" bitops="<<stat.wordOps<<" omits="<<stat.omits<<" depth="<<maxDepth<<"\n";}
 bool check(){if(found||timed)return true;if((stat.nodes&1023)==0||(stat.roots&127)==0){auto now=chrono::steady_clock::now();if(now>=deadline){timed=true;return true;}if(now-last>chrono::seconds(10)){last=now;log("progress");}}return false;}
 bool add(State&s,const Option&o){
  uint32_t newLabels=o.labels&~s.assigned;if(!newLabels)return true;
  // Check the partial bijection and the existing assignments.
  for(uint32_t m=o.labels;m;m&=m-1){int c=countr_zero(m),v=o.a[c];if(s.B[c]>=0&&s.B[c]!=v)return false;if(s.B[c]<0&&(s.used>>v&1))return false;}
  for(uint32_t m=newLabels;m;m&=m-1){int c=countr_zero(m),v=o.a[c];s.B[c]=v;s.assigned|=1u<<c;s.used|=1u<<v;stat.assigns++;}
  // For a partial injection option, it conflicts with c=v precisely if it
  // assigns c or v but does not assign this exact pair. Filter all new pairs
  // in one pass over each active word domain. Omitted/satisfied groups need no
  // additional constraint, so skip them.
  int missing=s.omit;
  for(int i:order){if(s.done>>i&1)continue;auto&g=gs[i];if(!s.counts[i]){if(++missing>BUDGET){stat.fail++;return false;}continue;}
   auto*a=s.alive.data()+g.offset;int count=0;
   for(size_t j=0;j<g.W;j++)if(a[j]){uint64_t b=a[j];for(uint32_t m=newLabels;m&&b;m&=m-1){int c=countr_zero(m),v=o.a[c],p=g.pos[c];uint64_t u=p<0?0:g.U[p*g.W+j],vv=g.V[v*g.W+j],eq=p<0?0:g.E[(p*Q+v)*g.W+j];b&=(~(u|vv)|eq);stat.wordOps++;}a[j]=b;count+=popcount(b);}
   s.counts[i]=count;if(!count&&++missing>BUDGET){stat.fail++;return false;}
  }
  return true;
 }
 bool decode(const string&c,const Assign&B,string&out,int&phase)const{
  string w,legal;int legalPh=0;Assign I;for(int v=0;v<Q;v++)I[B[v]]=v;
  auto walk=[&](auto&&self,int i,int j,int start)->bool{
   if(i==(int)c.size()){if(legal.empty()){legal=w;legalPh=start;}if(lex.count(w)){out=w;phase=start;return true;}return false;}
   int x=ix(c[i]);if(!x){w+='0';if(self(self,i+1,j,start))return true;w.pop_back();}int p=I[mod(x-k[j])];if(p){w+=SYM[p];if(self(self,i+1,(j+1)%N,start))return true;w.pop_back();}return false;
  };
  for(int j=0;j<N;j++)if(walk(walk,0,j,j))return true;out=legal;phase=legalPh;return false;
 }
 bool validate(const Assign&B){
  stat.complete++;int support=0,miss=0;vector<string> w;vector<int> phases;
  for(const auto&g:gs){string z;int j;bool good=decode(g.c,B,z,j);if(z.empty()||(!good&&++miss>BUDGET))return false;support+=good;w.push_back(z);phases.push_back(j);}
  string sig;for(int v:B)sig+=SYM[v];if(seen.insert(sig).second)cout<<"{\"candidate\":\""<<sig<<"\",\"support\":"<<support<<"}\n";return false;resultB=B;resultSupport=support;resultWords=move(w);resultPhases=move(phases);found=true;return true;
 }
 bool finish(const State&s){
  vector<int> labs,vals;for(int c=0;c<Q;c++)if(s.B[c]<0)labs.push_back(c);for(int v=0;v<Q;v++)if(!(s.used>>v&1))vals.push_back(v);
  if(labs.size()!=vals.size())throw runtime_error("permutation");Assign B=s.B;
  do{for(int i=0;i<(int)labs.size();i++)B[labs[i]]=vals[i];if(validate(B))return true;if((stat.complete&1023)==0&&chrono::steady_clock::now()>=deadline){timed=true;return false;}}while(next_permutation(vals.begin(),vals.end()));return false;
 }
 void dfs(State s,int depth){
  stat.nodes++;maxDepth=max(maxDepth,depth);if(check())return;
  if(popcount(s.assigned)>=Q-2){finish(s);return;}
  int chosen=-1,best=numeric_limits<int>::max(),bestNew=0;
  for(int i:order){if(s.done>>i&1)continue;auto&g=gs[i];int n=s.counts[i];if(!n){s.done|=1ull<<i;stat.omits++;if(++s.omit>BUDGET){stat.fail++;return;}continue;}
   // A path whose whole partial injection is assigned cannot be invalidated
   // by any future completion. Mark this word permanently supported.
   bool guarantee=false;auto*a=s.alive.data()+g.offset;uint32_t unknown=g.labels&~s.assigned;
   if(!unknown)guarantee=true;
   else if(n<=64||popcount(unknown)<=3){for(size_t j=0;j<g.W&&!guarantee;j++)for(uint64_t b=a[j];b;b&=b-1){size_t q=j*64+countr_zero(b);if(!(g.opts[q].labels&unknown)){guarantee=true;break;}}}
   if(guarantee){s.done|=1ull<<i;stat.guaranteed++;continue;}
   int fresh=popcount(unknown);if(n<best||(n==best&&fresh>bestNew)){chosen=i;best=n;bestNew=fresh;}
  }
  if(chosen<0){finish(s);return;}
  auto&g=gs[chosen];auto*a=s.alive.data()+g.offset;vector<size_t> options;
  for(size_t j=0;j<g.W;j++)for(uint64_t b=a[j];b;b&=b-1)options.push_back(j*64+countr_zero(b));
  s.done|=1ull<<chosen;
  // All branches are partial injections. An explicit omission branch
  // covers the up-to-three unsupported words; counts are never inferred
  // from a chosen plaintext score.
  for(auto i:options){stat.branches++;State next=s;if(add(next,g.opts[i]))dfs(move(next),depth+1);if(found||timed)return;}
  if(s.omit<BUDGET){s.omit++;stat.omits++;dfs(move(s),depth+1);}
 }
 State initial()const{State s;s.alive.assign(totalW,~0ull);for(int i=0;i<(int)gs.size();i++){auto&g=gs[i];s.counts[i]=g.opts.size();if(g.W&&g.opts.size()%64)s.alive[g.offset+g.W-1]=(1ull<<(g.opts.size()%64))-1;}return s;}
 public:
 Solver(const string&lf,const string&cf,const string&key,int seconds){if(key.size()!=N)throw runtime_error("key size");for(int j=0;j<N;j++)k[j]=ix(key[j]);build(lf,cf);t0=last=chrono::steady_clock::now();deadline=t0+chrono::seconds(seconds);}
 int run(int only=-1){
  auto init=initial();int ai=0;for(int a:anchors){if(only>=0&&a!=only)continue;anchor=a;auto&g=gs[a];vector<size_t> ids(g.opts.size());iota(ids.begin(),ids.end(),0);mt19937 rng(0x54ab2300u+a);shuffle(ids.begin(),ids.end(),rng);
   State base=init;
   // Partition coverage by the first lexical anchor; earlier anchors are
   // allowed to be omitted. At least one of four must be lexical.
   if(only<0){for(int j=0;j<ai;j++)base.done|=1ull<<anchors[j];base.omit=ai;}
   base.done|=1ull<<a;
   for(size_t i:ids){stat.roots++;if(check())break;State s=base;if(add(s,g.opts[i]))dfs(move(s),1);if(found||timed)break;}
   ai++;if(found||timed)break;
  }
  log(found?"FOUND":timed?"TIMEOUT":"EXHAUSTED");cerr<<"unique="<<seen.size()<<"\n";cout<<"{\"status\":\""<<(found?"FOUND":timed?"TIMEOUT":"EXHAUSTED")<<"\",\"only\":"<<only<<",\"anchor\":"<<anchor<<",\"nodes\":"<<stat.nodes<<",\"roots\":"<<stat.roots<<",\"branches\":"<<stat.branches<<",\"complete\":"<<stat.complete<<",\"support\":"<<resultSupport<<",\"anchors\":[";for(int i=0;i<(int)anchors.size();i++)cout<<(i?",":"")<<anchors[i];cout<<"]";
  if(found){cout<<",\"B\":[";for(int c=0;c<Q;c++)cout<<(c?",":"")<<int(resultB[c]);cout<<"],\"words\":[";for(int i=0;i<(int)resultWords.size();i++)cout<<(i?",":"")<<"\""<<resultWords[i]<<"\"";cout<<"],\"phases\":[";for(int i=0;i<(int)resultPhases.size();i++)cout<<(i?",":"")<<resultPhases[i];cout<<"]";}
  cout<<"}\n";return found?0:2;
 }
};
int main(int argc,char**argv){try{if(argc<5)throw runtime_error("lex train key seconds [anchor]");return Solver(argv[1],argv[2],argv[3],stoi(argv[4])).run(argc>5?stoi(argv[5]):-1);}catch(const exception&e){cerr<<e.what()<<"\n";return 1;}}
