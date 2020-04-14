import requests
from bs4 import BeautifulSoup
import pprint
import pandas as pd


def getPricesHistory(coin_name : str):
    priceDict = {}
    urlToInspect = []

    url = 'https://coinmarketcap.com/currencies/%s/historical-data/?start=20130428&end=20180610'%(coin_name)
    r = requests.get(url, proxies=proxies)
    table = pd.read_html(r.text)[0]
    table.set_index("Date")

    return table

def getPricesFromCoinMarketCap():


    priceDict = {}

    urlToInspect = ['http://coinmarketcap.com/',"https://coinmarketcap.com/2"]
    for url in urlToInspect:
        r = requests.get(url,proxies=proxies)
        soup = BeautifulSoup(r.text,'html.parser')
        prices = soup.findAll("a",class_="price")
        for price in prices:
            currencyName = price.get('href').split("/")[2]
            currentPrice = price.get('data-usd')
            priceDict[currencyName] = float(currentPrice)

    return priceDict


def getDollarEuroConversion():
    urlSrc = "http://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y"
    r = requests.get(urlSrc,proxies)
    resp = r.json()

    return resp


if __name__=="__main__":
    table = getPricesHistory("bitcoin")["Close**"]

