import json
import requests
import sys
import time

class Activities:
    def __init__(self, username, activity_type='comments', uid=None, sid=None):
        self.activity_type = activity_type
        self.username = username
        self.page = 1

    def __iter__(self):
        return self

    def __next__(self):
        url = f'https://d3.ru/api/users/{self.username}/{self.activity_type}/?page={self.page}'
        response = requests.get(url).json()
        self.page += 1
        try:
            activities = response[self.activity_type]
        except:
            raise StopIteration()
        if len(activities) > 0:
            return activities
        else:
            raise StopIteration()

class Comments(Activities):
    def __init__(self, username, uid=None, sid=None):
        Activities.__init__(self, username, 'comments', uid, sid)

class Posts(Activities):
    def __init__(self, username, uid=None, sid=None):
        Activities.__init__(self, username, 'posts', uid, sid)

# 

from_id = 0
to_id = 300000

if len(sys.argv) == 3:
    from_id = int(sys.argv[1])
    to_id = int(sys.argv[2])

time_limit = time.time() - 60 * 60 * 24 * 7
pages_limit = 25
activities_limit = 42 * pages_limit
url = 'https://d3.ru/ajax/user/get/'

max_errors = 250
errors = 0

def cache_activity(activity, cache):
    if 'created' in activity and 'rating' in activity and activity['created'] <= time_limit:
        cached_activity = {
            'domain': activity['domain']['prefix'],
            'rating': activity['rating'],
            'created': activity['created'],
            'id': activity['id']
        }
        if 'post' in activity:
            cached_activity['post_id'] = activity['post']['id']
        cache.append(cached_activity)


for id in range(from_id, to_id):
    if errors > max_errors:
        break
    user = requests.post(url, data={ 'id': id }).json()
    if user['status'] == 'OK':
        errors = 0
        print('id:', id, 'user:', user['dude']['login'])
        if (user['comments_count'] > activities_limit or user['posts_count'] > activities_limit):
            print(f' posts: {user["posts_count"]}, comments: {user["comments_count"]}')

            cached_posts = list()
            for posts in Posts(user['dude']['login']):
                for post in posts:
                    cache_activity(post, cached_posts)

            cached_comments = list()
            for comments in Comments(user['dude']['login']):
                for comment in comments:
                    cache_activity(comment, cached_comments)

            cached_posts.sort(key=lambda x: x['created'], reverse=True)
            cached_comments.sort(key=lambda x: x['created'], reverse=True)

            cache = {
                'user': user['dude']['login'],
                'posts': cached_posts,
                'comments': cached_comments,
                'limit': time_limit
            }

            with open(f'blobs/{user["dude"]["login"].lower()}.json', 'w') as file:
                json.dump(cache, file, ensure_ascii=False, separators=(',',':'))

    else:
        errors += 1
        print('id:', id, 'error:', user['errors'][0]['code'], 'errors left:', max_errors - errors)
