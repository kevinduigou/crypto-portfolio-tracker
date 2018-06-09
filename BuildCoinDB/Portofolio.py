

class Portofolio():
    def __init__(self):
        self.ownerName = ""
        self.content = {}

    def addValue(self,currencyName: str,quantity : float):
        self.content[currencyName] = quantity
