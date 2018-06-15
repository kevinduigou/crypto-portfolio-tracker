import CoinPriceScrapper
import mysql.connector

from datetime import datetime, timedelta

if __name__ == "__main__":



    print("Purge DB starting ...")

    # Open The sql Data Base
    conn = mysql.connector.connect(host="localhost", user="root", password="", database="cryptoportofolio")
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, timestamp FROM `portofolio_curency`")

    IDsToDelete = []
    for (id, name, timestamp) in cursor:


        time_difference =  datetime.now() - timestamp
        time_difference_in_minutes = time_difference / timedelta(minutes=1)
        if time_difference_in_minutes > 60*(24+6): #Security of 6 more hours
            if not((timestamp.hour == 12 or timestamp.hour == 0) and timestamp.minute == 0):
                print(id,name, timestamp)
                IDsToDelete.append(id)

    for id in IDsToDelete:
        delete_currency_req = "DELETE FROM `portofolio_curency` WHERE `id` = %(id)s"
        currency_info = {"id" : id}

        cursor.execute(delete_currency_req, currency_info)


    conn.commit()

    cursor.close()
    conn.close()

    print("Purge DB was successful")
