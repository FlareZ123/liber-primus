// Exact arbitrary-initial-state order-2 prime-clock reachability.
// Input: one base-29 digit per original rune in p16..21 (0-9,a-s).
// Compile C++17, OpenMP optional. Output JSON death histogram and survivors.
#include <algorithm>
#include <array>
#include <cassert>
#include <chrono>
#include <cstdint>
#include <fstream>
#include <iostream>
#include <numeric>
#include <string>
#include <vector>
using namespace std;
constexpr int M=841;
struct Result {uint64_t visited=0,keys=0; vector<uint64_t> dead; vector<array<int,5>> survivors;};
Result solve(const vector<int>& tape,int b,int d,int m0,int m1,int seedmode=1){
 int Z=count(tape.begin(),tape.end(),0),N=M*(Z+1),L=tape.size(); assert(N<=65536);
 vector<uint16_t> s(N),t(N),base(N),h(N); vector<uint8_t> f(N); vector<uint32_t> seen(N); vector<int> primes;
 for(int p=2;primes.size()<tape.size();++p){bool ok=true;for(int q:primes){if(q*q>p)break;if(p%q==0){ok=false;break;}}if(ok)primes.push_back(p);}
 for(int v=0;v<N;++v){int j=v%M,x=j%29,y=j/29;h[v]=v/M;f[v]=(b*x+d*y)%29;base[v]=M*h[v]+29*x;}
 Result out;out.dead.resize(L+1);uint32_t stamp=0; vector<uint8_t> bias((Z+1)*L);
 int z=0;vector<int> maxh(L);for(int i=0;i<L;++i){maxh[i]=z;if(tape[i]==0)++z;}
 for(int m=m0;m<m1;++m)for(int k=0;k<29;++k){++out.keys;
 for(int i=0;i<L;++i)for(int j=0;j<=maxh[i];++j)bias[i*(Z+1)+j]=(tape[i]+k+m*(primes[i-j]-1))%29;
 int count0=seedmode?M:1;iota(s.begin(),s.begin()+count0,0);int i=0;
 for(;i<L;++i){++stamp;int n=0;out.visited+=count0;auto pb=bias.data()+i*(Z+1);
 if(tape[i]==0){for(int j=0;j<count0;++j){int v=s[j],w=v+M;if(seen[w]!=stamp){seen[w]=stamp;t[n++]=w;}int x=f[v]+pb[h[v]];if(x>=29)x-=29;if(x){w=base[v]+x;if(seen[w]!=stamp){seen[w]=stamp;t[n++]=w;}}}}
 else{for(int j=0;j<count0;++j){int v=s[j],x=f[v]+pb[h[v]];if(x>=29)x-=29;if(x){int w=base[v]+x;if(seen[w]!=stamp){seen[w]=stamp;t[n++]=w;}}}}
 if(!n)break;count0=n;s.swap(t);}
 ++out.dead[i];if(i==L)out.survivors.push_back({b,d,m,k,count0});}return out;}
int main(int argc,char**argv){if(argc<2)return 1;ifstream in(argv[1]);string st;in>>st;vector<int> tape;for(char c:st){int x=c<='9'?c-'0':c-'a'+10;assert(x>=0&&x<29);tape.push_back(x);}assert(!tape.empty());int begin=argc>2?stoi(argv[2]):0,end=argc>3?stoi(argv[3]):29,mode=argc>4?stoi(argv[4]):1;assert(begin>=0&&end<=29&&begin<end);vector<Result> res((end-begin)*29);auto start=chrono::steady_clock::now();
#pragma omp parallel for schedule(dynamic,1)
 for(int i=0;i<(end-begin)*29;++i)res[i]=solve(tape,begin+i/29,i%29,1,29,mode);
 Result out;out.dead.resize(tape.size()+1);for(auto&r:res){out.keys+=r.keys;out.visited+=r.visited;for(int i=0;i<out.dead.size();++i)out.dead[i]+=r.dead[i];out.survivors.insert(out.survivors.end(),r.survivors.begin(),r.survivors.end());}
 cout<<"{\"bstart\":"<<begin<<",\"bend\":"<<end<<",\"seedmode\":"<<mode<<",\"keys\":"<<out.keys<<",\"visited\":"<<out.visited<<",\"seconds\":"<<chrono::duration<double>(chrono::steady_clock::now()-start).count()<<",\"hist\":[";for(int i=0;i<out.dead.size();++i){if(i)cout<<',';cout<<out.dead[i];}cout<<"],\"survivors\":[";for(int i=0;i<out.survivors.size();++i){if(i)cout<<',';cout<<'[';for(int j=0;j<5;++j){if(j)cout<<',';cout<<out.survivors[i][j];}cout<<']';}cout<<"]}\n";}
