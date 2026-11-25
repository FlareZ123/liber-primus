#include <algorithm>
#include <array>
#include <atomic>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <mutex>
#include <numeric>
#include <string>
#include <thread>
#include <vector>
using namespace std;
using U=uint32_t;
struct Search {
 int q,L; U all; vector<int> shift,order; vector<vector<U>> restrictions; vector<vector<int>> domains;
 struct Result {uint64_t tests=0,nodes=0; vector<uint64_t> hist; vector<vector<int>> keys;};
 Search(const vector<int>& C,int q):q(q),all((1u<<q)-1u){
  vector<vector<U>> bad; vector<U> b(q); int n=0;
  for(int x:C) if(!x){bad.push_back(b);shift.push_back(n%q);fill(b.begin(),b.end(),0);n=0;}else{b[n%q]|=1u<<x;++n;}
  bad.push_back(b);shift.push_back(n%q);L=bad.size();
  restrictions.assign(q*29,vector<U>(L));domains.resize(q);order.resize(q);iota(order.begin(),order.end(),0);
  for(int j=0;j<q;j++)for(int k=0;k<29;k++)for(int s=0;s<L;s++){U m=0;for(int a=0;a<q;a++)if(!(bad[s][(j-a+q)%q]&(1u<<k)))m|=1u<<a;restrictions[j*29+k][s]=m;}
  vector<U> src(L,all),dest(L); for(int j=0;j<q;j++)for(int k=0;k<29;k++)if(test(src,dest,j,k,k?all:all&~(1u<<j)))domains[j].push_back(k);
  stable_sort(order.begin(),order.end(),[&](int a,int b){return domains[a].size()<domains[b].size();});
 }
 inline U rot(U x,int s) const {return ((x<<s)|(x>>(q-s)))&all;}
 bool test(const vector<U>& src,vector<U>& dest,int j,int k,U allow) const {
  const auto& mask=restrictions[j*29+k];U p=1;
  for(int s=0;s<L;s++){U m=src[s]&mask[s];dest[s]=m;p=rot(p&m,shift[s]);if(!p)return false;if(s+1<L)p|=rot(p&allow,1);}
  return true;
 }
 void dfs(int d,U allow,vector<int>& K,vector<vector<U>>& stack,Result& R) const {
  ++R.nodes;++R.hist[d];if(d==q){R.keys.push_back(K);return;}
  int j=order[d];for(int k:domains[j]){K[j]=k;U a=k?allow:allow&~(1u<<j);++R.tests;if(test(stack[d],stack[d+1],j,k,a))dfs(d+1,a,K,stack,R);}K[j]=-1;
 }
 Result branch(int k) const {
  Result R;R.hist.resize(q+1);vector<int>K(q,-1);vector<vector<U>>stack(q+1,vector<U>(L,all));int j=order[0];K[j]=k;U a=k?all:all&~(1u<<j);++R.tests;if(test(stack[0],stack[1],j,k,a))dfs(1,a,K,stack,R);return R;
 }
};
array<int,29> score(const vector<int>& C,const vector<int>& K){
 int q=K.size();using A=array<int,29>;vector<A>a(q),b(q);for(auto&x:a)x.fill(-1);a[0].fill(0);
 for(int c:C){for(auto&x:b)x.fill(-1);for(int j=0;j<q;j++)if(a[j][0]>=0){auto offer=[&](int e,int p){for(int r=0;r<29;r++)b[e][r]=max(b[e][r],a[j][r]+(p==r));};if(!c)offer(j,0);int p=(c-K[j]+29)%29;if(p)offer((j+1)%q,p);}a.swap(b);}
 A out;out.fill(-1);for(auto&x:a)for(int r=0;r<29;r++)out[r]=max(out[r],x[r]);return out;
}
void printvec(const vector<int>& a){cout<<'[';for(size_t i=0;i<a.size();i++){if(i)cout<<',';cout<<a[i];}cout<<']';}
int main(int argc,char**argv){if(argc!=5){cerr<<"usage: program tape q threads output-keys-file\n";return 2;}ifstream f(argv[1]);string s;f>>s;vector<int>C;U h=2166136261u;for(char c:s){int x=c<='9'?c-'0':c-'a'+10;if(x<0||x>=29)return 2;C.push_back(x);h=(h^U(x))*16777619u;}
 if(C.size()!=3316||count(C.begin(),C.end(),0)!=131||h!=0x71af25aa){cerr<<"source mismatch\n";return 2;}
 int q=stoi(argv[2]),T=stoi(argv[3]);if(q<1||q>30||T<1)return 2;Search G(C,q);auto start=chrono::steady_clock::now();atomic<int>next{0};mutex m;vector<Search::Result> R(G.domains[G.order[0]].size());auto& root=G.domains[G.order[0]];
 vector<thread> workers;for(int t=0;t<T;t++)workers.emplace_back([&]{for(;;){int i=next.fetch_add(1);if(i>=int(root.size()))break;R[i]=G.branch(root[i]);lock_guard<mutex>g(m);cerr<<"q="<<q<<" root="<<root[i]<<" nodes="<<R[i].nodes<<" keys="<<R[i].keys.size()<<"\n";}});for(auto&t:workers)t.join();
 uint64_t tests=uint64_t(q)*29,nodes=1,keys=0;vector<uint64_t>hist(q+1);hist[0]=1;int maxE=-1,maxAny=-1,maxRune=-1,maxNonzero=0;vector<int>EKey,AnyKey;ofstream out(argv[4]);
 for(auto&r:R){tests+=r.tests;nodes+=r.nodes;keys+=r.keys.size();for(int j=1;j<=q;j++)hist[j]+=r.hist[j];for(auto&k:r.keys){auto a=score(C,k);if(*min_element(a.begin(),a.end())<0){cerr<<"invalid key\n";return 3;}maxNonzero=max(maxNonzero,int(count_if(k.begin(),k.end(),[](int v){return v!=0;})));if(a[18]>maxE){maxE=a[18];EKey=k;}for(int p=0;p<29;p++)if(a[p]>maxAny){maxAny=a[p];maxRune=p;AnyKey=k;}for(int v:k)out<<"0123456789abcdefghijklmnopqrs"[v];out<<'\n';}}
 cout<<"{\"q\":"<<q<<",\"tests\":"<<tests<<",\"nodes\":"<<nodes<<",\"keys\":"<<keys<<",\"maxNonzero\":"<<maxNonzero<<",\"maxE\":"<<maxE<<",\"maxAny\":"<<maxAny<<",\"maxRune\":"<<maxRune<<",\"EKey\":";printvec(EKey);cout<<",\"AnyKey\":";printvec(AnyKey);cout<<",\"hist\":[";for(int j=0;j<=q;j++){if(j)cout<<',';cout<<hist[j];}cout<<"],\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<"}\n";
}
