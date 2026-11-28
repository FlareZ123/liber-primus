// Exact top-m concentration maxima for remove/reinsert at any fixed rank.
// stdin: base29-encoded original chapter and native clear control (one token each).
// Optional inclusive subset range [lo,hi], with full range 0..2^27-1.
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <cstdlib>
#include <fstream>
#include <iostream>
#include <numeric>
#include <random>
#include <string>
#include <vector>
#include <omp.h>
using namespace std;
using U=uint32_t;
constexpr U FULL=(1u<<28)-1;
struct Feature { U mask; int n; };
struct Data { array<vector<Feature>,28> f; U seen=0; int repeats=0; int n=0; array<int,29> map; };
vector<int> parse(const string &s){vector<int> v;for(char c:s){int x=(c<='9'?c-'0':c-'a'+10);assert(x>=0&&x<29);v.push_back(x);}return v;}
Data features(const vector<int>& c){Data d;d.n=c.size();array<int,29> inv; iota(inv.begin(),inv.end(),0);const int pivot=c[0];int j=0;for(int x=0;x<29;x++)d.map[x]=(x==pivot?-1:j++);array<int,28> last;last.fill(-1);array<vector<U>,28> tmp;int prev=pivot;
 for(int i=1;i<(int)c.size();i++){int x=c[i],z=d.map[inv[x]];if(z<0){assert(x==prev);d.repeats++;}else{assert(x!=prev);if(last[z]>=0){U m=0;for(int t=0;t<28;t++)if(t!=z&&last[t]>last[z])m|=1u<<t;tmp[z].push_back(m);}last[z]=i;d.seen|=1u<<z;}swap(inv[x],inv[prev]);prev=x;}
 for(int z=0;z<28;z++){sort(tmp[z].begin(),tmp[z].end());for(U m:tmp[z]){if(d.f[z].empty()||d.f[z].back().mask!=m)d.f[z].push_back({m,1});else d.f[z].back().n++;}}
 return d;
}
int pc(U x){return __builtin_popcount(x);}
vector<int> encode(const vector<int>&p,vector<int>deck,int k){vector<int>c;for(int r:p){int x=deck[r];c.push_back(x);deck.erase(deck.begin()+r);deck.insert(deck.begin()+k,x);}return c;}
vector<int> decode(const vector<int>&c,vector<int>deck,int k){vector<int>p;for(int x:c){int r=find(deck.begin(),deck.end(),x)-deck.begin();assert(r<29);p.push_back(r);deck.erase(deck.begin()+r);deck.insert(deck.begin()+k,x);}return p;}
constexpr int M=5,NEG=-1000000;
using Top=array<int,M+1>;
Top lane(const Data& d,U s){array<int,28> h{};for(U b=s;b;b&=b-1){int z=__builtin_ctz(b);for(const auto &f:d.f[z])h[pc(s&f.mask)]+=f.n;}int k=pc(s),seen=pc(s&d.seen);Top best;best.fill(NEG);best[0]=0;array<int,M> prefix{};for(int r=0;r<k;r++){int v=h[r]+min(r+1,seen),cum=0;for(int m=1;m<=min(M,r+1);m++){best[m]=max(best[m],v+cum);cum+=prefix[m-1];}int x=h[r];for(int j=0;j<M;j++)if(x>prefix[j])swap(x,prefix[j]);}return best;}
struct Result{int count=0;U mask=0;int left=0,right=0,center=0;};
void scan(const vector<int>& c,U lo=0,U limit=(1u<<27)-1){const Data d=features(c);int groups=0,events=0;for(auto& f:d.f)for(auto e:f){groups++;events+=e.n;}cerr<<"N="<<d.n<<" repeats="<<d.repeats<<" distinct_masks="<<groups<<" repeated_accesses="<<events<<" seen="<<pc(d.seen)<<" range="<<lo<<","<<limit<<"\n";
 array<Result,M+1> best{};auto start=chrono::steady_clock::now();
 #pragma omp parallel
 {array<Result,M+1> local{};
 #pragma omp for schedule(static)
 for(U s=lo;s<=limit;s++){auto l=lane(d,s),r=lane(d,FULL^s);for(int a=0;a<=M;a++){if(l[a]<0)continue;for(int b=0;a+b<=M;b++){if(r[b]<0)continue;int m=a+b,v=l[a]+r[b]+1;if(m>0&&v>local[m].count)local[m]={v,s,a,b,0};if(m<M&&v+d.repeats>local[m+1].count)local[m+1]={v+d.repeats,s,a,b,1};}}}
 #pragma omp critical
 for(int m=1;m<=M;m++)if(local[m].count>best[m].count)best[m]=local[m];
 }
 for(int m=1;m<=M;m++){auto b=best[m];cout<<m<<","<<b.count<<","<<b.mask<<","<<b.left<<","<<b.right<<","<<b.center<<"\n";}
 cout<<"seconds="<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"\n";
}
void control(const vector<int>&p){
 mt19937 rng(3301);int passed=0;
 for(int trial=0;trial<58;trial++){
   vector<int> deck(29);iota(deck.begin(),deck.end(),0);shuffle(deck.begin(),deck.end(),rng);int k=trial%29;auto c=encode(p,deck,k);assert(decode(c,deck,k)==p);
   auto d=features(c);int h[29]{};for(int x:p)h[x]++;assert(d.repeats==h[k]-(p[0]==k));
   int r=p[0],x=deck[r];deck.erase(deck.begin()+r);deck.insert(deck.begin()+k,x);U s=0;for(int i=0;i<k;i++)s|=1u<<d.map[deck[i]];
   auto l=lane(d,s),rr=lane(d,FULL^s);vector<int> hl,hr;for(int j=0;j<k;j++)hl.push_back(h[j]-(p[0]==j));for(int j=k+1;j<29;j++)hr.push_back(h[j]-(p[0]==j));sort(hl.rbegin(),hl.rend());sort(hr.rbegin(),hr.rend());
   int a=0,b=0;for(int m=1;m<=M;m++){if(m<=k){a+=hl[m-1];assert(a<=l[m]);}if(m<=28-k){b+=hr[m-1];assert(b<=rr[m]);}}
   if(trial==26||trial==28)cerr<<"control pivot="<<k<<" repeats="<<d.repeats<<" mode="<<*max_element(h,h+29)<<"\n";passed++;
 }
 cerr<<"positive controls passed="<<passed<<"\n";
}
int main(int argc,char**argv){string original,controltext;cin>>original>>controltext;auto c=parse(original),p=parse(controltext);assert(c.size()==729&&p.size()>=729);p.resize(c.size());control(p);
 U lo=argc>1?stoul(argv[1]):0,limit=argc>2?stoul(argv[2]):((1u<<27)-1);assert(lo<=limit&&limit<(1u<<27));scan(c,lo,limit);
}
