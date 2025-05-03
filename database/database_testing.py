import pymongo
import datetime

from user_functions import *

def get_database():
    CONNECTION_STRING = "mongodb+srv://clairemather03:qHdE9tZOR2Lt3vpI@cluster0.wh5i5om.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"

    client = pymongo.MongoClient(CONNECTION_STRING)
    return client["db1"]

def new_schedule(year):
    start_date = datetime.date(year, 1, 1)
    end_date = datetime.date(year+1, 1, 1)
    delta = datetime.timedelta(days=1)

    days = []
    while start_date < end_date:
        days.append({
            "date": "%s/%s/%s" % (start_date.day, start_date.month, start_date.year),
            "Holiday": None
        })
        start_date += delta
    db_name = get_database()
    collection = db_name["Schedule"]
    collection.insert_many(days)
    return True

def set_holiday(holiday_date, new_name):
    holiday = {
        "name": new_name
    }
    query = {"holiday_date": holiday_date}
    new_value = {"$set": {"Holiday": holiday}}
    db_name = get_database()
    collection = db_name["Schedule"]
    collection.update_one(query, new_value)
    return True

if __name__ == "__main__":
    #add_user("Claire", "Mather", "bwahhh", False)
    add_preference("bwahhh", "1/1/2025", 3)

# Users
    # first_name: string
    # last_name: string
    # email: string
    # password: string
    # admin: bool
    # preference: preference
        # priority: int
        # day: day

# schedule
    # Day
        # Date: Date
        # Holiday: holiday
            # Name: string
            # does_date_vary: bool
            # month: int?
            # day: int?
            # future Dates: list of dates?
            # requires either month and day or future dates
