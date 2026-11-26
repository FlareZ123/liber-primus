// Exact interval relaxation for q13 arbitrary-phase alphabet + F hold.
#include <algorithm>
#include <array>
#include <bitset>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <random>
#include <string>
#include <vector>
using namespace std;
#ifndef Q_CLOCK
#define Q_CLOCK 13
#endif
constexpr int Q=Q_CLOCK,A=29,W=(Q+1)/2;constexpr uint32_t ALL=(1u<<A)-1;constexpr uint64_t BOTH=uint64_t(ALL)|(uint64_t(ALL)<<32);
struct Mask{array<uint64_t,W> x{};bool operator<(const Mask&b)const{return x<b.x;}bool operator==(const Mask&b)const{return x==b.x;}};
Mask operator&(Mask a,const Mask&b){for(int i=0;i<W;i++)a.x[i]&=b.x[i];return a;}
Mask operator|(Mask a,const Mask&b){for(int i=0;i<W;i++)a.x[i]|=b.x[i];return a;}
void set(Mask &m,int s,int a){m.x[s/2]|=uint64_t(1)<<(a+32*(s&1));}
uint32_t row(const Mask&m,int s){return uint32_t(m.x[s/2]>>(32*(s&1)));}
int raw(const Mask&m){int n=0;for(auto w:m.x)n+=__builtin_popcountll(w);return n;}
int cap(const Mask&m){int n=0;for(int s=0;s<Q;s++){int v=__builtin_popcount(row(m,s));if(!v)return -1;n+=min(5,v);}return n;}
Mask complement(const Mask&m){Mask r;for(int i=0;i<W-1;i++)r.x[i]=BOTH^m.x[i];r.x[W-1]=(Q%2?ALL:BOTH)^m.x[W-1];return r;}
Mask rot(const Mask&m,int d){Mask r;for(int s=0;s<Q;s++){int p=(s+d)%Q;r.x[p/2]|=uint64_t(row(m,s))<<(32*(p&1));}return r;}
struct Interval{int lo,hi,holds;};
vector<Interval> choices(const vector<int>&c,int h,int k){vector<int> p{-1};for(int i=0;i<(int)c.size();i++)if(c[i]==h)p.push_back(i);p.push_back(c.size());vector<Interval> out;for(int j=0;j+k+1<(int)p.size();j++)out.push_back({p[j]+1,p[j+k+1],k});sort(out.begin(),out.end(),[](auto a,auto b){return a.hi-a.lo!=b.hi-b.lo?a.hi-a.lo>b.hi-b.lo:a.lo<b.lo;});return out;}
struct Histories{vector<Mask> masks;int maxCap=-1,maxRaw=0;uint64_t n=0;};
Histories enumerate(const vector<int>&c,int h,Interval I,int th){
 vector<vector<int>> b(1);for(int i=I.lo;i<I.hi;i++)if(c[i]==h)b.emplace_back();else b.back().push_back(c[i]);assert((int)b.size()==I.holds+1);
 vector<array<Mask,Q>> m(b.size());for(int j=0;j<(int)b.size();j++)for(int s=0;s<Q;s++)for(int i=0;i<(int)b[j].size();i++)set(m[j][s],(s+i)%Q,b[j][i]);
 Histories r;auto go=[&](auto&&self,int j,int s,Mask occupied)->void{occupied=occupied|m[j][s];int p=(s+b[j].size())%Q;if(j+1==(int)b.size()){r.n++;Mask z=complement(occupied);int v=cap(z);r.maxCap=max(r.maxCap,v);r.maxRaw=max(r.maxRaw,raw(z));if(v>=th)r.masks.push_back(z);return;}self(self,j+1,p,occupied);set(occupied,p,h);self(self,j+1,(p+1)%Q,occupied);};go(go,0,0,Mask{});assert(r.n==(1ull<<I.holds));sort(r.masks.begin(),r.masks.end());r.masks.erase(unique(r.masks.begin(),r.masks.end()),r.masks.end());return r;
}
struct Filter {
 vector<array<Mask,Q>> absent; vector<int> len; int h;uint64_t visits=0,leaves=0;vector<Mask> survivors;
 Filter(const vector<int>&c,int h_,Interval I):h(h_){vector<vector<int>> b(1);for(int i=I.lo;i<I.hi;i++)if(c[i]==h)b.emplace_back();else b.back().push_back(c[i]);assert((int)b.size()==I.holds+1);absent.resize(b.size());len.resize(b.size());for(int j=0;j<(int)b.size();j++){len[j]=b[j].size()%Q;for(int s=0;s<Q;s++){Mask m;for(int i=0;i<(int)b[j].size();i++)set(m,(s+i)%Q,b[j][i]);absent[j][s]=complement(m);}}}
 void search(Mask z,int j,int s,int th){visits++;z=z&absent[j][s];if(raw(z)<th||cap(z)<th)return;int p=(s+len[j])%Q;if(j+1==(int)len.size()){leaves++;survivors.push_back(z);return;}search(z,j+1,p,th);z.x[p/2]&=~(uint64_t(1)<<(h+32*(p&1)));if(raw(z)>=th&&cap(z)>=th)search(z,j+1,(p+1)%Q,th);}
 void search(Mask z,int th){for(int s=0;s<Q;s++)search(z,0,s,th);}
};
void dedup(vector<Mask>&v){sort(v.begin(),v.end());v.erase(unique(v.begin(),v.end()),v.end());}
Mask direct(const vector<int>&c,int h,Interval I,unsigned bits,int start=0){bool seen[Q][A]{};int p=start,j=0;for(int i=I.lo;i<I.hi;i++){int a=c[i];if(a==h&&((bits>>j++)&1u))continue;seen[p][a]=true;p=(p+1)%Q;}assert(j==I.holds);Mask z;for(int s=0;s<Q;s++)for(int a=0;a<A;a++)if(!seen[s][a])set(z,s,a);return z;}
void toy(){mt19937 rng(20261126);int tested=0,passes=0,empty=0;for(int t=0;t<40;t++){int h=rng()%A,k=3+rng()%5,n=100+rng()%160;vector<int> c(n);for(int&a:c){a=rng()%(A-1);if(a>=h)a++;}for(int j=0;j<k;){int i=rng()%n;if(c[i]!=h){c[i]=h;j++;}}Interval I{0,n,k};int th=max(1,5*Q-25+int(rng()%26));auto got=enumerate(c,h,I,th);vector<Mask>want;for(unsigned b=0;b<(1u<<k);b++){auto z=direct(c,h,I,b);if(cap(z)>=th)want.push_back(z);}dedup(want);assert(got.masks==want);tested++;Mask z=rot(direct(c,h,I,rng()%(1u<<k)),rng()%Q);if(t%2){z=Mask{};for(int s=0;s<Q;s++)for(int a=0;a<A;a++)if(rng()%5==0)set(z,s,a);}Filter f(c,h,I);f.search(z,th);dedup(f.survivors);want.clear();for(int s=0;s<Q;s++)for(unsigned b=0;b<(1u<<k);b++){auto x=z&direct(c,h,I,b,s);if(cap(x)>=th)want.push_back(x);}dedup(want);assert(f.survivors==want);tested++;passes+=!want.empty();empty+=want.empty();}cout<<"toy exact set comparisons="<<tested<<" filterNonempty="<<passes<<" filterEmpty="<<empty<<"\n";}
void plant(vector<int> p,int h,unsigned seed){assert(p.size()==3008);mt19937 rng(seed);int counts[A]{};for(int a:p)counts[a]++;vector<int>order;for(int a=1;a<A;a++)order.push_back(a);sort(order.begin(),order.end(),[&](int a,int b){return counts[a]!=counts[b]?counts[a]<counts[b]:a<b;});order.resize(4);int rare=0;for(int a:order)rare+=counts[a];assert(rare<=12);shuffle(p.begin(),p.end(),rng);array<array<int,A>,Q> map;for(auto &m:map){for(int a=0;a<A;a++)m[a]=a;shuffle(m.begin(),m.end(),rng);}int phase=rng()%Q;vector<int>c,phases;vector<bool>hold;Mask used;for(int a:p){phases.push_back(phase);hold.push_back(a==0);if(a==0)c.push_back(h);else{c.push_back(map[phase][a]);set(used,phase,c.back());phase=(phase+1)%Q;}}Mask full=complement(used);assert(cap(full)>=5*Q-rare);for(int s=0;s<Q;s++)assert((row(full,s)>>map[s][0])&1u);auto all=choices(c,h,12);vector<Interval> intervals;for(auto I:all){bool disjoint=true;for(auto J:intervals)if(I.hi>J.lo&&I.lo<J.hi)disjoint=false;if(disjoint)intervals.push_back(I);if(intervals.size()==3)break;}assert(intervals.size()==3);Mask z;for(int s=0;s<Q;s++)for(int a=0;a<A;a++)set(z,s,a);for(auto I:intervals){unsigned bits=0,j=0;for(int i=I.lo;i<I.hi;i++)if(c[i]==h){if(hold[i])bits|=1u<<j;j++;}assert(j==12);auto got=enumerate(c,h,I,5*Q-12);Mask canonical=direct(c,h,I,bits),actual=rot(canonical,phases[I.lo]);assert(binary_search(got.masks.begin(),got.masks.end(),canonical));Mask want=z&actual;assert(cap(want)>=5*Q-12);Filter f(c,h,I);f.search(z,5*Q-12);dedup(f.survivors);assert(binary_search(f.survivors.begin(),f.survivors.end(),want));z=want;}cout<<"plant seed="<<seed<<" h="<<h<<" rare="<<rare<<" E="<<counts[18]<<" F="<<counts[0]<<" fullCap="<<cap(full)<<" finalCap="<<cap(z)<<" three interval witnesses retained\n";}
vector<int> readTape(const string&path){ifstream f(path);string str;f>>str;vector<int> c;for(char a:str){int x=a<='9'?a-'0':a-'a'+10;assert(0<=x&&x<A);c.push_back(x);}return c;}
int main(int argc,char**argv){if(argc==2&&string(argv[1])=="toy"){toy();return 0;}if(argc==5&&string(argv[1])=="plant"){plant(readTape(argv[2]),stoi(argv[3]),stoul(argv[4]));return 0;}if(argc<4)return 1;ifstream f(argv[1]);string str;f>>str;vector<int> c;uint32_t hash=2166136261u;for(char a:str){int x=a<='9'?a-'0':a-'a'+10;assert(0<=x&&x<A);c.push_back(x);hash=(hash^x)*16777619u;}assert((c.size()==729&&hash==2252059994u)||(c.size()==1145&&hash==1061761264u)||(c.size()==1729&&hash==1603621047u)||(c.size()==1903&&hash==10919746u)||(c.size()==1255&&hash==3613844392u)||(c.size()==1199&&hash==412204298u)||(c.size()==1680&&hash==3438643603u)||(c.size()==3008&&hash==1862123327u));int h=stoi(argv[2]),k=stoi(argv[3]),th=argc>4?stoi(argv[4]):5*Q-12;assert(k<=25);auto start=chrono::steady_clock::now();auto time=[&](){return chrono::duration<double>(chrono::steady_clock::now()-start).count();};auto all=choices(c,h,k);if(all.empty()){cout<<"decision=UNRESOLVED_SHORT\n";return 0;}Interval I=all[0],J{};for(auto x:all)if(x.hi<=I.lo||x.lo>=I.hi){J=x;break;}if(J.hi<=J.lo){cout<<"decision=UNRESOLVED_SHORT\n";return 0;}auto x=enumerate(c,h,I,th),y=enumerate(c,h,J,th);cerr<<"h="<<h<<" I="<<I.lo<<":"<<I.hi<<" J="<<J.lo<<":"<<J.hi<<" holds="<<k<<" count="<<x.n<<","<<y.n<<" eligible="<<x.masks.size()<<","<<y.masks.size()<<" maxCap="<<x.maxCap<<","<<y.maxCap<<" maxRaw="<<x.maxRaw<<","<<y.maxRaw<<" seconds="<<time()<<"\n";
 vector<Mask> b;for(auto v:y.masks)for(int d=0;d<Q;d++)b.push_back(rot(v,d));sort(b.begin(),b.end());b.erase(unique(b.begin(),b.end()),b.end());cerr<<"rotated eligible="<<b.size()<<"\n";
 int best=-1,rawBest=0;uint64_t n=0,surv=0;vector<Mask> common;
 for(auto a:x.masks){for(auto v:b){Mask z=a&v;int r=raw(z);rawBest=max(rawBest,r);if(r<th)continue;int q=cap(z);best=max(best,q);if(q>=th){surv++;common.push_back(z);if(common.size()>1000000){cout<<"decision=UNRESOLVED_CAP\n";return 0;}}}n+=b.size();}
 cerr<<"pairs="<<n<<" rawBest="<<rawBest<<" capBestAtRawGeThreshold="<<best<<" survivors="<<surv<<" seconds="<<time()<<"\n";
 if(surv){
  sort(common.begin(),common.end());common.erase(unique(common.begin(),common.end()),common.end());cerr<<"unique common="<<common.size()<<"\n";
  vector<Interval> used{I,J};
  while(!common.empty()){
   Interval K{};for(auto t:all){bool disjoint=true;for(auto u:used)if(t.hi>u.lo&&t.lo<u.hi){disjoint=false;break;}if(disjoint){K=t;break;}}if(K.hi<=K.lo)break;used.push_back(K);
   Filter f(c,h,K);for(auto a:common)f.search(a,th);sort(f.survivors.begin(),f.survivors.end());f.survivors.erase(unique(f.survivors.begin(),f.survivors.end()),f.survivors.end());cerr<<"K="<<K.lo<<":"<<K.hi<<" visits="<<f.visits<<" leaves="<<f.leaves<<" survivors="<<f.survivors.size()<<" seconds="<<time()<<"\n";common=move(f.survivors);
  }
  cerr<<"final survivors="<<common.size()<<" intervals="<<used.size()<<"\n";
 }
 cout<<"decision="<<(common.empty()?"EXCLUDED":"UNRESOLVED")<<"\n";
}
