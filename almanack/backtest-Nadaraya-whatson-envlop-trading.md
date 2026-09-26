Backtesting the viral Nadaraya-Watson Envelop trading indicator in python
=========================================================================

[![Yashaswa Varshney](https://miro.medium.com/v2/resize:fill:64:64/1*nhvcq_4L_BzZM1KWKoFQ9w.jpeg)](https://medium.com/@yashaswa?source=post_page---byline--b800a70e8167-----------------------------------------)

[Yashaswa Varshney](https://medium.com/@yashaswa?source=post_page---byline--b800a70e8167-----------------------------------------)

4 min read

Jan 31, 2023



![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/0*dcYF0_uSW-RUwrZD.png)

> Too good to be true is often a warning sign, and this is certainly the case with the Nadaraya-Watson indicator, let me explain…

### What is Nadaraya-Watson envelope?

The Nadaraya-Watson envelope is a type of moving average calculated by taking a weighted average of data points over a period of time. The envelope is created by drawing two lines (one above and one below) parallel to the moving average at a user-defined percentage distance. Top and bottom lines form a “band” around the moving average that can be used to identify potential trend changes and generate trading signals. The Nadaraya-Watson cover is named after its creators, Vasily Nadaraya and his Geoffrey Watson.

Official: [https://www.tradingview.com/script/Iko0E2kL-Nadaraya-Watson-Envelope-LuxAlgo/](https://www.tradingview.com/script/Iko0E2kL-Nadaraya-Watson-Envelope-LuxAlgo/)

**Logic**
---------

The main computation is done in a ‘for’ loop that iterates over ’n’. At each iteration “i”, a weighted average of the data points is calculated using another inner “for” loop that iterates “j”. The weight “w” is exponentially calculated and depends on the difference between the indices “i” and “j” and the smoothing parameter “h”. The weighted sum of data points is stored in ‘sum’ and the weighted sum of weights is stored in ‘sumw’. The weighted average of the data points for each iteration “i” is computed as the ratio of “sum” and “sumw”. The value “y2[i]” is set to this weighted average at each iteration. The value “y1[i]” is computed as the average of “y2[i]” and “y2[i-1]” for all iterations except the first. This is because the first value of “y1” is undefined. Finally, the arrays ‘y2’ and ‘y1’ are added as new columns to the dataframe ‘df’ contained in the object ‘self’. This function returns arrays “y2” and “y1”.

The function generates buy and sell signals based on the difference between two elements of the Nadaraya-Watson Envelope (y2). If the difference is greater than a threshold and the previous y2 value is below the previous y1 value, it is a buy signal. If the difference is less than the negative of the threshold and the previous y2 value is above the previous y1 value, it is a sell signal. The index of the buy and sell signals are added to separate lists.

Let’s backtest this in python
-----------------------------

```
import numpy as np
from sklearn.kernel_ridge import KernelRidge
import pandas as pd
import matplotlib.pyplot as plt
import yfinance as yf
``````
class Backtest:
    def __init__(self, symbol, tim):
        self.tim = tim
        self.symbol = symbol
        self.df = yf.download(tickers=symbol, period = self.tim)
        self.src = self.df["Close"].values
        self.h = 7
        y2, y1 = self.nadaraya_watson_envelope()
        self.gen_signals(y1,y2)
    def nadaraya_watson_envelope(self):
        n = len(self.src)
        y2 = np.empty(n)
        y1 = np.empty(n)
        h= self.h
        for i in range(n):
            sum = 0
            sumw = 0
            for j in range(n):
                w = np.exp(-(np.power(i-j,2)/(h*h*2)))
                sum += self.src[j]*w
                sumw += w
            y2[i] = sum/sumw
            if i > 0:
                y1[i] = (y2[i] + y2[i-1]) / 2
        self.df['y2'] = y2
        self.df['y1'] = y1
        return y2, y1
    
    def gen_signals(self,y1,y2):
        buy_signals = []
        sell_signals = []
        thld = 0.01
        for i in range(1, len(y2)):
            d = y2[i] - y2[i-1]
            if d > thld and y2[i-1] < y1[i-1]:
                buy_signals.append(i)
            elif d < -thld and y2[i-1] > y1[i-1]:
                sell_signals.append(i)
        money = 100
        profit = []
        for i in range(len(buy_signals)):
            buy_index = buy_signals[i]
            if i < len(sell_signals):
                sell_index = sell_signals[i]
                money *= self.src[sell_index] / self.src[buy_index]
                profit.append(money - 100)
        self.profit  = pd.DataFrame(profit)
        rets = "returns "+ self.tim +" = " + str(round(((money/100-1)*100),2)) + "%"
        print(rets)
        plt.figure(figsize=(20,5))
        plt.plot(y2, label='y2')
        plt.plot(self.src,color='black', label='close')
        for signal in buy_signals:
            plt.axvline(x=signal, color='green',linewidth=2)
        for signal in sell_signals:
            plt.axvline(x=signal, color='red',linewidth=2)
        plt.text(0.80, 0.25, self.symbol, transform=plt.gca().transAxes, fontsize=34,verticalalignment='top')
        plt.text(0.80, 0.15, rets, transform=plt.gca().transAxes, fontsize=14,verticalalignment='top')
        plt.legend()
        plt.show()
```
instance = Backtest("INFY.NS", tim='1y')
```

_Test on your desired company:_ [_https://finance.yahoo.com/_](https://finance.yahoo.com/)

![captionless image](https://miro.medium.com/v2/resize:fit:1400/format:webp/1*v7o28r7B_A9tQ15CMxWi-Q.png)

[https://github.com/bbmusa/nadaraya_watson_envelope](https://github.com/bbmusa/nadaraya_watson_envelope)

**But wait!!**
--------------

It is considered trash due to its tendency to “repaint,” which is a tactic used by scamsters to sell indicators on platforms like TradingView. In this context, repainting means dynamically changing signals as new data is added, making the indicator appear more successful than it actually is.

This code does not inherently cause a repaint, but if the self.src data used to compute the Nadaraya-Watson envelopes (y1 and y2) changes dynamically, it will cause a redraw, generated by the gen_signals function. changes the signal received. This can change previous signals and make the indicator appear more successful than it really is. This is the definition of repaint.

> A new free viral indicator from TradingView that looks like a goldmine but is nothing more than a repaint and backtest fooling tool!

Thanks for reading
For error correction or any query or small talks too,
Msg me on: [https://www.linkedin.com/in/yashaswa-varshney/](https://www.linkedin.com/in/yashaswa-varshney/)
