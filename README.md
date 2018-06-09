The project cryptoportofolio provides a basic web interface which can be used to follow your crypto currencies investment in live.

# Problem solved

If you own cryptocurrencies on different platforms (e.g. Coinbase, Kraken, Binance and also your own wallets), it is difficult to track the values of your portfolio at one glance.
This webinterface gives you a mean to have an overview of your investement with:
* A table with the current value of each coin you own in dollar, euro and BTC
* The total value in dollar, euro and BTC of your investment
* A pie chart which describes the diversifciation of your portofolio
* A history chart which provides a mean to see the total value of your portofolio through time in dollar and BTC.

# Repositories

* WebSite contains all the scripts which run the django web site.
* BuildCoinDB contains all the script which are used to fuel the DB. This is the polling engine

# Getting Started
* Install Python 3
* Launch the command "pip install -r requirements.txt"
* Install XAMPP
* With XAMPP starts the Appache Server and the mySQL database
* Create a scheduled task to run the script BuildCoinDB/recordCoinPrices.py with python 3 (this the polling engine so configure it as you want). The srcipt recordCoinPrices.py searches the data on coinmarketcap.com.
* In the repository WebSite/manage.py repository, launch the command "python manage.py makemigrations" and then "python manage.py migrate"
* Run the django server with the command "python manage.py runserver"
* Open your favorite web browser and go to http://127.0.0.1:8000/
* Enjoy!
