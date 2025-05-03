import datetime

from database_testing import get_database

def new_schedule(year):
    start_date = datetime.date(year, 1, 1)
    end_date = datetime.date(year+1, 1, 1)
    delta = datetime.timedelta(days=1)

    days = []
    while start_date < end_date:
        days.append({
            "date": start_date,
            "Holiday": None
        })
        start_date += delta
    db_name = get_database()
    collection = db_name["Schedule"]
    collection.insert_many(days)
    return True

def get_date():
    return True
