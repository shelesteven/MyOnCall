import pymongo

CONNECTION_STRING = "mongodb+srv://clairemather03:qHdE9tZOR2Lt3vpI@cluster0.wh5i5om.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"


def create_database():
    # if the users collection does not exists
        # create user collection
    # if schedule does not exist
        # create schedule collection
    

    return True

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


