from django.http import JsonResponse

from .models import Protofolio
from .models import Coin
from .models import CoinForm
from .models import Curency

from django.contrib.auth import login, authenticate
from django.shortcuts import render, redirect
from django.contrib.auth.decorators import login_required
from django.contrib.auth import views as auth_views
from django.utils import timezone
from django.db.models import Max

import datetime
from .signupform import SignupForm
# Create your views here.

def signup(request):
    if request.method == 'POST':
        form = SignupForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            raw_password = form.cleaned_data.get('password1')
            user = authenticate(username=username, password=raw_password)
            login(request, user)
            return redirect('index')
    else:
        form = SignupForm()
    return render(request, 'signup.html', {'form': form})

@login_required
def index(request):

    if request.user.is_authenticated:
        current_user = request.user
        portofolios = Protofolio.objects.filter(owner = current_user)
        currencies = Curency.objects.raw("SELECT * FROM `portofolio_curency` WHERE timestamp = (SELECT MAX(timestamp) FROM `portofolio_curency`)")
        lastTimeStamp = getTimeStamp(currencies)

        coins = Coin.objects.all()
        portofolioOfCurrentUser = []
        euroInDollar = getEuroValueInDollar(currencies)
        totalValueInDollar = 0
        btcInDollar = getBtcValueInDollar(currencies)
        
        #Total summary rows will contain all the information needed to build the summary table
        totalSummaryRows = []

        for portofolio in portofolios:
            if portofolio.owner == current_user:
                index = 1
                for coin in coins:
                    if coin.portofolio.owner == portofolio.owner:
                        coinInfo = {"name": coin.name, "quantity": coin.quantity,"valueInDollar":"N/A","id":coin.id,"index":index,"valueInBTC":"N/A","tag": coin.tag}
                        index += 1
                        valueInDollar = 0
                        coinValueInDollar = getValueInDollar(coin, currencies)
                        coinValueInBTC = coinValueInDollar/btcInDollar
                        coinInfo["valueInBTC"] = coinValueInBTC
                        coinInfo["valueInDollar"] = coinValueInDollar
                        totalValueInDollar += coinValueInDollar
                        portofolioOfCurrentUser.append(coinInfo)

                        '''
                        Build the data needed for the summary table
                        '''
                        for tag in coin.tag.split(" "):
                            if not tag == "":
                                if not tag in list(map(lambda row : row["title"], totalSummaryRows)):
                                    totalSummaryRows.append({'title': tag ,'totalValueInDollar': 0,'totalValueInEuro': 0,'totalValueInBtc': 0})

                                totalSummaryRow = list(filter(lambda row : row["title"] == tag, totalSummaryRows))[0]
                                totalSummaryRow['totalValueInDollar'] += coinValueInDollar
                                totalSummaryRow['totalValueInEuro'] += coinValueInDollar / euroInDollar
                                totalSummaryRow['totalValueInBtc'] += coinValueInDollar / btcInDollar



        totalSummaryRows.append({'title':'All Coin',
                                 'totalValueInDollar': totalValueInDollar,
                                 'totalValueInEuro': totalValueInDollar / euroInDollar,
                                 'totalValueInBtc': totalValueInDollar / btcInDollar})

        context = {
            'title': 'Portofolios',
            'currentUser' : current_user,
            'portofolioOfCurrentUser' : portofolioOfCurrentUser,
            'totalSummaryRows' : totalSummaryRows,
            'euroInDollar' : euroInDollar,
            'lastTimeStamp': lastTimeStamp.strftime("%Y-%m-%dT%H:%M:%SZ"),
            'numberOfCoinsInPortofolio' : len(portofolioOfCurrentUser)
        }
        
        return render(request, 'index.html',context)

    return redirect( auth_views.login)


def getValueInDollar(coin, currencies):
    valueInDollar = 0
    for currency in currencies:
        if currency.name == coin.name:
            valueInDollar = float(currency.valueInDollar) * float(coin.quantity)
    return valueInDollar


def getTimeStamp(currencies):
    lastTimeStamp = "N/A"
    for currency in currencies:
        lastTimeStamp = currency.timestamp
        break;
    return lastTimeStamp

def about(request):
    return render(request, 'about.html')


@login_required
def piechart(request):
    timestampReq = None
    if "timestamp" in request.GET.keys():
        timestampReqAsString = request.GET["timestamp"]
        timestampReqAsString = timestampReqAsString.split(" GMT")[0]
        timestampReq = datetime.datetime.strptime (timestampReqAsString,"%a %b %d %Y %X")
        print (timestampReq.date(),datetime.datetime.today().date())
        if timestampReq.date() == datetime.datetime.today().date():
            #If the user requests to see today PieChart then compute the coins values with the latest values avalaible
            timestampMaxDict = Curency.objects.all().aggregate(Max('timestamp'))
            timestampReq = timestampMaxDict['timestamp__max']
        else :
            # For value requested in the past (i.e. another day than today), take the value recorded at 13:00 UTC
            timestampReq = timestampReq.replace(hour=12, minute=00)

    
    current_user = request.user
    
    #In case no timestamp is requested then display the coins repartation with the latest values avalaible for each coin
    if timestampReq == None :
        timestampMaxDict = Curency.objects.all().aggregate(Max('timestamp'))
        timestampReq = timestampMaxDict['timestamp__max']
    
    currencies = []
    
    for currency in Curency.objects.all():
        if currency.timestamp.year == timestampReq.year and  currency.timestamp.month == timestampReq.month and currency.timestamp.day == timestampReq.day:
             if currency.timestamp.hour == timestampReq.hour and currency.timestamp.minute == timestampReq.minute:
                currencies.append(currency)


    if len (currencies) == 0:
        #No Data avalaible to display the PieChart (Date requested is too old?)
        return JsonResponse({}, safe=False)

    coins = Coin.objects.all()
    portofolioOfCurrentUser = [] # Contains data about coins owned by the current user (used to draw the piechart)
    totalValueInDollar = 0


    for coin in coins:
        if coin.portofolio.owner == current_user:
            coinInfo = {"name": coin.name, "quantity": coin.quantity,"valueInDollar":"N/A"}
            for currency in currencies:
                if currency.name == coin.name:
                    coinInfo["valueInDollar"] = float(currency.valueInDollar) * float(coin.quantity)
                    totalValueInDollar += coinInfo["valueInDollar"]

            portofolioOfCurrentUser.append(coinInfo)
   
    piechartData = []
    for coinInfo in portofolioOfCurrentUser:
        piechartData.append({"y":coinInfo["valueInDollar"]/totalValueInDollar*100 ,"label":coinInfo["name"]})

    return JsonResponse(piechartData,safe=False)

@login_required
def historychart(request):

    refCoin = request.GET["coinRef"]
    selectedScope = "optionAll" #default Scope
    if "scope" in request.GET.keys():
        selectedScope = request.GET["scope"]

    #Find all timestamp avalaible
    currencies = Curency.objects.all()
    current_user = request.user
    current_user_portfolio = Protofolio.objects.get(owner = current_user)
    #List of timestamp in the database
    timestampsList = []
    coins = Coin.objects.all()


    #Filter the timestamp which will be used to display the history chart depending on the selected scope
    for currency in currencies.filter(name = 'bitcoin'):
        timestamp = currency.timestamp
        if selectedScope == "optionAll":
            if (timestamp.hour == 12) and timestamp.minute == 0 and  timestamp.second < 20:
                timestampsList.append(timestamp)
        elif selectedScope == "option1d" and timestamp > timezone.now()-datetime.timedelta(hours=24):
                timestampsList.append(timestamp)
        elif selectedScope == "option7d" and timestamp > timezone.now() - datetime.timedelta(days=7):
            if (timestamp.hour == 12 or timestamp.hour == 0) and timestamp.minute == 0:
                timestampsList.append(timestamp)
        elif selectedScope == "option1m" and timestamp > timezone.now() - datetime.timedelta(days=30):
            if (timestamp.hour == 12 or timestamp.hour == 0) and timestamp.minute == 0:
                timestampsList.append(timestamp)
        elif selectedScope == "option3m" and timestamp > timezone.now() - datetime.timedelta(days=90):
            if timestamp.hour == 12 and timestamp.minute == 0 :
                timestampsList.append(timestamp)
    
    coinsInCurrentUserPortfolio = coins.filter(portofolio=current_user_portfolio)
    
    
    totalPortofoolioValueInDollarByTimeStamps = []
    for xTimestamp in timestampsList:
        totalValueInDollar = 0

        for coin in coinsInCurrentUserPortfolio:
            #Find the value of this coin in Dollar and add the value to th total value of the portofolio
            currency =   Curency.objects.get(name = coin.name,timestamp = xTimestamp)
            totalValueInDollar += float(currency.valueInDollar) * float(coin.quantity)

        if refCoin != "dollar":
            refCoinInDollar = Curency.objects.get(name = refCoin,timestamp = xTimestamp).valueInDollar
            totalPortofoolioValueInDollarByTimeStamps.append({"x":xTimestamp,"y":totalValueInDollar/float(refCoinInDollar)})
        else :
            totalPortofoolioValueInDollarByTimeStamps.append({"x": xTimestamp, "y": totalValueInDollar})

    return JsonResponse(totalPortofoolioValueInDollarByTimeStamps,safe=False)



@login_required
def modifycoin(request,coinToModifyId):
    coins = Coin.objects.all()

    if request.method == 'POST':
        form = CoinForm(request.POST)

        current_user = request.user
        portofolios = Protofolio.objects.filter(owner=current_user)

        coinToModify = getCoin(coins, coinToModifyId)

        #Verify that the coin exists and can be modified by the current user (i.e. current user is the owner)
        if coinToModify == None:
            return redirect('index')
        elif not coinToModify.portofolio.owner == request.user:
            return redirect('index')


        coinQuantity = form.data["quantity"]
        coinTag = form.data["tag"]
        if form.is_valid():
            coinToModify.quantity = coinQuantity
            coinToModify.tag = coinTag
            coinToModify.save(update_fields=["quantity","tag"])

        return redirect('index')





    coinToModify= getCoin(coins,coinToModifyId)

    #if coin does not exist or current user is not the owner then redirect to the index
    if coinToModify == None:
        return redirect('index')
    elif  not coinToModify.portofolio.owner == request.user:
        return redirect('index')

    quantity = coinToModify.quantity
    tag = coinToModify.tag
    form = CoinForm(initial={'quantity': quantity,'tag': tag})

    return render(request, 'modifycoin.html', {'form': form,'coinName': coinToModify.name})

'''
Returns the coin with the id "coinToModifyId" else None
'''
def getCoin(coins,coinToModifyId):
    for coin in coins:
        if coin.id == coinToModifyId :
            return coin
    return None


@login_required
def addcoin(request,coinToAdd = ''):

    if request.method == 'POST':
        form = CoinForm(request.POST)

        portofolioOfCurrentUser = getPortofolioOfCurrentUser(request)
            
        if form.is_valid():
            CoinName = form.data["coinName"]
            form = form.save(commit=False)
            form.portofolio = portofolioOfCurrentUser
            form.name = CoinName
            form.save()
            return redirect('index')
    else:

        form = CoinForm()

    currencies = Curency.objects.raw("SELECT * FROM `portofolio_curency` WHERE timestamp = (SELECT MAX(timestamp) FROM `portofolio_curency`)")
    listOfCoins = []
    for currency in currencies:
        listOfCoins.append(currency.name)

    return render(request, 'addcoin.html', {'form': form,'listOfCoins': sorted(listOfCoins)})


def getPortofolioOfCurrentUser(request):
    current_user = request.user
    portofolios = Protofolio.objects.filter(owner=current_user)
    portofolioOfCurrentUser = None
    for portofolio in portofolios:
        if portofolio.owner == current_user:
            portofolioOfCurrentUser = portofolio
            break
    if portofolioOfCurrentUser == None:
        portofolioOfCurrentUser = Protofolio.objects.create(owner=current_user)
    return portofolioOfCurrentUser


@login_required
def deletecoin(request,coinToDeleteId):
    current_user = request.user
    portofolios = Protofolio.objects.filter(owner=current_user)
    coins = Coin.objects.all()
    for portofolio in portofolios:
        if portofolio.owner == current_user:
            coinToDelete = getCoin(coins,coinToDeleteId)
            coinToDelete.delete()


    return redirect('index')


def getBtcValueInDollar(currenciesValueAtTimestamp):
    btcInDollar = 1
    for currency in currenciesValueAtTimestamp:
        if currency.name == "bitcoin":
            btcInDollar = float(currency.valueInDollar)
    return btcInDollar

def getEuroValueInDollar(currenciesValueAtTimestamp):
    euroInDollar = 1
    for currency in currenciesValueAtTimestamp:
        if currency.name == "euro":
            euroInDollar = float(currency.valueInDollar)
    return euroInDollar