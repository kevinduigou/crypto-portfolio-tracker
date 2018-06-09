import requests
from bs4 import BeautifulSoup
import pprint


def getPricesFromCoinMarketCap():


    priceDict = {}

    urlToInspect = ['http://coinmarketcap.com/',"https://coinmarketcap.com/2"]
    for url in urlToInspect:
        r = requests.get(url)
        soup = BeautifulSoup(r.text,'html.parser')
        prices = soup.findAll("a",class_="price")
        for price in prices:
            currencyName = price.get('href').split("/")[2]
            currentPrice = price.get('data-usd')
            priceDict[currencyName] = float(currentPrice)

    return priceDict


def getDollarEuroConversion():
    urlSrc = "http://free.currencyconverterapi.com/api/v5/convert?q=EUR_USD&compact=y"
    r = requests.get(urlSrc)
    resp = r.json()

    return resp