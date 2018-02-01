import base64
import copy_reg
import datetime
import json
import os
import re
import smtplib
import time
import types
from Queue import Queue
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from threading import Thread

import ase_ftrack
import ase_session
import ase_task
import ldap
import pymongo
from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from settings import BASE_DIR, PROJ_BASE_DIR

from pprint import pprint

from .forms import AttachmentForm
from .models import Attachment


# from django.core.urlresolvers import reverse
# from django.shortcuts import render_to_response
# from django.template import RequestContext


# from django.utils.decorators import method_decorator

def _pickle_method(m):
    if m.im_self is None:
        return getattr, (m.im_class, m.im_func.func_name)
    else:
        return getattr, (m.im_self, m.im_func.func_name)


copy_reg.pickle(types.MethodType, _pickle_method)


class Activity:
    def __init__(self):
        self.session = ase_session.Session()
        self.reload_session()
        print os.environ['FTRACK_SERVER']
        self.password_str = base64.b64decode("bWFkQHBpcDE=")
        self.projects = {}
        self.object_types = {}
        self.sequences = {}
        self.asset_builds = {}
        self.shots = {}
        self.employee_details_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/employee_details.json')
        self.user_details_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/user_details.json')
        self.email_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/email.json')
        self.task_template_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/task_template.json')
        self.allowed_status = ['In progress', 'Ready to start', 'Internal Reject', 'Internal Approved', 'On Hold',
                               'Not started']
        self.change_status = ['In progress', 'Ready to start', 'On Hold']
        self.artist_status = ['Ready to start', 'In progress', 'On Hold', 'Pending Internal Review', 'Internal Reject',
                              'Pending Client Review', 'Client Reject']
        self.ftp_departments = [{'name': 'Layout', 'id': '03'}, {'name': 'Shot Finaling', 'id': '06'},
                                {'name': 'Blocking', 'id': '04'}, {'name': 'Animation', 'id': '05'},
                                {'name': 'Render', 'id': '00'}, {'name': 'Lighting', 'id': '01'}]
        self.ftp_status = [{'name': 'Internal Approved'}]
        self.ftp_asset_name = ['final', 'sequence', 'static', 'review', 'geom']
        self.ftp_vesion_side = [{'name': 'both'}, {'name': 'left'}, {'name': 'right'}]

        self.dept_short = ase_task.getTaskFtFsMapping()

        self.master_login = 0
        self.users_columns = ''
        self.objTask = []
        self.parent_ids = []
        self.queue = ''
        self.object_name = ''
        self.object_type = ''
        self.user = ''
        self.user_role = ''
        self.username = ''
        self.user_details_log = []
        self.asset_build_tasks = sorted([u'Texturing', u'Data Ingest', u'PreLighting', u'CFX', u'Modeling', u'Rigging',
                                         u'Blend Shape', u'Layout Rig', u'Fur Shape', u'Anim Texture', u'Sim Modeling'])
        self.shots_tasks = sorted([u'Anim Tech Check', u'Render', u'Stereo Render', u'Lighting', u'Stereo Comp',
                                   u'PreLighting', u'Cloth', u'FX', u'Shave Hair', u'Animation', u'Shot Finaling',
                                   u'Layout', u'Blocking'])

        self.all_tasks = sorted(set(self.asset_build_tasks + self.shots_tasks))

        self.type_name = {'Blend Shape': 'Modeling', 'Fur Shape': 'Modeling', 'Sim Modeling': 'Modeling',
                          'Layout Rig': 'Rigging', 'Anim Texture': 'Texturing', 'Anim Tech Check': 'Animation',
                          'Cloth': 'CFX', 'Shave Hair': 'CFX', 'Rig Test': 'Animation', 'Layout Stereo': 'Stereo',
                          'Animation Stereo': 'Stereo', 'Final Animation Stereo': 'Stereo', 'Foliage': 'Foliage'}

        self.stereo_tasks = ['Layout Stereo', 'Animation Stereo', 'Final Animation Stereo']

        self.mongo_client = pymongo.MongoClient('192.168.1.128', 27017)
        self.mongo_database = self.mongo_client['userDailyBackupTask']

        self.email_address = self.getEmailAddress()
        self.durations = ['Daily', 'Weekly', 'Monthly', 'Date Wise']
        self.empcode = {'prafull.sakharkar': 'RCP0713', 'muqtar.shaikh': 'RCM0800', 'ayush.goel': 'RCA0633'}
        self.employee_details = dict()

    def get_login(self, request):
        """
        get login id of the user who logs in
        :param request:
        :return:
        """
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        # password = request.user.password
        self.username = username

        self.get_user_columns(username)
        print datetime.datetime.now(), "User Login : %s" % username

        if self.user_role == 'Supervisor':
            return HttpResponseRedirect('/mgm_dashboard/')
        elif self.user_role == 'Co-ordinator':
            return HttpResponseRedirect('/status/')
        else:
            return HttpResponseRedirect('/tasks/')

    def ajax_call(self, request):
        """
        Establishes a connection on server on url='callajax/' and accepts the dictionary based on object name
        :param request: Requests a response from server url
        :return: returns a dictionary containing required data
        """
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        if request.method == 'POST':
            data = []
            if request.is_ajax():
                proj_id = request.POST.get('proj_id')
                object_name = request.POST.get('object_name')
                if object_name == 'Sequence':
                    data = self.get_sequences(proj_id)
                elif object_name == 'Shot':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_shots(proj_id, parent_id)
                elif object_name == 'Asset Build':
                    obj_type = request.POST.get('object_type')
                    data = self.get_asset_builds(proj_id, obj_type)
                elif object_name == 'Task':
                    parent_ids = request.POST.get('parent_ids')
                    self.object_name = request.POST.get('parent_object_name')
                    data = self.get_task_detail(parent_ids)
                elif object_name == 'Tasks':
                    pparent_ids = request.POST.get('pparent_ids')
                    self.object_name = request.POST.get('parent_object_name')
                    self.object_type = request.POST.get('parent_object_type')
                    data = self.get_task_details(pparent_ids)
                elif object_name == 'Save Changes':
                    data_list = request.POST.get('data_list')
                    self.save_changes(data_list, proj_id)
                elif object_name == 'Save Version Changes':
                    data_list = request.POST.get('data_list')
                    self.save_version_changes(data_list)
                elif object_name == 'Versions':
                    object_id = request.POST.get('object_id')
                    task_name = request.POST.get('task_name')
                    asset_type = request.POST.get('asset_type')
                    object_type = request.POST.get('object_type')
                    data = self.get_asset_versions(object_id, task_name, asset_type, object_type)
                elif object_name == 'Create Note':
                    note = request.POST.get('note_text')
                    object_id = request.POST.get('task_id')
                    note_category = request.POST.get('note_category')
                    note_for = request.POST.get('note_for')
                    note_task = request.POST.get('note_task')
                    attach_files = request.POST.get('attach_files')
                    self.create_entity_note(note, object_id, note_category, note_for, note_task, attach_files)
                elif object_name == 'DB Note':
                    note_text = request.POST.get('note_text')
                    object_id = request.POST.get('task_id')
                    note_category = request.POST.get('note_category')
                    change_status = request.POST.get('change_status')
                    task_path = request.POST.get('task_path')
                    users = request.POST.get('users')
                    version = request.POST.get('version')
                    self.insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version)
                elif object_name == 'Reply Note':
                    note_id = request.POST.get('note_id')
                    reply_text = request.POST.get('reply_text')
                    self.reply_note(reply_text, note_id)
                elif object_name == 'FtpShot':
                    parent_id = request.POST.get('parent_id')
                    task_name = request.POST.get('task_name')
                    status_name = request.POST.get('status_name')
                    upload_for = request.POST.get('upload_for')
                    data = self.get_ftp_shots(parent_id, task_name, status_name, upload_for)
                elif object_name == 'FtpAsset':
                    parent_id = request.POST.get('proj_id')
                    task_name = request.POST.get('task_name')
                    status_name = request.POST.get('status_name')
                    upload_for = request.POST.get('upload_for')
                    asset_type = request.POST.get('object_type')
                    data = self.get_ftp_asset_builds(parent_id, task_name, status_name, upload_for, asset_type)
                elif object_name == 'FTP Versions':
                    data_array = request.POST.get('data_array')
                    data = self.get_ftp_versions(data_array)
                elif object_name == 'FTP Upload':
                    versions = request.POST.get('data_array')
                    destination = request.POST.get('destination')
                    prefer = request.POST.get('prefer')
                    side = request.POST.get('side')
                    upload_status = request.POST.get('upload_status')
                    client_final_combo = request.POST.get('client_final_combo')
                    dept = request.POST.get('department')
                    username = request.user.username
                    data = self.upload_versions(versions, destination, prefer, side, upload_status, client_final_combo,
                                                dept, username)
                elif object_name == 'Ftp Asset Type':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_ftp_asset_types(parent_id)
                elif object_name == 'Ftp Asset Name':
                    parent_id = request.POST.get('parent_id')
                    asset_type = request.POST.get('asset_type')
                    data = self.get_ftp_asset_name(parent_id, asset_type)
                elif object_name == 'Ftp Component':
                    parent_id = request.POST.get('parent_id')
                    asset_name = request.POST.get('asset_name')
                    dept = request.POST.get('department')
                    upload_for = request.POST.get('upload_for')
                    data = self.get_ftp_components(parent_id, asset_name, dept, upload_for)
                elif object_name == 'client_version':
                    project_name = request.POST.get('project_name')
                    parent_name = request.POST.get('parent_name')
                    task_prefer = request.POST.get('task_prefer')
                    build_type = request.POST.get('build_type')
                    data = self.get_project_path_versions(project_name, parent_name, task_prefer, build_type)
                elif object_name == 'client_side_versions':
                    project_name = request.POST.get('project_name')
                    parent_name = request.POST.get('parent_name')
                    task_prefer = request.POST.get('task_prefer')
                    build_type = request.POST.get('build_type')
                    data = self.get_client_side_versions(project_name, parent_name, task_prefer, build_type)
                elif object_name == 'Show Task Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    data = self.show_task_details(type_name, task_id)
                elif object_name == 'Show Note Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    note_task = request.POST.get('note_task')
                    data = self.get_note_details(task_id, type_name, last_row, note_task)
                elif object_name == 'Show Link Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    data = self.get_link_details(task_id, type_name, last_row)
                elif object_name == 'Show Asset Versions':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    task = request.POST.get('task')
                    data = self.show_asset_versions(task_id, type_name, last_row, task)
                elif object_name == 'Version Note':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    task = request.POST.get('task')
                    data = self.get_version_notes(task_id, type_name, last_row, task)
                elif object_name == 'Change Status':
                    new_status = request.POST.get('new_status')
                    old_status = request.POST.get('old_status')
                    object_id = request.POST.get('object_id')
                    status_for = request.POST.get('status_for')
                    data = self.object_change_status(new_status, old_status, object_id, status_for)
                elif object_name == 'User Dashboard':
                    project = request.POST.get('project')
                    duration = request.POST.get('duration')
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    task = request.POST.get('task')
                    data = self.get_user_task_reports(project, duration, first, last, task)
                elif object_name == 'MGM Dashboard':
                    project = request.POST.get('project')
                    data = self.get_project_details(project)
                elif object_name == 'Artist Tasks':
                    project = request.POST.get('project')
                    status = request.POST.get('status')
                    data = self.get_artist_tasks(username, project, status)
                elif object_name == 'Review Tasks':
                    project = request.POST.get('project')
                    data = self.get_review_tasks(username, project)
                elif object_name == 'Entity Details':
                    entity_id = request.POST.get('entity_id')
                    entity_type = request.POST.get('entity_type')
                    data = self.get_entity_data(entity_id, entity_type)

            if request.FILES:
                data = self.attach_files(request)

            #            pprint(data)
            data = json.dumps(data)
            return HttpResponse(data, content_type="application/json")

    #            return JsonResponse(data)

    def get_user_details(self):

        json_data = {}
        if os.path.isfile(self.employee_details_jfile):
            data_file = open(self.employee_details_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        self.employee_details = json_data

    def get_user_columns(self, username):

        # json_data = {}
        if os.path.isfile(self.user_details_jfile):
            data_file = open(self.user_details_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

            if (username in json_data) and (
                    json_data[username]['role'] == 'Supervisor' or json_data[username]['role'] == 'Co-ordinator'):
                self.user_role = json_data[username]['role']
                self.users_columns = (',').join(json_data[username]['columns'])

    def get_projects(self):
        """
        gets the list of projects from ftrack
        :return:
        """
        obj_projects = self.session.query('Project')
        for projects in obj_projects:
            self.projects[projects['name']] = projects['id']

        return self.projects

    def get_sequences(self, proj_id=''):
        """
        Gets the sequences list when project is selected
        :param proj_id: ftrack Project id of the selected project
        :return:
        """
        if not proj_id:
            return False

        seq_list = []
        obj_seqs = self.session.query('Sequence where project.id is "%s"' % proj_id)
        for seqs in obj_seqs:
            sequences = {}
            if seqs['name']:
                sequences['name'] = seqs['name']
                sequences['id'] = seqs['id']
                seq_list.append(sequences)

        s_list = sorted(seq_list, key=lambda x: x['name'])
        return s_list

    def get_shots(self, proj_id='', parent_id=''):
        """
        Gets the list of shots for selected sequences and project
        :param proj_id: ftrack Project id of the selected project
        :param parent_id: ftrack sequence id of the selected sequence
        :return:
        """
        if not (proj_id and parent_id):
            return False

        obj_shots = self.session.query('Shot where project.id is "%s" and parent.id is "%s"' % (proj_id, parent_id))
        shot_list = []
        for shot in obj_shots:
            shots = {}
            if shot['name']:
                shots['name'] = shot['name']
                shots['id'] = shot['id']
                shots['parent_name'] = shot['parent']['name']
                if hasattr(shot['parent'], 'keys'):
                    shots['parent_name'] = shot['parent']['name']
                shot_list.append(shots)

                #                objTask = self.task_details(shot['id'])
                #                self.objTask.append(objTask)

        sh_list = sorted(shot_list, key=lambda x: x['name'])
        return sh_list

    def get_ftp_shots(self, sequence_id, task_name, status_name, upload_for):
        """
        Gets list of shots for compout upload page
        :param sequence_id: ftrack sequence id of the selected sequence
        :param task_name: ftrack task name of the selected sequence
        :param status_name: UI selection for compout upload in 'Upload For' combo box
        :param upload_for: UI selection for compout upload in 'Asset Name' combo box
        :return:
        """
        self.reload_session()
        #        print sequence_id, task_name, status_name, upload_for, '--'
        check_status = ''
        if upload_for == 'final' and status_name == 'Client':
            check_status = 'Client approved'
        elif status_name == 'Internal':
            check_status = 'Pending Internal Review'
        elif status_name == 'Client':
            check_status = 'Internal Approved'
        elif status_name == 'Review':
            check_status = 'Client Approved'
        elif status_name == 'DI':
            check_status = 'Review Approved'

        # print 'SHOT:','Task where name is "%s" and parent.parent.id is "%s" and status.name is "%s"'
        # % (task_name, sequence_id, check_status)

        task = self.session.query('Task where name is "%s" and parent.parent.id is "%s" and status.name is "%s"' % (
            task_name, sequence_id, check_status)).all()

        shots_list = []
        for shot in task:
            details = dict()
            details['name'] = shot['parent']['name']
            details['parent_name'] = shot['parent']['parent']['name']
            details['id'] = shot['parent_id']
            shots_list.append(details)

        sh_list = sorted(shots_list, key=lambda x: x['name'])
        return sh_list

    def get_ftp_asset_builds(self, parent_id, task_name, status_name, upload_for, asset_type):
        """
        Gets list of shots for compout upload page
        :param parent_id: ftrack project id 
        :param task_name: ftrack task name of the selected sequence
        :param status_name: UI selection for compout upload in 'Upload For' combo box
        :param upload_for: UI selection for compout upload in 'Asset Name' combo box
        :return:
        """
        self.reload_session()
        #        print parent_id, task_name, status_name, upload_for, asset_type, '--'
        check_status = ''
        if upload_for == 'final' and status_name == 'Client':
            check_status = 'Client approved'
        elif status_name == 'Internal':
            check_status = 'Pending Internal Review'
        elif status_name == 'Client':
            check_status = 'Internal Approved'

        # print 'ASSET BUILD:','Task where name is "%s" and project.id is "%s" and status.name is "%s" and parent.type.name is "%s"' % (task_name, parent_id, check_status, asset_type)

        task = self.session.query(
            'Task where name is "%s" and project.id is "%s" and status.name is "%s" and parent.type.name is "%s" ' % (
                task_name, parent_id, check_status, asset_type)).all()

        asset_list = []
        for asset in task:
            details = {}
            details['name'] = asset['parent']['name']
            details['id'] = asset['parent_id']
            asset_list.append(details)

        asset_list = sorted(asset_list, key=lambda x: x['name'])

        return asset_list

    def get_ftp_asset_types(self, parent_id):
        """
        Gets list of asset type 
        :param parent_id: parent id of task shot or asset build
        :return:
        """

        query = 'Asset where parent.id is "%s"' % (parent_id)

        #	print query
        asset = self.session.query(query).all()

        type_list = []
        flag = dict()
        for data in asset:
            name = data['type']['name']
            if name in flag:
                continue
            flag[name] = 1

            details = dict()
            details['name'] = name

            type_list.append(details)

        type_list = sorted(type_list, key=lambda x: x['name'])

        return type_list

    def get_ftp_asset_name(self, parent_id, asset_type):
        """
        Gets list of asset name
        :param parent_id: parent id of task shot or asset build
        :param asset_type: selected asset type
        :return:
        """

        query = 'Asset where parent.id is "%s" and type.name is "%s"' % (parent_id, asset_type)

        #	print query
        asset = self.session.query(query).all()

        type_list = []
        flag = dict()
        for data in asset:
            name = data['name']
            if name in flag:
                continue
            flag[name] = 1

            details = dict()
            details['name'] = name

            type_list.append(details)

        type_list = sorted(type_list, key=lambda x: x['name'])

        return type_list

    def get_ftp_components(self, parent_id, asset_name, dept, upload_for):
        """
        Gets list of componets of selected asset name
        :param parent_id: parent id of task shot or asset build
        :param asset_name: selected asset name
        :param dept: selected depatment
        :return:
        """

        status = ''
        if upload_for == 'Review':
            status = 'and status.name is "Client approved"'
        elif upload_for == 'DI':
            status = 'and status.name is "Review Approved"'
        elif asset_name == 'final' and dept == 'Lighting':
            status = 'and status.name is "Internal approved"'
        query = 'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" %s' % (
            asset_name, parent_id, dept, status)

        #	query = 'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s"' %(asset_name,parent_id,dept)

        print query
        asset = self.session.query(query).first()

        if not asset:
            return False

        comp_list = []
        flag = dict()
        for data in asset['components']:
            name = data['name']
            if name in flag:
                continue
            flag[name] = 1

            details = dict()
            details['name'] = name

            comp_list.append(details)

        comp_list = sorted(comp_list, key=lambda x: x['name'])

        return comp_list

    def get_asset_builds(self, proj_id='', obj_type=''):
        """
        Gets the list of Asset Builds from ftrack for selected project
        :param proj_id: ftrack project id of the selected project
        :param obj_type: ftrack Asset Build type (prop, chars,set,vehicles)
        :return:
        """
        if not proj_id:
            return False
        if (obj_type and obj_type != 'All'):
            obj_assets = self.session.query(
                'AssetBuild where project.id is "%s" and type.name is "%s"' % (proj_id, obj_type))
        else:
            obj_assets = self.session.query('AssetBuild where project.id is "%s"' % proj_id)

        asset_list = []
        self.objTask = []
        for assets in obj_assets:
            asset_builds = {}
            if assets['name']:
                asset_builds['name'] = assets['name']
                asset_builds['id'] = assets['id']
                asset_list.append(asset_builds)

                #                objTask = self.task_details(assets['id'])
                #                self.objTask.append(objTask)

        a_list = sorted(asset_list, key=lambda x: x['name'])
        return a_list

    def get_task_details(self, pparent_ids=''):

        if not (pparent_ids):
            return False

        parent_dict = {}
        self.__result = []
        self.pparent_ids = json.loads(pparent_ids)

        # Add all the process in list
        for p_id in self.pparent_ids:
            self.stereo_object = 0
            self.fork_tasks(p_id)

            self.stereo_object = 1
            self.fork_tasks(p_id)
            self.stereo_object = 0

        # pprint(self.__result)
        for result in self.__result:
            for value in result:
                if value['parent_id'] in parent_dict:
                    parent_dict[value['parent_id']].append(value)
                else:
                    parent_dict[value['parent_id']] = [value]

        return parent_dict

    def fork_tasks(self, pparent_id=''):

        task = self.task_query(pparent_id)

        total_task = len(task)
        if total_task < 1:
            return False

        number_of_cpu = 4
        results = []
        start = 0
        end = total_task / number_of_cpu
        queue = Queue()

        for cpu in range(1, number_of_cpu + 1):
            if cpu == number_of_cpu:
                #                print 'Total Tasks :', total_task
                worker = Thread(target=self.table_row_data, args=(pparent_id, start, total_task, queue,))
            else:
                worker = Thread(target=self.table_row_data, args=(pparent_id, start, end * cpu, queue,))

            worker.setDaemon(True)
            worker.start()

            start = end * cpu
        queue.join()

        for cpu in range(1, number_of_cpu + 1):
            self.__result.append(queue.get())

    def table_row_data(self, pparent_id, start, end, queue):
        parent_dict = {}
        task_list = []
        objTask = self.task_query(pparent_id)
        for task in objTask[start:end]:
            parent_id = task['parent_id']
            try:
                link = task['link']
                parent_name = ('_'.join([each_link['name'] for each_link in link[1:-1]]))
            except:
                parent_name = parent_id

            tasks = {}
            try:
                tasks['status'] = task['status']['name']
            except:
                tasks['status'] = '---'
            tasks['id'] = task['id']
            tasks['name'] = task['name']
            tasks['parent_name'] = parent_name
            tasks['parent_id'] = parent_id
            if self.stereo_object:
                #                tasks['parent_id'] = task['parent']['id']
                tasks['parent_id'] = task['link'][-3]['id']
            users = []
            for resource in task['assignments']:
                users.append(resource['resource']['username'])
            if not (users):
                users = ['---']
            tasks['users'] = sorted(users)
            task_list.append(tasks)

            parent_dict[parent_id] = task_list

        queue.put(task_list)

        return parent_dict

    # Load single seq or asset build
    def get_task_detail(self, parent_ids=''):
        if not (parent_ids):
            return False

        self.reload_session()
        parent_ids = json.loads(parent_ids)
        parent_dict = {}
        for parent_id in parent_ids:

            if self.object_name == 'Shot Asset Build':
                parent_dict = self.task_for_shot_asset_build(parent_id, parent_dict)
            else:
                task_list = []
                obj_tasks = self.session.query('Task where parent.id is "%s"' % (parent_id))
                task_list = self.create_task_list(obj_tasks)

                if not task_list:
                    obj_name = self.object_name.replace(' ', '')
                    print "No Task :", '%s where id is "%s"' % (obj_name, parent_id)
                    parent_obj = self.session.query('%s where id is "%s"' % (obj_name, parent_id)).first()

                    if parent_obj:
                        tasks = dict()
                        tasks['status'] = '---'
                        tasks['users'] = ['---']
                        link = self.defaultCheck(parent_obj['link'])
                        parent_name = ('_'.join([each_link['name'] for each_link in link[1:]]))
                        tasks['parent_name'] = parent_name
                        tasks['parent_id'] = parent_id

                        task_list = [tasks]

                if self.object_name == 'Shot':
                    p_obj_tasks = self.session.query('Task where parent.parent.id is "%s"' % (parent_id))
                    p_task_list = self.create_task_list(p_obj_tasks)
                    if len(p_task_list) > 0:
                        task_list = task_list + p_task_list

                parent_dict[parent_id] = task_list

        return parent_dict

    def task_for_shot_asset_build(self, parent_id, parent_dict):
        obj_shot = self.session.query('Shot where id is "%s"' % (parent_id)).first()
        if obj_shot:
            for asset in obj_shot['incoming_links']:
                task_list = []
                obj_tasks = self.session.query('Task where parent.id is "%s"' % (asset['from']['id']))
                task_list = self.create_task_list(obj_tasks)
                parent_dict[asset['from']['id']] = task_list

            return parent_dict

    def reload_session(self):
        if self.session:
            self.session.reset()
        self.session = ase_session.Session()

    def create_task_list(self, obj_tasks):
        task_list = []
        for task in obj_tasks:
            tasks = {}
            try:
                tasks['status'] = task['status']['name']
                tasks['parent_type'] = task['parent']['type']['name']
            except:
                tasks['status'] = '---'
                tasks['parent_type'] = ''

            tasks['id'] = task['id']
            tasks['name'] = task['name']
            link = self.defaultCheck(task['link'])
            parent_name = ('_'.join([each_link['name'] for each_link in link[1:-1]]))
            tasks['parent_name'] = parent_name
            tasks['parent_id'] = task['parent']['id']

            users = []
            for resource in task['assignments']:
                users.append(resource['resource']['username'])

            if not (users):
                users = ['---']
            tasks['users'] = sorted(users)
            task_list.append(tasks)

        return task_list

    def task_query(self, parent_id=''):

        session = ase_session.Session()
        query = ''
        if (self.stereo_object == 1) and (self.object_name == 'Shot'):
            query = 'Task where parent.parent.parent.id is "%s"' % (parent_id)
        elif self.object_name == 'Shot':
            query = 'Task where parent.parent.id is "%s"' % (parent_id)
        elif self.object_name == 'Sequence':
            query = 'Task where project.id is "%s" and parent.type.name is "Sequence"' % (parent_id)
        elif self.object_name == 'Asset Build':
            query = 'Task where project.id is "%s" and parent.type.name is "%s"' % (parent_id, self.object_type)

        obj_task = session.query(query)
        return obj_task

    def task_status(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

        self.get_user_columns(username)
        # if not self.master_login:
        #            return HttpResponseRedirect('/tasks/')

        task_hash = {}
        projects = {}
        self.projects = self.get_projects()

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_temp_data = self.getTasksTemplate()

        asset_types = self.get_asset_types()

        task_hash['task_temp_data'] = task_temp_data
        task_hash['asset_types'] = asset_types

        task_hash['data'] = {'projects': self.projects, 'columns': self.users_columns, 'user_role': self.user_role,
                             'all_tasks': self.all_tasks}

        statuses = self.allStatus()
        ldap_users = self.ldapUsers()

        task_hash['statuses'] = statuses
        task_hash['users'] = ldap_users

        task_hash['statement'] = 'Yahoooooooooooooooo'
        return render(request, 'task_status.html', task_hash)

    def get_project_path_versions(self, proj_name, shot_name, task_prefer, build_type):
        asset_type_var = ''
        shot = ''
        if task_prefer == 'Sequence':
            asset_type_var = 'shotpub'
            shot = shot_name.replace('_', '/')
        elif task_prefer == 'Asset Build':
            asset_type_var = 'assetbuildpub' + '/' + build_type
            shot = shot_name
        build_path = os.path.join('/opt/djangoenv/projftrack/media/ASE/01prj', proj_name.upper(),
                                  'prod', asset_type_var, shot, 'upload/client')
        print build_path
        version_list = []
        if os.path.exists(build_path):
            for version in os.listdir(build_path):
                version_dict = dict()
                version_dict['version_name'] = version
                version_dict['version_path'] = os.path.join(build_path, version)
                version_list.append(version_dict)
        return version_list

    def get_client_side_versions(self, proj_name, shot_name, task_prefer, build_type):
        asset_type_var = ''
        shot = ''
        if task_prefer == 'Sequence':
            asset_type_var = 'shotpub'
            shot = shot_name.replace('_', '/')
        elif task_prefer == 'Asset Build':
            asset_type_var = 'assetbuildpub' + '/' + build_type
            shot = shot_name
        build_path = os.path.join('/opt/djangoenv/projftrack/media/ASE/01prj', proj_name.upper(),
                                  'prod', asset_type_var, shot, 'upload/client')
        if not os.path.exists(build_path):
            os.makedirs(build_path)

        new_version_name = 'v' + str(len(os.listdir(build_path)) + 1).zfill(3)

        version_list = []
        version_dict = dict()
        version_dict['version_name'] = new_version_name
        version_dict['version_path'] = os.path.join(build_path, new_version_name)
        version_list.append(version_dict)

        print version_list
        return version_list

    def show_task_details(self, type_name, task_id):

        type_name = type_name.replace(' ', '')
        task_obj = self.session.query('%s where id is "%s"' % (type_name, task_id)).first()

        details = dict()
        details_list = list()
        if task_obj:
            link = task_obj['link']
            link_path = (' / '.join([each_link['name'] for each_link in link]))

            details['name'] = task_obj['name']
            details['type_name'] = task_obj['type']['name']
            details['object_type'] = task_obj['object_type']['name']
            details['link_path'] = link_path
            details['priority'] = task_obj['priority']['name']
            details['status'] = task_obj['status']['name']
            details['object_id'] = task_id

        details_list.append(details)

        return details_list

    def get_note_details(self, task_id, type_name, last_row, note_task):

        self.reload_session()

        type_name = type_name.replace(' ', '')
        query = ''
        if note_task:
            query = 'Task where parent_id is "%s" and name is "%s"' % (task_id, note_task)
        else:
            query = '%s where id is "%s"' % (type_name, task_id)

        #        print query
        task_obj = self.session.query(query).first()

        start_row = int(last_row) - 15
        last_row = int(last_row) - 1

        obj_notes = task_obj['notes'][start_row:last_row]

        note_list = self.get_note_data(obj_notes)

        return note_list

    def get_link_details(self, task_id, type_name, last_row):

        type_name = type_name.replace(' ', '')
        task_obj = self.session.query('%s where id is "%s"' % (type_name, task_id)).first()

        start_row = int(last_row) - 15
        last_row = int(last_row) - 1

        if type_name == 'Task':
            obj_links = task_obj['parent']['incoming_links']
        else:
            obj_links = task_obj['incoming_links']

        links = list()
        for link in obj_links:
            link_dict = dict()
            link_dict['name'] = link['from']['name']
            links.append(link_dict)

        return links

    def get_my_details(self, my_id, my_type):

        my_type = my_type.replace(' ', '')
        my_obj = self.session.query('%s where id is "%s"' % (my_type, my_id)).first()
        details = dict()
        details_list = list()
        if my_obj:
            link = my_obj['link']
            link_path = (' / '.join([each_link['name'] for each_link in link]))

            details['name'] = my_obj['name']
            details['type_name'] = my_obj['type']['name']
            details['object_type'] = my_obj['object_type']['name']
            details['link_path'] = link_path

            details['notes_list'] = self.get_note_data(my_obj['notes'])

        details_list.append(details)

        return details_list

    def get_asset_types(self):
        query = self.session.query("AssetType")
        asset_types = list()
        for i in query:
            asset_types.append(i['name'])

        return sorted(asset_types)

    def get_version_object(self, my_id, my_type, task):

        parent_id = ''
        if my_type == 'Sequence':
            parent_id = 'asset.parent.parent.id'
        elif my_type == 'Task':
            parent_id = 'task.id'
        else:
            parent_id = 'asset.parent.id'

        task_key = ''
        if task:
            task_key = "and task.name is '%s'" % task

        my_query = "AssetVersion where %s is '%s' %s order by date desc" % (parent_id, my_id, task_key)

        #	print my_query

        query = self.session.query(my_query)

        return query

    def show_asset_versions(self, my_id, my_type, last_row, task):

        self.reload_session()

        self.get_user_columns(self.username)

        query = self.get_version_object(my_id, my_type, task)

        len_query = len(query)

        last_row = int(last_row)
        first_row = last_row - 15
        last_row = last_row - 1

        list_versions = list()
        if query:
            for j in xrange(first_row, last_row):
                if j >= len_query:
                    break

                i = query[j]
                version_hash = dict()
                try:
                    version_hash['version_id'] = i['id']
                    version_hash['version_name'] = i['link'][-1]['name']
                    version_hash['asset_type'] = i['asset']['type']['name']
                    version_hash['status_name'] = i['status']['name']
                    version_hash['published_on'] = i['date'].format('DD-MM-YYYY HH:mm:ss')
                    version_hash['published_by'] = i['user']['username']
                    version_hash['user_role'] = self.user_role
                except:
                    print "Some version details missing .."

                list_versions.append(version_hash)

                #	if list_versions:
                #	    list_versions = sorted(list_versions, key=lambda x: datetime.datetime.strptime(x['published_on'], '%d-%m-%Y %H:%M'), reverse=True)

        return list_versions

    def save_changes(self, data_list='', proj_id=''):

        if not data_list:
            return False

        data_list = json.loads(data_list)
        print '+++++++++++++++++++++++++++++++'
        print '%s : Change Data %s' % (self.username, data_list)

        obj_proj = self.session.query("Project where id is '%s'" % proj_id).first()
        project = obj_proj['name'].lower()

        collection = self.mongo_database['%s_tasks' % project]
        bulk = collection.initialize_ordered_bulk_op()

        for data in data_list:
            change_value = str(data[0])
            task_id = str(data[1])  # task parent id
            task_name = str(data[2])
            element_name = str(data[3])
            task_note = str(data[4])
            parent_id = str(data[5])
            proj_id = str(data[6])
            object_type = str(data[7])
            row_org_val = str(data[8])

            if object_type:
                if object_type == 'Shot Asset Build':
                    object_type = 'Asset Build'
            object_type = object_type.replace(' ', '')

            obj_tasks = self.session.query('Task where id is "%s"' % (task_id)).first()
            if not obj_tasks:
                obj_tasks = self.create_new_task(element_name, change_value, parent_id, task_name, object_type)

            if obj_tasks:
                obj_tasks = obj_tasks

            if obj_tasks['name'] != task_name:  # sanity check
                continue

            # For changing status
            if element_name == 'Status':
                print "Old Status:", row_org_val, '+++++', "New Status:", change_value
                #                oldstatus = obj_tasks['status']['name']
                status = change_value

                if row_org_val == status:
                    continue

                obj_status = self.session.query('Status where name is "%s"' % (status)).one()
                obj_tasks['status'] = obj_status

            if element_name == 'Users':
                print "Old Users:", row_org_val, '+++++', "New Users:", change_value

                org_users_list = row_org_val.split(',')
                changed_users_list = change_value.split(',')

                added_users = list()
                for a_user in changed_users_list:
                    if a_user != '---' and a_user not in org_users_list:
                        added_users.append(a_user)

                for user in added_users:
                    obj_user = ase_ftrack.add_user_in_project(self.session, user, proj_id, True)

                    #                obj_user = self.session.query('User where username is "%s"' % (user)).one()
                    self.session.create('Appointment', {
                        'context': obj_tasks,
                        'resource': obj_user,
                        'type': 'assignment'
                    })

                deleted_users = list()
                for d_user in org_users_list:
                    if d_user != '---' and d_user not in changed_users_list:
                        deleted_users.append(d_user)

                for del_user in deleted_users:
                    if del_user != '---':
                        obj_app = self.session.query(
                            'Appointment where context_id is "%s" and resource.username is "%s"' % (
                                task_id, del_user)).first()
                        self.session.delete(obj_app)

            task_data = dict()
            search_key = dict()

            search_key['ftrack_id'] = obj_tasks['id']

            task_data['ftrack_id'] = obj_tasks['id']
            task_path = (':'.join([each_link['name'] for each_link in obj_tasks['link']]))
            task_path = task_path.replace(task_path.split(':')[0], task_path.split(':')[0].lower())
            task_name = task_path.split(':')[-1]
            task_data['path'] = task_path
            task_data['name'] = task_name
            task_data['updated_by'] = self.username
            task_data['updated_on'] = datetime.datetime.now()

            bulk.find(search_key).upsert().update_one({'$set': task_data})

        bulk.execute()
        self.session.commit()

    def create_new_task(self, element_name, change_value, parent_id, task_name, object_type):

        obj_tasks = self.session.query('Task where parent_id is "%s" and name is "%s"' % (parent_id, task_name)).first()
        if obj_tasks:
            return obj_tasks
        else:
            obj_tasks = self.session.query(
                'Task where parent.parent.id is "%s" and name is "%s"' % (parent_id, task_name)).first()
            if obj_tasks:
                return obj_tasks

        if element_name == 'Users':
            status = 'Not started'
        else:
            status = change_value

        obj_status = self.session.query('Status where name is "%s"' % status).one()

        obj_parent = self.session.query('%s where id is "%s"' % (object_type, parent_id)).first()

        if task_name in self.stereo_tasks:
            obj_shot_asset = self.session.query(
                'ShotAssetBuild where id is "%s" and name is "Stereo"' % (parent_id)).first()
            if obj_shot_asset:
                obj_parent = obj_shot_asset
            else:
                obj_shot_asset = self.session.query(
                    'ShotAssetBuild where parent.id is "%s" and name is "Stereo"' % (parent_id)).first()
                if obj_shot_asset:
                    obj_parent = obj_shot_asset
                else:
                    obj_shot_type = self.session.query('Type where name is "Generic"').first()
                    obj_parent = self.session.create('ShotAssetBuild', {
                        'name': 'Stereo',
                        'parent': obj_parent,
                        'status': obj_status,
                        'type': obj_shot_type
                    })
                    #        print '|==================== Debug ================|'
                    #        print element_name, change_value, parent_id, task_name, object_type

        if task_name in self.type_name:
            task_type = self.type_name[task_name]
        else:
            task_type = task_name

        obj_type = self.session.query('Type where name is "%s"' % task_type).first()

        obj_tasks = self.session.create('Task', {
            'name': task_name,
            'parent': obj_parent,
            'status': obj_status,
            'type': obj_type
        })
        # obj_tasks = self.session.query('Task where parent_id is "%s" and name is "%s"' % (parent_id, task_name))

        self.session.commit()
        # self.session.reset()
        # self.reload_session()
        return obj_tasks

    def save_version_changes(self, data_list=''):

        if not data_list:
            return False

        data_list = json.loads(data_list)
        print '+++++++++++++++++++++++++++++++'
        print '%s : Change Data %s' % (self.username, data_list)
        for data in data_list:
            change_value = str(data[0])
            version_id = str(data[1])  # version id
            row_org_val = str(data[2])

            if (row_org_val == change_value) or not version_id:  # sanity check
                continue

            obj_status = self.session.query('Status where name is "%s"' % (change_value)).first()

            if obj_status:
                obj_version = self.session.query("AssetVersion where id is '%s'" % version_id).first()
                obj_version['status'] = obj_status

        self.session.commit()

    def object_change_status(self, new_status, old_status, object_id, status_for):

        if (new_status == old_status) or not object_id:
            return False

        print '+++++++++++++++++++++++++++++++'
        print '%s : Change Object Status :- %s : %s : %s ' % (self.username, new_status, object_id, status_for)

        obj_status = self.session.query('Status where name is "%s"' % (new_status)).first()

        project = 'ice'
        if obj_status:
            status_for = status_for.replace(' ', '')
            query = "%s where id is '%s'" % (status_for, object_id)
            print query
            my_object = self.session.query(query).first()
            my_object['status'] = obj_status

            if status_for == 'AssetVersion':
                project = my_object['task']['project']['name']
            else:
                project = my_object['project']['name']

        self.session.commit()

        search_key = dict()
        search_key['ftrack_id'] = object_id

        task_data = dict()
        task_data['updated_by'] = self.username
        task_data['updated_on'] = datetime.datetime.now()

        if status_for == 'Task':
            collection = self.mongo_database['%s_tasks' % project]
            collection.update_one(search_key, {'$set': task_data}, upsert=True)

        elif status_for == 'AssetVersion':
            collection = self.mongo_database['%s_versions' % project]
            collection.update_one(search_key, {'$set': task_data}, upsert=True)

    def insert_db_note(self, note_text, note_category, object_id, change_status, users, task_path, pub_version):

        if not task_path:
            return False

        proj = task_path.split(':')[0].lower()
        collection = self.mongo_database['%s_notes' % (proj)]

        search_key = dict()
        search_key['ftrack_id'] = object_id
        search_key['status'] = change_status

        version = 1

        cur_count = collection.find(search_key).count()
        if cur_count:
            latest_version = collection.find(search_key).sort('added_on', -1).limit(1)
            version = int(latest_version[0]['version']) + 1

        task_data = dict()

        task = task_path.split(':')[-1]

        task_data['added_by'] = self.username
        task_data['added_on'] = datetime.datetime.now()
        task_data['task_path'] = task_path
        task_data['version'] = version
        task_data['task'] = task
        task_data['ftrack_id'] = object_id
        task_data['note_category'] = note_category
        task_data['note_text'] = note_text
        task_data['status'] = change_status
        task_data['users'] = users
        task_data['pub_version'] = pub_version

        collection.insert_one(task_data)

        # Send reject email
        self.reject_mail(task_data)

    def create_entity_note(self, note, object_id, note_category, note_for, note_task, attach_files):
        if note != 'None':
            obj_cat = self.session.query('NoteCategory where name is "%s"' % (note_category)).first()
            if object_id:
                user = self.session.query('User where username is "%s"' % self.username).first()

                note_for = note_for.replace(' ', '')
                query = ''
                if note_task:
                    query = 'Task where parent_id is "%s" and name is "%s"' % (object_id, note_task)
                else:
                    query = '%s where id is "%s"' % (note_for, object_id)

                print "Note :- %s : %s" % (note_for, object_id)

                my_obj = self.session.query(query).first()
                obj_note = my_obj.create_note(note, user, category=obj_cat)

                if attach_files:
                    attach_files = json.loads(attach_files)
                    server_location = self.session.query(
                        'Location where name is "ftrack.server"'
                    ).one()
                    for each_file in attach_files:
                        file_name = os.path.basename(each_file)
                        file_path = PROJ_BASE_DIR + '/' + each_file
                        # Create component and name it "My file".
                        component = self.session.create_component(
                            file_path,
                            data={'name': file_name},
                            location=server_location
                        )

                        # Attach the component to the note.
                        self.session.create(
                            'NoteComponent',
                            {'component_id': component['id'], 'note_id': obj_note['id']}
                        )

                        # Delete uploaded files after adding
                        for attach in Attachment.objects.all():
                            if attach.file.name == each_file:
                                attach.file.delete()
                                attach.delete()

                self.session.commit()

    def addNote(self, note_for, object_id, note, note_category):
        if note != 'None':
            obj_cat = self.session.query('NoteCategory where name is "%s"' % (note_category)).first()
            if object_id:
                user = self.session.query('User where username is "%s"' % self.username).first()

                note_for = note_for.replace(' ', '')
                query = '%s where id is "%s"' % (note_for, object_id)
                print query

                my_obj = self.session.query(query).first()
                my_obj.create_note(note, user, category=obj_cat)

                self.session.commit()

    def reply_note(self, reply_text, note_id):
        if reply_text != 'None':
            if note_id:
                user = self.session.query('User where username is "%s"' % self.username).one()
                note_object = self.session.query('Note where id is "%s"' % note_id).one()
                note_object.create_reply(reply_text, user)

                self.session.commit()

    def get_version_notes(self, my_id, my_type, last_row, task):

        query = self.get_version_object(my_id, my_type, task)

        last_row = int(last_row)
        first_row = last_row - 15
        last_row = last_row - 1

        #        print first_row,':',last_row,':',len_query

        note_list = list()
        if query:
            #	    for j in xrange(first_row, last_row):
            for i in query:
                if i['notes']:
                    note_list = note_list + self.get_note_data(i['notes'])

        len_notes = len(note_list)

        note_list = sorted(note_list, key=lambda x: datetime.datetime.strptime(x['note_date'], '%d-%m-%Y %H:%M'),
                           reverse=True)

        note_data = list()
        if len_notes:
            note_data = note_list[first_row:last_row]

        #	pprint(note_list)
        return note_data

    # def getRejectVersionNotes(self, task_id):
    #     if task_id:
    #         note_data = {}
    #         obj_ass_ver = self.session.query(
    #             'AssetVersion where task_id is "%s" and status.name is "Internal Reject"' % (task_id))
    #         for ass_ver in obj_ass_ver:
    #             note_list = []
    #             version = ass_ver['link'][-1]['name']
    #             asset_type_name = ass_ver['asset']['type']['name'].replace(' ', '_')
    #             key = asset_type_name + '__' + version
    #             note_list = self.get_note_data(ass_ver['notes'])
    #             note_data[key] = note_list
    #
    #         return note_data

    def allStatus(self):

        statuses = self.session.query('Status')
        status_list = []
        for status in statuses:
            if status['name']:
                status_list.append({'name': status['name'], 'id': status['id']})

        status_list = sorted(status_list, key=lambda x: x['name'])
        return status_list

    def get_asset_versions(self, object_id, task_name, asset_type, object_type):

        parent = 'asset.parent.id'

        if object_type == 'Sequence':
            parent = 'asset.parent.parent.id'
        elif object_type == 'Task':
            parent = 'task_id'

        my_query = "AssetVersion where %s is '%s' and task.name is '%s' and asset.type.name is '%s'" % (
            parent, object_id, task_name, asset_type)
        versions = self.session.query(my_query)

        ver_list = []
        for ver in versions:
            if len(ver['link']) > 2:
                ver_list.append({'name': ver['link'][-1]['name'], 'id': ver['link'][-1]['id']})

        ver_list = sorted(ver_list, key=lambda x: x['name'], reverse=True)
        return ver_list

    def getTasksTemplate(self):

        json_data = {}
        if os.path.isfile(self.task_template_jfile):
            data_file = open(self.task_template_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        return json_data

    def getEmailAddress(self):

        json_data = {}
        if os.path.isfile(self.email_jfile):
            data_file = open(self.email_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        return json_data

    def artist_tasks(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

        self.get_user_columns(username)

        # Current Project
        project = 'ice'
        status = ''

        # Get task details
        task_hash = {}
        task_list = self.get_artist_tasks(username, project, status)

        task_hash['tasks'] = task_list
        asset_types = self.get_asset_types()
        task_hash['asset_types'] = asset_types

        statuses = self.allStatus()

        task_hash['statuses'] = statuses

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'all_tasks': self.all_tasks,
                             'project': project}

        if task_hash and len(task_hash['tasks']) == 0:
            task_hash['statement'] = 'Hey %s, You have no assigned tasks' % task_hash['first_name']
            return render(request, 'no_tasks.html', task_hash)
        else:
            return render(request, 'artist_tasks.html', task_hash)

    def attach_files(self, request):
        username = request.user.username
        # time.sleep(1)
        data = dict()
        form = AttachmentForm(request.POST, request.FILES)
        if form.is_valid():
            photo = form.save()
            data = {'is_valid': True, 'name': photo.file.name, 'url': photo.file.url}
        else:
            data = {'is_valid': False}
        return data

    def review_tasks(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = {}

        project = 'ice'

        task_list = self.get_review_tasks(username, project)
        task_hash['tasks'] = task_list

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'project': project}

        if task_hash and len(task_hash['tasks']) == 0:
            task_hash['statement'] = 'Hey %s, You have no tasks for review' % task_hash['first_name']
            return render(request, 'no_tasks.html', task_hash)
        else:
            return render(request, 'review_tasks.html', task_hash)

    def create_entities(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

        self.user_role = ''
        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = {}

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']

        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role}

        return render(request, 'create_entities.html', task_hash)

    def sup_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

        self.get_user_columns(username)

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect('/login/')
        # Get task details
        task_hash = {}

        self.projects = self.get_projects()

        project = 'ice'
        duration = 'Monthly'
        task = 'all'

        reports = dict()
        reports['project'] = project
        reports['duration'] = duration

        today = datetime.date.today()
        this_month_first = today.replace(day=1)
        last = this_month_first - datetime.timedelta(days=1)
        first = last.replace(day=1)

        reports['from_date'] = str(first)
        reports['to_date'] = str(last)

        #        dashboard_data = self.get_user_task_reports(project, duration, first, last, task)
        #        if dashboard_data:
        #            task_hash['tasks'] = dashboard_data[0]['task_list']
        #            task_hash['top_users'] = dashboard_data[0]['top_task_users']
        #            task_hash['tash_graph_data'] = dashboard_data[0]['tash_graph_data']
        #            task_hash['status_graph_data'] = dashboard_data[0]['status_graph_data']

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'durations': self.durations,
                             'reports': reports, 'all_tasks': self.all_tasks}

        return render(request, 'dashboard.html', task_hash)

    def mgm_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = dict()

        project = 'ice'

        task_temp_data = self.getTasksTemplate()

        task_hash['task_temp_data'] = task_temp_data
        #        task_hash['sequence_data'] = self.get_sequence_data()

        self.projects = self.get_projects()

        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'current_project': project}

        return render(request, 'mgm_dashboard.html', task_hash)

    def get_project_details(self, project='ice'):

        data = self.getTasksTemplate()
        shot_task_list = data['Shot']['Static shot']
        asset_build_task_list = data['Shot']['All Asset Build']

        task_col = self.mongo_database[project + '_tasks']
        user_col = self.mongo_database[project + '_daily_task_details']

        find_cur = task_col.find({"object_type": "Task", "parent_object_type": {"$exists": "true"}})

        sequence_dict = dict()
        asset_dict = dict()
        user_dict = dict()
        user_dict['total_users'] = dict()

        shot_type = ['Shot', 'Shot Asset Build']
        asset_type = ['Asset Build']

        shot_flag = dict()
        asset_flag = dict()
        for each in find_cur:

            task = each['path']
            parent_type = each['parent_type']
            task_status = each['ftrack_status']

            if not (task_status or parent_type):
                continue

            split_task = task.split(':')
            task_name = split_task[-1]

            if task_name not in user_dict:
                user_dict[task_name] = dict()

            if 'current_assignees' in each:
                for each_user in each['current_assignees']:
                    user = each_user['user_name']
                    if user not in user_dict[task_name]:
                        user_dict[task_name][user] = 1
                    if user not in user_dict['total_users']:
                        user_dict['total_users'][user] = 1

            if each['parent_object_type'] in shot_type:
                seq = split_task[1]
                shot = split_task[2]

                # task name not in my task list NEXT ...
                if task_name not in shot_task_list:
                    continue

                if seq not in sequence_dict:
                    sequence_dict[seq] = dict()
                    sequence_dict[seq]['total_shots'] = 0

                    sequence_dict[seq]['WIP'] = dict()
                    sequence_dict[seq]['DONE'] = dict()
                    sequence_dict[seq]['APPROVED'] = dict()

                    for my_task in shot_task_list:
                        sequence_dict[seq]['WIP'][my_task] = 0
                        sequence_dict[seq]['DONE'][my_task] = 0
                        sequence_dict[seq]['APPROVED'][my_task] = 0

                if seq not in shot_flag:
                    shot_flag[seq] = dict()

                if shot not in shot_flag[seq]:
                    sequence_dict[seq]['total_shots'] = sequence_dict[seq]['total_shots'] + 1

                shot_flag[seq][shot] = 1

                if task_status == 'In progress':
                    sequence_dict[seq]['WIP'][task_name] = sequence_dict[seq]['WIP'][task_name] + 1
                elif task_status == 'Internal Approved':
                    sequence_dict[seq]['DONE'][task_name] = sequence_dict[seq]['DONE'][task_name] + 1
                elif task_status == 'Client approved':
                    sequence_dict[seq]['APPROVED'][task_name] = sequence_dict[seq]['APPROVED'][task_name] + 1

            elif each['parent_object_type'] in asset_type:
                asset_build = split_task[1]

                # task name not in my task list NEXT ...
                if task_name not in asset_build_task_list:
                    continue

                if parent_type not in asset_dict:
                    asset_dict[parent_type] = dict()
                    asset_dict[parent_type]['total_assets'] = 0

                    asset_dict[parent_type]['WIP'] = dict()
                    asset_dict[parent_type]['DONE'] = dict()
                    asset_dict[parent_type]['APPROVED'] = dict()

                    for my_task in asset_build_task_list:
                        asset_dict[parent_type]['WIP'][my_task] = 0
                        asset_dict[parent_type]['DONE'][my_task] = 0
                        asset_dict[parent_type]['APPROVED'][my_task] = 0

                if parent_type not in asset_flag:
                    asset_flag[parent_type] = dict()

                if asset_build not in asset_flag[parent_type]:
                    asset_dict[parent_type]['total_assets'] = asset_dict[parent_type]['total_assets'] + 1

                asset_flag[parent_type][asset_build] = 1

                if task_status == 'In progress':
                    asset_dict[parent_type]['WIP'][task_name] = asset_dict[parent_type]['WIP'][task_name] + 1
                elif task_status == 'Internal Approved':
                    asset_dict[parent_type]['DONE'][task_name] = asset_dict[parent_type]['DONE'][task_name] + 1
                elif task_status == 'Client approved':
                    asset_dict[parent_type]['APPROVED'][task_name] = asset_dict[parent_type]['APPROVED'][task_name] + 1
            else:
                continue

        data_list = list()
        data_list.append({'user_count': user_dict, 'sequence': sequence_dict, 'asset_build': asset_dict})

        return data_list

    def get_entity_data(self, entity_id, entity_type):
        pass

    def defaultCheck(self, element):
        try:
            assign = element
        except:
            assign = None

        return assign

    def convert_timedelta(self, duration):
        days, seconds = duration.days, duration.seconds
        hours = days * 24 + seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = (seconds % 60)
        return hours, minutes, seconds

    def get_review_tasks(self, user, project):

        task_list = list()
        user_columns = self.users_columns.split(',')

        check_status = ["Pending Client Review"]
        #        check_status = ["Pending Internal Review", "Pending Client Review"]
        if self.user_role == 'Supervisor':
            check_status = ["Pending Internal Review"]

        obj_col = self.mongo_database['%s_tasks' % (project)]

        data = obj_col.find({"name": {"$in": user_columns}, "ftrack_status": {"$in": check_status}}).sort(
            "updated_on", -1)

        for each in data:
            task_details = dict()
            task_details['project'] = 'None'
            task_details['task'] = 'None'
            task_details['path'] = 'None'
            task_details['ftrack_status'] = 'None'
            task_details['task_name'] = 'None'
            task_details['updated_on'] = '0000-00-00 00:00:00'
            task_details['version'] = 'None'
            task_details['object_type'] = 'Task'

            ftrack_id = each['ftrack_id']

            if 'path' in each:
                path = each['path']
                project = path.split(':')[0]
                task = path.split(':')[-1]
                task_details['project'] = project
                task_details['task'] = task
                task_details['path'] = path
                task_details['task_id'] = each['ftrack_id']

                query = 'AssetVersion where task_id is "%s" and task.name is "%s" and status.name is "Pending Client Review"' % (
                    ftrack_id, task)
                obj_versions = self.session.query(query).first()
                if obj_versions:
                    task_details['version'] = obj_versions['_link'][-1]['name']
                    task_details['object_type'] = 'AssetVersion'
                    task_details['version_id'] = obj_versions['id']

            if 'name' in each:
                task_details['task_name'] = each['name']
            if 'updated_on' in each:
                task_details['updated_on'] = str(each['updated_on']).split('.')[0]
            if 'ftrack_status' in each:
                task_details['ftrack_status'] = each['ftrack_status']
                task_status_label = each['ftrack_status'].replace(' ', '_')
                task_status_label = task_status_label.lower()
                task_details['status_label'] = task_status_label

            users = list()
            if 'current_assignees' in each:
                for each_user in each['current_assignees']:
                    users.append(each_user['user_name'])

            task_details['users'] = (' , ').join(users)
            task_list.append(task_details)

        # task_list = sorted(task_list,
        #                             key=lambda x: datetime.datetime.strptime(x['updated_on'], '%Y-%m-%d %H:%M:%S'),
        #                             reverse=True)

        return task_list

    def get_artist_tasks(self, user, project, status):

        task_list = list()
        task_user_details = self.getSpendTime(user)
        obj_col = self.mongo_database[project + '_tasks']
        search_key = {'current_assignees.user_name': user}
        if status:
            search_key['ftrack_status'] = status

        data = obj_col.find(search_key,
                            {'current_assignees.$': 1, 'ftrack_id': 1, 'path': 1, 'ftrack_status': 1,
                             'bid': 1}).sort(
            "updated_on", -1)

        for each in data:
            task_details = dict()
            if 'ftrack_id' in each:
                task_details['task_id'] = each['ftrack_id']
                task_details['user_name'] = each['current_assignees'][0]['user_name']
                task_details['project'] = 'None'
                task_details['task'] = 'None'
                task_details['path'] = 'None'
                task_details['ftrack_status'] = 'None'
                task_details['start_date'] = 'None'
                task_details['finish_date'] = 'None'
                task_details['upload_date'] = 'None'
                task_details['backup_status'] = 'None'
                task_details['bid_hours'] = "00:00:00"
                task_details['total_hours'] = "00:00:00"
                task_details['time_left'] = "00:00:00"
                task_details['project_id'] = 'None'
                task_details['total_secs'] = 0

                if 'path' in each:
                    task_details['task'] = each['path']
                    project = task_details['task'].split(':')[0]
                    task = task_details['task'].split(':')[-1]
                    path = task_details['task'].replace(':', ' / ')
                    task_details['project'] = project
                    task_details['task'] = task
                    task_details['path'] = path
                    if each['path'] in task_user_details:
                        task_details['total_hours'] = task_user_details[each['path']]['time_spend']
                        task_details['total_secs'] = task_user_details[each['path']]['time_spend_sec']

                    obj_task = self.session.query('Task where project.name is "%s"' % project).first()
                    if obj_task:
                        task_details['project_id'] = obj_task['project_id']

                if 'bid' in each:
                    bid = int(each['bid']) or 0
                    td = datetime.timedelta(seconds=bid)
                    hours, minutes, seconds = self.convert_timedelta(td)
                    bid_hours = '%02d:%02d:%02d' % (hours, minutes, seconds)
                    task_details['bid_hours'] = bid_hours

                    negsign = ''
                    left = int(bid - task_details['total_secs'])
                    if left < 0:
                        left = abs(left)
                        negsign = '-'
                    td_sec = datetime.timedelta(seconds=left)
                    hours_sec, minutes_sec, seconds_sec = self.convert_timedelta(td_sec)
                    time_left = '%s%02d:%02d:%02d' % (negsign, hours_sec, minutes_sec, seconds_sec)

                    task_details['time_left'] = time_left

                if 'ftrack_status' in each:
                    task_details['ftrack_status'] = each['ftrack_status']

                    task_status_label = each['ftrack_status'].replace(' ', '_')
                    task_status_label = task_status_label.lower()
                    task_details['status_label'] = task_status_label

                if 'backup_status' in each['current_assignees'][0]:
                    task_details['backup_status'] = each['current_assignees'][0]['backup_status']
                if 'start_date' in each['current_assignees'][0]:
                    start_date = str(each['current_assignees'][0]['start_date']).split('.')[0]
                    task_details['start_date'] = start_date
                if 'finish_date' in each['current_assignees'][0]:
                    finish_date = str(each['current_assignees'][0]['finish_date']).split('.')[0]
                    task_details['finish_date'] = finish_date
                if 'upload_date' in each['current_assignees'][0]:
                    upload_date = str(each['current_assignees'][0]['start_date']).split('.')[0]
                    task_details['upload_date'] = upload_date

            task_list.append(task_details)

        return task_list

    def get_user_task_reports(self, project, duration, first, last, task):

        dashboard_data = dict()
        task_user_reports = dict()
        daily_task_col = self.mongo_database[project + '_daily_task_details']

        if not (first and last and daily_task_col):
            return task_user_reports

        first = first + ' 00:00:00'
        last = last + ' 23:59:59'

        startdate = datetime.datetime.strptime(str(first), '%Y-%m-%d %H:%M:%S')
        enddate = datetime.datetime.strptime(str(last), '%Y-%m-%d %H:%M:%S')

        self.get_user_details()

        print startdate, enddate

        match_dict = {
            'start_date': {'$gte': startdate}, 'stop_date': {'$lte': enddate}
        }

        if task != 'all':
            match_dict['task_name'] = task

        aggregate = [{
            "$match": match_dict
        },
            {
                "$project": {
                    "task": 1,
                    "user": 1,
                    "task_name": 1,
                    "start_date": 1,
                    "stop_date": 1,
                    "dateDifference": {
                        "$subtract": ["$stop_date", "$start_date"]
                    }
                }
            },
            {
                "$group": {
                    "_id": {"task_name": "$task_name", "task": "$task", "user": "$user"},
                    "startMinDate": {"$min": "$start_date"},
                    "stopMaxDate": {"$max": "$stop_date"},
                    "total": {"$sum": "$dateDifference"}
                }
            }]

        data = daily_task_col.aggregate(aggregate)
        obj_col = self.mongo_database[project + '_tasks']

        top_users = dict()
        task_list = list()
        tash_graph = dict()
        status_graph = dict()
        user_all_task = dict()
        task_count = dict()

        for i in data:

            start_min_date = str(i['startMinDate']).split('.')[0]
            stop_max_date = str(i['stopMaxDate']).split('.')[0]
            task = i['_id']['task']
            user = i['_id']['user']
            task_name = i['_id']['task_name']
            key = task + ':' + user
            task_user_reports = dict()
            total = int(i['total']) / 1000
            if user in top_users:
                top_users[user] = top_users[user] + total
            else:
                top_users[user] = total
            td = datetime.timedelta(seconds=total)
            hours, minutes, seconds = self.convert_timedelta(td)
            time_spend = '%02d:%02d:%02d' % (hours, minutes, seconds)
            task_user_reports['total_hours'] = time_spend
            task_user_reports['total_seconds'] = total
            task_user_reports['project'] = project
            task_user_reports['task'] = task
            task_user_reports['user'] = user
            task_user_reports['task_name'] = task_name
            task_user_reports['start_min_date'] = start_min_date
            task_user_reports['stop_max_date'] = stop_max_date

            if task_name in tash_graph:
                tash_graph[task_name] = tash_graph[task_name] + total
            else:
                tash_graph[task_name] = total

            if user not in user_all_task:
                user_all_task[user] = [task_name]
            else:
                user_all_task[user].append(task_name)

            if task_name not in task_count:
                task_count[task_name] = 1
            else:
                task_count[task_name] = task_count[task_name] + 1

            data = obj_col.find({'current_assignees.user_name': user, 'path': task},
                                {'current_assignees.$': 1, 'ftrack_id': 1, 'path': 1, 'ftrack_status': 1}).sort(
                "current_assignees.$.start_date", -1)
            for each in data:
                ftrack_status = each['ftrack_status']
                task_user_reports['ftrack_status'] = ftrack_status

                if ftrack_status in status_graph:
                    status_graph[ftrack_status] = status_graph[ftrack_status] + 1
                else:
                    status_graph[ftrack_status] = 1

                if 'start_date' in each['current_assignees'][0]:
                    start_date = str(each['current_assignees'][0]['start_date']).split('.')[0]
                    task_user_reports['start_date'] = start_date
                if 'finish_date' in each['current_assignees'][0]:
                    finish_date = str(each['current_assignees'][0]['finish_date']).split('.')[0]
                    task_user_reports['finish_date'] = finish_date

            task_list.append(task_user_reports)

        #	pprint(task_list)
        task_list = sorted(task_list,
                           key=lambda x: datetime.datetime.strptime(x['start_min_date'], '%Y-%m-%d %H:%M:%S'),
                           reverse=True)
        top_task_users = list()
        for user, time in top_users.items():
            user_task = dict()
            td = datetime.timedelta(seconds=time)
            hours, minutes, seconds = self.convert_timedelta(td)
            time_spend = '%02d:%02d:%02d' % (hours, minutes, seconds)

            fuser = user.replace('.', ' ')
            fuser = fuser.title()
            user_task['user'] = fuser
            user_task['user_id'] = user
            user_task['time'] = time_spend
            user_task['time_sec'] = time

            departments = ''
            if user in user_all_task:
                dept_list = set(user_all_task[user])
                departments = ','.join(dept_list)

            user_task['tasks'] = departments

            if user in self.employee_details:
                user_task['empcode'] = self.employee_details[user]['emp_code']
                user_task['departments'] = self.employee_details[user]['department']
            else:
                user_task['empcode'] = 'blank'
            top_task_users.append(user_task)

        top_task_users = sorted(top_task_users, key=lambda x: x['time_sec'], reverse=True)

        tash_graph_data = list()
        for key, value in tash_graph.items():
            graph_data = dict()
            graph_data['y'] = value

            td = datetime.timedelta(seconds=value)
            hours, minutes, seconds = self.convert_timedelta(td)
            time_spend = '%02d:%02d:%02d' % (hours, minutes, seconds)

            graph_data['x'] = time_spend
            graph_data['name'] = key
            tash_graph_data.append(graph_data)

        status_graph_data = list()
        for key, value in status_graph.items():
            graph_data = dict()
            graph_data['y'] = value
            graph_data['x'] = value
            graph_data['name'] = key
            status_graph_data.append(graph_data)

        task_count_data = list()
        for key, value in task_count.items():
            count_data = dict()
            count_data['name'] = key
            count_data['count'] = value

            spend_sec = tash_graph[key]
            td = datetime.timedelta(seconds=spend_sec)
            hours, minutes, seconds = self.convert_timedelta(td)
            spend_hrs = '%02d:%02d:%02d' % (hours, minutes, seconds)

            count_data['hours'] = spend_hrs
            task_count_data.append(count_data)

        dashboard_data['task_list'] = task_list
        dashboard_data['top_task_users'] = top_task_users
        dashboard_data['tash_graph_data'] = tash_graph_data
        dashboard_data['status_graph_data'] = status_graph_data
        dashboard_data['task_count_data'] = task_count_data

        return [dashboard_data]

    def getSpendTime(self, user):

        task_user_details = dict()
        for col in self.mongo_database.collection_names():
            if not col.endswith('_daily_task_details'):
                continue

            daily_task_col = self.mongo_database[col]
            aggregate = [{
                "$match": {
                    "user": user
                }
            },
                {
                    "$project": {
                        "task": 1,
                        "user": 1,
                        "dateDifference": {
                            "$subtract": ["$stop_date", "$start_date"]
                        }
                    }
                },
                {
                    "$group": {
                        "_id": {"task": "$task", "user": "$user"},
                        "total": {"$sum": "$dateDifference"}
                    }
                }]

            data = daily_task_col.aggregate(aggregate)
            for i in data:
                task = i['_id']['task']
                task_user_details[task] = dict()
                total = int(i['total']) / 1000
                td = datetime.timedelta(seconds=total)
                hours, minutes, seconds = self.convert_timedelta(td)
                time_spend = '%02d:%02d:%02d' % (hours, minutes, seconds)
                task_user_details[task]['time_spend'] = time_spend
                task_user_details[task]['time_spend_sec'] = total

        return task_user_details

    def get_note_data(self, objNotes):
        note_list = []
        for note in objNotes:
            noteid = note['id']
            comments_hash = {}
            if note['in_reply_to'] == None and noteid:
                try:
                    category = note['category']['name'].replace(' ', '_')
                except:
                    category = None
                comments_hash['note_category'] = category
                comments_hash['note_author'] = note['author']['username']
                comments_hash['note_head'] = note['content'] or 'Null'
                comments_hash['note_id'] = noteid
                note_date = note['date'].format('DD-MM-YYYY HH:MM')
                comments_hash['note_date'] = note_date
                comments_hash['task_name'] = ''

                comments_hash['note_info'] = ''
                if note['parent_id'] and note['parent_type']:
                    parent = self.session.query(
                        "%s where id is '%s'" % (note['parent_type'], note['parent_id'])).first()
                    path_list = map(lambda x: x['name'], parent['_link'])
                    comments_hash['note_info'] = ' / '.join(path_list)
                    if note['parent_type'] == 'AssetVersion':
                        comments_hash['task_name'] = parent['task']['name']

                comments_list = []
                for reply in note['replies']:
                    comments_list.append(
                        reply['author']['username'] + ' :- ' + reply['content'] + '||' + reply['date'].format(
                            'DD-MM-YYYY HH:MM'))

                note_component = []
                server_location = self.session.query('Location where name is "ftrack.server"').one()
                for each in note['note_components']:
                    url = '{0}'.format(server_location.get_url(each['component']))
                    file_type = each['component']['file_type']
                    note_component.append({'url': url, 'file_type': file_type})

                comments_hash['replies'] = comments_list
                comments_hash['note_components'] = note_component

                note_list.append(comments_hash)

        note_list = sorted(note_list, key=lambda x: datetime.datetime.strptime(x['note_date'], '%d-%m-%Y %H:%M'),
                           reverse=True)

        return note_list

    def ldapUsers(self):

        ldap_server = "ldap://192.168.1.2"
        base_dn = "ou=People,dc=intra,dc=madassemblage,dc=com"

        ldap.set_option(ldap.OPT_REFERRALS, 0)
        Scope = ldap.SCOPE_SUBTREE
        Filter = "(uid=*)"
        Attrs = ["cn", "uid"]

        name = ''
        l = ldap.initialize(ldap_server)
        uid_list = list()
        try:
            r = l.search(base_dn, Scope, Filter, Attrs)
            Type, user = l.result(r, 60)

            for users in user:
                Name, Attrs = users
                if 'uid' in Attrs:
                    (name, uid) = (Attrs['cn'][0], Attrs['uid'][0])
                    uid_list.append(uid)
        except ldap.LDAPError, e:
            print e

        l.unbind_s()
        return sorted(uid_list)

    # FTP
    def ftp_serve(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        ftp_hash = {}
        self.projects = self.get_projects()
        self.get_user_columns(username)

        self.get_user_details()
        ftp_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            ftp_hash['emp_code'] = self.employee_details[username]['emp_code']
        ftp_hash['user_id'] = username.upper()
        task_temp_data = self.getTasksTemplate()

        ftp_hash['task_temp_data'] = task_temp_data

        ftp_hash['data'] = {'projects': self.projects, 'ftp_status': self.ftp_status, 'user_role': self.user_role,
                            'ftp_departments': self.ftp_departments, 'ftp_vesion_side': self.ftp_vesion_side,
                            'ftp_asset_name': self.ftp_asset_name}

        return render(request, 'upload_ftp.html', ftp_hash)

    def get_ftp_versions(self, data_array=''):
        """
        Gets the list of all the versions whose status are been set as per the requirement on Compout Upload tool
        :param data_array: List in which each item is a combined format of all the selections based on the Comp Upload
         For eg: ["aaj_080_0010:642629a4-91d3-11e6-b6f4-001e67d20c13_Client_Lighting_final_exr_both"]
        :return: returns a list which carries ample number of dictionaries consisting of versions from ftrack whose
        files are avaialble on 'ASE' folder system
        """
        if not data_array:
            return False

        import ase_prod_srv
        self.ftp, self.sftp = ase_prod_srv.makeServerConnection()
        data_array = json.loads(data_array)

        final_list = set(data_array)
        final_list = list(final_list)
        dets = ''
        data_list = []
        for items in final_list:
            data_hash = {}
            # aaj_999_0010:b9320c4e-9203-11e6-8620-001e67d20c13|Internal|Render|final|jpg|both
            # aaj_beaverDad:77f939b2-75b8-11e6-b2b6-001e67d20c13|Internal|Modeling|geom|mov
            data = items.split(':')
            split_task = data[0].split('_')
            proj_name = split_task[0]
            obj_key = '_'.join(split_task[1:])

            details = data[1].split('|')
            obj_id = details[0]
            version_status = details[1]
            task_name = details[2]
            asset_name = details[3]
            folder_option = details[4]
            camera_angle = ''
            if len(details) == 6:
                camera_angle = details[5]

            version = ''
            ver_list = []
            listy = []
            user_list = []

            data_hash['status'] = 'Ready to upload'
            data_hash['obj_name'] = obj_key
            data_hash['version'] = '--'
            data_hash['assignees'] = '--'
            data_hash['linked_path'] = '--'
            data_hash['trimmed_version'] = '--'
            data_hash['approved_version_number'] = '--'
            data_hash['camera_angle'] = '--'
            data_hash['version_id'] = '--'
            data_hash['source_path'] = '--'

            reject_status = ''
            check_version_status = ''

            if version_status == 'Internal':
                reject_status = 'Internal Reject'
                check_version_status = 'Ready to Review'
            # elif version_status == 'Client' and asset_name == 'final':
            #     reject_status = 'Client Reject'
            #     check_version_status = 'Client Approved'
            elif version_status == 'Client':
                reject_status = 'Client Reject'
                check_version_status = 'Internal Approved'
            elif version_status == 'Review':
                reject_status = 'Review Reject'
                check_version_status = 'Client Approved'
            elif version_status == 'DI':
                reject_status = 'DI Reject'
                check_version_status = 'Review Approved'

            reject_versions = self.session.query(
                'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" and status.name is "%s"' % (
                    asset_name, obj_id, task_name, reject_status)).all()

            approved_version_number = str(len(reject_versions) + 1).zfill(3)
            approved_version_number_1 = asset_name + '_' + folder_option + '_v' + approved_version_number

            data_hash['approved_version_number'] = approved_version_number_1

            ver = self.session.query(
                'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" and status.name is "%s"' % (
                    asset_name, obj_id, task_name, check_version_status)).all()

            print 'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" and status.name is "%s"' % (
                asset_name, obj_id, task_name, check_version_status)

            restrict_final_upload_check_flag = 0
            # Adding filter which will restrict the final upload if sequence doesn't have any client approval
            # restrict_final_upload_check_flag = 0
            restrict_final_upload_check = ''
            if version_status == 'Client' and asset_name == 'final':
                restrict_final_upload_check = self.session.query(
                    'AssetVersion where asset.name is "sequence" and asset.parent.id is "%s" and task.name is '
                    '"%s" and status.name is "Client approved"' % (obj_id, task_name)).all()
                if len(restrict_final_upload_check) == 0:
                    # print restrict_final_upload_check
                    # if not len(restrict_final_upload_check) > 0:
                    restrict_final_upload_check_flag = 1
                    # data_hash['status'] = 'Sequence version not yet approved by client !'

            restrict_final_upload_check_1 = self.session.query(
                'AssetVersion where asset.name is "final" and asset.parent.id is "%s" and task.name is '
                '"%s" and status.name is "Internal Approved"' % (obj_id, task_name)).all()

            if len(restrict_final_upload_check_1) > 1:
                restrict_final_upload_check_flag = 2

            for x in ver:
                version_name = x['link'][-1]['name']
                if version_name:
                    ver_no = version_name.split(' ')[-1]
                    ver_dept_name = asset_name
                    if task_name == 'Lighting':
                        ver_dept_name = 'compout'

                    version = proj_name + '_' + obj_key + ':' + self.dept_short[
                        task_name] + '_' + ver_dept_name + '_' + asset_name + '_' + folder_option + '_' + ver_no
                    trimmed_version = asset_name + '_' + folder_option + '_' + ver_no
                    listy.append(trimmed_version)
                    ver_list.append(version)
                    data_hash['version_id'] = x['id']

                    for users in x['task']['appointments']:
                        user_list.append(users['resource']['username'])

                    for comps in x['components']:
                        if comps['name'] == folder_option:
                            data_hash['source_path'] = comps['component_locations'][0]['resource_identifier']

            users_ver = ','.join(user_list)

            data_hash['version'] = ','.join(ver_list)
            data_hash['assignees'] = users_ver

            ftrack_path = data_hash['source_path']
            len_ver_list = len(ver_list)

            if restrict_final_upload_check_flag == 1:
                data_hash['status'] = 'Sequence version not yet approved by client'
                restrict_final_upload_check_flag = 0
                restrict_final_upload_check = ''
            elif restrict_final_upload_check_flag == 2:
                data_hash['status'] = "More than one version's status is Internal Approved"
                restrict_final_upload_check_flag = 0
                restrict_final_upload_check_1 = ''
            else:
                if len_ver_list > 1:
                    data_hash['status'] = 'Multiple version has status "%s"' % version_status
                elif len_ver_list == 0:
                    data_hash['status'] = 'No version found'
                else:
                    if task_name == 'Lighting':
                        if camera_angle == 'both':
                            left_path = os.path.join(ftrack_path, 'left')
                            right_path = os.path.join(ftrack_path, 'right')

                            try:
                                self.sftp.stat(left_path)
                                self.sftp.stat(right_path)
                            except:
                                data_hash['status'] = 'Source folder not available'
                        else:
                            path = os.path.join(ftrack_path, camera_angle)
                            try:
                                self.sftp.stat(path)
                            except:
                                data_hash['status'] = 'Source folder not available'
                    else:
                        try:
                            self.sftp.stat(ftrack_path)
                        except:
                            data_hash['status'] = 'Source folder not available'

                    data_hash['trimmed_version'] = listy[0]
                    data_hash['linked_path'] = ftrack_path

            data_list.append(data_hash)

        #        pprint(data_list)
        return data_list

    def upload_versions(self, versions, destination, prefer, side, upload_status, client_final_combo, dept, username):
        """
        Function used to upload all the selected versions on Compout Upload tool when clicked "Upload" button
        :param versions:
        :param destination:
        :param prefer:
        :param side:
        :param upload_status:
        :param client_final_combo:
        :return:
        """
        if not (versions):
            return False

        print versions, destination, prefer, side, upload_status, client_final_combo, dept

        success_dict = [{}]
        versions = json.loads(versions)
        destination = json.loads(destination)
        self.user_details_log = []

        if destination[0] == "Z:" or destination[1] == 'ASE':
            destined = ''
            projname = ''
            if destination[0] == "Z:":
                destination.pop(0)
                destined = '/'.join(destination)
                destined = '/ASE/' + destined
                projname = destination[1]
            else:
                destined = '/'.join(destination)
                projname = destination[3]

            fol_search = '/ASE/01prj/%s/06_ftp.*/upload' % (projname.upper())
            #	    fol_search = '/ASE/01prj/NXP/programmer'

            match = re.match(r'^%s' % fol_search, destined)

            if not match:
                success_dict = [{'status': 'Invalid Destination'}]
            else:
                os.system("sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 sudo chmod 775 %s" % (
                    self.password_str, destined))
                import ase_prod_srv
                self.ftp, self.sftp = ase_prod_srv.makeServerConnection()
                for x in versions:
                    # x = 'aaj_060_0030:anim_review_review_mov_v004:review_mov_v002:9e43c54d-a54a-4c14-80cb-ae32d4907dbd:/ASE/01prj/AAJ/prod/shotpub/060/0030/anim_review/review/mov/aaj_060_0030_anim_review_review_mov_v004.mov'
                    print x

                    client_rejected_version_list = x.split(':')
                    internal_version = client_rejected_version_list[1].split('_')[-1]
                    client_rejected_version = client_rejected_version_list[2]
                    clt_rej_ver_no = client_rejected_version.split('v')[-1]
                    version_id = client_rejected_version_list[3]
                    ftrack_source_path = client_rejected_version_list[4]

                    vers = client_rejected_version_list[0].split('_')
                    prj_name = vers[0]
                    obj_name = '_'.join(vers[1:])

                    ver = client_rejected_version_list[1].split('_')
                    version_number = internal_version

                    asset_name = ver[2]
                    folder_type = '_'.join(ver[3:-1])

                    obj_path = '/'.join(vers[1:])

                    side_head = ''
                    if side:
                        side_head = '(' + side + ')'

                    heading_mail = ':'.join(vers) + '-' + asset_name + '[' + folder_type + ']' + side_head

                    user_details = {}
                    user_details['source_file'] = ftrack_source_path
                    user_details['project'] = prj_name.upper()
                    user_details['heading_mail'] = heading_mail
                    user_details['publishing_time'] = time.strftime("%Y/%m/%d %H:%M")
                    user_details['Internal Version'] = asset_name + ' ' + internal_version
                    user_details['Client Version'] = client_rejected_version
                    user_details['Upload For'] = upload_status + ' Upload'
                    user_details['Asset Name'] = asset_name
                    user_details['department'] = dept
                    user_details['username'] = username

                    mailing_destination = ''
                    status = ''

                    if asset_name == 'final' or side == 'both':
                        source_path1 = ftrack_source_path + '/' + 'left'
                        source_path2 = ftrack_source_path + '/' + 'right'
                        destination_folder1 = os.path.join(destined, obj_path, folder_type, 'l')
                        destination_folder2 = os.path.join(destined, obj_path, folder_type, 'r')
                        mailing_destination = os.path.join(destined, obj_path, folder_type)
                        try:
                            if not os.path.exists(destination_folder1):
                                #				os.makedirs(destination_folder1)
                                self.ftp.exec_command('/bin/mkdir -p %s' % (destination_folder1))
                            if not os.path.exists(destination_folder2):
                                #				os.makedirs(destination_folder2)
                                self.ftp.exec_command('/bin/mkdir -p %s' % (destination_folder2))
                        except IOError as e:
                            print "I/O error({0}): {1}".format(e.errno, e.strerror)

                        time.sleep(3)
                        file_exist = 0

                        listy = self.listdir(source_path1)
                        if listy:
                            for x in listy:
                                version_number = x.split('.')[1]
                                if version_number == folder_type:
                                    file_name = prj_name + '_' + obj_name + '_' + 'l' + '_' + clt_rej_ver_no + '.' + folder_type
                                else:
                                    file_name = prj_name + '_' + obj_name + '_' + 'l' + '_' + clt_rej_ver_no + '.' + version_number + '.' + folder_type
                                finale = os.path.join(destination_folder1, file_name)
                                source_final = os.path.join(source_path1, x)

                                if os.path.exists(finale):
                                    file_exist = 1

                                self.preference(prefer, source_final, finale, version_id, heading_mail,
                                                client_rejected_version, version_number, upload_status,
                                                client_final_combo)

                        right_listy = self.listdir(source_path2)
                        if right_listy:
                            for y in right_listy:
                                version_number = y.split('.')[1]
                                if version_number == folder_type:
                                    file_name = prj_name + '_' + obj_name + '_' + 'r' + '_' + clt_rej_ver_no + '.' + folder_type
                                else:
                                    file_name = prj_name + '_' + obj_name + '_' + 'r' + '_' + clt_rej_ver_no + '.' + version_number + '.' + folder_type
                                finale = os.path.join(destination_folder2, file_name)
                                source_final = os.path.join(source_path2, y)

                                if os.path.exists(finale):
                                    file_exist = 1

                                self.preference(prefer, source_final, finale, version_id, heading_mail,
                                                client_rejected_version, version_number, upload_status,
                                                client_final_combo)

                        if file_exist:
                            status = 'One or more files already exists in Provided Destination !'
                        else:
                            status = 'Upload Successful'


                    else:
                        source_path1 = ''
                        destination_folder1 = ''
                        if side:
                            source_path1 = ftrack_source_path + '/' + side
                            destination_folder1 = os.path.join(destined, obj_path, folder_type, side[0])
                        else:
                            source_path1 = ftrack_source_path
                            destination_folder1 = os.path.join(destined, obj_path, folder_type)

                        # For SW9 project copy mov outside ....
                        if prj_name.lower() == 'sw9' and folder_type == 'mov':
                            destination_folder1 = destined

                        mailing_destination = destination_folder1
                        try:
                            if not os.path.exists(destination_folder1):
                                self.ftp.exec_command('mkdir -p %s' % (destination_folder1))
                        except IOError as e:
                            print "I/O error({0}): {1}".format(e.errno, e.strerror)

                        time.sleep(3)
                        check_destinations = {}

                        file_exist = 0

                        listy = self.listdir(source_path1)
                        if listy:
                            for x in listy:
                                #                                version_number = x.split('.')[1]
                                #                                if version_number == folder_type:

                                ext = x.split('.')[-1]
                                if side:
                                    file_name = prj_name + '_' + obj_name + '_' + side[
                                        0] + '_' + clt_rej_ver_no + '.' + ext
                                else:
                                    file_name = prj_name + '_' + obj_name + '_' + clt_rej_ver_no + '.' + ext
                                # else:
                                #                                    file_name = prj_name + '_' + obj_name + '_' + 'l' + '_' + clt_rej_ver_no + '.' + folder_type

                                finale = os.path.join(destination_folder1, file_name)
                                source_final = os.path.join(source_path1, x)

                                if os.path.exists(finale) is True:
                                    file_exist = 1

                                self.preference(prefer, source_final, finale, version_id, heading_mail,
                                                client_rejected_version, version_number, upload_status,
                                                client_final_combo)

                        if file_exist:
                            status = 'One or more files already exists in Provided Destination !'
                        else:
                            status = 'Upload Successful'

                    user_details['status'] = status
                    user_details['mailing_destination'] = mailing_destination

                    os.system(
                        "sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 sudo chown -R pip:prod %s" % (
                            self.password_str, destined))

                    self.user_details_log.append(user_details)
                    success_dict = [{'status': 'Upload Complete'}]
                    if version_id:
                        self.change_status_after_upload(version_id, upload_status, client_final_combo)

        else:
            success_dict = [{'status': 'Local File Path Not Allowed'}]

        if self.user_details_log:
            self.send_log_mail(self.user_details_log)

        return success_dict

    def listdir(self, path):
        list_array = ''
        import ase_prod_srv
        self.ftp, self.sftp = ase_prod_srv.makeServerConnection()
        try:
            stdin, stdout, stderr = self.ftp.exec_command('ls %s' % path)
            files = stdout.read()
            mylist = files.split('\n')
            list_array = [i for i in mylist if i != '']
        except IOError as e:
            print "I/O error({0}): {1}".format(e.errno, e.strerror)

        return list_array

    def preference(self, prefer, source_final, finale, version_id, heading_mail, client_rejected_version,
                   version_number, upload_status, client_final_combo):

        file_status = ''
        if os.path.exists(finale):
            file_status = "Destination file exists"
            return False

        try:
            if prefer == 'symlink':
                self.ftp.exec_command('/bin/ln -s %s %s' % (source_final, finale))
            elif prefer == 'copy':
                self.ftp.exec_command('/bin/cp -f %s %s' % (source_final, finale))
            file_status = 'Upload successful'
        except IOError as e:
            print "Symlink failed({0}): {1}".format(e.errno, e.strerror)
            file_status = "Upload failed"
            version_id = ''

    def logger_details_ftp(self, source_final, finale, status, the_heading_mail, client_rejected_version,
                           version_number, upload_status):
        return False

        user_details = {}
        logg_file = os.path.join(BASE_DIR, 'projftrack/logs/logger_details.json')

        username = self.username
        user_details['source_file'] = source_final
        user_details['destination_file'] = finale
        # current_date = time.asctime()
        # user_details['publishing_date'] = current_date
        user_details['status'] = status
        user_details['publishing_time'] = time.asctime()
        user_details['heading_mail'] = the_heading_mail
        user_details['Client Version'] = client_rejected_version
        user_details['Internal Version'] = version_number
        user_details['Upload For'] = upload_status + ' Upload'

        #        self.user_details_log.append(user_details)

        data = {}
        if os.path.isfile(logg_file) and os.path.getsize(logg_file) > 0:
            data_file = open(logg_file, 'r')
            try:
                data = json.load(data_file)
            finally:
                data_file.close()

        listy = []
        listy.append(user_details)
        if username in data:
            listy = listy + data[username]

        data[username] = listy

        with open(logg_file, "w") as log_file:
            try:
                log_file.write(json.dumps(data))
            finally:
                log_file.close()

    def change_status_after_upload(self, ver_id, upload_status, client_final_combo):
        print "Changing Status To : ", ver_id, client_final_combo, upload_status
        finale_version = self.session.query("AssetVersion where id is '%s'" % ver_id).one()
        changed_status = ''
        if client_final_combo == 'final' and upload_status == 'Client':
            changed_status = self.session.query("Status where name is 'Client Approved'").first()
            finale_version['task']['status'] = changed_status
        elif upload_status == 'Internal':
            changed_status = self.session.query("Status where name is 'Pending Internal Review'").first()
        elif upload_status == 'Client':
            changed_status = self.session.query("Status where name is 'Pending Client Review'").first()
            finale_version['task']['status'] = changed_status
        elif upload_status == 'Review':
            changed_status = self.session.query("Status where name is 'Review Approved'").first()
            finale_version['task']['status'] = changed_status
        elif upload_status == 'DI':
            changed_status = self.session.query("Status where name is 'DI Approved'").first()
            finale_version['task']['status'] = changed_status

        finale_version['status'] = changed_status
        self.session.commit()

    def send_log_mail(self, user_details_log):

        project = user_details_log[0]['project']

        user_id = user_details_log[0]['username']
        from_addr = user_id + '@intra.madassemblage.com'

        to = from_addr

        if project in self.email_address['FTP Upload']:
            if user_details_log[0]['department'] in self.email_address['FTP Upload'][project]:
                to = to + ',' + ','.join(self.email_address['FTP Upload'][project][user_details_log[0]['department']])

        to_addr = to
        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

        subject = '[' + project + '] ' + user_details_log[0]['department'] + ' Upload' + '(' + user_details_log[0][
            'Asset Name'] + ')(' + \
                  user_details_log[0][
                      'publishing_time'] + ')'

        body_list = []
        for user in user_details_log:
            htmlhead = """
                    <table border="1">
                    <tr style="font-weight:bold;"><td>%s</td><td>%s</td><td>%s</td></tr>
                <tr><td colspan="3">
                <table border="1">
                    <tbody>
            """ % (user['heading_mail'], user['publishing_time'], user['Upload For'])
            htmlbody = ''
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Status</td><td style="font-size:12px;">%s</td></tr>' % \
                       user['status']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Internal Version</td><td style="font-size:12px;">%s</td></tr>' % \
                       user['Internal Version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Upload Version</td><td style="font-size:12px;">%s</td></tr>' % \
                       user['Client Version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Source File</td><td style="font-size:12px;">%s</td></tr>' % \
                       user['source_file']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Destination File</td><td style="font-size:12px;">%s</td></tr>' % \
                       user['mailing_destination']

            htmltail = """
                </tbody>
            </table>
            </td>
            </tr>
            </table>
            """

            html_data = htmlhead + htmlbody + htmltail
            body_list.append(html_data)

        mail_body = ' '.join(body_list)

        self.send_email(subject, from_addr, to_addr, cc_addr, mail_body)

    def reject_mail(self, details):

        if 'users' not in details:
            print "No user found to send a reject mail"

        subject = 'Task Reject (' + details['task_path'] + ')(' + details['status'] + ')'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        user_list = details['users'].split(',')
        to_list = list()

        for user in user_list:
            user = user.strip()
            to_list.append(user + '@intra.madassemblage.com')

        to_addr = ','.join(to_list)

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com'

        htmlhead = """
	    Hello Artist(s),</br>Your task has been rejected with below details ... </br></br>
                    <table border="1">
                    <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
                <tr><td colspan="3">
                <table border="0">
                    <tbody>
        """ % (details['task_path'], details['status'])

        htmlbody = ''
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Task</td><td style="font-size:12px;">%s</td></tr>' % \
                   details['task_path']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reason</td><td style="font-size:12px;">%s</td></tr>' % \
                   details['note_text']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reject Version</td><td style="font-size:12px;">%s</td></tr>' % \
                   details['version']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Rejected by</td><td style="font-size:12px;">%s</td></tr>' % \
                   details['added_by'].replace('.', ' ').title()
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Rejected on</td><td style="font-size:12px;">%s</td></tr>' % \
                   str(details['added_on']).split('.')[0]

        htmltail = """
                </tbody>
            </table>
            </td>
            </tr>
            </table>
	</br>
	Regards,</br> %s
        """ % details['added_by'].replace('.', ' ').title()

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
        receiver_mail = ['prafull.sakharkar@intra.madassemblage.com']

        part = MIMEText(mail_body, 'html')
        msg.attach(part)
        s = smtplib.SMTP('localhost')
        s.sendmail(sender_mail, receiver_mail, msg.as_string())
        print "Mail Send from %s to %s" % (sender_mail, receiver_mail)
        s.quit()
