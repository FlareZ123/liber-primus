#include <array>
#include <algorithm>
#include <cstdint>
#include <iostream>
#include <queue>
#include <string>
#include <vector>
using namespace std;
constexpr int Q=29, N2=Q*Q, N3=N2*Q;
using Row=array<int,5>;
int mod(int x){return (x%Q+Q)%Q;}
int val(char c){return c<='9'?c-'0':c-'A'+10;}
int main(){
 string tape; if(!(cin>>tape)||tape.size()%5||tape.size()<15)return 1;
 const int n=tape.size()/5-1;
 vector<Row> c(tape.size()/5);for(size_t i=0;i<c.size();i++)for(int j=0;j<5;j++)c[i][j]=val(tape[i*5+j]);
 vector<uint8_t> left(N2*n),right(N3*n);
 for(int a=0;a<N2;a++)for(int t=0;t<n;t++)left[a*n+t]=(a/Q*c[t+1][0]+a%Q*c[t+1][1])%Q;
 for(int b=0;b<N3;b++)for(int t=0;t<n;t++)right[b*n+t]=(b/N2*c[t+1][2]+b/Q%Q*c[t+1][3]+b%Q*c[t+1][4])%Q;
 #pragma omp parallel for schedule(dynamic)
 for(int lane=0;lane<5;lane++){
  vector<uint8_t> R(right.size());for(int b=0;b<N3;b++)for(int t=0;t<n;t++)R[b*n+t]=mod(right[b*n+t]-c[t][lane]);
  using P=pair<int,int>;priority_queue<P,vector<P>,greater<P>> best;
  for(int a=0;a<N2;a++){
   const auto *x=left.data()+a*n;
   for(int b=0;b<N3;b++){
    if(a==0&&b==0)continue;
    const auto *y=R.data()+b*n;int h[Q]={},score=0;
    for(int t=0;t<n;t++){int k=x[t]+y[t];k-=Q*(k>=Q);score+=h[k]++;}
    P p={score,a*N3+b};if(best.size()<32)best.push(p);else if(p>best.top()){best.pop();best.push(p);}
   }
  }
  vector<P> out;while(!best.empty()){out.push_back(best.top());best.pop();}reverse(out.begin(),out.end());
  #pragma omp critical
  {cout<<lane<<' '<<n<<' '<<N2*N3-1<<'\n';for(auto [s,k]:out){cout<<s;Row r;for(int j=4;j>=0;j--){r[j]=k%Q;k/=Q;}for(int x:r)cout<<' '<<x;cout<<'\n';}cout<<flush;}
 }
}
