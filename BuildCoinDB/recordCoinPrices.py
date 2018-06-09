import CoinPriceScrapper
import mysql.connector
from datetime import date, datetime, timedelta

if __name__ == "__main__":



    print("Record Coin Prcies in DB starting ...")

    # Open The sql Data Base
    conn = mysql.connector.connect(host="localhost", user="root", password="crakul88*", database="cryptoportofolio")
    cursor = conn.cursor()

    add_currency_info = (
        "INSERT INTO `portofolio_curency` (`id`, `name`, `timestamp`, `valueInDollar`) VALUES (NULL, %(name)s, %(timestamp)s, %(valueInDollar)s)")

    coinPrices = CoinPriceScrapper.getPricesFromCoinMarketCap()
    currentDateTime = datetime.now().utcnow().strftime("%Y-%m-%d %H:%M:%S")
    print (currentDateTime+ "UTC")
    for currencyName, valueInDollar in coinPrices.items():
        currencyInfo = {"name": currencyName, 'timestamp': currentDateTime, 'valueInDollar': valueInDollar}
        cursor.execute(add_currency_info, currencyInfo)

    oneEuroInDollar = CoinPriceScrapper.getDollarEuroConversion()['EUR_USD']['val']
    currencyInfo = {"name": 'euro', 'timestamp': currentDateTime, 'valueInDollar': oneEuroInDollar}
    cursor.execute(add_currency_info, currencyInfo)

    conn.commit()

    cursor.close()
    conn.close()

    print("Record Coin Prcies in DB was successful")