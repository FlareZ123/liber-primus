// Exact fixed-numeric source-key component receiver. C++17; optional OpenMP.
#include <algorithm>
#include <array>
#include <atomic>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstring>
#include <fstream>
#include <iostream>
#include <map>
#include <mutex>
#include <numeric>
#include <set>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <vector>
#ifdef _OPENMP
#include <omp.h>
#endif
using namespace std;
constexpr int N=29,Q=8,M=19,L=28;
constexpr array<int,Q> K={19,21,23,27,2,14,10,19};
using Word=vector<uint8_t>;using Pi=array<uint8_t,N>;
uint8_t inv[N],mul[N][N],sub[N][N],dif[N][N][N];
int mod(int x){x%=N;return x<0?x+N:x;}
void init(){for(int x=0;x<N;x++)for(int y=0;y<N;y++){mul[x][y]=x*y%N;sub[x][y]=mod(x-y);if(x*y%N==1)inv[x]=y;for(int z=0;z<N;z++)dif[x][y][z]=mod(x-y-z);}}
int val(char c){return c<='9'?c-'0':c-'a'+10;}
char sym(int x){return x<10?'0'+x:'a'+x-10;}
string str(const Pi& p){string s;for(int x:p)s+=sym(x);return s;}
vector<Word> readWords(const string& path){ifstream f(path);if(!f)throw runtime_error("cannot read "+path);vector<Word> v;string s;while(f>>s){Word w;for(char c:s){int x=val(c);if(x<0||x>=N)throw runtime_error("bad rune");w.push_back(x);}v.push_back(move(w));}return v;}
string wkey(const Word& w){return string(reinterpret_cast<const char*>(w.data()),w.size());}
constexpr uint32_t FULL=(1u<<N)-1;
uint32_t rot(uint32_t x,int d){return d?((x<<d)|(x>>(N-d)))&FULL:x;}
struct Space {array<uint8_t,N> root{},offset{};array<uint32_t,N> mask{};int d=N-1;};
Space base(){Space s;for(int i=0;i<N;i++){s.root[i]=i;s.mask[i]=1;}return s;}
struct Edge{uint8_t c,p,k;};
uint16_t eid(Edge e){return (e.c*N+e.p)*N+e.k;}
int delta(const Space& s,Edge e){return mod(e.k+s.offset[e.p]-s.offset[e.c]);}
bool possible(const Space& s,Edge e){int a=s.root[e.c],b=s.root[e.p],d=delta(s,e);return a==b?d==0:!(rot(s.mask[a],d)&s.mask[b]);}
bool constrain(Space& s,Edge e){int a=s.root[e.c],b=s.root[e.p],d=delta(s,e);if(a==b)return d==0;uint32_t m=rot(s.mask[a],d);if(m&s.mask[b])return false;
 // Keep the larger component as root. The relative offsets remain exact.
 if(__builtin_popcount(s.mask[a])>__builtin_popcount(s.mask[b])){swap(a,b);d=mod(-d);m=rot(s.mask[a],d);}
 for(int i=0;i<N;i++)if(s.root[i]==a){s.root[i]=b;s.offset[i]=mod(s.offset[i]+d);}s.mask[b]|=m;s.mask[a]=0;s.d--;return true;}
bool valid(const Space&){return true;}
struct Option{array<Edge,16> e{};array<uint16_t,16> feature{};uint8_t n=0;};
bool apply(const Space& s,const Option& o,Space& t){t=s;for(int i=0;i<o.n;i++)if(!constrain(t,o.e[i]))return false;return valid(t);}
bool edges(const Word& c,const Word& w,int j,Option& o){o.n=0;for(size_t i=0;i<c.size();i++){int p=w[i],a=c[i];if(!p){if(a)return false;o.feature[i]=0;continue;}int k=K[j];if(a==p)return false;for(int n=0;n<o.n;n++){auto e=o.e[n];if((e.c==a&&e.p==p&&e.k!=k)||(e.k==k&&((e.c==a&&e.p!=p)||(e.p==p&&e.c!=a))))return false;}o.e[o.n++]={(uint8_t)a,(uint8_t)p,(uint8_t)k};o.feature[i]=k*N+p;j=(j+1)%Q;}return true;}
struct Domain{int group;vector<Option> opts;vector<vector<pair<int,vector<int>>>> post;};
Domain makeDomain(int g,const Word& c,const vector<Word>& words,const Space& b){Domain d;d.group=g;d.post.resize(c.size());unordered_set<string> seen;vector<map<int,vector<int>>> tmp(c.size());for(const auto& w:words)for(int j=0;j<Q;j++){Option o;if(!edges(c,w,j,o))continue;Space t;if(!apply(b,o,t))continue;array<uint16_t,16> ids{};for(int i=0;i<o.n;i++)ids[i]=eid(o.e[i]);sort(ids.begin(),ids.begin()+o.n);auto end=unique(ids.begin(),ids.begin()+o.n);string id(reinterpret_cast<const char*>(ids.data()),2*(end-ids.begin()));if(!seen.insert(id).second)continue;int index=d.opts.size();d.opts.push_back(o);for(size_t i=0;i<c.size();i++)tmp[i][o.feature[i]].push_back(index);}for(size_t i=0;i<c.size();i++)for(auto& a:tmp[i])d.post[i].push_back({a.first,move(a.second)});return d;}
struct Filter{const Space& s;array<uint32_t,N*N> cache;bool saturated=false;Filter(const Space& sp):s(sp){cache.fill(UINT32_MAX);}
 uint32_t mask(int c,int k){auto& cached=cache[c*N+k];if(cached!=UINT32_MAX)return cached;uint32_t bits=0;for(int p=1;p<N;p++)if(possible(s,{(uint8_t)c,(uint8_t)p,(uint8_t)k}))bits|=1u<<p;return cached=bits;}
 bool allowed(const Option& o){for(int i=0;i<o.n;i++){auto e=o.e[i];if(!(mask(e.c,e.k)&(1u<<e.p)))return false;}return true;}
};
struct Stats{uint64_t nodes=0,joins=0,filters=0,featureTests=0,saturated=0,enumNodes=0,enumerated=0,accepted=0;int maxLong=0,maxAll=0;map<int,uint64_t> dims;vector<Pi> winners;};
struct Problem{vector<Word> cipher,full;vector<vector<Word>> by;unordered_set<string> dict;vector<Domain> ds;Space b;int maxOov=3;uint32_t all=0;};
// Exact dictionary reachability, with transparent plaintext F and ordinary encoded zero.
bool supported(const Word& c,const Pi& pi,const Pi& ip,const unordered_set<string>& dict){string w(c.size(),'\0');auto walk=[&](auto&& self,int i,int j)->bool{if(i==(int)c.size())return dict.count(w);if(!c[i]){w[i]=0;if(self(self,i+1,j))return true;}int p=ip[sub[pi[c[i]]][K[j]]];if(!p)return false;w[i]=char(p);return self(self,i+1,(j+1)%Q);};for(int j=0;j<Q;j++)if(walk(walk,0,j))return true;return false;}
struct Search{const Problem& p;Stats st;unordered_set<string> seen;Search(const Problem& x):p(x){}
 void score(const Pi& pi){string id(reinterpret_cast<const char*>(pi.data()),N);if(!seen.insert(id).second)return;st.enumerated++;Pi ip{};for(int x=0;x<N;x++)ip[pi[x]]=x;int lc=0;for(const auto& d:p.ds)lc+=supported(p.cipher[d.group],pi,ip,p.dict);st.maxLong=max(st.maxLong,lc);if(lc<(int)p.ds.size()-p.maxOov)return;int cov=0;for(size_t i=2;i<p.cipher.size();i++)cov+=supported(p.cipher[i],pi,ip,p.dict);if(cov>st.maxAll){st.maxAll=cov;st.winners.clear();}if(cov==st.maxAll&&st.winners.size()<20)st.winners.push_back(pi);if(cov>=(int)p.cipher.size()-2-p.maxOov)st.accepted++;}
 void enumerate(const Space& s){vector<int> roots;int r0=s.root[0];for(int r=0;r<N;r++)if(s.mask[r]&&r!=r0)roots.push_back(r);sort(roots.begin(),roots.end(),[&](int a,int b){return __builtin_popcount(s.mask[a])>__builtin_popcount(s.mask[b]);});array<uint8_t,N> shift{};shift[r0]=mod(-s.offset[0]);uint32_t used=rot(s.mask[r0],shift[r0]);Pi pi{};auto visit=[&](auto&& self,int j,uint32_t mask)->void{st.enumNodes++;if(j==(int)roots.size()){for(int x=0;x<N;x++)pi[x]=mod(s.offset[x]+shift[s.root[x]]);score(pi);return;}int r=roots[j];for(int v=0;v<N;v++){uint32_t m=rot(s.mask[r],v);if(m&mask)continue;shift[r]=v;self(self,j+1,mask|m);}};visit(visit,0,used);}
 void visit(const Space& s,uint32_t remaining,int budget){st.nodes++;st.dims[s.d]++;if(s.d<=3||__builtin_popcount(remaining)<=budget){enumerate(s);return;}Filter f(s);if(f.saturated){st.saturated++;return;}int pick=-1;vector<int> domain;size_t best=SIZE_MAX;
  // Remove groups already impossible under this affine space; reuse the same filter.
  for(int i=0;i<(int)p.ds.size();i++)if(remaining&(1u<<i)){const auto& d=p.ds[i];const auto& c=p.cipher[d.group];size_t count=SIZE_MAX;vector<const vector<int>*> posting;
   for(size_t j=0;j<d.post.size();j++){size_t n=0;vector<const vector<int>*> lists;for(const auto& [feature,list]:d.post[j]){st.featureTests++;int k=feature/N,a=feature%N;if(a&&!(f.mask(c[j],k)&(1u<<a)))continue;n+=list.size();lists.push_back(&list);if(n>=count)break;}if(n<count){count=n;posting=move(lists);if(!count)break;}}
   vector<int> cand;bool stop=false;for(auto* list:posting){for(int id:*list){st.filters++;if(f.allowed(d.opts[id])){cand.push_back(id);if(cand.size()>=best){stop=true;break;}}}if(stop)break;}
   if(cand.empty()){if(budget==0)return;remaining&=~(1u<<i);budget--;continue;}
   if(cand.size()<best){best=cand.size();pick=i;domain=move(cand);}
  }
  if(pick<0||__builtin_popcount(remaining)<=budget){enumerate(s);return;}
  uint32_t next=remaining&~(1u<<pick);unordered_set<string> spaces;spaces.reserve(domain.size());for(int id:domain){st.joins++;Space t;if(!apply(s,p.ds[pick].opts[id],t))continue;string sk(reinterpret_cast<const char*>(t.root.data()),N);sk.append(reinterpret_cast<const char*>(t.offset.data()),N);if(!spaces.insert(sk).second)continue;visit(t,next,budget);}if(budget>0)visit(s,next,budget-1);
 }
};
void merge(Stats& a,const Stats& b){a.nodes+=b.nodes;a.joins+=b.joins;a.filters+=b.filters;a.featureTests+=b.featureTests;a.saturated+=b.saturated;a.enumNodes+=b.enumNodes;a.enumerated+=b.enumerated;a.accepted+=b.accepted;a.maxLong=max(a.maxLong,b.maxLong);for(auto [d,n]:b.dims)a.dims[d]+=n;if(b.maxAll>a.maxAll){a.maxAll=b.maxAll;a.winners.clear();}if(b.maxAll==a.maxAll)for(const auto& q:b.winners)if(a.winners.size()<20&&find(a.winners.begin(),a.winners.end(),q)==a.winners.end())a.winners.push_back(q);}
int main(int argc,char**argv){if(argc!=10){cerr<<"usage: red8 words.txt cipher.txt groups anchor omitted-csv|- maxOov begin end threads\n";return 2;}init();Problem p;p.b=base();auto words=readWords(argv[1]);p.full=readWords(argv[2]);p.cipher=p.full;int groups=stoi(argv[3]),anchor=stoi(argv[4]);p.cipher.resize(groups);p.maxOov=stoi(argv[6]);int begin=stoi(argv[7]),end=stoi(argv[8]),threads=stoi(argv[9]);set<int> omitted;string om=argv[5];if(om!="-"){size_t x=0;while(x<om.size()){auto y=om.find(',',x);omitted.insert(stoi(om.substr(x,y-x)));if(y==string::npos)break;x=y+1;}}p.by.resize(40);for(const auto& w:words){p.by[w.size()].push_back(w);p.dict.insert(wkey(w));}assert(p.dict.size()==38938);assert(p.full.size()==66);for(int g=2;g<groups;g++)if(p.cipher[g].size()>=8)p.ds.push_back(makeDomain(g,p.cipher[g],p.by[p.cipher[g].size()],p.b));assert(p.ds.size()<32);int ai=-1;uint32_t remaining=0;for(int i=0;i<(int)p.ds.size();i++){auto& d=p.ds[i];cerr<<"domain "<<d.group<<" "<<d.opts.size()<<"\n";if(d.group==anchor)ai=i;else if(!omitted.count(d.group))remaining|=1u<<i;}assert(ai>=0&&!omitted.count(anchor));const auto& a=p.ds[ai];end=min(end,(int)a.opts.size());int budget=p.maxOov-omitted.size();assert(budget>=0&&begin<=end);Stats total;atomic<int> done=0;auto start=chrono::steady_clock::now();
#ifdef _OPENMP
 omp_set_num_threads(threads);
#pragma omp parallel for schedule(dynamic,1)
#endif
 for(int i=begin;i<end;i++){Space s;if(!apply(p.b,a.opts[i],s))throw runtime_error("anchor inconsistent");Search search(p);search.visit(s,remaining,budget);
#ifdef _OPENMP
#pragma omp critical
#endif
  {merge(total,search.st);int n=++done;if(n%25==0||n==end-begin)cerr<<"completed "<<n<<"/"<<end-begin<<" nodes "<<total.nodes<<" filters "<<total.filters<<" maps "<<total.enumerated<<" accepted "<<total.accepted<<" seconds "<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"\n";}}
 cout<<"{\"anchor\":"<<anchor<<",\"omitted\":[";bool first=true;for(int o:omitted){if(!first)cout<<',';first=false;cout<<o;}cout<<"],\"maxOov\":"<<p.maxOov<<",\"budget\":"<<budget<<",\"groups\":"<<groups<<",\"anchorOptions\":"<<a.opts.size()<<",\"range\":["<<begin<<','<<end<<"],\"complete\":true,\"nodes\":"<<total.nodes<<",\"joins\":"<<total.joins<<",\"filters\":"<<total.filters<<",\"featureTests\":"<<total.featureTests<<",\"saturated\":"<<total.saturated<<",\"enumNodes\":"<<total.enumNodes<<",\"enumerated\":"<<total.enumerated<<",\"accepted\":"<<total.accepted<<",\"maxLong\":"<<total.maxLong<<",\"maxAll\":"<<total.maxAll<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<",\"winners\":[";first=true;for(const auto& q:total.winners){if(!first)cout<<',';first=false;cout<<'"'<<str(q)<<'"';}cout<<"],\"dimensionNodes\":{";first=true;for(auto [d,n]:total.dims){if(!first)cout<<',';first=false;cout<<'"'<<d<<"\":"<<n;}cout<<"}}\n";}
