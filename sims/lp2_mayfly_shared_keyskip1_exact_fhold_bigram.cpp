#include <algorithm>
#include <array>
#include <cmath>
#include <cstdint>
#include <iostream>
#include <iomanip>
#include <numeric>
#include <stdexcept>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29, STR=8*Q;
using Tape=array<vector<int>,3>;
using Row=array<double,Q>;
struct Model{Row uni{};array<Row,Q> bi{};};
int mod(int x){return (x+Q)%Q;}
struct Action{double w;int r;bool pending,active;};
struct Span{uint32_t off;uint16_t len;};
struct Trans{vector<Action> data;vector<Span> spans;};
int lid(int i,int pending,int h,int k){return ((i*2+pending)*Q+h)*Q+k;}
Trans build(const vector<int>& c,const Model& m,double s){
 int n=c.size();Trans z;z.spans.resize((n+1)*2*Q*Q);
 for(int i=0;i<=n;i++)for(int p=0;p<2;p++)for(int h=0;h<Q;h++)for(int k=0;k<Q;k++){
  auto& a=z.spans[lid(i,p,h,k)];a.off=z.data.size();
  if(p){if(i>0&&i<n){int x=mod(c[i-1]-h);if(x&&x==mod(c[i]-k))z.data.push_back({Q,1,false,true});}}
  else{
   double w=1;const Row* row=i?&m.bi[mod(c[i-1]-h)]:&m.uni;
   for(int j=i;;j++){
    int r=j-i;
    if(j==n){z.data.push_back({w,r,false,false});break;}
    int x=mod(c[j]-k);if(x)z.data.push_back({w*Q*(*row)[x]*(j&&c[j]==c[j-1]?1-s:1),r+1,false,true});
    if(j){x=mod(c[j-1]-k);if(x)z.data.push_back({w*s*(*row)[x],r,true,true});}
    if(c[j]!=0)break;
    w*=Q*(*row)[0];row=&m.bi[0];
   }
  }
  a.len=z.data.size()-a.off;
 }
 return z;
}
double indep(const vector<int>& c,const Model&m,double s,int cap){
 int Z=count(c.begin(),c.end(),0),D=Z+cap+1,n=c.size();vector<double> cur(D*Q),nxt(cur.size());cur[Z*Q]=1;
 for(int i=0;i<n;i++){
  fill(nxt.begin(),nxt.end(),0);double accept=i&&c[i]==c[i-1]?1-s:1;
  for(int d=0;d<D;d++)for(int h=0;h<Q;h++){
   double w=cur[d*Q+h];if(!w)continue;const Row& row=i?m.bi[h]:m.uni;
   if(c[i]==0&&d>0)nxt[(d-1)*Q]+=w*Q*row[0];
   for(int x=1;x<Q;x++){nxt[d*Q+x]+=w*row[x]*accept;if(i&&d+1<D)nxt[(d+1)*Q+x]+=w*row[x]*s/Q;}
  }
  cur.swap(nxt);
 }
 return log(accumulate(cur.begin(),cur.end(),0.));
}
struct Result{double common,independent;};
Result exact(const Tape& c,const Model&m,double s,int cap){
 int n=c[0].size();array<int,3>Z{},D{},inc{};array<Trans,3>L;array<vector<int>,3> zeroPrefix;
 for(int j=0;j<3;j++){Z[j]=count(c[j].begin(),c[j].end(),0);D[j]=Z[j]+cap+1;L[j]=build(c[j],m,s);zeroPrefix[j].resize(n+1);for(int i=0;i<n;i++)zeroPrefix[j][i+1]=zeroPrefix[j][i]+(c[j][i]==0);}
 inc={D[1]*D[2]*STR,D[2]*STR,STR};vector<double> cur(D[0]*inc[0]),nxt(cur.size());cur[Z[0]*inc[0]+Z[1]*inc[1]+Z[2]*inc[2]]=1;double total=0;
 for(int t=0;t<=n+cap;t++){
  fill(nxt.begin(),nxt.end(),0);
  array<int,3> lo{},hi{};for(int j=0;j<3;j++){lo[j]=max(0,t-n+Z[j]);hi[j]=min(D[j]-1,t+Z[j]);}
  for(int a=lo[0];a<=hi[0];a++)for(int b=lo[1];b<=hi[1];b++)for(int d=lo[2];d<=hi[2];d++){
   array<int,3> ds={a,b,d},i={t+Z[0]-a,t+Z[1]-b,t+Z[2]-d};int base=a*inc[0]+b*inc[1]+d*inc[2];
   bool feasible=true;int inact=0;for(int j=0;j<3;j++){if(ds[j]-Z[j]<-zeroPrefix[j][i[j]])feasible=false;if(i[j]==n||i[j]==0)inact|=1<<j;}if(!feasible)continue;
   for(int p=0;p<8;p++)if(!(p&inact)){
    int delta=-1;bool valid=true;for(int j=0;j<3;j++)if(p>>j&1){int x=mod(c[j][i[j]]-c[j][i[j]-1]);if(delta>=0&&delta!=x){valid=false;break;}delta=x;}if(!valid)continue;
    for(int h=0;h<Q;h++){
     double w=cur[base+p*Q+h]/Q;if(!w)continue;
     int k0=p?mod(h+delta):0,k1=p?k0+1:Q;
     for(int k=k0;k<k1;k++){
      const Span& u=L[0].spans[lid(i[0],p&1,h,k)];const Span& v=L[1].spans[lid(i[1],p>>1&1,h,k)];const Span& z=L[2].spans[lid(i[2],p>>2&1,h,k)];
      for(int x=0;x<u.len;x++){const auto& A=L[0].data[u.off+x];int da=a+1-A.r;
       for(int y=0;y<v.len;y++){const auto&B=L[1].data[v.off+y];int db=b+1-B.r;double ab=w*A.w*B.w;
        for(int q=0;q<z.len;q++){const auto&C=L[2].data[z.off+q];int dd=d+1-C.r;bool active=A.active||B.active||C.active;
         if(t==n+cap&&active)continue;double weight=ab*C.w;
         if(i[0]+A.r==n&&i[1]+B.r==n&&i[2]+C.r==n){total+=weight;continue;}
         if(!active||da<0||da>=D[0]||db<0||db>=D[1]||dd<0||dd>=D[2])continue;
         int mask=A.pending|(B.pending<<1)|(C.pending<<2);nxt[da*inc[0]+db*inc[1]+dd*inc[2]+mask*Q+k]+=weight;
        }
       }
      }
     }
    }
   }
  }
  cur.swap(nxt);
 }
 double null=0;for(const auto& a:c)null+=indep(a,m,s,cap);return {log(total),null};
}
struct State{int i=0,last=-1,pending=-1;};
struct Step{State st;double w;bool active;};
double brute(const Tape&c,const Model&m,double s,int cap,int t,array<State,3> st){
 int n=c[0].size();if(st[0].i==n&&st[1].i==n&&st[2].i==n)return 1;double sum=0;
 for(int k=0;k<Q;k++){
  array<vector<Step>,3> opt;
  for(int j=0;j<3;j++){
   State a=st[j];auto&o=opt[j];if(a.pending>=0){if(a.i<n&&mod(c[j][a.i]-k)==a.pending){a.i++;a.pending=-1;o.push_back({a,Q,true});}continue;}
   double w=1;for(;;){if(a.i==n){o.push_back({a,w,false});break;}
    const Row& row=a.last<0?m.uni:m.bi[a.last];int x=mod(c[j][a.i]-k);
    if(x){auto b=a;b.i++;b.last=x;o.push_back({b,w*Q*row[x]*(a.i&&c[j][a.i]==c[j][a.i-1]?1-s:1),true});}
    if(a.i){x=mod(c[j][a.i-1]-k);if(x){auto b=a;b.pending=b.last=x;o.push_back({b,w*s*row[x],true});}}
    if(c[j][a.i]!=0)break;w*=Q*row[0];a.i++;a.last=0;
   }
  }
  for(auto&a:opt[0])for(auto&b:opt[1])for(auto&d:opt[2]){
   bool active=a.active||b.active||d.active;double w=a.w*b.w*d.w/Q;
   if(t==n+cap&&active)continue;
   if(a.st.i==n&&b.st.i==n&&d.st.i==n){sum+=w;continue;}
   if(active&&t+1-a.st.i<=cap&&t+1-b.st.i<=cap&&t+1-d.st.i<=cap)sum+=w*brute(c,m,s,cap,t+1,{a.st,b.st,d.st});
  }
 }
 return sum;
}
int main(){int n;cin>>n;Model m;string x;double z=0;for(auto&p:m.uni){cin>>x;p=stoul(x,nullptr,36);z+=p;}for(auto&p:m.uni)p=(p+8./Q)/(z+8);for(auto&row:m.bi){z=0;for(auto&p:row){cin>>x;p=stoul(x,nullptr,36);z+=p;}for(int k=0;k<Q;k++)row[k]=(row[k]+8*m.uni[k])/(z+8);}
 constexpr double s=.81288;Tape toy={vector<int>{0,0},vector<int>{4,0},vector<int>{0,9}};auto t=exact(toy,m,s,1);double b=brute(toy,m,s,1,0,{});if(abs(exp(t.common)-b)>1e-10*max(1.,b))throw runtime_error("toy disagreement");cout<<setprecision(14)<<"toy "<<exp(t.common)<<" "<<b<<endl;
 int cases;cin>>cases;int hits=0,negative=0;
 for(int q=0;q<cases;q++){string name;cin>>name;Tape tape;for(auto&a:tape){cin>>x;for(char c:x){int k=c<='9'?c-'0':c-'A'+10;if(k<0||k>=Q)throw runtime_error("bad rune");a.push_back(k);}if((int)a.size()!=n)throw runtime_error("bad tape length");}
  if(name.rfind("original",0)==0&&!(hits>=3&&negative==4)){cout<<name<<" gated"<<endl;continue;}
  auto r=exact(tape,m,s,(n+15)/16);double lr=r.common-r.independent;if(name.rfind("shared",0)==0&&lr>0)hits++;if(name.rfind("null",0)==0&&lr<0)negative++;cout<<name<<" common="<<r.common<<" independent="<<r.independent<<" logLR="<<lr<<endl;
 }
}
