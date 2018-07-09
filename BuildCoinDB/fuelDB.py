import mysql.connector
from datetime import date, datetime, timedelta
import CoinPriceScrapper
import pprint
import os
if __name__ == "__main__":



    print("Record Coin Prcies in DB starting ...")

    # Open The sql Data Base
    conn = mysql.connector.connect(host="localhost", user="root", password="", database="cryptoportofolio")
    cursor = conn.cursor()

    add_currency_info = (
        "INSERT INTO `portofolio_curency` (`id`, `name`, `timestamp`, `valueInDollar`) VALUES (NULL, %(name)s, %(timestamp)s, %(valueInDollar)s)")

    coins = CoinPriceScrapper.getPricesFromCoinMarketCap().keys()

    for coin in coins :
        print("Record %s"%(coin))
        table = CoinPriceScrapper.getPricesHistory(coin)
        tableMatrix = table.as_matrix()
        for row in tableMatrix:

            datetimeOfRecord = datetime.strptime(row[0],"%b %d, %Y").replace(hour=12, minute=00)
            #print(datetimeOfRecord)
            datetimeOfRecord = datetimeOfRecord.strftime("%Y-%m-%d %H:%M:%S")
            currencyInfo = {"name": coin, 'timestamp': datetimeOfRecord, 'valueInDollar': row[4]}
            cursor.execute(add_currency_info, currencyInfo)



    conn.commit()

    cursor.close()
    conn.close()

    print("Record Coin Prcies in DB was successful")