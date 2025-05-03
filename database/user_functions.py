from database_testing import get_database

def add_user(new_first_name, new_last_name, new_email, new_admin=False):

    # create preferences collection for user
    new_user = {
        "first_name": new_first_name,
        "last_name": new_last_name,
        "email": new_email,
        "admin": new_admin,
        "preferences": []
    }
    db_name = get_database()
    collection = db_name["users"]
    print(collection.insert_one(new_user))
    return new_user

def remove_user(user_email):
    if user_email is None:
        return False
    
    db_name = get_database()
    collection = db_name["users"]
    collection.remove()
    return True

def add_preference(email, date, priority):
    db_name = get_database()
    collection = db_name["schedule"]
    date_obj = collection.users.find_one({"date": date})
    pref = {
        "priority": priority,
        "date": date_obj["_id"]
    }
    collection = db_name["users"]
    user = collection.users.find_one({"email": email})
    query = {"email": email}
    new_value = {"$set": {"preferences": user["preferences"].append(pref)}}
    collection.update_one(query, new_value)
    return True

    

def get_user():
    return True