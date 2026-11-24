// Adaptive fixed-insertion list cipher: exact partition attack.
#include <algorithm>
#include <array>
#include <cassert>
#include <cstdint>
#include <iostream>
#include <numeric>
#include <random>
#include <vector>
using namespace std;
using U=uint32_t;
struct E{int b=-1; U g=0;};
int pc(U x){x-=((x>>1)&0x55555555u);x=(x&0x33333333u)+((x>>2)&0x33333333u);return (((x+(x>>4))&0x0f0f0f0fu)*0x01010101u)>>24;}
vector<E> events(const vector<int>& x){int c=x[0],n=0;int id[29];for(int i=0;i<29;i++)id[i]=i==c?-1:n++;U gaps[28]={},seen=0;vector<E> e(x.size());for(size_t i=1;i<x.size();i++){int v=x[i],t=id[v];if(t==-1){e[i]={0,0};continue;}U b=1u<<t;if(seen&b)e[i]={(int)b,gaps[t]};for(int k=0;k<28;k++)if(k!=t)gaps[k]|=b;gaps[t]=0;seen|=b;id[c]=t;id[v]=-1;c=v;}return e;}
int rankof(E e,U m,int r){return e.b==0?r:(m&e.b)?r-1-pc(e.g&m):r+1+pc(e.g&~m);}
template<class F> long long subsets(int r,F f){U m=(1u<<r)-1;long long tested=0;do{f(m);tested++;if(!m)break;U lo=m&-m,hi=m+lo;m=hi+((hi^m)>>2)/lo;}while(m<(1u<<28));long long expected=1;for(int k=1;k<=r;k++)expected=expected*(29-k)/k;assert(tested==expected);return tested;}
bool ok[841];
vector<U> attack(const vector<E>& e,vector<int> starts,int r){starts.erase(remove_if(starts.begin(),starts.end(),[&](int s){return e[s].b<0||e[s+1].b<0;}),starts.end());vector<long long> counts(starts.size());vector<U> keys;auto tested=subsets(r,[&](U m){size_t j=0;for(;j<starts.size();j++){int s=starts[j];if(!ok[rankof(e[s],m,r)*29+rankof(e[s+1],m,r)])break;counts[j]++;}if(j==starts.size())keys.push_back(m);});cout<<"lex r="<<r<<" tested="<<tested<<" survivors="<<keys.size()<<" counts=";for(auto c:counts)cout<<c<<",";cout<<"\n";return keys;}
vector<int> readv(){int n;cin>>n;assert(n>=0);vector<int> v(n);for(int&x:v)cin>>x;return v;}
int main(){auto x=readv(),starts=readv(),sing=readv(),dict=readv(),p=readv(),ps=readv();assert(x.size()==12956&&starts.size()==28&&sing.size()==83&&dict.size()==189&&p.size()==448);for(int z:dict)ok[z]=true;auto e=events(x);for(int r:{12,13,22,23})assert(attack(e,starts,r).empty());
vector<E> se;for(int s:sing)if(e[s].b>=0)se.push_back(e[s]);assert(se.size()==83);
array<int,29> minima={27,23,23,23,22,21,21,21,20,20,20,19,20,19,20,19,20,19,20,20,20,21,21,21,22,23,23,23,27};long long all=0;
for(int r=0;r<=28;r++){int best=29;U bm=0;long long ties=0;auto n=subsets(r,[&](U m){U b=0;int d=0;for(auto z:se){b|=1u<<rankof(z,m,r);d=pc(b);if(d>best)break;}if(d<best){best=d;bm=m;ties=1;}else if(d==best)ties++;});all+=n;assert(best==minima[r]);cout<<"singleton r="<<r<<" tested="<<n<<" minimum="<<best<<" witness="<<bm<<" ties="<<ties<<"\n";}assert(all==(1u<<28));
for(int r:{13,23}){vector<int>a(29),q;iota(a.begin(),a.end(),0);mt19937 gen(3301+r);shuffle(a.begin(),a.end(),gen);U m=0;for(int z:p){int v=a[z];a.erase(a.begin()+z);a.insert(a.begin()+r,v);q.push_back(v);if(q.size()==1){int k=0;for(int j=0;j<29;j++)if(j!=v){if(find(a.begin(),a.end(),j)-a.begin()<r)m|=1u<<k;k++;}}}auto pe=events(q);int known=0;for(size_t i=0;i<p.size();i++)if(pe[i].b>=0){known++;assert(rankof(pe[i],m,r)==p[i]);}auto keys=attack(pe,ps,r);assert(keys.size()==1&&keys[0]==m);cout<<"native plant r="<<r<<" recovered partition="<<m<<" exact known ranks="<<known<<"/"<<p.size()<<"\n";}
}
