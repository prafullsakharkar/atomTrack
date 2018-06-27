import ftrack
import ftrack_api
import functools
import pymongo
import os
import datetime
import smtplib
import json
from subprocess import check_output
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

import logging
from logging.handlers import RotatingFileHandler
from logging import handlers
import sys

from pprint import pprint


class AtomTrackEvent():

    def __init__(self):

        __author__ = "Prafull Sakharkar"

        try:
            ips = check_output(['hostname', '--all-ip-addresses'])
            ip_address = ips.strip()
        # self.ipaddress = gethostbyname(self.machinename)
        except ValueError:
            ip_address = '127.0.0.1'

        mongo_server = '192.168.1.19'
        ftrack_server = 'http://192.168.1.98'
        self.debug = False
        if ip_address not in ['192.168.1.20', '192.168.1.19']:
            mongo_server = '192.168.1.128'
            ftrack_server = 'http://192.168.1.99'
            self.debug = True

        LOGFILE = "/var/log/ftrackevent/ftrack_event.log"

        self.log = logging.getLogger('')
        self.log.setLevel(logging.INFO)
        format = logging.Formatter("%(asctime)s - %(name)s - %(levelname)s - %(message)s")

        ch = logging.StreamHandler(sys.stdout)
        ch.setFormatter(format)
        ch.setLevel(logging.ERROR)
        self.log.addHandler(ch)

        fh = handlers.RotatingFileHandler(LOGFILE, maxBytes=(1048576 * 5), backupCount=7)
        fh.setFormatter(format)
        ch.setLevel(logging.INFO)
        self.log.addHandler(fh)

        self.log.info('Server :- %s : %s' % (mongo_server, ftrack_server))

        mongo = pymongo.MongoClient(mongo_server, 27017)
        self.database = mongo['userDailyBackupTask']
        self.session = ftrack_api.Session(ftrack_server)

	self.email_jfile = '/opt/djangoenv/atomTrack/static/json/email.json'
	self.email_address = self.get_email_address()

    #        self.register_event(session)

    # Wait for events.
    #        session.event_hub.wait()

    def register_event(self, session, **kw):
        '''Register event listener.'''

        # Validate that session is an instance of ftrack_api.Session. If not,
        # assume that register is being called from an incompatible API
        # and return without doing anything.
        if not isinstance(session, ftrack_api.Session):
            # Exit to avoid registering this plugin again.
            return

        # Register the event handler
        handle_event = functools.partial(self.handle_ftrack_event, session)

        session.event_hub.subscribe('topic=ftrack.update', handle_event)

    def handle_ftrack_event(self, session, event):

        """
        :param session: Ftrack Session
        :param event: ftrack Event
        :return:
        """

        check_action = ['add', 'update', 'remove']
        check_entity_type = ['show', 'task', 'appointment', 'assetversion']

        update_entity = dict()
        for entity in event['data'].get('entities', []):

            if self.debug:
                self.log.info(entity)

            if entity.get('action') not in check_action or entity.get('changes') == None or entity.get(
                    'entityType') not in check_entity_type:
                continue

            action = entity.get('action')
            entity_type = entity.get('entityType')

            if entity_type == 'show':
                project_changes = self.project_changes(entity, session)
                if 'project' in project_changes:
                    proj = project_changes['project']

                    if proj not in update_entity:
                        update_entity[proj] = dict()
                    if action not in update_entity[proj]:
                        update_entity[proj][action] = dict()
                    if entity_type not in update_entity[proj][action]:
                        update_entity[proj][action][entity_type] = list()

                    update_entity[proj][action][entity_type].append(project_changes)

            if entity_type == 'task':
                task_changes = self.task_changes(entity, session)
                if 'project' in task_changes:
                    proj = task_changes['project']

                    if proj not in update_entity:
                        update_entity[proj] = dict()
                    if action not in update_entity[proj]:
                        update_entity[proj][action] = dict()
                    if entity_type not in update_entity[proj][action]:
                        update_entity[proj][action][entity_type] = list()

                    update_entity[proj][action][entity_type].append(task_changes)

            if entity_type == 'appointment':
                appointment_changes = self.appointment_changes(entity, session)
                if 'project' in appointment_changes:
                    proj = appointment_changes['project']

                    if proj not in update_entity:
                        update_entity[proj] = dict()
                    if action not in update_entity[proj]:
                        update_entity[proj][action] = dict()
                    if entity_type not in update_entity[proj][action]:
                        update_entity[proj][action][entity_type] = list()

                    update_entity[proj][action][entity_type].append(appointment_changes)

            if entity_type == 'assetversion':
                assetversion_changes = self.assetversion_changes(entity, session)
                if 'project' in assetversion_changes:
                    proj = assetversion_changes['project']

                    if proj not in update_entity:
                        update_entity[proj] = dict()
                    if action not in update_entity[proj]:
                        update_entity[proj][action] = dict()
                    if entity_type not in update_entity[proj][action]:
                        update_entity[proj][action][entity_type] = list()

                    update_entity[proj][action][entity_type].append(assetversion_changes)

        # Updating MongoDB
        self.update_mongodb(update_entity)

    def update_mongodb(self, update_entity):

        """
            Task : {u'add': {u'task': [{'priority': u'None', 'enable': 1, 'description': u'', 'ftrack_status': u'Client Reject', 'bid': 0.0, 'parent_object_type': u'Shot', 'parent_type': u'Static shot', 'project': u'mong', 'parent_id': u'2894c340-fb73-11e7-84a2-4eb8bafb65b2', 'ftrack_id': u'1b48346c-0b68-468c-b2a6-9a4940a42f1b', 'path': u'mong:998:0010:Layout', 'object_type': u'Task', 'updated_on': datetime.datetime(2018, 1, 17, 18, 56, 42, 983105), 'type': u'Layout', 'added_on': datetime.datetime(2018, 1, 17, 18, 56, 42, 983135), 'name': u'Layout'}]}}
            Assignment : {u'add': {u'appointment': [{'project': u'mong', 'updated_on': datetime.datetime(2018, 1, 17, 18, 57, 8, 180246), 'ftrack_id': u'1b48346c-0b68-468c-b2a6-9a4940a42f1b', 'user': {'email_id': u'ajay.maurya@intra.madassemblage.com', 'user_name': u'ajay.maurya'}, 'added_on': datetime.datetime(2018, 1, 17, 18, 57, 8, 180213)}]}}
        """

        if not update_entity:
            return False

        project = update_entity.keys()[0]
        collection = self.database['%s_tasks' % project]
        bulk = collection.initialize_ordered_bulk_op()

        collection1 = self.database['%s_versions' % project]
        bulk1 = collection1.initialize_ordered_bulk_op()

        self.log.info('-' * 150)
#        self.log.info(update_entity)

	bulk1_flag = 0
	bulk_flag = 0
        for action, entity_type in update_entity[project].items():
            for entity, data in entity_type.items():
		version_col = 0
		if entity == 'assetversion':
		    version_col = 1
		    bulk1_flag = 1
		else:
		    bulk_flag = 1

                for each_data in data:
                    if 'ftrack_id' not in each_data or 'project' not in each_data:
                        continue

                    search_key = dict()
                    search_key['ftrack_id'] = each_data['ftrack_id']

                    if action == 'add':
                        self.log.info('Adding : %s ....' % (each_data))
                        if entity == 'appointment':
                            users = [each_data['user']]
                            bulk.find(search_key).upsert().update_one(
                                {'$addToSet': {'current_assignees': {'$each': users}}})
                            if 'parent_id' in each_data:
                                bulk.find(search_key).upsert().update_one(
                                    {'$set': {'parent_id': each_data['parent_id']}})
                        else:
			    if version_col:
				bulk1.find(search_key).upsert().update_one({'$set': each_data})
			    else:
				bulk.find(search_key).upsert().update_one({'$set': each_data})
                    elif action == 'update':
                        self.log.info('Updating : %s ....' % (each_data))
			if version_col:
			    bulk1.find(search_key).upsert().update_one({'$set': each_data})
			else:
			    bulk.find(search_key).upsert().update_one({'$set': each_data})
                    elif action == 'remove':
                        self.log.info('Deleting : %s ....' % (each_data))
                        if entity == 'appointment':
                            users = each_data['user']
                            bulk.find(search_key).update_one({'$pull': {'current_assignees': users}})
                        else:
			    if version_col:
				bulk1.find(search_key).remove_one()
			    else:
				bulk.find(search_key).remove_one()

        self.log.info(' >>> mongodb updated <<<')
	if bulk_flag:
	    bulk.execute()
	if bulk1_flag:
	    bulk1.execute()

    def project_changes(self, entity, session):
        data = dict()
        data['ftrack_id'] = entity.get('entityId')
        data['updated_on'] = datetime.datetime.now()

        action = entity.get('action')

        show_obj = session.get('Context', data['ftrack_id'])
        data['project'] = show_obj['name'].lower()
        data['type'] = 'Project'
        data['object_type'] = 'Project'

        if action == 'remove':
            return data

        if action == 'add':
            data['added_on'] = datetime.datetime.now()

        if 'fullname' in entity.get('changes'):
            data['fullname'] = entity['changes']['fullname']['new']

        if 'name' in entity.get('changes'):
            data['name'] = entity['changes']['name']['new']

        if 'startdate' in entity.get('changes'):
            data['startdate'] = entity['changes']['startdate']['new']

        if 'enddate' in entity.get('changes'):
            data['enddate'] = entity['changes']['enddate']['new']

        if 'projectschemeid' in entity.get('changes'):
            data['projectschemeid'] = entity['changes']['projectschemeid']['new']

        if 'root' in entity.get('changes'):
            data['root'] = entity['changes']['root']['new']

        if 'status' in entity.get('changes'):
            data['status'] = entity['changes']['status']['new']

        if 'clientlabel_proj' in entity.get('changes'):
            data['clientlabel_proj'] = entity['changes']['clientlabel_proj']['new']

        if 'resolution' in entity.get('changes'):
            data['resolution'] = entity['changes']['resolution']['new']

        if 'fps' in entity.get('changes'):
            data['fps'] = entity['changes']['fps']['new']

        if 'startFrame' in entity.get('changes'):
            data['startFrame'] = entity['changes']['startFrame']['new']

        return data

    def task_changes(self, entity, session):

        task_data = dict()
        task_data['ftrack_id'] = entity.get('entityId')
        task_data['updated_on'] = datetime.datetime.now()

        action = entity.get('action')

        if action == 'remove':
            for each_parent in entity.get('parents'):
                if each_parent['entityType'] == 'show':
                    show_obj = session.get('Context', each_parent['entityId'])
                    task_data['project'] = show_obj['name'].lower()

            return task_data

        if entity.get('parentId'):
            task_data['parent_id'] = entity.get('parentId')

        if action == 'add':
            task_data['added_on'] = datetime.datetime.now()

        task_id = task_data['ftrack_id']
        task_obj = session.get('Context', task_id)
        if 'object_type' not in task_obj.keys():
            return False
        task_path = (':'.join([each_link['name'] for each_link in task_obj['link']]))
        task_path = task_path.replace(task_path.split(':')[0], task_path.split(':')[0].lower())
        project_name = task_obj['project']['name'].lower()

        task_data['project'] = project_name
        task_data['path'] = task_path
        task_data['name'] = task_path.split(':')[-1]
        task_data['type'] = task_obj['type']['name']
        task_data['object_type'] = task_obj['object_type']['name']

        if 'object_type' in task_obj['parent']:
            task_data['parent_type'] = task_obj['parent']['type']['name']
            task_data['parent_object_type'] = task_obj['parent']['object_type']['name']
        else:
            task_data['parent_type'] = 'Project'
            task_data['parent_object_type'] = 'Project'

        if 'bid' in entity.get('changes'):
            task_data['bid'] = entity['changes']['bid']['new']

        if 'description' in entity.get('changes'):
            task_data['description'] = entity['changes']['description']['new']

        if 'startdate' in entity.get('changes'):
            task_data['startdate'] = entity['changes']['startdate']['new']

        if 'enddate' in entity.get('changes'):
            task_data['enddate'] = entity['changes']['enddate']['new']

        if 'object_typeid' in entity.get('changes'):
            obj_type_id = entity['changes']['object_typeid']['new']
            obj_type = session.get('ObjectType', obj_type_id)
            obj_type_name = obj_type['name']
            task_data['object_type'] = obj_type_name

        if 'entity_name' in entity.get('changes'):
            task_data['entity_name'] = entity['changes']['entity_name']['new']

        if 'statusid' in entity.get('changes'):
            status_id = entity['changes']['statusid']['new']
            obj_status = session.get('Status', status_id)
            status_name = obj_status['name']
            task_data['ftrack_status'] = status_name

        if 'typeid' in entity.get('changes'):
            type_id = entity['changes']['typeid']['new']
            task_type = session.get('Type', type_id)
            type_name = task_type['name']
            task_data['type'] = type_name

        if 'fstart' in entity.get('changes'):
            task_data['startframe'] = entity['changes']['fstart']['new']

        if 'fend' in entity.get('changes'):
            task_data['endframe'] = entity['changes']['fend']['new']

        if 'priorityid' in entity.get('changes'):
            priorityid = entity['changes']['priorityid']['new']
            priority_obj = session.get('Priority', priorityid)
            task_data['priority'] = priority_obj['name']

        return task_data

    def appointment_changes(self, entity, session):
        data = dict()
        task_id, user_id = entity['changes']['context_id'], entity['changes']['resource_id']
        if entity.get('action') == 'add':
            # get new assigned user object and task object
            task_id, user_id = task_id['new'], user_id['new']
            data['added_on'] = datetime.datetime.now()
        else:
            # get new removed user from task object and task object
            task_id, user_id = task_id['old'], user_id['old']

        data['ftrack_id'] = task_id
        data['updated_on'] = datetime.datetime.now()
        task_obj = session.get('Context', task_id)

        if 'project' not in task_obj:
            return data

        data['project'] = task_obj['project']['name'].lower()
        data['parent_id'] = task_obj['parent']['id']

        # User info user name and email id
        user = session.get('Resource', user_id)
        user_name, user_email = user['username'], user['email']
        data['user'] = {'user_name': user_name, 'email_id': user_email}

        return data

    def assetversion_changes(self, entity, session):

        data = dict()
        if not entity.get('entityId'):
            return data

        ftrack_id = entity.get('entityId')
        data['ftrack_id'] = ftrack_id
        data['updated_on'] = datetime.datetime.now()

        obj_version = session.get('AssetVersion', ftrack_id)
        if not obj_version:
            return data

        path_list = [each_link['name'] for each_link in obj_version['link']]
        project_name = path_list[0].lower()

        path = ':'.join(path_list)
        path = path.replace(path.split(':')[0], path.split(':')[0].lower())

        data['project'] = project_name
        data['path'] = path
        data['name'] = path.split(':')[-1]
        data['object_type'] = 'Asset Version'
        data['task_name'] = obj_version['task']['name']
        data['task_path'] = path.replace(data['name'],data['task_name'])
        data['asset_type'] = obj_version['asset']['type']['name']
        data['asset_name'] = obj_version['asset']['name']

        action = entity.get('action')
        if action == 'remove':
            return data

        if entity.get('taskid'):
            data['task_id'] = entity.get('taskid')

        if entity.get('parentId'):
            data['parent_id'] = entity.get('parentId')

        if 'userid' in entity.get('changes'):
	    obj_user = session.get('User', entity['changes']['userid']['new'])
            data['published_on'] = datetime.datetime.now()
            data['published_by'] = obj_user['username']

        if 'comment' in entity.get('changes'):
            data['description'] = entity['changes']['comment']['new']

        if 'statusid' in entity.get('changes'):
            status_id = entity['changes']['statusid']['new']
            obj_status = session.get('Status', status_id)
            status_name = obj_status['name']
            data['ftrack_status'] = status_name

	comp_list = list()
	
	for each in obj_version.get('components'):
	    try:
		name = each['name']
		location = each['component_locations'][0]['resource_identifier']
		comp_list.append({'name':name,'location':location})
	    except:
		self.log.info("No resource_identifier in component")

	data['components'] = comp_list

	# Check version reject by other department

	if action == 'add':
	    task_path_list = path_list[:-1]
	    task_path_list.append(data['task_name'])
	    task_path = ':'.join(task_path_list)

	    ver = data['name']
	    prev_ver_no = '%003d' %(int(ver.split()[-1][-3:]) - 1)
	    prev_ver = ver.split()[0] + ' v' + prev_ver_no
	    
	    note_col = self.database['%s_notes' % project_name]
	    search_key = {
			    "pub_version" : prev_ver,
			    "status" : "Internal Reject",
			    "to_name" : task_path,
			    "from_name" : { "$exists" : True, "$ne" : task_path }
			}
	    find_cursor = note_col.find_one(search_key)

	    if find_cursor:
		from_dept = find_cursor['from_name']
		to_dept = find_cursor['to_name']
		comment = find_cursor['note_text']
		added_by = find_cursor['added_by']
		added_on = find_cursor['added_on']
		reply = data['description']
		reply_on = data['published_on']
		pub_version = data['name']
		details = { 'from_dept' : from_dept, 'user' : added_by , 'status' : 'New Version Published', 'to_dept': to_dept, 'note_text' : comment, 'note_reply' : reply, 'reply_on': reply_on, 'added_on': added_on, 'pub_version': pub_version}

		self.reject_mail(details)

        return data

    def reject_mail(self, details):

        subject = 'Re: Task Reject (' + details['to_dept'] + ') [' + details['status'] + ']'
        from_addr = 'pip@intra.madassemblage.com'

        user_list = [ details['user'] ]
        to_list = list()

        for user in user_list:
            user = user.strip()
            to_list.append(user + '@intra.madassemblage.com')

        to_addr = ','.join(to_list)

        project = details['from_dept'].split(':')[0].upper()
        from_task_name = details['from_dept'].split(':')[-1]
        to_task_name = details['to_dept'].split(':')[-1]

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

        if 'Review Task' in self.email_address['Email']:
            if project in self.email_address['Email']['Review Task']:
                if from_task_name in self.email_address['Email']['Review Task'][project]:
                    cc_addr = cc_addr + ',' + ','.join(self.email_address['Email']['Review Task'][project][from_task_name])
                if to_task_name in self.email_address['Email']['Review Task'][project]:
                    cc_addr = cc_addr + ',' + ','.join(self.email_address['Email']['Review Task'][project][to_task_name])

        htmlhead = """
        Hello ,</br>New version has been published for rejected task ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['to_dept'], details['status'])
        htmlbody = ''
        # htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Task</td>' \
        #                       '<td style="font-size:12px;">%s</td></tr>' % details['task_path']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">From</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['to_dept'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">To</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['from_dept'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reject Reason</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reply</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_reply']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Rejected on</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['added_on'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reply on</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['reply_on']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Published Version</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['pub_version'])

        htmltail = """
                </tbody>
            </table>
            </td>
            </tr>
            </table>
            <br>
            Regards,</br> %s
        """ % 'Pipeline Team' 

        mail_body = htmlhead + htmlbody + htmltail

        self.send_email(subject, from_addr, to_addr, cc_addr, mail_body)

    def send_email(self, subject, from_addr, to_addr, cc_addr, mail_body):

        msg = MIMEMultipart('alternative')
        msg['Subject'] = subject
        msg['From'] = from_addr
        msg['To'] = to_addr
        msg['Cc'] = cc_addr

        sender_mail = from_addr
        receiver_mail = to_addr.split(",") + cc_addr.split(",")

        if self.debug:
            receiver_mail = ['prafull.sakharkar@intra.madassemblage.com', 'vikas.bhargav@intra.madassemblage.com']

        part = MIMEText(mail_body, 'html')
        msg.attach(part)
        s = smtplib.SMTP('localhost')
        s.sendmail(sender_mail, receiver_mail, msg.as_string())
        s.quit()

        mail_log = "Publish Mail Send from %s to %s" % (sender_mail, receiver_mail)
	self.log.info(mail_log)
    
    def get_email_address(self):

        json_data = {}
        if os.path.isfile(self.email_jfile):
            data_file = open(self.email_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        return json_data

if __name__ == '__main__':
    # session = ftrack_api.Session()
    class_obj = AtomTrackEvent()
    class_obj.register_event(class_obj.session)
    # Wait for events.
    class_obj.session.event_hub.wait()
