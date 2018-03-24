import pymongo


class AseAtom:
    def __init__(self):
        self.mongo_server = '192.168.1.19'
        self.mongo_client = pymongo.MongoClient(self.mongo_server, 27017)
        self.mongo_database = None

    def connect_db(self, db_name='userDailyBackupTask'):
        self.mongo_database = self.mongo_client[db_name]
        if not self.mongo_database:
            print("Failed to connect db : %s" % db_name)
            return False

        return self.mongo_database

    def user_assignments(self, project, user_name):

        """
        :param session: project like e.g ice or sw9
        :param user_name: user name like: prafull.sakharkar
        :return: will return task list like: [u'aaj:pb:rigging'] [u'aaj:060:0190:animation']
        """

        if not (project or user_name):
            print("Parse valid arguments: USAGE: user_assignments('ice','prafull.sakharkar')")
            return False

        db = self.mongo_database

        if not db:
            db = self.connect_db()

        collection = db[project.lower() + '_tasks']
        search_key = {
            'current_assignees.user_name': user_name,
            'ftrack_status': {
                '$in': ['Internal Reject', 'In progress', 'Ready to start']
            }
        }
        db_cursor = collection.find(search_key, {'path': 1, 'ftrack_id': 1})

        task_list = list()
        for each_task in db_cursor:
            if 'path' in each_task:
                task_list.append(each_task['path'])

        if len(task_list):
            return task_list
        else:
            return ['Nothing is assign to you.', 'Kindly contact to production.', 'or check task status.']
