import random
from datetime import date, timedelta
import pymongo

def schedule_day(database, date_to_schedule):
    priority_dict = {}


    num_docs = len(database["doctors"]) #FIX THIS - DATABASE STUFF

    for doc in database["doctors"]: #FIX THIS - DATABASE STUFF
        priority = doc["rank"]  # base ranking #FIX THIS - DATABASE STUFF

        if is_holiday(date_to_schedule, database) and priority != 0:
            name_of_holiday = #FIX THIS - DATABASE STUFF
            holiday_dist = get_holiday_distance(doc, name_of_holiday, database) #FIX THIS - DATABASE STUFF
            priority += max(num_docs - holiday_dist, 0)

        dist = get_schedule_distance(doc, date_to_schedule, database) #FIX THIS - DATABASE STUFF
        priority += max(8 - dist, 0)

        priority_dict[doc["id"]] = priority

    # Find doc(s) with min priority
    min_priority = min(priority_dict.values())
    candidates = [doc_id for doc_id, p in priority_dict.items() if p == min_priority]

    selected_doc_id = random.choice(candidates)
    assign_shift(database, selected_doc_id, date_to_schedule) #FIX THIS - DATABASE STUFF

    return selected_doc_id


def get_ranking(database, date_to_sum):
    sum_rank = 0
    for doc in database["doctors"]:
        sum_rank += doc["rank"] #FIX THIS - DATABASE STUFF
    return sum_rank


def create_schedule(database, year):
    
    # Initialize the schedule
    for d in database.dates: #FIX THIS - DATABASE STUFF
        database["schedule"][d] = None

    # Pre-assign holiday shifts
    for holiday in database["holidays"]:
        selected_doc_id = doc assigned to holiday #FIX THIS - DATABASE STUFF
        date_to_schedule = date of holiday #FIX THIS - DATABASE STUFF
        assign_shift(database, selected_doc_id, date_to_schedule)

    # Priority dict for non-holidays
    priority_dict = {
        d: 0 for d in database.dates if d not in database["holidays"] #FIX THIS - DATABASE STUFF
    }

    if not priority_dict:
        return False

    for d in priority_dict:
        priority_dict[d] = get_ranking(database, d)

    while priority_dict:
        max_date = max(priority_dict, key=priority_dict.get)
        schedule_day(database, max_date)
        del priority_dict[max_date]

    return True
