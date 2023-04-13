# let cur = db.users.find({ total_count: { $exists: false } })
# while (cur.hasNext()) {
#     const user = cur.next()
#     print(user.dude.login)
#     user.total_count = user.comments_count + user.posts_count
#     db.users.save(user)
# }

# let cur = db.users.find({}).sort({ 'dude.id': 1 })

# while (cur.hasNext()) {
#     const user = cur.next()
#     print(user.dude.id + ' ' + user.dude.login)
#     db.karma.updateMany({ from: user.dude.login }, { $set: { total_count_from: user.total_count } })
# }

import os
import sys
from pymongo import MongoClient, ASCENDING, DESCENDING
import numpy as np

from_id = int(sys.argv[1])
to_id = int(sys.argv[2])

db = MongoClient(os.environ['MONGO'])['dirty']
users_collection = db['users']
karma_collection = db['karma']

print('from', from_id, 'to', to_id)

for user in users_collection.find({'dude.id': {'$gte': from_id, '$lte': to_id}}):
    print(user['dude']['id'], user['dude']['login'])
    totals = np.fromiter(map(lambda x: int(x['total_count_from']), list(
        karma_collection.find({'to': user['dude']['login']}))), dtype=np.int)

    count = len(totals)
    zeros = count - np.count_nonzero(totals)
    zero_perc = 0
    if count != 0:
        zero_perc = zeros / count

    stats = {
        'count': len(totals),
        'mean': np.mean(totals),
        'median': np.median(totals),
        'std': np.std(totals),
        'zeros': len(totals) - np.count_nonzero(totals),
        'zero_perc': zero_perc
    }

    print(stats)

    user['stats'] = stats

    users_collection.save(user)
