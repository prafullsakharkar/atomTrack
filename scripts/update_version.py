import ase_session
import pymongo
import datetime
from pprint import pprint

session = ase_session.Session()

project = 'sw9'

client = pymongo.MongoClient('192.168.1.19', 27017)

mongo_db = client['userDailyBackupTask']
collection = mongo_db['%s_versions' % project]
bulk = collection.initialize_ordered_bulk_op()

obj_vers = session.query('AssetVersion where task.project.name is "%s"' % project)
for ver in obj_vers:
    data = dict()
    verid = ver['id']
    search_key = { 'ftrack_id' : verid }
    print("VERSION : %s" %verid)
    try:
        pub_date = ver['date']
        published_on = datetime.datetime.strptime(pub_date.strftime('%F %T'), '%Y-%m-%d %H:%M:%S')
        data['published_on'] = published_on

        path_list = [each_link['name'] for each_link in ver['link']]
        project_name = path_list[0].lower()

        path = ':'.join(path_list)
        path = path.replace(path.split(':')[0], path.split(':')[0].lower())

        data['project'] = project_name
        data['path'] = path
        data['name'] = path.split(':')[-1]
        data['object_type'] = 'Asset Version'
        data['task_name'] = ver['task']['name']
        data['task_path'] = path.replace(data['name'], data['task_name'])
        data['asset_type'] = ver['asset']['type']['name']
        data['asset_name'] = ver['asset']['name']
        data['task_id'] = ver['task_id']
        data['ftrack_status'] = ver['status']['name']
        data['description'] = ver['comment']

        comp_list = list()
        for each in ver['components']:
            try:
                name = each['name']
                location = each['component_locations'][0]['resource_identifier']
                comp_list.append({'name': name, 'location': location})
            except:
                print("No resource_identifier in component")

        data['components'] = comp_list
        data['published_by'] = ver['user']['username']
    except:
        print("WRONG:%s" %verid)

    bulk.find(search_key).upsert().update_one({'$set': data})

bulk.execute()
