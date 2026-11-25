#include <algorithm>
#include <array>
#include <cmath>
#include <iostream>
#include <iomanip>
#include <numeric>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
using Tape=array<vector<int>,3>;
constexpr int Q=29;
using Row=array<double,Q>;
struct Model { Row uni{}; array<Row,Q> bi{}; };
int mod(int a){return (a+Q)%Q;}
struct Factors {array<double,Q*Q> e{},s{}; int delta=-1;};
struct Result{double common,independent;};
Result exact(const Tape& c,const Model& m,double s,int cap){
 const int n=c[0].size(),D=cap+1,STR=8*Q;
 const array<int,3> inc={D*D*STR,D*STR,STR};
 array<int,8> off{}; for(int b=0;b<8;b++)for(int j=0;j<3;j++)if(b>>j&1)off[b]+=inc[j];
 vector<double> cur(D*D*D*STR),nxt(cur.size()); cur[0]=1; double total=0;
 vector<Factors> f(3*D);
 for(int t=0;t<=n+cap;t++){
  if(t>=n){int z=off[7]*(t-n);for(int h=0;h<Q;h++){total+=cur[z+h];cur[z+h]=0;}}
  if(t==n+cap)break;
  fill(nxt.begin(),nxt.end(),0);
  int lo=max(0,t-n),hi=min(cap,t);
  for(int j=0;j<3;j++)for(int d=lo;d<=hi;d++){
   int i=t-d; auto& v=f[j*D+d];
   if(i==n){v.e.fill(1);v.s.fill(0);v.delta=-1;continue;}
   v.delta=i?mod(c[j][i]-c[j][i-1]):-1;
   double accept=(i&&v.delta==0)?1-s:1;
   for(int h=0;h<Q;h++){
    const Row& row=i?m.bi[mod(c[j][i-1]-h)]:m.uni;
    for(int k=0;k<Q;k++){
     v.e[h*Q+k]=Q*accept*row[mod(c[j][i]-k)];
     v.s[h*Q+k]=(i&&d<cap)?s*row[mod(c[j][i-1]-k)]:0;
    }
   }
  }
  for(int a=lo;a<=hi;a++)for(int b=lo;b<=hi;b++)for(int d=lo;d<=hi;d++){
   array<int,3> ds={a,b,d}; int base=a*inc[0]+b*inc[1]+d*inc[2], inactive=0,eligible=0;
   array<const Factors*,3> v={&f[a],&f[D+b],&f[2*D+d]};
   for(int j=0;j<3;j++){int i=t-ds[j];if(i==n)inactive|=1<<j;else if(i&&ds[j]<cap)eligible|=1<<j;}
   if(inactive==7)continue;
   bool beyond=false;for(int j=0;j<3;j++)if((inactive>>j&1)&&ds[j]==cap)beyond=true;
   if(beyond)continue;
   array<int,8> delta{}; delta.fill(-1); array<bool,8> valid{};valid[0]=true;
   for(int p=1;p<8;p++){
    int x=-1;bool ok=true;
    for(int j=0;j<3;j++)if(p>>j&1){if(v[j]->delta<0||(x>=0&&x!=v[j]->delta)){ok=false;break;}x=v[j]->delta;}
    valid[p]=ok;delta[p]=x;
   }
   for(int p=0;p<8;p++)if(valid[p]&&!(p&inactive)){
    array<int,8> masks{};int count=0;
    for(int z=0;z<8;z++)if(valid[z]&&!(z&~eligible)&&!(z&p))masks[count++]=z;
    for(int h=0;h<Q;h++){
     double w=cur[base+p*Q+h]/Q;if(!w)continue;
     int k0=p?mod(h+delta[p]):0,k1=p?k0+1:Q;
     for(int k=k0;k<k1;k++){
      int hk=h*Q+k;
      double e0=p&1?Q:v[0]->e[hk],e1=p&2?Q:v[1]->e[hk],e2=p&4?Q:v[2]->e[hk];
      double s0=v[0]->s[hk],s1=v[1]->s[hk],s2=v[2]->s[hk];
      for(int z0=0;z0<count;z0++){int z=masks[z0];
       double w2=w*(z&1?s0:e0)*(z&2?s1:e1)*(z&4?s2:e2);
       nxt[base+off[z|inactive]+z*Q+k]+=w2;
      }
     }
    }
   }
  }
  cur.swap(nxt);
 }
 double lognull=0;
 for(auto& tape:c){vector<double> dp(D),dn(D);dp[0]=1;for(int i=0;i<n;i++){
  fill(dn.begin(),dn.end(),0);double acc=(i&&tape[i]==tape[i-1])?1-s:1;
  for(int d=0;d<D;d++){dn[d]+=dp[d]*acc;if(i&&d<cap)dn[d+1]+=dp[d]*s/Q;}dp.swap(dn);
 }lognull+=log(accumulate(dp.begin(),dp.end(),0.));}
 return {log(total),lognull};
}
struct State {int i=0,skip=0,last=-1,pending=-1;};
double brute(const Tape& c,const Model&m,double s,int cap,array<State,3> st){
 int n=c[0].size();if(st[0].i==n&&st[1].i==n&&st[2].i==n)return 1;
 double sum=0;
 for(int k=0;k<Q;k++){
  array<vector<pair<State,double>>,3> options;
  for(int j=0;j<3;j++){
   State a=st[j];auto& o=options[j];if(a.i==n){o.push_back({a,1});continue;}
   int p=mod(c[j][a.i]-k);
   if(a.pending>=0){if(p==a.pending){a.i++;a.pending=-1;o.push_back({a,Q});}continue;}
   const Row& row=a.last<0?m.uni:m.bi[a.last];
   State emit=a;emit.i++;emit.last=p;double acc=a.i&&c[j][a.i]==c[j][a.i-1]?1-s:1;
   o.push_back({emit,Q*row[p]*acc});
   if(a.i&&a.skip<cap){int q=mod(c[j][a.i-1]-k);State hold=a;hold.pending=hold.last=q;hold.skip++;o.push_back({hold,s*row[q]});}
  }
  for(auto& a:options[0])for(auto& b:options[1])for(auto& d:options[2])sum+=a.second*b.second*d.second/Q*brute(c,m,s,cap,{a.first,b.first,d.first});
 }
 return sum;
}
int main(){
 int n;cin>>n;Model m;string x;double z=0;for(auto& p:m.uni){cin>>x;p=stoul(x,nullptr,36);z+=p;}for(auto& p:m.uni)p=(p+8./Q)/(z+8);
 for(auto& row:m.bi){z=0;for(auto& p:row){cin>>x;p=stoul(x,nullptr,36);z+=p;}for(int k=0;k<Q;k++)row[k]=(row[k]+8*m.uni[k])/(z+8);}
 constexpr double s=.81288;Tape toy={vector<int>{1,1},vector<int>{4,8},vector<int>{9,9}};
 auto t=exact(toy,m,s,1);double b=brute(toy,m,s,1,{});if(abs(exp(t.common)-b)>1e-10)throw runtime_error("toy disagreement");
 cout<<setprecision(14)<<"toy "<<exp(t.common)<<" "<<b<<endl;
 int cases;cin>>cases;int hits=0,negative=0;
 for(int i=0;i<cases;i++){
  string name;cin>>name;Tape tape;
  for(auto& a:tape){cin>>x;for(char c:x){int k=c<='9'?c-'0':c-'A'+10;if(k<0||k>=Q)throw runtime_error("bad rune");a.push_back(k);}if((int)a.size()!=n)throw runtime_error("bad tape length");}
  if(name.rfind("original",0)==0&&!(hits>=3&&negative==4)){cout<<name<<" gated"<<endl;continue;}
  auto r=exact(tape,m,s,(n+15)/16);double lr=r.common-r.independent;
  if(name.rfind("shared",0)==0&&lr>0)hits++;if(name.rfind("null",0)==0&&lr<0)negative++;
  cout<<name<<" common="<<r.common<<" independent="<<r.independent<<" logLR="<<lr<<endl;
 }
}
