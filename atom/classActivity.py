import base64
# import copy_reg
import datetime
import json
import os
import re
import smtplib
import time
import calendar
# import types
import Queue
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from threading import Thread

import ase_ftrack
import ase_session
import ase_task
import ldap
import pymongo
import csv
import copy

from django.http import HttpResponse, HttpResponseRedirect
# from django.http import HttpResponse, HttpResponseRedirect, JsonResponse
from django.shortcuts import render
from settings import BASE_DIR, PROJ_BASE_DIR, FTRACK_URL, MONGO_SERVER, DEVMODE

from pprint import pprint
from socket import socket, AF_INET, SOCK_DGRAM
from subprocess import check_output

from mongoengine.queryset.visitor import Q
from .forms import CreateProject, CreateSequence, CreateShot, CreateAsset, CreateTask, AttachmentForm
from .models import Attachment, getModel


# from django.shortcuts import render_to_response
# from django.template import RequestContext
# from django.core.urlresolvers import reverse


# from django.utils.decorators import method_decorator

# def _pickle_method(m):
#     if m.im_self is None:
#         return getattr, (m.im_class, m.im_func.func_name)
#     else:
#         return getattr, (m.im_self, m.im_func.func_name)


# copy_reg.pickle(types.MethodType, _pickle_method)


class Activity:
    # noinspection PyBroadException
    def __init__(self):

        self.session = ase_session.Session(FTRACK_URL)
        mongo_server = MONGO_SERVER
        os.environ['FTRACK_SERVER'] = FTRACK_URL
        self.debug = DEVMODE

#        try:
#            ips = check_output(['hostname', '--all-ip-addresses'])
#            ip_address = ips.strip()
#        # self.ipaddress = gethostbyname(self.machinename)
#        except ValueError:
#            ip_address = '127.0.0.1'
#
#        if ip_address not in ['192.168.1.20', '192.168.1.19']:
#            mongo_server = '192.168.1.128'
#            os.environ['FTRACK_SERVER'] = "http://192.168.1.99"
#            self.debug = True

        self.reload_session()

        print("**************** START ******************")
        print(os.environ['FTRACK_SERVER'], mongo_server, self.debug)

        self.password_str = base64.b64decode("bWFkQHBpcDE=")
        self.projects = {}
        self.object_types = {}
        self.sequences = {}
        self.asset_builds = {}
        self.shots = {}
        self.employee_details_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/employee_details.json')
        self.user_details_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/user_details.json')
        self.email_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/email.json')
        self.asset_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/asset_config.json')
        self.task_template_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/task_template.json')
        self.allowed_status = ['In progress', 'Ready to start', 'Internal Reject', 'Internal Approved', 'On Hold',
                               'Not started']
        self.change_status = ['In progress', 'Ready to start', 'On Hold']
        self.artist_status = ['Ready to start', 'In progress', 'On Hold', 'Pending Internal Review', 'Internal Reject',
                              'Pending Client Review', 'Client Reject']
        self.ftp_departments = [{'name': 'Layout', 'id': '03'}, {'name': 'Shot Finaling', 'id': '06'},
                                {'name': 'Blocking', 'id': '04'}, {'name': 'Animation', 'id': '05'},
                                {'name': 'Render', 'id': '00'}, {'name': 'Lighting', 'id': '01'}]
        self.review_statuses = ["Pending Client Review", "Pending Internal Review", "Outsource",
                                "Outsource Client Review"]
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
        self.disabled_statuses = ['In progress', 'Pending Internal Review', 'Ready to Publish',
                                  'Pending Client Review']

        self.months_str = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep',
                           10: 'Oct', 11: 'Nov', 12: 'Dec'}
        self.mongo_client = pymongo.MongoClient(mongo_server, 27017)
        self.mongo_database = self.mongo_client['userDailyBackupTask']

	self.emp_db = self.mongo_client['employees']
	self.col_emp_details = self.emp_db['employee_details']

        self.email_address = self.get_email_address()
        self.durations = ['Daily', 'Weekly', 'Monthly', 'Date Wise']
        self.empcode = {'prafull.sakharkar': 'RCP0713', 'muqtar.shaikh': 'RCM0800', 'ayush.goel': 'RCA0633'}
        self.employee_details = dict()
	self.get_user_details()

        self.sequence_name = ''
        self.__result = []
        self.pparent_ids = {}
        self.stereo_object = 0
        self.ftp, self.sftp = '', ''
        self.project = ''

        # list to store all statuses of task
        self.list_task_statuses = ''
        # list to store all types of task
        self.list_task_types = ''
        # list to store all shot types
        self.list_shot_statuses = ''
        # list to store all sequence types
        self.list_sequence_statuses = ''
        # list to store all asset types
        self.list_asset_sequences = ''

        self.project_schemas = self.session.query("ProjectSchema")[3]
        self.task_status_object = self.project_schemas.get_statuses("Task")
        self.task_types_object = self.project_schemas.get_types("Task")
        self.asset_status_object = self.project_schemas.get_statuses("AssetBuild")
        self.sequence_status_object = self.project_schemas.get_statuses("Sequence")
        self.shot_status_object = self.project_schemas.get_statuses("Shot")
        self.sequence_status_object = self.project_schemas.get_statuses("Sequence")
        '''
        project variable which will store
        the object returned from ftrack.createProject()
        '''
        self.project = ''

        '''
        class variable sequence which will store
        object returned from project_var.create("Sequence","ABC")
        '''
        self.sequence_object = ''

        '''
        class variable sequence name
        '''
        self.sequence_name = ''

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

        # Creating ftrack user
        self.create_new_ftrack_user(username)

        self.get_user_columns(username)
        print(str(datetime.datetime.now()), "User (%s) Login : %s" % (self.user_role,username))

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
        self.get_user_columns(username)

        if request.method == 'POST':
            data = []
            if request.is_ajax():
                proj_id = request.POST.get('proj_id')
                object_name = request.POST.get('object_name')
                if object_name == 'Update Form Data':
                    entity_name = request.POST.get('entity_name')
                    data_list = request.POST.get('data_list')
                    data = self.update_form_data(entity_name, data_list)
                elif object_name == 'Sequence':
                    data = self.get_sequences(proj_id)
                elif object_name == 'Shot':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_shots(proj_id, parent_id)
                elif object_name == 'Asset Build':
                    obj_type = request.POST.get('object_type')
                    data = self.get_asset_builds(proj_id, obj_type)
                elif object_name == 'Task':
                    parent_ids = request.POST.get('parent_ids')
                    project_name = request.POST.get("project_name")
                    self.object_name = request.POST.get('parent_object_name')
                    data = self.get_task_detail_mongo(project_name, parent_ids)
                elif object_name == 'Select Task':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_tasks(parent_id)
                elif object_name == 'Save Changes':
                    data_list = request.POST.get('data_list')
                    self.save_changes(data_list, proj_id)
                elif object_name == 'Save Version Changes':
                    data_list = request.POST.get('data_list')
                    page = request.POST.get('page')
                    self.save_version_changes(data_list, page)
                elif object_name == 'Versions':
                    object_id = request.POST.get('object_id')
                    task_id = request.POST.get('task_id')
                    asset_type = request.POST.get('asset_type')
                    object_type = request.POST.get('object_type')
                    data = self.get_asset_versions(object_id, task_id, asset_type, object_type)
                elif object_name == 'Create Note':
                    note = request.POST.get('note_text')
                    object_id = request.POST.get('task_id')
                    note_category = request.POST.get('note_category')
                    note_for = request.POST.get('note_for')
                    note_task = request.POST.get('note_task')
                    attach_files = request.POST.get('attach_files')
                    page = request.POST.get('page')
                    data = self.create_entity_note(note, object_id, note_category, note_for, note_task,
                                                   attach_files, page)
                elif object_name == 'DB Note':
                    note_text = request.POST.get('note_text')
                    object_id = request.POST.get('task_id')
                    note_category = request.POST.get('note_category')
                    change_status = request.POST.get('change_status')
                    task_path = request.POST.get('task_path')
                    users = request.POST.get('users')
                    version = request.POST.get('version')
                    from_name = request.POST.get('from')
                    to_name = request.POST.get('to')
                    page = request.POST.get('page')
                    self.insert_db_note(note_text, note_category, object_id, change_status, users, task_path, version,
                                        from_name, to_name, page)
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
                elif object_name == 'Load Asset Type':
                    parent_name = request.POST.get('parent_name')
                    data = self.load_asset_types(parent_name)
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
                    task_assignee = request.POST.get('task_assignee')
                    data = self.show_task_details(type_name, task_id, task_assignee)
                elif object_name == 'Show Note Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    note_task = request.POST.get('note_task')
                    note_category = request.POST.get('note_category')
                    data = self.get_note_details(task_id, type_name, last_row, note_task, note_category)
                elif object_name == 'Show Link Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    # last_row = request.POST.get('last_row')
                    project_name = request.POST.get('project_name')
                    data = self.get_link_details(task_id, type_name, project_name)
                elif object_name == 'Show Asset Versions':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    task = request.POST.get('task')
                    project = request.POST.get('project')
                    path = request.POST.get('path')
                    task_name = request.POST.get('task_name')
                    data = self.show_asset_versions(task_id, type_name, last_row, task, project, path, task_name)
                elif object_name == 'Version Note':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    last_row = request.POST.get('last_row')
                    task = request.POST.get('task')
                    note_category = request.POST.get('note_category')
                    project = request.POST.get('project')
                    path = request.POST.get('path')
                    task_name = request.POST.get('task_name')
                    data = self.get_version_notes(task_id, type_name, last_row, task, note_category, project,
                                                  path, task_name)
                elif object_name == 'Change Status':
                    new_status = request.POST.get('new_status')
                    old_status = request.POST.get('old_status')
                    object_id = request.POST.get('object_id')
                    status_for = request.POST.get('status_for')
                    page = request.POST.get('page')
                    data = self.object_change_status(new_status, old_status, object_id, status_for, page)
                elif object_name == 'User Dashboard':
                    project = request.POST.get('project')
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    task = request.POST.get('task')
                    data = self.get_user_task_reports(project, first, last, task)
                elif object_name == 'MGM Dashboard':
                    project = request.POST.get('project')
                    work_status = request.POST.get('work_status')
                    data = self.get_project_details(work_status, project)
                elif object_name == 'Artist Tasks':
                    project = request.POST.get('project')
                    status = request.POST.get('status')
                    data = self.get_artist_tasks(username, project, status)
                elif object_name == 'Artist Action':
                    project = request.POST.get('project')
                    task_id = request.POST.get('task_id')
                    action = request.POST.get('action')
                    page = request.POST.get('page')
                    path = request.POST.get('path')
                    parent_id = request.POST.get('parent_id')
                    # note_text = request.POST.get('note_text')
                    self.apply_artist_action(username, project, task_id, action, page, path, parent_id)
                elif object_name == 'Review Tasks':
                    project = request.POST.get('project')
                    review_status = request.POST.get('status')
                    data = self.get_review_tasks(project, review_status)
                elif object_name == 'display_project_thumbnail_manner':
                    data = self.display_project_thumbnail_manner()
                elif object_name == 'display_sequence_details':
                    project_name = request.POST.get('project_name')
                    data = self.display_sequence_details(project_name)
                elif object_name == 'display_shot_details':
                    data = self.display_shot_details(request.POST.get('seq_name'), request.POST.get('prj_name'))
                elif object_name == 'display_asset_details':
                    data = self.display_asset_details(request.POST.get('project_name'))
                elif object_name == 'display_task_details':
                    project_name = request.POST.get('project_name')
                    name = request.POST.get('name')
                    type_name = request.POST.get("type")
                    shot_name = request.POST.get("shot_name")
                    asset_name = request.POST.get("asset_name")
                    data = self.display_task_details(project_name, name, type_name, shot_name, asset_name)
                elif object_name == 'get_details':
                    name = request.POST.get('project_name')
                    entity_id = request.POST.get('entity_id')
                    data = self.get_details_before_update(name, entity_id)
                elif object_name == 'Task_types':
                    type_name = request.POST.get('type_name')
                    asset_type_name = request.POST.get("asset_type_name")
                    data = self.get_task_types(type_name, asset_type_name)
                elif object_name == 'Multiple_assignees':
                    data = self.get_multiple_assignees()
                elif object_name == 'fps_calculation':
                    start_frame = request.POST.get('sf')
                    end_frame = request.POST.get("ef")
                    prj_name = request.POST.get('prj_name')
                    # seq_name = request.POST.get("seq_name")
                    data = self.get_fps_seconds(start_frame, end_frame, prj_name)
                elif object_name == 'Duplicate_name_check':
                    task_name_check = request.POST.get("name")
                    prj_name = request.POST.get("prj")
                    seq_name = request.POST.get("seq")
                    shot_name = request.POST.get("shot")
                    flag = request.POST.get("flag")
                    data = self.duplicate_name_check(task_name_check, prj_name, seq_name, shot_name, flag)
                elif object_name == 'Show Upload CSV':
                    project = request.POST.get('project')
                    entity = request.POST.get('create_entity')
                    parent_id = request.POST.get('parent_id')
                    file_path = request.POST.get('file_path')
                    data = self.show_upload_data(file_path, entity, parent_id, project)
                elif object_name == 'Artist Productivity':
                    project = request.POST.get('project')
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    artist = request.POST.get('artist')
                    task_name = request.POST.get('task_name')
                    data = self.get_artist_productivity_reports(project, first, last, artist, task_name)
                elif object_name == 'Month Wise Reports':
                    project = request.POST.get('project')
                    first = request.POST.get('start_date')
                    last = request.POST.get('end_date')
                    parent_object_type = request.POST.get('parent_object_type')
                    months = request.POST.get('months')
                    data = self.get_month_wise_reports(project, first, last, parent_object_type, months)
                elif object_name == 'Link Asset':
                    task_id = request.POST.get('task_id')
                    selected_asset = request.POST.get('selected_asset')
                    asset_name = request.POST.get('asset_name')
                    old_asset_ids = request.POST.get('old_asset_ids')
                    page = request.POST.get('page')
                    parent_path = request.POST.get('parent_path')
                    self.add_asset(task_id, selected_asset, asset_name, old_asset_ids, page, parent_path)
                elif object_name == 'Delete Note':
                    note_id = request.POST.get('note_id')
                    self.delete_note(note_id)
                # -----
                elif object_name == 'Load Task':
                    selected_object = request.POST.get('selected_object')
                    selected_asset_type = request.POST.get('selected_asset_type')
                    data = self.load_task(selected_object, selected_asset_type)
                elif object_name == 'Load Asset Name':
                    selected_project = request.POST.get('selected_project')
                    selected_asset_type = request.POST.get('selected_asset_type')
                    selected_object = request.POST.get('selected_object')
                    selected_task = request.POST.get('selected_task')
                    data = self.load_asset_name(selected_project, selected_object, selected_asset_type, selected_task)
                elif object_name == 'Load Entity Task':
                    project_name = request.POST.get('project_name')
                    parent_ids = request.POST.get('parent_ids')
                    selected_object = request.POST.get('selected_object')
                    selected_task = request.POST.get('selected_task')
                    # selected_ids = request.POST.get('selected_ids')
                    data = self.load_entity_data(parent_ids, project_name, selected_object, selected_task)
                elif object_name == 'Save Entity Data':
                    # selected_project = request.POST.get('selected_project')
                    # selected_asset_type = request.POST.get('selected_asset_type')
                    # selected_object = request.POST.get('selected_object')
                    # selected_task = request.POST.get('selected_task')
                    data_list = request.POST.get('data_str_list')
                    # parent_ids = request.POST.get('parent_ids')
                    data = self.save_entity_data(data_list)
                elif object_name == 'Asset Build Create':
                    entity_name = request.POST.get('entity_name')
                    data_list = request.POST.get('data_list')
                    self.asset_build_create(entity_name, data_list)
                elif object_name == 'Get Range':
                    project_name = request.POST.get('project_name')
                    task_name = request.POST.get('task_name')
                    x_range = request.POST.get('x_range')
                    data = self.range_sq_sc(task_name, project_name, x_range)
                elif object_name == 'Sequence Delivery Details':
                    project = request.POST.get('project')
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    data = self.sequence_task_total_time_duration(first, last, project)
                elif object_name == 'Note History':
                    from_name = request.POST.get('from')
                    last_row = request.POST.get('last_row')
                    page = request.POST.get('page')
                    project = (from_name.split(":")[0]).lower()
                    data = self.get_note_history(from_name, project, last_row, page)
                elif object_name == 'Activity Log':
                    from_name = request.POST.get('from')
                    last_row = request.POST.get('last_row')
                    task = request.POST.get('task')
                    page = request.POST.get('page')
                    parent_id = request.POST.get('parent_id')
                    project = (from_name.split(":")[0]).lower()
                    data = self.get_activity_log_details(from_name, project, last_row, task, page, parent_id)
                elif object_name == 'Show Tab Link Details':
                    task_id = request.POST.get('task_id')
                    type_name = request.POST.get('type_name')
                    # last_row = request.POST.get('last_row')
                    project_name = request.POST.get('project_name')
                    data = self.get_tab_link_details(task_id, type_name, project_name)

            if request.FILES:
                data = self.attach_upload_files(request)

            # pprint(data)
            data = json.dumps(data)
            return HttpResponse(data, content_type="application/json")

            # return JsonResponse(data)

    def get_user_details(self):

        json_data = {}

	emp_data = self.col_emp_details.find({"user_name":{"$exists":True}, "active": 1})
	for each in emp_data:
	    json_data[each['user_name']] = each
#        if os.path.isfile(self.employee_details_jfile):
#            data_file = open(self.employee_details_jfile, 'r')
#            try:
#                json_data = json.load(data_file)
#            finally:
#                data_file.close()

        self.employee_details = json_data

    def get_user_columns(self, username):

        self.user_role = 'Artist'
	self.users_columns = ''
        if username in self.employee_details:
            self.user_role = self.employee_details[username]['role']
            self.users_columns = ','.join(self.employee_details[username]['columns'])

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
        elif status_name == 'Outsource':
            check_status = 'Outsource Approved'

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
        :param asset_type: ftrack asset type
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
        elif status_name == 'Outsource':
            check_status = 'Outsource Approved'

        task = self.session.query(
            'Task where name is "%s" and project.id is "%s" and status.name is "%s" and parent.type.name is "%s" ' % (
                task_name, parent_id, check_status, asset_type)).all()

        asset_list = []
        for asset in task:
            details = dict()
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

        query = 'Asset where parent.id is "%s"' % parent_id

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

    def load_asset_types(self, parent_name):
        """
        Gets list of asset type
        :param parent_name: parent name of task or asset build
        :return:
        """

        # query = 'Asset where parent.id is "%s"' % parent_id
        with open(self.asset_jfile) as data_file:
            data = json.load(data_file)

        # asset = self.session.query(query).all()

        # type_list = []
        # flag = dict()
        # for data in asset:
        #     name = data['type']['name']
        #     if name in flag:
        #         continue
        #     flag[name] = 1
        #
        #     details = dict()
        #     details['name'] = name
        #
        #     type_list.append(details)

        type_list = data[parent_name]

        return type_list

    def get_ftp_components(self, parent_id, asset_name, dept, upload_for):
        """
        Gets list of componets of selected asset name
        :param upload_for: uploading for what (e.g review, DI)
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
        elif upload_for == 'Outsource':
            status = 'and status.name is "Outsource Approved"'
        query = 'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" %s order by date desc' % (
            asset_name, parent_id, dept, status)

        print(query)
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

    def get_tasks(self, parent_id=''):
        """
        Gets the list of Tasks from ftrack for selected parent
        :param parent_id: parent id of task (will be shot, seq, assetbuild)
        :return: list of task
        """

        task_list = list()
        if not parent_id:
            return task_list

        query = 'Task where parent_id is "%s"' % parent_id
        obj_tasks = self.session.query(query)

        for task in obj_tasks:
            dict_task = dict()
            if task['name']:
                dict_task['name'] = task['name']
                dict_task['id'] = task['id']
                link = task['link']
                # print("----------link: ", type(link))
                path = ''
                if isinstance(type(link), list):
                    path = (':'.join([each_link['name'] for each_link in link]))
                dict_task['path'] = path

                task_list.append(dict_task)

        task_list = sorted(task_list, key=lambda x: x['name'])
        return task_list

    def get_asset_builds(self, proj_id='', obj_type=''):
        """
        Gets the list of Asset Builds from ftrack for selected project
        :param proj_id: ftrack project id of the selected project
        :param obj_type: ftrack Asset Build type (prop, chars,set,vehicles)
        :return:
        """

        if not proj_id:
            return False
        if obj_type and obj_type != 'All':

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

        a_list = sorted(asset_list, key=lambda x: x['name'])
        return a_list

    def get_task_details(self, project_name, pparent_ids=''):

        if not pparent_ids:
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
        # results = []
        start = 0
        end = total_task / number_of_cpu
        queue = Queue.Queue()

        for cpu in range(1, number_of_cpu + 1):
            if cpu == number_of_cpu:
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
        obj_task = self.task_query(pparent_id)
        for task in obj_task[start:end]:
            parent_id = task['parent_id']
            try:
                link = task['link']
                parent_name = ('_'.join([each_link['name'] for each_link in link[1:-1]]))
            except ValueError:
                parent_name = parent_id

            tasks = {}
            try:
                tasks['status'] = task['status']['name']
            except ValueError:
                tasks['status'] = '---'
            tasks['id'] = task['id']
            tasks['name'] = task['name']
            tasks['parent_name'] = parent_name
            tasks['parent_id'] = parent_id
            if self.stereo_object:
                tasks['parent_id'] = task['link'][-3]['id']
            users = []
            for resource in task['assignments']:
                users.append(resource['resource']['username'])
            if not users:
                users = ['---']
            tasks['users'] = sorted(users)
            task_list.append(tasks)

            parent_dict[parent_id] = task_list

        queue.put(task_list)

        return parent_dict

    def get_task_detail_mongo(self, project_name, parent_ids):
        '''

        :param project_name: Name of selected project
        :param parent_ids: To get tasks present inside particular
        parent_id
        :return: dict containing tasks inside Shot/Asset
        '''
        if not parent_ids:
            return False

        self.reload_session()
        parent_ids = json.loads(parent_ids)
        parent_dict = {}
        coll = self.mongo_database[project_name + "_tasks"]
        ver_coll = self.mongo_database[project_name + "_versions"]

        proj_find = coll.find_one({'name': project_name})
        fps = 0
        if proj_find:
            fps = int(proj_find['fps'])

	if self.object_name == 'Shot Asset Build':
	    shot_results = coll.find(
		{"ftrack_id": {"$in": parent_ids}, "links" : {"$exists": True}},
		{"links": 1}
	    )
	    new_parent_ids = list()
	    for obj_shot in shot_results:
		new_parent_ids += obj_shot['links']

	    parent_ids = new_parent_ids

        task_results = coll.find(
            {"parent_id": {"$in": parent_ids}},
            {"id": 0}
        )
        for ele in task_results:
            inner_dict = {}
            bid = 0
            if 'bid' in ele:
                bid = round(float(ele['bid']) / 36000, 2)

            # Client Status find
            client_status = '---'
            parent_id = ele['parent_id']

            # Getting bid & shot seconds
            seconds = 0
            if self.object_name == 'Shot':
                f_start = f_end = 0
                shot_find = coll.find_one({'ftrack_id': parent_id})
                if 'startframe' in shot_find:
                    f_start = float(shot_find['startframe'])
                if 'endframe' in shot_find:
                    f_end = float(shot_find['endframe'])

                seconds = round(float(f_end - (f_start - 1)) / fps, 2)

            try:
                path_arr = ele['path'].split(':')[:-1]
                parent_path = ':'.join(path_arr)

                task_name = ele['name']
                ver_cur = ver_coll.find({"task_path": ele['path'], "ftrack_status": {"$regex": ".*Client.*"}}).sort(
                    'updated_on', -1).limit(1)
                if ver_cur.count():
                    client_status = ver_cur[0]['ftrack_status']
            except:
                client_status = '---'

            try:
                inner_dict = {'id': ele['ftrack_id'], 'name': ele['name'], 'parent_d': ele['parent_id'],
                              'parent_type': ele["parent_type"], 'status': ele['ftrack_status'], 'bid': bid,
                              'seconds': seconds, 'client_status': client_status}

                user_name = map(lambda user: user['user_name'], ele['current_assignees'])

                if user_name:
                    inner_dict['users'] = user_name
                else:
                    inner_dict['users'] = ['---']
            except KeyError as ke:
                inner_dict[str(ke)] = ['---']

            inner_dict['parent_name'] = "_".join(ele['path'].split(":")[1:-1])

            if parent_id not in parent_dict:
                parent_dict[parent_id] = []

            parent_dict[parent_id].append(inner_dict)

        return parent_dict

    # Load single seq or asset build
    def get_task_detail(self, parent_ids=''):
        if not parent_ids:
            return False

        self.reload_session()
        parent_ids = json.loads(parent_ids)
        parent_dict = {}
        for parent_id in parent_ids:

            if self.object_name == 'Shot Asset Build':
                parent_dict = self.task_for_shot_asset_build(parent_id, parent_dict)
            else:
                # task_list = []
                obj_tasks = self.session.query('Task where parent.id is "%s"' % parent_id)
                task_list = self.create_task_list(obj_tasks)

                if not task_list:
                    obj_name = self.object_name.replace(' ', '')
                    print("No Task :", '%s where id is "%s"' % (obj_name, parent_id))
                    obj_parent = self.session.query('%s where id is "%s"' % (obj_name, parent_id)).first()

                    if obj_parent:
                        tasks = dict()
                        tasks['status'] = '---'
                        tasks['users'] = ['---']
                        link = self.default_check(obj_parent['link'])
                        parent_name = ('_'.join([each_link['name'] for each_link in link[1:]]))
                        tasks['parent_name'] = parent_name
                        tasks['parent_id'] = parent_id

                        task_list = [tasks]

                if self.object_name == 'Shot':
                    p_obj_tasks = self.session.query('Task where parent.parent.id is "%s"' % parent_id)
                    p_task_list = self.create_task_list(p_obj_tasks)
                    if len(p_task_list) > 0:
                        task_list = task_list + p_task_list

                parent_dict[parent_id] = task_list

        return parent_dict

    def task_for_shot_asset_build(self, parent_id, parent_dict):
        obj_shot = self.session.query('Shot where id is "%s"' % parent_id).first()
        if obj_shot:
            for asset in obj_shot['incoming_links']:
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
            except ValueError:
                tasks['status'] = '---'
                tasks['parent_type'] = ''

            tasks['id'] = task['id']
            tasks['name'] = task['name']
            link = self.default_check(task['link'])
            parent_name = ('_'.join([each_link['name'] for each_link in link[1:-1]]))
            tasks['parent_name'] = parent_name
            tasks['parent_id'] = task['parent']['id']

            users = []
            for resource in task['assignments']:
                users.append(resource['resource']['username'])

            if not users:
                users = ['---']
            tasks['users'] = sorted(users)
            task_list.append(tasks)

        return task_list

    def task_query(self, parent_id=''):

        session = ase_session.Session()
        query = ''
        if (self.stereo_object == 1) and (self.object_name == 'Shot'):
            query = 'Task where parent.parent.parent.id is "%s"' % parent_id
        elif self.object_name == 'Shot':
            query = 'Task where parent.parent.id is "%s"' % parent_id
        elif self.object_name == 'Sequence':
            query = 'Task where project.id is "%s" and parent.type.name is "Sequence"' % parent_id
        elif self.object_name == 'Asset Build':
            query = 'Task where project.id is "%s" and parent.type.name is "%s"' % (parent_id, self.object_type)

        obj_task = session.query(query)
        return obj_task

    def task_status(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

#        self.get_user_columns(username)
        # if not self.master_login:
        #            return HttpResponseRedirect('/tasks/')

        task_hash = {}
        # projects = {}
        self.projects = self.get_projects()

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_temp_data = self.get_tasks_template()

        asset_types = self.get_asset_types()

        task_hash['task_temp_data'] = task_temp_data
        task_hash['asset_types'] = asset_types

        task_hash['data'] = {'projects': self.projects, 'columns': self.users_columns, 'user_role': self.user_role,
                             'all_tasks': self.all_tasks}

        statuses = self.all_status()
        ldap_users = self.ldap_users()

        task_hash['statuses'] = statuses
        task_hash['users'] = ldap_users
        task_hash['disabled_status'] = ','.join(self.disabled_statuses)

        task_hash['statement'] = 'Yahoooooooooooooooo'
        return render(request, 'task_status.html', task_hash)

    @staticmethod
    def get_project_path_versions(proj_name, shot_name, task_prefer, build_type):
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
        print(build_path)
        version_list = []
        if os.path.exists(build_path):
            for version in os.listdir(build_path):
                version_dict = dict()
                version_dict['version_name'] = version
                version_dict['version_path'] = os.path.join(build_path, version)
                version_list.append(version_dict)
        return version_list

    @staticmethod
    def get_client_side_versions(proj_name, shot_name, task_prefer, build_type):
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

        print(version_list)
        return version_list

    def show_task_details(self, type_name, task_id, task_assignee):

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
            details['parent_id'] = task_obj['parent_id']
            # for load task list
            if task_obj['object_type']['name'] == "Task":
                asset_task_dict = self.get_asset_task(task_obj['parent_id'])
            else:
                asset_task_dict = self.get_asset_task(task_id)

            details['asset_task_dict'] = asset_task_dict
            details['task_assignee'] = task_assignee

        details_list.append(details)

        return details_list

    def get_note_details(self, task_id, type_name, last_row, note_task, note_category=''):
        """
        Function to get details data for notes of task.
        :param task_id: Task id
        :param type_name: Object type
        :param last_row: Last row
        :param note_task: Task name
        :param note_category: Note category
        :return: List of dictionary of note data
        """
        print("--------get note details-------------")
        # print(task_id, type_name, last_row, note_task, note_category)
        self.reload_session()

        type_name = type_name.replace(' ', '')
        # query = ''
        if note_task:
            query = 'Task where parent_id is "%s" and id is "%s"' % (task_id, note_task)
        else:
            query = '%s where id is "%s"' % (type_name, task_id)

        task_obj = self.session.query(query).first()

        start_row = int(last_row) - 15
        last_row = int(last_row) - 1

        # for change in note category
        obj_notes = []
        if note_category and task_obj:
            obj_nts = task_obj['notes']  # [start_row:last_row]

            for note in obj_nts:
                cat = note['category']['name']
                if cat == note_category:
                    obj_notes.append(note)

            obj_notes = obj_notes[start_row:last_row]
        elif task_obj:
            obj_notes = task_obj['notes'][start_row:last_row]

        note_list = self.get_note_data(obj_notes)

        return note_list

    def get_link_details(self, task_id, type_name, project_name=''):
        """
        Function to get links details.
        :param task_id: Task id
        :param type_name: Object type name
        :param project_name: Project name
        :return: List of dictionay of linke data.
        """
        print("--------- get link----------")
        self.reload_session()

        # ----- old code -------
        type_name = type_name.replace(' ', '')
        task_obj = self.session.query('%s where id is "%s"' % (type_name, task_id)).first()
        if type_name == 'Task':
            obj_links = task_obj['parent']['incoming_links']
        else:
            obj_links = task_obj['incoming_links']

        links = list()
        for link in obj_links:
            link_dict = dict()
            link_dict['name'] = link['from']['name']
            if not link_dict['name']:
                continue
            link_dict['id'] = link['from']['id']
            links.append(link_dict)
        # -------
        # model_tasks_class = getModel(str(project_name) + '_tasks')
        # tsk_obj = model_tasks_class.objects.get(ftrack_id=task_id)
        # links = list()
        # if tsk_obj.links:
        #     for lnk in tsk_obj.links:
        #         task__link_obj = model_tasks_class.objects.get(ftrack_id=lnk)
        #         link_dict = dict()
        #         link_dict['name'] = task__link_obj.name
        #         link_dict['id'] = lnk
        #         to_name = project_name + ':' + task__link_obj.name + ':'
        #         model_notes_class = getModel(str(project_name) + '_notes')
        #         notes_obj = model_notes_class.objects.order_by('-added_on').filter(Q(to_name__startswith=to_name))
        #         data_list = list()
        #         for obj in notes_obj:
        #             data_dict = dict()
        #             data_dict['department'] = obj.task
        #             data_dict['status'] = obj.status
        #             data_dict['added_by'] = obj.added_by
        #             data_dict['added_on'] = str(obj.added_on).split('.')[0]
        #             # version
        #             path = obj.task_path
        #             task_path = path.replace(path.split(':')[-1], obj.pub_version)
        #             data_dict['task_path'] = task_path
        #             data_dict['note_text'] = obj.note_text
        #
        #             data_list.append(data_dict)
        #
        #         link_dict['notes'] = data_list
        #         # pprint(data_list)
        #         links.append(link_dict)

        return links

    def get_tab_link_details(self, task_id, type_name, project_name=''):
        """
        Function to get links details of a task.
        :param task_id: Task id
        :param type_name: Object type name
        :param project_name: Project name
        :return: List of dictionay of linke data.
        """
        print("--------- get link----------")
        self.reload_session()

        # ----- old code -------
        # type_name = type_name.replace(' ', '')
        # task_obj = self.session.query('%s where id is "%s"' % (type_name, task_id)).first()
        # if type_name == 'Task':
        #     obj_links = task_obj['parent']['incoming_links']
        # else:
        #     obj_links = task_obj['incoming_links']
        #
        # links = list()
        # for link in obj_links:
        #     link_dict = dict()
        #     link_dict['name'] = link['from']['name']
        #     link_dict['id'] = link['from']['id']
        #     links.append(link_dict)
        # -------
        model_tasks_class = getModel(str(project_name) + '_tasks')
        tsk_obj = model_tasks_class.objects.get(ftrack_id=task_id)
        links = list()
        if tsk_obj.links:
            for lnk in tsk_obj.links:
                task__link_obj = model_tasks_class.objects.get(ftrack_id=lnk)
                link_dict = dict()
                link_dict['name'] = task__link_obj.name
                link_dict['id'] = lnk
                to_name = project_name + ':' + task__link_obj.name + ':'
                model_notes_class = getModel(str(project_name) + '_notes')
                acitivity_obj = model_notes_class.objects.order_by('-added_on').filter(Q(to_name__startswith=to_name))
                data_list = list()
                for obj in acitivity_obj:
                    data_dict = dict()
                    data_dict['department'] = obj.task
                    data_dict['status'] = obj.status
                    data_dict['added_by'] = obj.added_by
                    data_dict['added_on'] = str(obj.added_on).split('.')[0]
                    # version
                    path = obj.task_path
                    task_path = path.replace(path.split(':')[-1], obj.pub_version)
                    data_dict['task_path'] = task_path
                    data_dict['note_text'] = obj.note_text

                    data_list.append(data_dict)

                link_dict['notes'] = data_list
                # pprint(data_list)
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

    def get_version_object(self, my_id, my_type, task, project='', path='', task_name='', first_row=0, last_row=15,
                           flag=''):
        """
        Function to get object of the version
        :param my_id: Task id
        :param my_type: Object type
        :param task: Task name
        :param project: Project name
        :param path: Task path
        :param task_name: Task name
        :param last_row: Last index
        :param first_row: Start index
        :return: List of dictionary of version data
        """
        query = ''
        # parent_id = ''
        if my_type == 'Sequence':
            parent_id = 'asset.parent.parent.id'
        elif my_type == 'Task':
            parent_id = 'task.id'
        else:
            parent_id = 'asset.parent.id'

        task_key = ''
        if task:
            task_key = "and task.id is '%s'" % task

        my_query = "AssetVersion where %s is '%s' %s order by date desc" % (parent_id, my_id, task_key)
        print(my_query)
        # query = self.session.query(my_query)
        path = str(path).replace(' ', '')
        #        task_name = str(task_name).replace(' ', '')

        path = path.replace(path.split(':')[0], path.split(':')[0].lower())

        if flag:
            db_table = str(project).strip() + '_versions'
            model_class = getModel(db_table)
            if task:
                q = Q(task_id=task)
            else:
                q = Q(task_path=path)
            version_obj = model_class.objects.order_by('-published_on').filter(q)[first_row:last_row]
        else:
            version_obj = self.session.query(my_query)

        query = version_obj
        return query

    def show_asset_versions(self, my_id, my_type, last_row, task, project='', path='', task_name=''):
        """
        Function to get the list of assset versions for task
        :param my_id: Task id
        :param my_type: Object type
        :param last_row: Last index
        :param task: Task name
        :param project: Project name
        :param path: Task path
        :param task_name: Task name
        :return: List of dictionary of version data
        """
        print("Asset versions : ", my_id, my_type, task, project, path, task_name)
        self.reload_session()

#        self.get_user_columns(self.username)

        query = self.get_version_object(my_id, my_type, task)

        len_query = len(query)

        last_row = int(last_row)
        first_row = last_row - 15
        last_row = last_row

        query = self.get_version_object(my_id, my_type, task, project, path, task_name, first_row, last_row, flag='version')

        # len_query = len(query)

        list_versions = list()
        if query:
            # for j in range(first_row, last_row):
            for i in query:
                # if j >= len_query:
                #     break

                # i = query[j]
                version_hash = dict()
                try:
                    version_hash['version_id'] = i['ftrack_id']
                    version_hash['version_name'] = i['name']
                    version_hash['asset_type'] = ''
                    if 'asset_type' in i:
                        version_hash['asset_type'] = i['asset_type']

                    version_hash['status_name'] = ''
                    if 'ftrack_status' in i:
                        version_hash['status_name'] = i['ftrack_status']

                    version_hash['published_on'] = ''
                    if 'published_on' in i:
                        version_hash['published_on'] = str(i['published_on']).split('.')[0]

                    version_hash['user_role'] = self.user_role

                    version_hash['comment'] = ''
                    if 'description' in i:
                        version_hash['comment'] = i['description']

                except ValueError:
                    print("Some version details missing ..")

                try:
                    version_hash['published_by'] = i['published_by']
                except:
                    version_hash['published_by'] = 'unknown'

                list_versions.append(version_hash)

        return list_versions

    def save_changes(self, data_list='', proj_id=''):

        if not data_list:
            return False

        data_list = json.loads(data_list)
        print('+++++++++++++++++++++++++++++++')
        print('%s : Change Data %s' % (self.username, data_list))

        obj_proj = self.session.query("Project where id is '%s'" % proj_id).first()
        project = obj_proj['name'].lower()

        collection = self.mongo_database['%s_tasks' % project]
        bulk = collection.initialize_ordered_bulk_op()

        for data in data_list:
            change_value = str(data[0])
            task_id = str(data[1])  # task parent id
            task_name = str(data[2])
            element_name = str(data[3])
            # task_note = str(data[4])
            parent_id = str(data[5])
            proj_id = str(data[6])
            object_type = str(data[7])
            row_org_val = str(data[8])

            if object_type:
                if object_type == 'Shot Asset Build':
                    object_type = 'Asset Build'
            object_type = object_type.replace(' ', '')

            obj_tasks = self.session.query('Task where id is "%s"' % task_id).first()
            if not obj_tasks:
                obj_tasks = self.create_new_task(element_name, change_value, parent_id, task_name, object_type)

            if obj_tasks:
                obj_tasks = obj_tasks

            if obj_tasks['name'] != task_name:  # sanity check
                continue

            # For changing status
            if element_name == 'Status':
                print("Old Status:", row_org_val, '+++++', "New Status:", change_value)

                status = change_value

                if row_org_val == status:
                    continue

                obj_status = self.session.query('Status where name is "%s"' % status).one()
                obj_tasks['status'] = obj_status

            if element_name == 'Users':
                print("Old Users:", row_org_val, '+++++', "New Users:", change_value)

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
                        self.session.commit()

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

    def create_new_ftrack_user(self, user_name):

        ftrack_user = self.session.query('User where username is "%s"' % user_name).first()
        if not ftrack_user:
            print(str(datetime.datetime.now()), ": Creating new Ftack user : %s" % user_name)
            data = dict()
            data['username'] = user_name
            data['first_name'] = user_name.split('.')[0]
            data['last_name'] = user_name.split('.')[-1]
            data['is_active'] = False
            data['email'] = '%s@intra.madassemblage.com' % user_name
            self.session.create('User', data)
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
                'ShotAssetBuild where id is "%s" and name is "Stereo"' % parent_id).first()
            if obj_shot_asset:
                obj_parent = obj_shot_asset
            else:
                obj_shot_asset = self.session.query(
                    'ShotAssetBuild where parent.id is "%s" and name is "Stereo"' % parent_id).first()
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

    def save_version_changes(self, data_list='', page=''):

        if not data_list:
            return False

        data_list = json.loads(data_list)
        print('+++++++++++++++++++++++++++++++')
        print('%s : Change Data %s' % (self.username, data_list))
        log_data_list = []
        for data in data_list:
            change_value = str(data[0])
            version_id = str(data[1])  # version id
            row_org_val = str(data[2])

            if (row_org_val == change_value) or not version_id:  # sanity check
                continue

            obj_status = self.session.query('Status where name is "%s"' % change_value).first()

            if obj_status:
                obj_version = self.session.query("AssetVersion where id is '%s'" % version_id).first()
                obj_version['status'] = obj_status
                # for logs
                path = (':'.join([each_link['name'] for each_link in obj_version['link']]))
                path = path.replace(path.split(':')[0], path.split(':')[0].lower())
                log_dict = dict()
                log_dict['project'] = path.split(":")[0]
                log_dict['action'] = "update"
                log_dict['object_type'] = 'AssetVersion'
                log_dict['sub_type'] = 'AssetVersion'
                log_dict['parent_id'] = obj_version['task_id']
                log_dict['path'] = path
                log_dict['page'] = page.strip()
                log_dict['ftrack_id'] = version_id
                log_dict['value'] = change_value
                log_dict['details_for'] = 'Status'
                log_data_list.append(log_dict)
        self.session.commit()
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'],
                                  details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])

    def object_change_status(self, new_status, old_status, object_id, status_for, page=''):
        """
        Function to change status of the task.
        :param new_status: New status
        :param old_status: Old status
        :param object_id: Selected object id
        :param status_for: Value of the entity for which the status changed.
        :param page: Current page name
        :return: None
        """
        if (new_status == old_status) or not object_id:
            return False

        print('+++++++++++++++++++++++++++++++')
        print('%s : Change Object Status :- %s : %s : %s ' % (self.username, new_status, object_id, status_for))

        obj_status = self.session.query('Status where name is "%s"' % new_status).first()

        project = 'ice'
        if status_for == 'AssetVersion':
            asset_version_obj = self.session.query("AssetVersion where id is '%s'" % object_id).first()
            parent_id = asset_version_obj['asset']['parent']['id']
            asset_reject_obj = self.session.query(
                "AssetVersion where asset.parent.id is '%s' order by date desc" % parent_id)
            flag_dict = {}
            for ele in asset_reject_obj:
                name = ele['link'][-1]['name']
                split_name = name.split(" ")[0] + ":" + ele['asset']['type']['name']
                if split_name not in flag_dict:
                    flag_dict[split_name] = 1
                    ele['status'] = obj_status
                else:
                    continue
        elif obj_status:
            status_for = status_for.replace(' ', '')
            query = "%s where id is '%s'" % (status_for, object_id)
            print(query)
            my_object = self.session.query(query).first()
            if not my_object:
                return False

            my_object['status'] = obj_status

            if status_for == 'AssetVersion':
                project = my_object['task']['project']['name']
            else:
                project = my_object['project']['name']

        self.session.commit()

        if status_for == 'Task':
            path = ''
            if my_object['_link']:
                path = (':'.join([each_link['name'] for each_link in my_object['_link']]))
                path = path.replace(path.split(':')[0], path.split(':')[0].lower())
            self.add_activity_log(project=project, value=new_status, ftrack_id=my_object['id'],
                                  action='update', object_type='Task', details_for='Status',
                                  sub_type='Task', parent_id=my_object['parent_id'],
                                  path=path, page=page.strip())

        elif status_for == 'AssetVersion':
            path = ''
            if asset_version_obj['link']:
                path = (':'.join([each_link['name'] for each_link in asset_version_obj['link']]))
                path = path.replace(path.split(':')[0], path.split(':')[0].lower())
            self.add_activity_log(project=project, value=new_status, ftrack_id=asset_version_obj['id'],
                                  action='update', object_type='AssetVersion', details_for='Status',
                                  sub_type=status_for, parent_id=asset_version_obj['task_id'],
                                  path=path, page=page.strip())

    def insert_db_note(self, note_text, note_category, object_id, change_status, users, task_path, pub_version,
                       from_name, to_name, page=''):
        """
        Function for adding note in database
        :param note_text: Note text
        :param note_category: Note category
        :param object_id: Selected object type id
        :param change_status: Changed task status
        :param users: Assigned user name
        :param task_path: Task path
        :param pub_version: Published version name
        :param from_name: Current task path
        :param to_name: Path of the task on which note added
        :param page: Current page value
        :return: None
        """

        # log_data_list = []
        if not task_path:
            return False

        proj = task_path.split(':')[0].lower()
        collection = self.mongo_database['%s_notes' % proj]

        search_key = dict()
        search_key['ftrack_id'] = object_id
        search_key['status'] = change_status

        version = 1

        cur_count = collection.find(search_key).count()
        if cur_count:
            latest_version = collection.find(search_key).sort('added_on', -1).limit(1)
            version = int(latest_version[0]['version']) + 1

        #        from_name = from_name.replace(from_name.split(':')[0], from_name.split(':')[0].lower())
        #        to_name = to_name.replace(to_name.split(':')[0], to_name.split(':')[0].lower())
        task_path = task_path.replace(task_path.split(':')[0], task_path.split(':')[0].lower())
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
        task_data['from_name'] = from_name
        task_data['to_name'] = to_name

        collection.insert_one(task_data)

        # Send reject email or approve mail
        approved_status = ['Client Approved', 'Ready to Publish', 'Outsource Approved', 'Outsource Client Approved', 'Final Publish', 'Internal Approved']

        if change_status in approved_status:
            print("************ Client Approved ****************")
            self.approve_mail(task_data)
        else:
            print("************ Client Reject ****************")
            self.reject_mail(task_data)

    def create_entity_note(self, note, object_id, note_category, note_for, note_task, attach_files, page=''):
        """
        Function to add note on task or version.
        :param note: Note text
        :param object_id: Selected object type id
        :param note_category: Note category
        :param note_for: Version or Task name
        :param note_task: Task name
        :param attach_files: File name attached with note.
        :param page: Current activity page
        :return: Dictionary of note
        """
        print("------- create note-------------")
        log_data_list = []
        if note != 'None':
            note_dict = {}
            obj_cat = self.session.query('NoteCategory where name is "%s"' % note_category).first()
            if object_id:
                user = self.session.query('User where username is "%s"' % self.username).first()

                note_for = note_for.replace(' ', '')
                # query = ''
                if note_task:
                    query = 'Task where parent_id is "%s" and id is "%s"' % (object_id, note_task)
                else:
                    query = '%s where id is "%s"' % (note_for, object_id)

                print(query)
                print("Note :- %s : %s" % (note_for, object_id))

                my_obj = self.session.query(query).first()
                if not my_obj:
                    return False

                obj_note = my_obj.create_note(note, user, category=obj_cat)

                # for activity logs
                # for k, v in my_obj.items():
                #     print(k, ": ", v)

                path = ''
                if my_obj['link']:
                    path = (':'.join([each_link['name'] for each_link in my_obj['link']]))
                    path = path.replace(path.split(':')[0], path.split(':')[0].lower())

                log_dict = dict()
                log_dict['project'] = path.split(':')[0]
                log_dict['action'] = 'add'
                log_dict['object_type'] = note_for
                log_dict['sub_type'] = note_for
                log_dict['parent_id'] = object_id # my_obj['parent_id']
                log_dict['path'] = path
                log_dict['page'] = page.strip()
                log_dict['ftrack_id'] = my_obj['id']
                log_dict['value'] = note
                log_dict['details_for'] = 'Note'
                log_data_list.append(log_dict)

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
                note_dict = {"note_id": obj_note['id']}
                # call logs
                for log in log_data_list:
                    self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                          action=log['action'], object_type=log['object_type'],
                                          details_for=log['details_for'],
                                          sub_type=log['sub_type'], parent_id=log['parent_id'],
                                          path=log['path'], page=log['page'])

        return note_dict

    def reply_note(self, reply_text, note_id):
        """
        Function for reply on version notes.
        :param reply_text: Message text
        :param note_id: Note id of the replied note
        :return: None
        """
        if reply_text != 'None':
            if note_id:
                try:
                    user = self.session.query('User where username is "%s"' % self.username).one()
                    note_object = self.session.query('Note where id is "%s"' % note_id).one()
                    note_object.create_reply(reply_text, user)

                    self.session.commit()
                    # for send mail
                    details = dict()
                    details['users'] = note_object['author']['username']
                    details['added_by'] = self.username
                    details['note_text'] = reply_text
                    details['category'] = note_object['category']['name']
                    details['added_on'] = datetime.datetime.now()
                    #
                    parent = self.session.query(
                        "%s where id is '%s'" % (note_object['parent_type'], note_object['parent_id'])).first()
                    path_list = map(lambda x: x['name'], parent['_link'])
                    # comments_hash['note_info'] = ' / '.join(path_list)
                    #
                    details['task_path'] = ' / '.join(path_list)
                    details['task_name'] = parent['task']['type']['name']

                    self.reply_mail(details)
                except Exception as e:
                    print e.message

    def reply_mail(self, details):
        """
        Function for send mail on reply note.
        :param details: Detail data for send mail.
        :return: None
        """
        print("------------------- reply mail function ------------------------------")
        if 'users' not in details:
            print("No user found to send a reject mail")

        subject = 'Task Note Reply (' + details['task_path'] + ')'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        user_list = details['users'].split(',')
        to_list = list()

        for user in user_list:
            user = user.strip()
            to_list.append(user + '@intra.madassemblage.com')

        # to_list.append(from_addr + '@intra.madassemblage.com')
        to_addr = ','.join(to_list)
        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com,' \
                  'vikas.bhargav@intra.madassemblage.com,kunal.jamdade@intra.madassemblage.com'
        htmlhead = """
        Hello, </br> Your task has been done with below details ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['task_path'])
        htmlbody = ''
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Task</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['task_name']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reply Note</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reply by</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['added_by'].replace('.', ' ').title()
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reply</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['added_on']).split('.')[0]
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Category</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['category'])
        htmltail = """
                </tbody>
            </table>
            </td>
            </tr>
            </table>
            <br>
            Regards,</br> %s
        """ % details['added_by'].replace('.', ' ').title()
        mail_body = htmlhead + htmlbody + htmltail

        self.send_email(subject, from_addr, to_addr, cc_addr, mail_body)

    def get_version_notes(self, my_id, my_type, last_row, task, note_category='', project='', path='', task_name=''):
        """
        Function to get the note data for the version
        :param my_id: Task id
        :param my_type: Selected object type
        :param last_row: Index of last row
        :param task: Task name
        :param note_category: Category of note
        :param project: Project name
        :param path: Task path
        :param task_name: Task name
        :return: List of notes data
        """
        # self.reload_session()
        # # query = self.get_version_object(my_id, my_type, task, project, path, task_name)
        if last_row == 15:
            self.reload_session()
        last_row = int(last_row)
        first_row = last_row - 15
        last_row = last_row - 1
        query = self.get_version_object(my_id, my_type, task, project, path, task_name, first_row, last_row)
        note_list = list()
        if query:
            for i in query:
                if i['notes']:
                    obj_notes = []
                    if note_category:
                        print("len obj_notes: ", len(i['notes']))

                        for note in i['notes']:
                            cat = note['category']['name']
                            if cat == note_category:
                                obj_notes.append(note)

                        print(len(obj_notes))

                        obj_notes = obj_notes

                        note_list = note_list + self.get_note_data(obj_notes)

                    else:
                        note_list = note_list + self.get_note_data(i['notes'])
                    # note_list = note_list + self.get_note_data(i['notes'], note_category)

        len_notes = len(note_list)

        note_list = sorted(note_list, key=lambda x: datetime.datetime.strptime(x['note_date'], '%d-%m-%Y %H:%M'),
                           reverse=True)
        note_data = list()
        if len_notes:
            note_data = note_list[first_row:last_row]

        return note_data

    def all_status(self):

        status_list = list()

        project_schemas = self.session.query("ProjectSchema")[3]
        task_status_object = project_schemas.get_statuses("Task")

        time.sleep(1)
        for status in task_status_object:
            if status['name']:
                status_list.append({'name': status['name'], 'id': status['id']})

        status_list = sorted(status_list, key=lambda x: x['name'])
        return status_list

    def get_asset_versions(self, object_id, task_id, asset_type, object_type):

        parent = 'asset.parent.id'

        if object_type == 'Sequence':
            parent = 'asset.parent.parent.id'
        elif object_type == 'Task':
            parent = 'task_id'

        my_query = "AssetVersion where %s is '%s' and task.id is '%s' and asset.type.name is '%s' order by date desc" \
                   % (parent, object_id, task_id, asset_type)

        print(my_query)
        versions = self.session.query(my_query)

        ver_list = []
        duplicate = dict()
        for ver in versions:
            if len(ver['link']) > 2:
                name = ver['link'][-1]['name'].split(' ')[0]
                if name in duplicate:
                    continue
                ver_list.append({'name': ver['link'][-1]['name'], 'id': ver['link'][-1]['id']})
                duplicate[name] = 1

        ver_list = sorted(ver_list, key=lambda x: x['name'], reverse=True)
        return ver_list

    def get_asset_task(self, task_parent_id):

        my_query = "Task where parent_id is '%s'" % task_parent_id
        tasks = self.session.query(my_query)
        tasks_dict = {}
        for tsk in tasks:
            tasks_dict[tsk['id']] = tsk['name']

        # ver_list = sorted(ver_list, key=lambda x: x['name'], reverse=True)
        return tasks_dict

    def get_tasks_template(self):

        json_data = {}
        if os.path.isfile(self.task_template_jfile):
            data_file = open(self.task_template_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        return json_data

    def get_email_address(self):

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

#        self.get_user_columns(username)

        # Current Project
        project = 'ice'
        status = ''

        # Get task details
        task_hash = {}
        task_list = self.get_artist_tasks(username, project, status)

        task_hash['tasks'] = task_list
        asset_types = self.get_asset_types()
        task_hash['asset_types'] = asset_types

        statuses = self.all_status()

        task_hash['statuses'] = statuses

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'all_tasks': self.all_tasks,
                             'project': project}

        return render(request, 'artist_tasks.html', task_hash)

    @staticmethod
    def attach_upload_files(request):

        # data = dict()
        form = AttachmentForm(request.POST, request.FILES)
        if form.is_valid():
            photo = form.save()
            name = os.path.basename(photo.file.name)
            data = {'is_valid': True, 'name': name, 'url': photo.file.url}
        else:
            data = {'is_valid': False}
        return data

    def show_upload_data(self, file_path, entity, parent_id, project):

        csv_file = PROJ_BASE_DIR + '/' + file_path
        print(csv_file, entity, parent_id, project)

        csv_data = dict()
        if os.path.isfile(csv_file):
            with open(csv_file, 'rb') as csvfile:
                reader = csv.reader(csvfile, delimiter=',')
                csv_data_list = list()
                if entity == 'AssetBuild':
                    csv_data_list = self.asset_csv_data_validation(reader, project)
                elif entity == 'Shot':
                    csv_data_list = self.shot_csv_data_validation(reader, project, parent_id)

                csv_data[entity] = csv_data_list

        # Delete uploaded files after adding
        for attach in Attachment.objects.all():
            if attach.file.url == file_path:
                attach.file.delete()
                attach.delete()

        return csv_data

    def asset_csv_data_validation(self, reader, project):
        """
        Function to validate data inside csv file to upload
        :param reader: List of rows from csv file.
        :param project: Project name
        :return: CSV data list
        """
        duplicate = dict()
        csv_data_list = list()
        asset_types = ['Set', 'FX', 'Prop', 'Character', 'Vehicle', 'Environment']
        prg = re.compile("^[0-9a-zA-Z]+$")
        for row in reader:
            if not row[0]:
                continue

            invalid = 0
            name = row[0]
            name = name.strip()
            name = name.replace(" ", "")
            val_match = prg.match(name)
            if not val_match:
                invalid = 1
            asset_type = ''
            desc = 'New Asset Created'
            if len(row) > 1:
                asset_type = row[1].strip()
                desc = row[2]
                val_match = prg.match(asset_type)

                if val_match is None:
                    invalid = 1
                asset_type = asset_type.title()
                if asset_type not in asset_types:
                    invalid = 1

            if self.duplicate_name_check(name, project, asset_type, '', 'asset_name') is True:
                invalid = 1

            # val_match = prg.match(asset_type)
            # if not val_match:
            #     invalid = 1

            # asset_type = asset_type.title()
            #
            # if asset_type not in asset_types:
            #     invalid = 1

            if name in duplicate:
                invalid = 1

            # val_match = prg.match(row[2])
            # if not val_match:
            #     invalid = 1

            csv_data_list.append(
                {'asset_name': name, 'asset_type': asset_type, 'description': desc, 'invalid': invalid})
            duplicate[name] = 1

        return csv_data_list

    def shot_csv_data_validation(self, reader, project, parent_id):
        duplicate = dict()
        csv_data_list = list()
        prg = re.compile("^[0-9]+$")
        for row in reader:
            invalid = 0
            name = row[0]
            name = name.strip()
            name = name.replace(' ', '')
            val = prg.match(name)
            if val:
                name = int(name)
                name = "%04d" % name
            else:
                invalid = 1
            if self.duplicate_name_check(name, project, parent_id, '', 'shot_name') is True:
                invalid = 1
            start_frame = row[1]
            end_frame = row[2]
            if not (start_frame and end_frame):
                invalid = 1
            else:
                if not re.match('^\d+$', start_frame):
                    invalid = 1
                else:
                    start_frame = int(start_frame)

                if not re.match('^\d+$', end_frame):
                    invalid = 1
                else:
                    end_frame = int(end_frame)

                if isinstance(start_frame, int) and isinstance(end_frame, int):
                    if end_frame < start_frame:
                        invalid = 1

            # description = row[3]
            # if not re.match('^[0-9a-zA-Z]+$', description):
            #     invalid = 1
            if name in duplicate:
                invalid = 1

            csv_data_list.append(
                {'shot_name': name, 'start_frame': start_frame, 'end_frame': end_frame, 'description': row[3],
                 'invalid': invalid})
            duplicate[name] = 1

        return csv_data_list

    def create_entity_from_csv(self, data_list, parent_id, project, entity):
        """
        Function to create entities like AssetBuild or Shot using csv file.
        :param data_list: List of new entities
        :param parent_id: Parent name of the entity
        :param project: Project name
        :param entity: Entity type like AssetBuild or Shot
        :return: Success message
        """
        if data_list:
            data_list = json.loads(data_list)

        proj_col = self.mongo_database[project + '_tasks']

        cursor = proj_col.find_one({'ftrack_id': parent_id})

        object_type = cursor['object_type']
        obj_parent = self.session.query('%s where id is "%s"' % (object_type, parent_id)).first()

        msg = ''
        if entity == 'AssetBuild':
            self.create_asset_build_query(data_list, obj_parent, proj_col)
            msg = "Asset Build Successfully Created"

        if entity == 'Shot':
            self.create_shot_query(data_list, obj_parent, proj_col)
            msg = "Shot Successfully Created"

        return {'message': msg}

    def create_asset_build_query(self, data_list, obj_parent, proj_col):
        for each_asset in data_list:
            row = each_asset.split('|')
            name = row[0].strip()
            asset_type = row[1].strip()
            desc = row[2].strip()

            exist = proj_col.find_one({'name': name})

            if exist:
                print("Asset Build [%s] exists, so skipping ..." % name)
                continue

            print(name, asset_type, desc)
            type_obj = self.session.query('Type where name is "%s"' % asset_type).first()
            self.session.create('AssetBuild', {
                'name': name,
                'parent': obj_parent,
                'type': type_obj,
                'description': desc
            })

        self.session.commit()

    def create_shot_query(self, data_list, obj_parent, proj_col):
        for each_shot in data_list:
            row = each_shot.split('|')
            name = row[0].strip()
            start_frame = int(row[1].strip())
            end_frame = int(row[2].strip())
            desc = row[3]

            exist = proj_col.find_one({'name': name})

            if exist:
                print("Shot [%s] exists, so skipping ..." % name)
                continue

            shot = self.session.create('Shot', {
                'name': name,
                'parent': obj_parent,
                'description': desc
            })
            shot['custom_attributes']['fstart'] = start_frame
            shot['custom_attributes']['fend'] = end_frame

        self.session.commit()

    def review_tasks(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = {}

        project = 'ice'

        #       task_list = self.get_review_tasks(project)
        #       task_hash['tasks'] = task_list

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'project': project,
                             'review_status': self.review_statuses}

        return render(request, 'review_tasks.html', task_hash)

    def show_task_entities(self, request):
        """
        Function to show details about the task
        :param request:
        :return:
        """
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = dict()

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        objects = ['Asset Build', 'Shot', 'Sequence']
        asset_type = ['Set', 'Character', 'Prop', 'Vehicle', 'FX']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'objects': objects,
                             'asset_type': asset_type}
        statuses = self.all_status()
        ldap_users = self.ldap_users()

        task_hash['statuses'] = statuses
        task_hash['users'] = ldap_users
        bid_range = self.get_range(0.0, 20.0, 0.25)
        bids = [str(i).replace(".0", "") for i in bid_range]
        task_hash['bids'] = bids

        task_hash['stf_range'] = ["%03d" % x for x in range(101, 9999)]  # self.range_sq_sc('sq', "")
        task_hash['enf_range'] = ["%03d" % x for x in range(101, 9999)]  # self.range_sq_sc('sq', "")
        asset_types = self.get_asset_types()
        task_hash['asset_types'] = asset_types

        return render(request, 'show_task_entities.html', task_hash)

    def create_entities(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).first()
        self.user = user

#        self.user_role = ''
#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = {}

        task_temp_data = self.get_tasks_template()
        asset_types = self.get_asset_types()

        task_hash['task_temp_data'] = task_temp_data
        task_hash['asset_types'] = asset_types

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        self.projects = self.get_projects()
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']

        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role}

        statuses = self.all_status()
        list_statuses = list()

        for ele in statuses:
            list_statuses.append((ele['name'], ele['name']))

        if request.method == "POST":
            project_creation_form = CreateProject(request.POST)
            shot_creation_form = CreateShot(request.POST)
            sequence_creation_form = CreateSequence(request.POST)
            asset_creation_form = CreateAsset(request.POST)
            task_creation_form = CreateTask(request.POST, list_statuses)

            if shot_creation_form.is_valid() and project_creation_form.is_valid() \
                    and sequence_creation_form.is_valid() and asset_creation_form.is_valid() \
                    and task_creation_form.is_valid():
                return HttpResponseRedirect('create_entities.html')
        else:
            project_creation_form = CreateProject()
            shot_creation_form = CreateShot()
            sequence_creation_form = CreateSequence()
            asset_creation_form = CreateAsset()
            task_creation_form = CreateTask(list_statuses)

        task_hash['shot_form'] = shot_creation_form
        task_hash['project_form'] = project_creation_form
        task_hash['sequence_form'] = sequence_creation_form
        task_hash['asset_form'] = asset_creation_form
        task_hash['task_form'] = task_creation_form

        return render(request, 'create_entities.html', task_hash)

    def sup_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

#        self.get_user_columns(username)

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect('/tasks/')
        # Get task details
        task_hash = {}

        self.projects = self.get_projects()

        project = 'ice'
        duration = 'Monthly'
        # task = 'all'

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

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'durations': self.durations,
                             'reports': reports, 'all_tasks': self.all_tasks}

        return render(request, 'dashboard.html', task_hash)

    def month_wise_reports(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = dict()

        project = 'ice'

        task_temp_data = self.get_tasks_template()

        task_hash['task_temp_data'] = task_temp_data

        self.projects = self.get_projects()

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'current_project': project}

        return render(request, 'month_wise_reports.html', task_hash)

    def mgm_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_session()
        user = self.session.query('User where username is "%s"' % username).one()
        self.user = user

#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = dict()

        project = 'ice'

        task_temp_data = self.get_tasks_template()

        task_hash['task_temp_data'] = task_temp_data

        task_hash['shot_data'] = {"_".join(element.split(" ")): element for element in
                                  task_temp_data['Shot']['Static shot']}

        task_hash['asset_build'] = {"_".join(element.split(" ")): element for element in
                                    task_temp_data['Shot']['All Asset Build']}

        self.projects = self.get_projects()

        status = {"Internal": "Internal", "OutSource": "OutSource"}
#        self.get_user_details()

        task_hash['emp_code'] = 'blank'

        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_hash['first_name'] = user['first_name']
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'current_project': project,
                             'status': status}

        return render(request, 'mgm_dashboard.html', task_hash)

    def artist_productivity(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

#        self.get_user_columns(username)

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = {}

        projects = self.get_projects()

        ldap_users = self.ldap_users()

        project = 'ice'
        duration = 'Monthly'
        # artist = 'all'

        # today = datetime.date.today()
        # this_month_first = today.replace(day=1)
        # last = this_month_first - datetime.timedelta(days=1)
        # first = last.replace(day=1)

        reports = dict()
        reports['project'] = project
        reports['duration'] = duration

        #        task_hash['reports'] = self.get_artist_productivity_reports(project, first, last, artist)

#        self.get_user_details()
        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()
        task_hash['data'] = {'projects': projects, 'user_role': self.user_role, 'durations': self.durations,
                             'reports': reports, 'current_project': project, 'all_users': ldap_users,
                             'all_tasks': self.all_tasks}

        return render(request, 'artist_productivity.html', task_hash)

    def get_month_wise_reports(self, project='ice', first='', last='', parent_object_type='Asset Build', months=''):

        print(project, first, last)

        data_list = list()
        if not (first and last):
            return data_list
        else:
            first = str(first) + ' 00:00:00'
            last = str(last) + ' 23:59:59'

        task_col = self.mongo_database[project + '_tasks']

        match_dict = {
            'updated_on': {'$exists': True},
            'parent_object_type': parent_object_type,
            'name': {"$in": ['Modeling', 'Texturing', 'Rigging', 'CFX', 'Set Dressing', 'Blend Shape']}
        }

        aggregate = [{
            "$match": match_dict
        },
            {
                "$project": {
                    "name": 1,
                    "path": 1,
                    "parent_type": 1,
                    "ftrack_status": 1,
                    "month": {"$month": "$updated_on"},
                    "year": {"$year": "$updated_on"}
                }
            },
            {
                "$group": {
                    "_id": {"name": "$name", "type": "$type", "status": "$ftrack_status", "month": "$month",
                            "year": "$year", "type": "$parent_type"},
                    "total": {"$sum": 1},
                    "path": {"$addToSet": "$path"}
                }
            }]

        data_cursor = task_col.aggregate(aggregate)

        status_keys = ['WIP', 'Internal', 'Approved', 'Review']

        task_data = dict()
        for each in data_cursor:
            month = self.months_str[each['_id']['month']] + '-' + str(each['_id']['year'])
            parent_type = each['_id']['type']
            ftrack_status = each['_id']['status']
            total = int(each['total'])

            task = each['_id']['name']
            self.initialize_asset_month(task_data, task, status_keys, month, parent_type)
            self.calculate_asset_month(task_data, task, each, ftrack_status, month, parent_type, total)

            task = 'Gross'
            self.initialize_asset_month(task_data, task, status_keys, month, parent_type)
            self.calculate_asset_month(task_data, task, each, ftrack_status, month, parent_type, total)


	# For Shot Tab
        shot_data_cursor = task_col.find(
            {"object_type": 'Task', "parent_object_type": "Shot",
             "updated_on": {"$exists": True},
             'name': {"$in": ['Layout', 'Animation', 'Lighting']},
             }, {"_id": 0, "parent_object_type": 1, "path": 1, "name": 1,
                 "ftrack_status": 1, "updated_on": 1})

        shot_data = dict()
        for element in shot_data_cursor:
            task_name = element['name']
            updated_date = element['updated_on']
            format_date = datetime.datetime.strftime(datetime.datetime.strptime(str(updated_date).split(".")[0],
                                                                                "%Y-%m-%d ""%H:%M:%S"), "%Y/%-m/%-d")
            month = self.months_str[int(format_date.split("/")[1])] + "-" + format_date.split("/")[0]
            ftrack_status = element['ftrack_status']

            sequence_name = element['path'].split(":")[1]
            self.initialize_asset_month(shot_data, sequence_name, status_keys, month, task_name)
            self.calculate_asset_month(shot_data, sequence_name, element, ftrack_status, month, task_name, 1)

            task = 'Gross'
            self.initialize_asset_month(shot_data, task, status_keys, month, task_name)
            self.calculate_asset_month(shot_data, task, element, ftrack_status, month, task_name, 1)

        data_list.append({'asset_build': task_data, 'shot': shot_data})

#        pprint(data_list)

        return sorted(data_list)

    def initialize_asset_month(self, task_data, task, status_keys, month, parent_type):

        if task and parent_type and month:

            if task not in task_data:
                task_data[task] = dict()
                task_data[task]['Total'] = 0
                task_data[task]['Percent'] = 0
                task_data[task]['Done'] = 0

		for m_key in status_keys:
		    task_data[task][m_key] = 0

            if parent_type not in task_data[task]:
                task_data[task][parent_type] = dict()
                task_data[task][parent_type]['Total'] = 0
                task_data[task][parent_type]['Percent'] = 0
                task_data[task][parent_type]['Done'] = 0

		for m_key in status_keys:
		    task_data[task][parent_type][m_key] = 0

            if month not in task_data[task]:
                task_data[task][month] = dict()
                task_data[task][month]['Total'] = dict()
                task_data[task][month]['Total']['Count'] = 0
                task_data[task][month]['Total']['Task'] = list()

		for m_key in status_keys:
		    if m_key not in task_data[task][month]:
			task_data[task][month][m_key] = dict()
			task_data[task][month][m_key]['Count'] = 0
			task_data[task][month][m_key]['Task'] = list()

            if month not in task_data[task][parent_type]:
                task_data[task][parent_type][month] = dict()
                task_data[task][parent_type][month]['Count'] = 0
                task_data[task][parent_type][month]['Total'] = dict()
                task_data[task][parent_type][month]['Total']['Count'] = 0
                task_data[task][parent_type][month]['Total']['Task'] = list()

		for m_key in status_keys:
		    if m_key not in task_data[task][parent_type][month]:
			task_data[task][parent_type][month][m_key] = dict()
			task_data[task][parent_type][month][m_key]['Count'] = 0
			task_data[task][parent_type][month][m_key]['Total'] = 0
			task_data[task][parent_type][month][m_key]['Task'] = list()

    def calculate_asset_month(self, task_data, task, each, ftrack_status, month, parent_type, total):

        path = each['path']

	report_status = 'WIP'
        if ftrack_status == 'Internal Approved':
            report_status = 'Internal'
        elif ftrack_status == 'Pending Client Review':
            report_status = 'Review'
        elif ftrack_status == 'Client approved':
            report_status = 'Approved'
        elif ftrack_status == 'In progress':
            report_status = 'WIP'
        else:
            return task_data

        if task and parent_type and month and total:
	    if report_status != 'WIP':
		task_data[task]['Done'] += total
		task_data[task][parent_type]['Done'] += total

            task_data[task]['Total'] += total
            task_data[task][report_status] += total
            task_data[task]['Percent'] = (task_data[task]['Done'] * 100) / task_data[task]['Total']

            task_data[task][month]['Total']['Count'] += total
            task_data[task][month][report_status]['Count'] += total

            task_data[task][parent_type]['Total'] += total
            task_data[task][parent_type][report_status] += total

            task_data[task][parent_type]['Percent'] = (task_data[task][parent_type]['Done'] * 100) / task_data[task][parent_type]['Total']

            task_data[task][parent_type][month][report_status]['Count'] += total
            task_data[task][parent_type][month]['Total']['Count'] += total
            task_data[task][parent_type][month]['Count'] += total

            if isinstance(path, list):
                task_data[task][month][report_status]['Task'].append([ele.split(":")[1] for ele in path])
                task_data[task][parent_type][month][report_status]['Task'] += [new_ele.split(":")[1] for new_ele in
                                                                               (set(path))]
                task_data[task][parent_type][month]['Total']['Task'] += [ele.split(":")[1] for ele in set(path)]

                task_data[task][month]['Total']['Task'] += [new_ele.split(":")[1] for new_ele in (set(path))]
            else:
                task_data[task][month][report_status]['Task'].append(str(path))
                task_data[task][parent_type][month][report_status]['Task'].append(str(path))
                task_data[task][parent_type][month]['Total']['Task'].append(str(path))
                task_data[task][month]['Total']['Task'].append(str(path))

	    task_data[task][month][report_status]['Task'] = sorted(task_data[task][month][report_status]['Task'])
            task_data[task][parent_type][month][report_status]['Task'] = sorted(task_data[task][parent_type][month][report_status]['Task'])
            task_data[task][parent_type][month]['Total']['Task'] = sorted(task_data[task][parent_type][month]['Total']['Task'])
            task_data[task][month]['Total']['Task'] = sorted(task_data[task][month]['Total']['Task'])

    def get_artist_productivity_reports(self, project='ice', first='', last='', artist='all', task_name='all'):

        print(project, first, last, artist)
        daily_task_col = self.mongo_database[project + '_daily_task_details']

        task_user_reports = dict()
        if not daily_task_col:
            return task_user_reports

        match_dict = dict()
        if first and last:
            first = str(first) + ' 00:00:00'
            last = str(last) + ' 23:59:59'

            startdate = datetime.datetime.strptime(str(first), '%Y-%m-%d %H:%M:%S')
            enddate = datetime.datetime.strptime(str(last), '%Y-%m-%d %H:%M:%S')

            match_dict = {
                'start_date': {'$gte': startdate}, 'stop_date': {'$lte': enddate}
            }

        if artist != 'all':
            match_dict['user'] = artist
        if task_name != 'all':
            match_dict['task_name'] = task_name
        aggregate = [{
            "$match": match_dict
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
                    "total": {"$sum": "$dateDifference"},
                }
            }]

        data = daily_task_col.aggregate(aggregate)
        obj_col = self.mongo_database[project + '_tasks']

        artist_data = dict()

        one_bid = 10 * 60 * 60

        cur_proj = obj_col.find_one({'name': project, 'object_type': 'Project'}) or ''

        for each in data:
            task = each['_id']['task']

            cur_task = obj_col.find_one({'path': task})

            if 'parent_object_type' not in cur_task:
                continue

            parent_object_type = cur_task['parent_object_type'].replace(' ', '_')

            user = each['_id']['user']
            actual_bid = round(float(each['total'] / 1000) / one_bid, 2)

            # Priority data
            priority = 'Low'
            if 'priority' in cur_task and cur_task['priority'] != 'None':
                priority = cur_task['priority']

            if parent_object_type not in artist_data:
                artist_data[parent_object_type] = dict()

            if user not in artist_data[parent_object_type]:
                artist_data[parent_object_type][user] = dict()

            if priority not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user][priority] = dict()

            if 'task_count' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['task_count'] = 0

            if 'task_count' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['task_count'] = 0

            artist_data[parent_object_type][user]['task_count'] = artist_data[parent_object_type][user][
                                                                      'task_count'] + 1
            artist_data[parent_object_type][user][priority]['task_count'] = \
                artist_data[parent_object_type][user][priority]['task_count'] + 1

            if 'bid_days' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['bid_days'] = 0

            if 'bid_days' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['bid_days'] = 0

            bid = 0
            if 'bid' in cur_task:
                bid = round(cur_task['bid'] / one_bid, 2)

            artist_data[parent_object_type][user]['bid_days'] = round(
                artist_data[parent_object_type][user]['bid_days'] + bid, 2)
            artist_data[parent_object_type][user][priority]['bid_days'] = round(
                artist_data[parent_object_type][user][priority]['bid_days'] + bid, 2)

            if 'actual_bid' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['actual_bid'] = 0

            if 'actual_bid' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['actual_bid'] = 0

            artist_data[parent_object_type][user]['actual_bid'] = round(
                artist_data[parent_object_type][user]['actual_bid'] + actual_bid, 2)
            artist_data[parent_object_type][user][priority]['actual_bid'] = round(
                artist_data[parent_object_type][user][priority]['actual_bid'] + actual_bid, 2)

            if 'variance' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['variance'] = 0

            if 'variance' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['variance'] = 0

            variance = round(float(bid - actual_bid), 2)
            artist_data[parent_object_type][user]['variance'] = round(
                artist_data[parent_object_type][user]['variance'] + variance, 2)
            artist_data[parent_object_type][user][priority]['variance'] = round(
                artist_data[parent_object_type][user][priority]['variance'] + variance, 2)

            if 'tasks' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['tasks'] = list()

            if 'tasks' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['tasks'] = list()

            mod_task = {"task_name": task, "bid": bid, "actual_bid": actual_bid}  # task
            # mod_task = cur_task['parent_type']+':'+task
            artist_data[parent_object_type][user]['tasks'].append(mod_task)
            artist_data[parent_object_type][user][priority]['tasks'].append(mod_task)

            if 'frame_sec' not in artist_data[parent_object_type][user]:
                artist_data[parent_object_type][user]['frame_sec'] = 0

            if 'frame_sec' not in artist_data[parent_object_type][user][priority]:
                artist_data[parent_object_type][user][priority]['frame_sec'] = 0

            parent = ':'.join(task.split(':')[:-1])

            cur_parent = obj_col.find_one({'path': parent}) or ''

            totalframe = 0
            if 'startframe' in cur_parent and "endframe" in cur_parent:
                # noinspection PyTypeChecker
                startframe = float(cur_parent["startframe"])
                endframe = float(cur_parent["endframe"])
                totalframe = endframe - (startframe - 1)

            fps = 0
            if 'fps' in cur_proj:
                fps = int(cur_proj["fps"])

            ftrack_status = ''
            if 'ftrack_status' in cur_task:
                ftrack_status = cur_task['ftrack_status']

            if ftrack_status not in ['In progress', 'Ready to start']:
                try:
                    total_sec = round(float(totalframe) / fps, 2)
                    artist_data[parent_object_type][user]['frame_sec'] = round(
                        artist_data[parent_object_type][user]['frame_sec'] + total_sec, 2)
                    artist_data[parent_object_type][user][priority]['frame_sec'] = round(
                        artist_data[parent_object_type][user][priority]['frame_sec'] + total_sec, 2)
                except ValueError:
                    pass

            try:
                artist_data[parent_object_type][user]['avg_per_day'] = round(
                    artist_data[parent_object_type][user]['frame_sec'] /
                    artist_data[parent_object_type][user]['actual_bid'], 2)
                artist_data[parent_object_type][user][priority]['avg_per_day'] = round(
                    artist_data[parent_object_type][user][priority]['frame_sec'] /
                    artist_data[parent_object_type][user][priority]['actual_bid'], 2)
            except:
                artist_data[parent_object_type][user]['avg_per_day'] = 0.00
                artist_data[parent_object_type][user][priority]['avg_per_day'] = 0.00

        data_list = list()

        complexity = ['Urgent', 'High', 'Medium', 'Low']
        default_priority = {'actual_bid': 0.00,
                            'avg_per_day': 0.00,
                            'bid_days': 0.00,
                            'frame_sec': 0.00,
                            'task_count': 0,
                            'tasks': [],
                            'variance': 00.00}

        artist_prod_obj_type = dict()
        for p_obj_type, data in artist_data.items():
            artist_prod_obj_type[p_obj_type] = list()
            for key, value in data.items():
                # artist_prod = dict()
                artist_prod = value

                for each in complexity:
                    if each not in artist_prod:
                        artist_prod[each] = default_priority

                user = key.replace('.', ' ')
                artist_prod['artist'] = user.title()
                artist_prod_obj_type[p_obj_type].append(artist_prod)

        data_list.append(artist_prod_obj_type)

        return data_list

    def get_project_details(self, work_status, project='ice'):

        data = self.get_tasks_template()
        shot_task_list = data['Shot']['Static shot']
        asset_build_task_list = data['Shot']['All Asset Build']

        task_col = self.mongo_database[project + '_tasks']

        find_cur = task_col.find({"object_type": "Task", "parent_object_type": {"$exists": "true"}})

        sequence_dict = dict()
        asset_dict = dict()
        user_dict = dict()
        user_dict['total_users'] = dict()

        shot_type = ['Shot', 'Shot Asset Build']
        asset_type = ['Asset Build']

        shot_flag = dict()
        asset_flag = dict()
        outsource_sequence_dict = {}
        outsource_asset_dict = {}
        outsource_shot_flag = {}
        outsource_asset_flag = {}

        for each in find_cur:

            task = each['path']
            parent_type = each['parent_type']
            task_status = each['ftrack_status']
            user_name = '-'
            if 'current_assignees' in each:
                try:
                    user_name = map(lambda user: user['user_name'],
                                    each['current_assignees'])  # each['current_assignees'][0]['user_name']
                except IndexError as ie:
                    print(ie.message)

            if not (task_status or parent_type):
                continue

            split_task = task.split(':')
            task_name = split_task[-1]

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
                    sequence_dict[seq]['WIP']['task'] = []

                    sequence_dict[seq]['DONE'] = dict()
                    sequence_dict[seq]['DONE']['task'] = []

                    sequence_dict[seq]['APPROVED'] = dict()
                    sequence_dict[seq]['APPROVED']['task'] = []

                    outsource_sequence_dict[seq] = dict()
                    outsource_sequence_dict[seq]['total_shots'] = 0

                    outsource_sequence_dict[seq]['WIP'] = dict()
                    outsource_sequence_dict[seq]['WIP']['task'] = []

                    outsource_sequence_dict[seq]['DONE'] = dict()
                    outsource_sequence_dict[seq]['DONE']['task'] = []

                    outsource_sequence_dict[seq]['APPROVED'] = dict()
                    outsource_sequence_dict[seq]['APPROVED']['task'] = []

                    for my_task in shot_task_list:
                        sequence_dict[seq]['WIP'][my_task] = {}
                        sequence_dict[seq]['WIP'][my_task]['Count'] = 0
                        sequence_dict[seq]['WIP'][my_task]['User'] = []
                        sequence_dict[seq]['WIP'][my_task]['Task'] = []

                        sequence_dict[seq]['DONE'][my_task] = {}
                        sequence_dict[seq]['DONE'][my_task]['Count'] = 0
                        sequence_dict[seq]['DONE'][my_task]['User'] = []
                        sequence_dict[seq]['DONE'][my_task]['Task'] = []

                        sequence_dict[seq]['APPROVED'][my_task] = {}
                        sequence_dict[seq]['APPROVED'][my_task]['Count'] = 0
                        sequence_dict[seq]['APPROVED'][my_task]['User'] = []
                        sequence_dict[seq]['APPROVED'][my_task]['Task'] = []

                        outsource_sequence_dict[seq]['WIP'][my_task] = {}
                        outsource_sequence_dict[seq]['WIP'][my_task]['Count'] = 0
                        outsource_sequence_dict[seq]['WIP'][my_task]['User'] = []
                        outsource_sequence_dict[seq]['WIP'][my_task]['Task'] = []

                        outsource_sequence_dict[seq]['DONE'][my_task] = {}
                        outsource_sequence_dict[seq]['DONE'][my_task]['Count'] = 0
                        outsource_sequence_dict[seq]['DONE'][my_task]['User'] = []
                        outsource_sequence_dict[seq]['DONE'][my_task]['Task'] = []

                        outsource_sequence_dict[seq]['APPROVED'][my_task] = {}
                        outsource_sequence_dict[seq]['APPROVED'][my_task]['Count'] = 0
                        outsource_sequence_dict[seq]['APPROVED'][my_task]['User'] = []
                        outsource_sequence_dict[seq]['APPROVED'][my_task]['Task'] = []

                if seq not in shot_flag:
                    shot_flag[seq] = dict()

                if seq not in outsource_shot_flag and 'Outsource' in task_status:
                    outsource_shot_flag[seq] = dict()

                if shot not in shot_flag[seq]:
                    sequence_dict[seq]['total_shots'] = sequence_dict[seq]['total_shots'] + 1

                if 'Outsource' in task_status and shot not in outsource_shot_flag[seq]:
                    outsource_sequence_dict[seq]['total_shots'] += 1

                shot_flag[seq][shot] = 1
                if 'Outsource' in task_status:
                    outsource_shot_flag[seq][shot] = 1

                if task_status == 'In progress':
                    sequence_dict[seq]['WIP'][task_name]['Count'] += 1
                    sequence_dict[seq]['WIP'][task_name]['Task'].append({task: user_name})
                    # sequence_dict[seq]['WIP'][task_name]['Task'] += [each['path']]
                    # sequence_dict[seq]['WIP'][task_name]['User'] += [user_name]

                elif task_status == 'Internal Approved':
                    sequence_dict[seq]['DONE'][task_name]['Count'] += 1
                    sequence_dict[seq]['DONE'][task_name]['Task'].append({task: user_name})
                    # sequence_dict[seq]['DONE'][task_name]['Task'] += [each['path']]
                    # sequence_dict[seq]['DONE'][task_name]['User'] += [user_name]

                elif task_status == 'Client approved':
                    sequence_dict[seq]['APPROVED'][task_name]['Count'] += 1
                    sequence_dict[seq]['APPROVED'][task_name]['Task'].append({task: user_name})
                    # sequence_dict[seq]['APPROVED'][task_name]['Task'] += [each['path']]
                    # sequence_dict[seq]['APPROVED'][task_name]['User'] += [user_name]

                if task_status == 'Outsource':
                    outsource_sequence_dict[seq]['WIP'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['WIP'][task_name]['Task'].append({task: user_name})
                    # outsource_sequence_dict[seq]['WIP'][task_name]['Task'] += [each['path']]
                    # outsource_sequence_dict[seq]['WIP'][task_name]['User'] += [user_name]

                elif task_status == 'Outsource Approved':
                    outsource_sequence_dict[seq]['DONE'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['DONE'][task_name]['Task'].append({task: user_name})
                    # outsource_sequence_dict[seq]['DONE'][task_name]['Task'] += [each['path']]
                    # outsource_sequence_dict[seq]['DONE'][task_name]['User'] += [user_name]

                elif task_status == 'Outsource Client Approved':
                    outsource_sequence_dict[seq]['APPROVED'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['APPROVED'][task_name]['Task'].append({task: user_name})
                    # outsource_sequence_dict[seq]['APPROVED'][task_name]['Task'] += [each['path']]
                    # outsource_sequence_dict[seq]['APPROVED'][task_name]['User'] += [user_name]

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

                    outsource_asset_dict[parent_type] = dict()
                    outsource_asset_dict[parent_type]['total_assets'] = 0

                    outsource_asset_dict[parent_type]['WIP'] = dict()

                    outsource_asset_dict[parent_type]['DONE'] = dict()

                    outsource_asset_dict[parent_type]['APPROVED'] = dict()

                    for my_task in asset_build_task_list:
                        asset_dict[parent_type]['WIP'][my_task] = {}
                        asset_dict[parent_type]['WIP'][my_task]['Count'] = 0
                        asset_dict[parent_type]['WIP'][my_task]['User'] = []
                        asset_dict[parent_type]['WIP'][my_task]['Task'] = []

                        asset_dict[parent_type]['DONE'][my_task] = {}
                        asset_dict[parent_type]['DONE'][my_task]['Count'] = 0
                        asset_dict[parent_type]['DONE'][my_task]['User'] = []
                        asset_dict[parent_type]['DONE'][my_task]['Task'] = []

                        asset_dict[parent_type]['APPROVED'][my_task] = {}
                        asset_dict[parent_type]['APPROVED'][my_task]['Count'] = 0
                        asset_dict[parent_type]['APPROVED'][my_task]['User'] = []
                        asset_dict[parent_type]['APPROVED'][my_task]['Task'] = []

                        outsource_asset_dict[parent_type]['WIP'][my_task] = {}
                        outsource_asset_dict[parent_type]['WIP'][my_task]['Count'] = 0
                        outsource_asset_dict[parent_type]['WIP'][my_task]['User'] = []
                        outsource_asset_dict[parent_type]['WIP'][my_task]['Task'] = []

                        outsource_asset_dict[parent_type]['DONE'][my_task] = {}
                        outsource_asset_dict[parent_type]['DONE'][my_task]['Count'] = 0
                        outsource_asset_dict[parent_type]['DONE'][my_task]['User'] = []
                        outsource_asset_dict[parent_type]['DONE'][my_task]['Task'] = []

                        outsource_asset_dict[parent_type]['APPROVED'][my_task] = {}
                        outsource_asset_dict[parent_type]['APPROVED'][my_task]['Count'] = 0
                        outsource_asset_dict[parent_type]['APPROVED'][my_task]['User'] = []
                        outsource_asset_dict[parent_type]['APPROVED'][my_task]['Task'] = []

                if parent_type not in asset_flag:
                    asset_flag[parent_type] = dict()

                if parent_type not in outsource_asset_flag and 'Outsource' in task_status:
                    outsource_asset_flag[parent_type] = dict()

                if asset_build not in asset_flag[parent_type]:
                    asset_dict[parent_type]['total_assets'] = asset_dict[parent_type]['total_assets'] + 1

                if 'Outsource' in task_status and asset_build not in outsource_asset_flag[parent_type]:
                    outsource_asset_dict[parent_type]['total_assets'] += 1

                asset_flag[parent_type][asset_build] = 1

                if 'Outsource' in task_status:
                    outsource_asset_flag[parent_type][asset_build] = 1

                if task_status == 'In progress':
                    asset_dict[parent_type]['WIP'][task_name]['Count'] += 1
                    asset_dict[parent_type]['WIP'][task_name]['Task'].append({task: user_name})
                    # asset_dict[parent_type]['WIP'][task_name]['Task'] += [each['path']]
                    # asset_dict[parent_type]['WIP'][task_name]['User'] += [user_name]

                elif task_status == 'Internal Approved':
                    asset_dict[parent_type]['DONE'][task_name]['Count'] += 1
                    asset_dict[parent_type]['DONE'][task_name]['Task'].append({task: user_name})
                    # asset_dict[parent_type]['DONE'][task_name]['Task'] += [each['path']]
                    # asset_dict[parent_type]['DONE'][task_name]['User'] += [user_name]

                elif task_status == 'Client approved':
                    asset_dict[parent_type]['APPROVED'][task_name]['Count'] += 1
                    asset_dict[parent_type]['APPROVED'][task_name]['Task'].append({task: user_name})
                    # asset_dict[parent_type]['APPROVED'][task_name]['Task'] += [each['path']]
                    # asset_dict[parent_type]['APPROVED'][task_name]['User'] += [user_name]

                if task_status == 'Outsource':
                    outsource_asset_dict[parent_type]['WIP'][task_name]['Count'] += 1
                    outsource_asset_dict[parent_type]['WIP'][task_name]['Task'].append({task: user_name})
                    # outsource_asset_dict[parent_type]['WIP'][task_name]['Task'] += [each['path']]
                    # outsource_asset_dict[parent_type]['WIP'][task_name]['User'] += [user_name]

                elif task_status == 'Outsource Approved':
                    outsource_asset_dict[parent_type]['DONE'][task_name]['Count'] += 1
                    outsource_asset_dict[parent_type]['DONE'][task_name]['Task'].append({task: user_name})
                    # outsource_asset_dict[parent_type]['DONE'][task_name]['Task'] += [each['path']]
                    # outsource_asset_dict[parent_type]['DONE'][task_name]['User'] += [user_name]

                elif task_status == 'Outsource Client Approved':
                    outsource_asset_dict[parent_type]['APPROVED'][task_name]['Count'] = 1
                    outsource_asset_dict[parent_type]['APPROVED'][task_name]['Task'].append({task: user_name})
                    # outsource_asset_dict[parent_type]['APPROVED'][task_name]['Task'] += [each['path']]
                    # outsource_asset_dict[parent_type]['APPROVED'][task_name]['User'] += [user_name]
            else:
                continue

        data_list = list()
        data_list.append({'sequence': sequence_dict, 'asset_build': asset_dict,
                          'outsource_seq': outsource_sequence_dict, 'outsource_asset': outsource_asset_dict})
        return data_list

    @staticmethod
    def default_check(element):
        try:
            assign = element
        except ValueError:
            assign = None

        return assign

    @staticmethod
    def convert_timedelta(duration):
        days, seconds = duration.days, duration.seconds
        hours = days * 24 + seconds // 3600
        minutes = (seconds % 3600) // 60
        seconds = (seconds % 60)
        return hours, minutes, seconds

    def get_review_tasks(self, project, review_status='Pending Client Review'):

        task_list = list()
        user_columns = self.users_columns.split(',')

        check_status = [review_status]
        #        check_status = ["Pending Client Review", "Pending Internal Review", "Outsource Client Review"]

        obj_col = self.mongo_database['%s_tasks' % project]
        obj_col_ver = self.mongo_database['%s_versions' % project]

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

		obj_versions = obj_col_ver.find({"ftrack_status":review_status,"task_id":ftrack_id}).sort("updated_on", -1).limit(1)
		
#                query = 'AssetVersion where task_id is "%s" and task.name is "%s" and ' \
#                        'status.name is "%s" order by date desc' % (ftrack_id, task, review_status)
#                print(query)
#                obj_versions = self.session.query(query).first()
                if obj_versions.count():
                    task_details['version'] = obj_versions[0]['name']
                    task_details['object_type'] = 'AssetVersion'
                    task_details['version_id'] = obj_versions[0]['ftrack_id']

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

            task_details['users'] = ' , '.join(users)
            task_list.append(task_details)

        # task_list = sorted(task_list,
        #                             key=lambda x: datetime.datetime.strptime(x['updated_on'], '%Y-%m-%d %H:%M:%S'),
        #                             reverse=True)

        return task_list

    def get_artist_tasks(self, user, project, status):

        task_list = list()
        task_user_details = self.get_spend_time(user)
        obj_col = self.mongo_database[project + '_tasks']
        search_key = {'current_assignees.user_name': user}
        search_key['ftrack_status'] = {
            '$in': ['Ready to start', 'In progress', 'Internal Reject', 'Client Reject', 'Ready to Publish']}
        if status:
            search_key['ftrack_status'] = {'$in': [status]}

        data = obj_col.find(search_key,
                            {'current_assignees.$': 1, 'ftrack_id': 1, 'path': 1, 'ftrack_status': 1,
                             'parent_object_type': 1,
                             'bid': 1, 'parent_id': 1}).sort(
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
                task_details['parent_id'] = each['parent_id']
                task_details['task_pub_status'] = ''

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

                    # ------------
                    from_name = str(each['path'])
                    status = str(each['ftrack_status'])
                    if status == 'In progress':
                        # print("from_name: ", from_name)
                        # print("status: ", status)

                        model_note_class = getModel(str(project) + '_notes')
                        note_obj = model_note_class.objects.order_by('-added_on').filter(from_name__iexact=from_name, status='Internal Reject')
                        if note_obj:
                            note_obj = note_obj[0]
                            to_name = note_obj.to_name
                            pub_version = note_obj.pub_version
                            prev_ver_no = ''
                            if pub_version != 'None':
                                prev_ver_no = '%003d' % (int(pub_version.split()[-1][-3:]) + 1)

                            prev_ver = pub_version.split()[0] + ' v' + prev_ver_no
                            model_version_class = getModel(str(project) + '_versions')
                            version_path = from_name.replace(from_name.split(':')[-1], prev_ver)
                            task_name = to_name.split(':')[-1]
                            version_obj = model_version_class.objects.order_by('-published_on').filter(task_name=task_name, path__iexact=version_path)
                            if version_obj:
                                task_details['task_pub_status'] = 'published'
                            else:
                                task_details['task_pub_status'] = 'reject'
                    # ------------

                if 'parent_object_type' in each:
                    task_details['parent_object_type'] = each['parent_object_type']

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
                    upload_date = str(each['current_assignees'][0]['upload_date']).split('.')[0]
                    task_details['upload_date'] = upload_date

            task_list.append(task_details)

        return task_list

    @staticmethod
    def socket_cilent(serverip='', sock_port_no=5000):

        my_socket = socket(AF_INET, SOCK_DGRAM)
        my_socket.sendto('Stopped', (serverip, sock_port_no))

    def stop_active_task(self, project, task):

        search_key = dict()
        search_key['user'] = self.username
        search_key['task'] = task
        search_key['active'] = {'$ne': 0}

        today = datetime.date.today()
        startdate = datetime.datetime.strptime(str(today) + ' 00:00:00', '%Y-%m-%d %H:%M:%S')
        enddate = datetime.datetime.strptime(str(today) + ' 23:59:59', '%Y-%m-%d %H:%M:%S')
        search_key['start_date'] = {'$gte': startdate, '$lte': enddate}

        daily_task_col = self.mongo_database[project + '_daily_task_details']
        find_obj = daily_task_col.find(search_key).sort('start_date', -1)
        if find_obj.count():
            for each in find_obj:
                ip_address = each['ip_address']
                port_no = each['port_no']
                print("STOP TASK:", task, self.username, ip_address, port_no)
                try:
                    self.socket_cilent(ip_address, port_no)
                except:
                    print("No task a live")
                daily_task_col.update_one({'_id': each['_id']}, {'$set': {'active': 0}})

    def apply_artist_action(self, username, project, task_id, action, page, path, parent_id):
        """
        Function to add or update detail about the task by the artist.
        :param username: Name of the artist or user
        :param project: Project name
        :param task_id: Task id
        :param action: Action performed by the artist as START, STOP or Paused
        :param page: Current page name.
        :param path: Path of current task
        :param parent_id: Parent id of the current task.
        :return: None
        """
        obj_col = self.mongo_database[project + '_tasks']
        search_key = {'current_assignees.user_name': username, 'ftrack_id': task_id}

        find_obj = obj_col.find_one(search_key)
        task_path = find_obj['path']

        # For activity logs
        log_data_list = []
        log_dict = {}
        log_dict['project'] = project
        log_dict['action'] = "update"
        log_dict['object_type'] = 'Task'
        log_dict['sub_type'] = 'Task'
        log_dict['parent_id'] = parent_id
        log_dict['path'] = task_path
        log_dict['page'] = page.strip()
        log_dict['ftrack_id'] = task_id
        log_dict['value'] = action
        log_dict['details_for'] = 'Task'
        update_value = dict()
        if action == 'Started':
            update_value['current_assignees.$.start_date'] = datetime.datetime.now()
        elif action == 'Paused':
            update_value['current_assignees.$.pause_date'] = datetime.datetime.now()
        else:
            update_value['current_assignees.$.finish_date'] = datetime.datetime.now()
            self.stop_active_task(project, task_path)

        tsk_dict = copy.deepcopy(log_dict)
        tsk_dict['value'] = action
        tsk_dict['details_for'] = 'Task Status'
        log_data_list.append(tsk_dict)

        if task_id and (action == 'Started' or action == 'Review'):
            change_status = 'In progress'
            if action == 'Review':
                change_status = 'Pending Internal Review'
                action = 'Stopped'

            my_obj_status = self.session.query("Status where name is '%s'" % change_status).first()
            my_obj_task = self.session.query("Task where id is '%s'" % task_id).first()
            if my_obj_task:
                if my_obj_task['status']['name'] != change_status:
                    # for task
                    tsk_dict = copy.deepcopy(log_dict)
                    tsk_dict['value'] = change_status
                    tsk_dict['details_for'] = 'Status'
                    log_data_list.append(tsk_dict)

                my_obj_task['status'] = my_obj_status

            self.session.commit()

        update_value['current_assignees.$.backup_status'] = action
        # update backup status
        obj_col.update_one(search_key, {'$set': update_value}, upsert=True)

        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=(log['path']), page=log['page'])

    def get_user_task_reports(self, project, first, last, task):

        dashboard_data = dict()
        task_user_reports = dict()
        daily_task_col = self.mongo_database[project + '_daily_task_details']

        if not (first and last and daily_task_col):
            return task_user_reports

        first = first + ' 00:00:00'
        last = last + ' 23:59:59'

        startdate = datetime.datetime.strptime(str(first), '%Y-%m-%d %H:%M:%S')
        enddate = datetime.datetime.strptime(str(last), '%Y-%m-%d %H:%M:%S')

#        self.get_user_details()

        print(startdate, enddate)

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
            # key = task + ':' + user
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

            data = obj_col.find({'current_assignees.user_name': user, 'path': task, 'object_type': 'Task'},
                                {'current_assignees.$': 1, 'ftrack_id': 1, 'path': 1, 'ftrack_status': 1}).sort(
                "current_assignees.$.start_date", -1)
            for each in data:
                try:
                    ftrack_status = each['ftrack_status']
                except ValueError:
                    ftrack_status = 'undefined'

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

        task_list = sorted(task_list,
                           key=lambda x: datetime.datetime.strptime(x['start_min_date'], '%Y-%m-%d %H:%M:%S'),
                           reverse=True)
        top_task_users = list()
        for user, user_time in top_users.items():
            user_task = dict()
            td = datetime.timedelta(seconds=user_time)
            hours, minutes, seconds = self.convert_timedelta(td)
            time_spend = '%02d:%02d:%02d' % (hours, minutes, seconds)

            fuser = user.replace('.', ' ')
            fuser = fuser.title()
            user_task['user'] = fuser
            user_task['user_id'] = user
            user_task['time'] = time_spend
            user_task['time_sec'] = user_time

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

    def get_spend_time(self, user):

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

    def get_note_data(self, obj_notes):
        """
        Function to get notes data from database.
        :param obj_notes: List of objects of notes
        :return: List of dictionary of note data
        """
        note_list = []
        for note in obj_notes:
            noteid = note['id']
            comments_hash = {}
            if note['in_reply_to'] is None and noteid:
                try:
                    category = note['category']['name'].replace(' ', '_')
                except:
                    category = 'None'
                comments_hash['note_category'] = category
                try:
                    comments_hash['note_author'] = note['author']['username']
                except:
                    comments_hash['note_author'] = 'unknown user'
                comments_hash['note_head'] = note['content'] or 'Null'
                comments_hash['note_id'] = noteid
                note_date = note['date'].format('DD-MM-YYYY HH:MM')
                comments_hash['note_date'] = note_date
                comments_hash['task_name'] = ''

                comments_hash['note_info'] = ''
                if note['parent_id'] and note['parent_type']:
                    parent = self.session.query(
                        "%s where id is '%s'" % (note['parent_type'], note['parent_id'])).first()
                    path_list = []
                    if parent:
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
                comments_hash['current_user'] = self.username

                note_list.append(comments_hash)

        note_list = sorted(note_list, key=lambda x: datetime.datetime.strptime(x['note_date'], '%d-%m-%Y %H:%M'),
                           reverse=True)

        return note_list

    @staticmethod
    def ldap_users():

        ldap_server = "ldap://192.168.1.2"
        base_dn = "ou=People,dc=intra,dc=madassemblage,dc=com"

        ldap.set_option(ldap.OPT_REFERRALS, 0)
        scope = ldap.SCOPE_SUBTREE
        ldap_filter = "(uid=*)"
        attrs = ["cn", "uid"]

        # name = ''
        ldap_con = ldap.initialize(ldap_server)
        uid_list = list()
        try:
            search = ldap_con.search(base_dn, scope, ldap_filter, attrs)
            ldap_type, user = ldap_con.result(search, 60)

            for users in user:
                name, attrs = users
                if 'uid' in attrs:
                    (name, uid) = (attrs['cn'][0], attrs['uid'][0])
                    uid_list.append(uid)
        except ldap.LDAPError:
            print("Ldap error")

        ldap_con.unbind_s()
        return sorted(uid_list)

    # FTP
    def ftp_serve(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        ftp_hash = {}
        self.projects = self.get_projects()
#        self.get_user_columns(username)

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

#        self.get_user_details()
        ftp_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            ftp_hash['emp_code'] = self.employee_details[username]['emp_code']
        ftp_hash['user_id'] = username.upper()
        task_temp_data = self.get_tasks_template()

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
        # dets = ''
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

            # version = ''
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
            elif version_status == 'Outsource':
                reject_status = 'Outsource Client Reject'
                check_version_status = 'Outsource Approved'

            reject_versions = self.session.query(
                'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and '
                'task.name is "%s" and status.name is "%s"' % (asset_name, obj_id, task_name, reject_status)).all()

            approved_version_number = str(len(reject_versions) + 1).zfill(3)
            approved_version_number_1 = asset_name + '_' + folder_option + '_v' + approved_version_number

            data_hash['approved_version_number'] = approved_version_number_1

            asset_query = 'AssetVersion where asset.name is "%s" and asset.parent.id is "%s" and task.name is "%s" ' \
                          'and status.name is "%s"' % (asset_name, obj_id, task_name, check_version_status)

            print(asset_query)
            ver = self.session.query(asset_query)

            restrict_final_upload_check_flag = 0
            # Adding filter which will restrict the final upload if sequence doesn't have any client approval
            # restrict_final_upload_check_flag = 0
            restrict_final_upload_check = ''
            if version_status == 'Client' and asset_name == 'final':
                restrict_final_upload_check = self.session.query(
                    'AssetVersion where asset.name is "sequence" and asset.parent.id is "%s" and task.name is '
                    '"%s" and status.name is "Client approved"' % (obj_id, task_name)).all()
                if len(restrict_final_upload_check) == 0:
                    restrict_final_upload_check_flag = 1

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
                            except ValueError:
                                data_hash['status'] = 'Source folder not available'
                        else:
                            path = os.path.join(ftrack_path, camera_angle)
                            try:
                                self.sftp.stat(path)
                            except ValueError:
                                data_hash['status'] = 'Source folder not available'
                    else:
                        try:
                            self.sftp.stat(ftrack_path)
                        except ValueError:
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
        :param dept: task name
        :param username: username
        :return:
        """

        task_names_abbr = {'Animation': 'anm', 'Layout': 'lyt', 'Blocking': 'blk'}

        if not versions:
            return False

        print(versions, destination, prefer, side, upload_status, client_final_combo, dept)

        success_dict = [{}]
        versions = json.loads(versions)
        destination = json.loads(destination)
        self.user_details_log = []

        if destination[0] == "Z:" or destination[1] == 'ASE':
            # destined = ''
            # projname = ''
            if destination[0] == "Z:":
                destination.pop(0)
                destined = '/'.join(destination)
                destined = '/ASE/' + destined
                projname = destination[1]
            else:
                destined = '/'.join(destination)
                projname = destination[3]

            fol_search = '/ASE/01prj/%s/06_ftp.*/upload' % (projname.upper())

            match = re.match(r'^%s' % fol_search, destined)

            if not match:
                success_dict = [{'status': 'Invalid Destination'}]
            else:
                os.system("sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 "
                          "sudo chown -R pip:prod %s" % (self.password_str, destined))
                os.system("sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 sudo chmod 775 %s" % (
                    self.password_str, destined))

                time.sleep(5)
                import ase_prod_srv
                self.ftp, self.sftp = ase_prod_srv.makeServerConnection()
                for x in versions:
                    print(x)

                    client_rejected_version_list = x.split(':')
                    internal_version = client_rejected_version_list[1].split('_')[-1]
                    client_rejected_version = client_rejected_version_list[2]

                    vers = client_rejected_version_list[0].split('_')
                    prj_name = vers[0]
                    version_name = ''
                    clt_rej_ver_no = ''
                    '''
                        In case of sw9 & and task names is
                        Animation, Layout, Blocking then client
                        rejected version will be ex:-
                        Animation ==> anm_v01
                        followed by the extension
                    '''
                    if prj_name == 'sw9':
                        if dept in task_names_abbr:
                            dept_abbr_name = task_names_abbr[dept]
                            clt_rej_ver_no = dept_abbr_name + "_v" + client_rejected_version.split('v0')[-1]
                        else:
                            clt_rej_ver_no = client_rejected_version.split('v')[-1]
                    else:
                        clt_rej_ver_no = client_rejected_version.split('v')[-1]

                    print "clt_rej_ver_no", clt_rej_ver_no
                    # clt_rej_ver_no = client_rejected_version.split('v')[-1]
                    version_id = client_rejected_version_list[3]
                    ftrack_source_path = client_rejected_version_list[4]

                    # vers = client_rejected_version_list[0].split('_')
                    # prj_name = vers[0]
                    obj_name = '_'.join(vers[1:])

                    ver = client_rejected_version_list[1].split('_')
                    # version_number = internal_version

                    asset_name = ver[2]
                    folder_type = '_'.join(ver[3:-1])
                    if "review_img" == folder_type:
                        version_name = ver[-1]

                    print "version_name", version_name
                    obj_path = '/'.join(vers[1:])

                    side_head = ''
                    if side:
                        side_head = '(' + side + ')'

                    heading_mail = ':'.join(vers) + '-' + asset_name + '[' + folder_type + ']' + side_head

                    user_details = dict()
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

                    # mailing_destination = ''
                    # status = ''

                    if asset_name == 'final' or side == 'both':
                        source_path1 = ftrack_source_path + '/' + 'left'
                        source_path2 = ftrack_source_path + '/' + 'right'
                        destination_folder1 = os.path.join(destined, obj_path, folder_type, 'l')
                        destination_folder2 = os.path.join(destined, obj_path, folder_type, 'r')
                        mailing_destination = os.path.join(destined, obj_path, folder_type)
                        try:
                            if not os.path.exists(destination_folder1):
                                self.ftp.exec_command('/bin/mkdir -p %s' % destination_folder1)
                            if not os.path.exists(destination_folder2):
                                self.ftp.exec_command('/bin/mkdir -p %s' % destination_folder2)
                        except IOError as e:
                            print("I/O error({0}): {1}".format(e.errno, e.strerror))

                        time.sleep(3)
                        file_exist = 0

                        listy = self.listdir(source_path1)
                        if listy:
                            for ver_file in listy:
                                version_number = ver_file.split('.')[1]
                                if version_number == folder_type:
                                    file_name = prj_name + '_' + obj_name + '_' + 'l' + '_' + clt_rej_ver_no + \
                                                '.' + folder_type
                                else:
                                    file_name = prj_name + '_' + obj_name + '_' + 'l' + '_' + clt_rej_ver_no + \
                                                '.' + version_number + '.' + folder_type
                                finale = os.path.join(destination_folder1, file_name)
                                source_final = os.path.join(source_path1, ver_file)

                                if os.path.exists(finale):
                                    file_exist = 1

                                self.preference(prefer, source_final, finale)

                        right_listy = self.listdir(source_path2)
                        if right_listy:
                            for ver_file2 in right_listy:
                                version_number = ver_file2.split('.')[1]
                                if version_number == folder_type:
                                    file_name = prj_name + '_' + obj_name + '_' + 'r' + '_' + clt_rej_ver_no + \
                                                '.' + folder_type
                                else:
                                    file_name = prj_name + '_' + obj_name + '_' + 'r' + '_' + clt_rej_ver_no + \
                                                '.' + version_number + '.' + folder_type
                                finale = os.path.join(destination_folder2, file_name)
                                source_final = os.path.join(source_path2, ver_file2)

                                if os.path.exists(finale):
                                    file_exist = 1

                                self.preference(prefer, source_final, finale)

                        if file_exist:
                            status = 'One or more files already exists in Provided Destination !'
                        else:
                            status = 'Upload Successful'
                    else:
                        # source_path1 = ''
                        # destination_folder1 = ''
                        if side:
                            source_path1 = ftrack_source_path + '/' + side
                            destination_folder1 = os.path.join(destined, obj_path, folder_type, side[0])
                            if asset_name == 'master':
                                destination_folder1 = os.path.join(destined, obj_path, folder_type, 'master')
                        else:
                            source_path1 = ftrack_source_path
                            destination_folder1 = os.path.join(destined, obj_path, folder_type)

                        # For SW9 project copy mov outside ....
                        if prj_name.lower() == 'sw9' and folder_type == 'mov':
                            destination_folder1 = destined

                        mailing_destination = destination_folder1
                        try:
                            if not os.path.exists(destination_folder1):
                                self.ftp.exec_command('mkdir -p %s' % destination_folder1)
                        except IOError as e:
                            print("I/O error({0}): {1}".format(e.errno, e.strerror))

                        time.sleep(3)
                        # check_destinations = {}

                        file_exist = 0

                        listy = self.listdir(source_path1)
                        if listy:
                            for ver_file3 in listy:
                                ext = ver_file3.split('.')[-1]
                                if side:
                                    file_name = prj_name + '_' + obj_name + '_' + side[
                                        0] + '_' + clt_rej_ver_no + '.' + ext
                                    if asset_name == 'master':
                                        seq_img = ver_file3.split('.')[-2]
                                        if re.match('^\d{4}$', seq_img):
                                            ext = seq_img + '.' + ext
                                        file_name = prj_name + '_' + obj_name + '_' + 'master' + '_' + clt_rej_ver_no + '.' + ext
                                else:
                                    '''
                                    If folder is review_img then it will
                                    symlink based on the file names followed by
                                    version .
                                    '''
                                    if folder_type == 'review_img':
                                        file_name = ver_file3.split(".")[0] + "_v" + clt_rej_ver_no + "." + ext
                                        # file_name = prj_name + "_" + obj_name + "_" + clt_rej_ver_no + "_" + version_name + "." + ext
                                    else:
                                        file_name = prj_name + '_' + obj_name + '_' + clt_rej_ver_no + '.' + ext

                                finale = os.path.join(destination_folder1, file_name)
                                source_final = os.path.join(source_path1, ver_file3)

                                if os.path.exists(finale) is True:
                                    file_exist = 1

                                self.preference(prefer, source_final, finale)

                        if file_exist:
                            status = 'One or more files already exists in Provided Destination !'
                        else:
                            status = 'Upload Successful'

                    user_details['status'] = status
                    user_details['mailing_destination'] = mailing_destination

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
            print("I/O error({0}): {1}".format(e.errno, e.strerror))

        return list_array

    def preference(self, prefer, source_final, finale):

        # file_status = ''
        if os.path.exists(finale):
            # file_status = "Destination file exists"
            return False

        try:
            if prefer == 'symlink':
                self.ftp.exec_command('/bin/ln -s %s %s' % (source_final, finale))
            elif prefer == 'copy':
                self.ftp.exec_command('/bin/cp -f %s %s' % (source_final, finale))
            # file_status = 'Upload successful'
        except IOError as e:
            print("Symlink failed({0}): {1}".format(e.errno, e.strerror))
            # file_status = "Upload failed"
            # version_id = ''

    def change_status_after_upload(self, ver_id, upload_status, client_final_combo):
        print("Changing Status To : ", ver_id, client_final_combo, upload_status)
        finale_version = self.session.query("AssetVersion where id is '%s'" % ver_id).first()
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
        elif upload_status == 'Outsource':
            changed_status = self.session.query("Status where name is 'Outsource Client Review'").first()
            finale_version['task']['status'] = changed_status

        finale_version['status'] = changed_status
        self.session.commit()
	
	try:
	    log = dict()
	    log['acitivity_date'] = datetime.datetime.now()
	    log['action'] = 'update'
	    log['page'] = 'FTP Upload'
	    log['value'] = changed_status['name']
	    log['ftrack_id'] = ver_id
	    log['action'] = 'update'
	    log['object_type'] = 'AssetVersion'
	    log['details_for'] = 'Status'
	    log['sub_type'] = 'AssetVersion'
	    link = finale_version['link']
	    link_path = (':'.join([each_link['name'] for each_link in link]))
	    log['project'] = link_path.split(':')[0].lower()
	    path = link_path.replace(link_path.split(':')[0], link_path.split(':')[0].lower())
	    log['sub_type'] = 'AssetVersion'
	    log['path'] = path
	    log['parent_id'] = finale_version['task_id']
	    self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])
	except Exception as e:
	    print("FTP activity log error : %s" %e.message)

    def send_log_mail(self, user_details_log):

        project = user_details_log[0]['project']

        user_id = user_details_log[0]['username']
        from_addr = user_id + '@intra.madassemblage.com'

        to = from_addr

        if project in self.email_address['Email']['FTP Upload']:
            if user_details_log[0]['department'] in self.email_address['Email']['FTP Upload'][project]:
                to = to + ',' + ','.join(
                    self.email_address['Email']['FTP Upload'][project][user_details_log[-1]['department']])

        to_addr = to
        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

        subject = '[' + project + '] ' + user_details_log[0]['department'] + ' Upload' + '(' + user_details_log[0][
            'Asset Name'] + ')(' + user_details_log[0]['publishing_time'] + ')'

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
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Status</td><' \
                                  'td style="font-size:12px;">%s</td></tr>' % user['status']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Internal Version</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['Internal Version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Upload Version</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['Client Version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Source File</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['source_file']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Destination File</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['mailing_destination']

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
        """
        Function for creating task reject mail content and call send mail function inside this.
        :param details: Details of Task
        :return: None
        """
        if 'users' not in details:
            print("No user found to send a reject mail")

        # subject = 'Task Reject (' + details['task_path'] + ')(' + details['status'] + ')['+details['pub_version']+']'
        subject = 'Task Reject (' + details['task_path'] + ') [' + details['status'] + ']'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        user_list = details['users'].split(',')
        to_list = list()

        for user in user_list:
            user = user.strip()
            to_list.append(user + '@intra.madassemblage.com')

        to_addr = ','.join(to_list)

        project = details['task_path'].split(':')[0].upper()
        task_name = details['task_path'].split(':')[-1]

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

        from_task_name = ''
        if 'from_name' in details:
            from_task_name = details['from_name'].split(':')[-1]

        if 'Review Task' in self.email_address['Email']:
            if project in self.email_address['Email']['Review Task']:
                if task_name in self.email_address['Email']['Review Task'][project]:
                    cc_addr = cc_addr + ',' + ','.join(self.email_address['Email']['Review Task'][project][task_name])
                if from_task_name in self.email_address['Email']['Review Task'][project]:
                    if task_name != from_task_name:
                        cc_addr = cc_addr + ',' + ','.join(self.email_address['Email']['Review Task'][project][from_task_name])


        htmlhead = """
        Hello Artist(s),</br>Your task has been rejected with below details ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['task_path'], details['status'])

        htmlbody = ''
        # htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Task</td>' \
        #                       '<td style="font-size:12px;">%s</td></tr>' % details['task_path']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">From</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['from_name'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">To</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['to_name'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reason</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reject Version</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['version']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Rejected by</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['added_by'].replace('.', ' ').title()
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Rejected on</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['added_on']).split('.')[0]
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
        """ % details['added_by'].replace('.', ' ').title()

        mail_body = htmlhead + htmlbody + htmltail

        self.send_email(subject, from_addr, to_addr, cc_addr, mail_body)

    def approve_mail(self, details):
        """
        Function for creating task approve mail content and call send mail function inside this.
        :param details: Details of task
        :return: None
        """
        if 'users' not in details:
            print("No user found to send a approved mail")

        # subject = 'Task Approved (' + details['task_path'] + ')(' + details['status'] + ')['+details['pub_version']+']'
        subject = 'Task Approved (' + details['task_path'] + ') [' + details['status'] + ']'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        user_list = details['users'].split(',')
        to_list = list()

        for user in user_list:
            user = user.strip()
            to_list.append(user + '@intra.madassemblage.com')

        to_addr = ','.join(to_list)

        project = details['task_path'].split(':')[0].upper()
        task_name = details['task_path'].split(':')[-1]

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'
        if 'Review Task' in self.email_address['Email']:
            if project in self.email_address['Email']['Review Task']:
                if task_name in self.email_address['Email']['Review Task'][project]:
                    cc_addr = cc_addr + ',' + ','.join(self.email_address['Email']['Review Task'][project][task_name])

        htmlhead = """
        Hello Artist(s),</br>Your task has been approved with below details ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['task_path'], details['status'])

        htmlbody = ''
        # htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Task</td>' \
        #                       '<td style="font-size:12px;">%s</td></tr>' % details['task_path']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">From</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['from_name'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">To</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['to_name'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Note</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Approved Version</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['version']
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Approved by</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['added_by'].replace('.', ' ').title()
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Approved on</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['added_on']).split('.')[0]
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
        """ % details['added_by'].replace('.', ' ').title()

        mail_body = htmlhead + htmlbody + htmltail

        self.send_email(subject, from_addr, to_addr, cc_addr, mail_body)

    def send_email(self, subject, from_addr, to_addr, cc_addr, mail_body):
        """
        Function for sending mail.
        :param subject: Subject of the mail
        :param from_addr: Email address of sender
        :param to_addr: Email address of reciver
        :param cc_addr: Email address
        :param mail_body: Content of mail
        :return: None
        """
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
        print("Mail Send from %s to %s" % (sender_mail, receiver_mail))
        s.quit()

    # Update form elements

    def update_form_data(self, entity_name, data_list):
        """
        Function to update the on the basis of entity name.
        :param entity_name: Name of entity
        :param data_list: List of data to be update.
        :return: Success message
        """

        data_list = json.loads(data_list)

        #	pprint(data_list)
        msg = 'Nothing to happen ...'
        if entity_name == 'Project':
            self.update_project(data_list)
            msg = 'Project has been updated ...'
        elif entity_name == 'AssetBuild':
            self.update_asset_build(data_list)
            msg = 'Asset Build has been updated ...'
        elif entity_name == 'Sequence':
            self.update_sequence(data_list)
            msg = 'Sequence has been updated ...'
        elif entity_name == 'Shot':
            self.update_shot(data_list)
            msg = 'Shot has been updated ...'
        elif entity_name == 'Task':
            self.update_task(data_list)
            msg = 'Task has been updated ...'

        return {'message': msg}

    def update_project(self, data_list=None):
        """
        Function to add and update project.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """
        if data_list is None:
            data_list = []
        if not data_list:
            return False

        self.reload_session()
        log_data_list = []
        for each in data_list:
            if 'project_id' in each:
                proj_obj = self.session.query("Project where id is '%s'" % each['project_id']).first()
            else:
                if ('project_code' not in each) or ('project_name' not in each):
                    print("Project code/name not found ...")
                    continue

                proj_obj = self.session.create('Project', {
                    'name': each['project_code'],
                    'full_name': each['project_name'],
                    'project_schema': self.project_schemas,
                    'root': '/ASE/01prj/' + str(each['project_code']).upper()
                })

            # For activity logs
            log_dict = dict()
            log_dict['project'] = (each['project_code']).lower()
            log_dict['action'] = 'Create Project'
            log_dict['object_type'] = 'Project'
            log_dict['sub_type'] = 'Project'
            log_dict['parent_id'] = ""
            log_dict['path'] = ""
            log_dict['page'] = (each['page']).strip()
            log_dict['ftrack_id'] = proj_obj['id']
            log_dict['value'] =  each['project_name']
            log_dict['details_for'] = 'Project'
            log_data_list.append(log_dict)

            if 'start_date' in each:
                start_date = each['start_date']
                datetime_start_date_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                start_date = datetime.datetime.strftime(datetime_start_date_obj, "%Y-%m-%dT%H:%M:%S")
                proj_obj['start_date'] = start_date

                std_dict = copy.deepcopy(log_dict)
                std_dict['value'] = start_date
                std_dict['details_for'] = 'Project'
                std_dict['action'] = 'add'
                log_data_list.append(std_dict)

            if 'end_date' in each:
                end_date = each['end_date']
                datetime_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                end_date = datetime.datetime.strftime(datetime_obj, "%Y-%m-%dT%H:%M:%S")
                proj_obj['end_date'] = end_date
            # proj_obj['end_date'] = each['end_date']

                end_dict = copy.deepcopy(log_dict)
                end_dict['value'] = end_date
                end_dict['details_for'] = 'Project'
                end_dict['action'] = 'add'
                log_data_list.append(end_dict)
            if 'resolution' in each:
                proj_obj['custom_attributes']['resolution'] = each['resolution']

                res_dict = copy.deepcopy(log_dict)
                res_dict['value'] = each['resolution']
                res_dict['details_for'] = 'Project'
                res_dict['action'] = 'add'
                log_data_list.append(res_dict)
            if 'start_frame' in each:
                proj_obj['custom_attributes']['startFrame'] = each['start_frame']

                stf_dict = copy.deepcopy(log_dict)
                stf_dict['value'] = each['start_frame']
                stf_dict['details_for'] = 'Project'
                stf_dict['action'] = 'add'
                log_data_list.append(stf_dict)

            if 'fps' in each:
                proj_obj['custom_attributes']['fps'] = each['fps']

                fps_dict = copy.deepcopy(log_dict)
                fps_dict['value'] = each['fps']
                fps_dict['details_for'] = 'Project'
                fps_dict['action'] = 'add'
                log_data_list.append(fps_dict)

            self.session.commit()
            # call logs
            for log in log_data_list:
                self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                      action=log['action'], object_type=log['object_type'],
                                      details_for=log['details_for'],
                                      sub_type=log['sub_type'], parent_id=log['parent_id'],
                                      path=log['path'], page=log['page'])

    def update_asset_build(self, data_list=None):
        """
        Function to add and update the asset build.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """
        if data_list is None:
            data_list = []
        if not data_list:
            return False

        self.reload_session()
        log_data_list = []
        for each in data_list:
            action = 'update'
            log_dict = {}
            if 'asset_build_id' in each and each['asset_build_id']:
                asset_build_obj = self.session.query("AssetBuild where id is '%s'" % each['asset_build_id']).first()
            else:
                action = 'add'
                if ('asset_build_name' not in each) or ('asset_build_type' not in each):
                    print("Asset Build type/name not found ...")
                    continue

                if ('parent_id' not in each) or ('parent_object' not in each):
                    print("Asset Build parent_id not found ...")
                    continue

                name = each['asset_build_name']

                obj_parent = self.session.query(
                    '%s where id is "%s"' % (each['parent_object'], each['parent_id'])).first()

                type_obj = self.session.query('Type where name is "%s"' % each['asset_build_type']).first()

                asset_build_obj = self.session.create('AssetBuild', {
                    'name': name,
                    'parent': obj_parent,
                    'type': type_obj,
                })

            # For activity logs
            log_dict['project'] = each['project_name']
            log_dict['action'] = action
            log_dict['object_type'] = 'Asset Build'
            log_dict['sub_type'] = each['asset_build_type']
            log_dict['parent_id'] = each['parent_id']
            log_dict['path'] = each['path']
            log_dict['page'] = (each['page']).strip()
            log_dict['ftrack_id'] = asset_build_obj['id']
            log_dict['value'] = each['asset_build_name']
            log_dict['details_for'] = 'AssetBuild'
            if action == 'add':
                crt_dict = copy.deepcopy(log_dict)
                crt_dict['value'] = each['asset_build_name']
                crt_dict['details_for'] = each['entity_name']
                log_data_list.append(crt_dict)
                log_dict['action'] = 'update'
            if 'description' in each:
                asset_build_obj['description'] = each['description']

        self.session.commit()
        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=(log['page']).strip())

    def update_sequence(self, data_list=None):
        """
        Function to add and update the sequance.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """
        if data_list is None:
            data_list = []
        if not data_list:
            return False

        self.reload_session()
        log_data_list = []
        for each in data_list:
            action = 'update'
            log_dict = {}
            if 'seq_id' in each:
                seq_obj = self.session.query("Sequence where id is '%s'" % each['seq_id']).first()
            else:
                action = 'add'
                if 'seq_name' not in each:
                    print("Sequence name not found ...")
                    continue

                if ('parent_id' not in each) or ('parent_object' not in each):
                    print("Asset Build parent_id not found ...")
                    continue

                name = each['seq_name']

                obj_parent = self.session.query(
                    '%s where id is "%s"' % (each['parent_object'], each['parent_id'])).first()

                seq_obj = self.session.create('Sequence', {
                    'name': name,
                    'parent': obj_parent
                })

                # for create asset links
                project_name = obj_parent['name']
                if seq_obj and 'project_id' in each and project_name.startswith('sw'):
                    obj_assets = self.session.query('AssetBuild where project_id is "%s"' % each['project_id'])
                    for obj in obj_assets:
                        self.session.create('TypedContextLink', {
                            'from': obj,
                            'to': seq_obj,
                        })

            # For activity logs
            log_dict['project'] = each['project_name']
            log_dict['action'] = action
            log_dict['object_type'] = 'Sequence'
            log_dict['sub_type'] = 'Sequence'
            log_dict['parent_id'] = each['parent_id']
            log_dict['path'] = each['path']
            log_dict['page'] = (each['page']).strip()
            log_dict['ftrack_id'] = seq_obj['id']
            log_dict['value'] = each['seq_name']
            log_dict['details_for'] = 'Sequence'
            if action == 'add':
                crt_dict = copy.deepcopy(log_dict)
                crt_dict['value'] = each['seq_name']
                crt_dict['details_for'] = each['entity_name']
                log_data_list.append(crt_dict)
                log_dict['action'] = 'update'

            if 'description' in each:
                seq_obj['description'] = each['description']

        self.session.commit()
        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])

    def update_shot(self, data_list=None):
        """
        Function to add and update the shot.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """
        if data_list is None:
            data_list = []
        if not data_list:
            return False

        self.reload_session()
        log_data_list = []
        for each in data_list:
            action = 'update'
            log_dict = {}
            if 'shot_id' in each:
                shot_obj = self.session.query("Shot where id is '%s'" % each['shot_id']).first()
            else:
                action = 'add'
                if 'shot_name' not in each:
                    print("Shot name not found ...")
                    continue

                if ('parent_id' not in each) or ('parent_object' not in each):
                    print("Shot parent_id not found ...")
                    continue

                name = each['shot_name']

                obj_parent = self.session.query(
                    '%s where id is "%s"' % (each['parent_object'], each['parent_id'])).first()

                shot_obj = self.session.create('Shot', {
                    'name': name,
                    'status': self.shot_status_object[0],
                    'parent': obj_parent
                })

                # for create asset links
                project_name = obj_parent['project']['name']
                if shot_obj and 'project_id' in each and project_name.startswith('sw'):
                    obj_assets = self.session.query('AssetBuild where project_id is "%s"' % each['project_id'])
                    for obj in obj_assets:
                        self.session.create('TypedContextLink', {
                            'from': obj,
                            'to': shot_obj,
                        })

            # For activity logs
            log_dict['project'] = each['project_name']
            log_dict['action'] = action
            log_dict['object_type'] = 'Shot'
            log_dict['sub_type'] = each['shot_create_type']
            log_dict['parent_id'] = each['parent_id']
            log_dict['path'] = each['path']
            log_dict['page'] = (each['page']).strip()
            log_dict['ftrack_id'] = shot_obj['id']
            log_dict['value'] = each['shot_name']
            log_dict['details_for'] = 'Shot'
            if action == 'add':
                crt_dict = copy.deepcopy(log_dict)
                crt_dict['value'] = each['shot_name']
                crt_dict['details_for'] = each['entity_name']
                log_data_list.append(crt_dict)
                log_dict['action'] = 'update'

            if 'description' in each:
                shot_obj['description'] = each['description']

            if 'start_frame' in each:
                shot_obj['custom_attributes']['fstart'] = each['start_frame']
                stf_dict = copy.deepcopy(log_dict)
                stf_dict['value'] = each['start_frame']
                stf_dict['details_for'] = 'Start Frame'
                log_data_list.append(stf_dict)

            if 'end_frame' in each:
                shot_obj['custom_attributes']['fend'] = each['end_frame']
                enf_dict = copy.deepcopy(log_dict)
                enf_dict['value'] = each['end_frame']
                enf_dict['details_for'] = 'End Frame'
                log_data_list.append(enf_dict)

        self.session.commit()
        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])

    def update_task(self, data_list=None):
        """
        Function to add and update the details of task into database according to the changes has done by the user.
        :param data_list: List of dictionary with new or updated values.
        :return: None
        """
        if data_list is None:
            data_list = []

        if not data_list:
            return False

        global parent_obj
        self.reload_session()
        log_data_list = []

        print(data_list)
        for each in data_list:
            action = 'update'
            log_dict = {}
            if 'task_id' in each and each['task_id']:
                task_obj = self.session.query("Task where id is '%s'" % each['task_id']).first()
                task_id = each['task_id']

            else:
                task = self.session.query(
                    "Task where name is '%s' and parent_id is '%s'" % (each['task_name'], each['parent_id'])).first()

                if task:
                    each['task_id'] = task['id']
                    task_obj = self.session.query("Task where id is '%s'" % each['task_id']).first()
                    task_id = each['task_id']
                else:
                    action = 'add'
                    if 'task_name' not in each:
                        print("Task name not found ...")
                        continue

                    if ('parent_id' not in each) or ('parent_object_type' not in each):
                        print("Task parent_id not found ...")
                        continue

                    parent_object = each['parent_object_type'].replace(' ', '')
                    name = each['task_name']
                    q = '%s where id is "%s"' % (parent_object, each['parent_id'])
                    parent_obj = self.session.query(q).first()

                    task_type = name
                    if name in self.type_name:
                        task_type = self.type_name[name]

                    type_obj = self.session.query('Type where name is "%s"' % task_type).first()

                    task_status = 'Not started'
                    if 'task_status' in each:
                        task_status = each['task_status']

                    status_obj = self.session.query('Status where name is "%s"' % task_status).first()

                    task_obj = self.session.create('Task', {
                        'name': name,
                        'parent': parent_obj,
                        'status': status_obj,
                        'type': type_obj
                    })

                    task_id = task_obj['id']
            collection_name = self.mongo_database[each['project_name'] + "_tasks"]

            log_dict['project'] = each['project_name']
            log_dict['action'] = action
            log_dict['object_type'] = 'Task'
            log_dict['sub_type'] = each['parent_object_type']
            log_dict['parent_id'] = each ['parent_id']
            log_dict['path'] = each['path']
            log_dict['page'] = (each['page']).strip()
            log_dict['ftrack_id'] =  task_id#task_obj['id']
            log_dict['value'] = ''
            log_dict['details_for'] = ''
            if action == 'create':
                crt_dict = copy.deepcopy(log_dict)
                crt_dict['value'] = each['task_name']
                crt_dict['details_for'] = 'Task'
                log_data_list.append(crt_dict)
                log_dict['action'] = 'update'

            if 'description' in each:
                task_obj['description'] = each['description']
                dec_dict = copy.deepcopy(log_dict)
                dec_dict['value'] = each['description']
                dec_dict['details_for'] = 'Description'
                log_data_list.append(dec_dict)

            if 'task_status' in each:
                task_status = each['task_status']
                status_obj = self.session.query('Status where name is "%s"' % task_status).first()
                task_obj['status'] = status_obj
                sts_dict = copy.deepcopy(log_dict)
                sts_dict['value'] = each['task_status']
                sts_dict['details_for'] = 'Status'
                log_data_list.append(sts_dict)

            if 'start_date' in each and each['start_date']:
                start_date = each['start_date']
                start_date_datetime_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                start_date = datetime.datetime.strftime(start_date_datetime_obj, "%Y-%m-%dT%H:%M:%S")
                task_obj['start_date'] = start_date
                std_dict = copy.deepcopy(log_dict)
                std_dict['value'] = each['start_date']
                std_dict['details_for'] = 'Start Date'
                log_data_list.append(std_dict)

            if 'end_date' in each and each['end_date']:
                end_date = each['end_date']
                end_date_datetime_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                end_date = datetime.datetime.strftime(end_date_datetime_obj, "%Y-%m-%dT%H:%M:%S")
                task_obj['end_date'] = end_date
                etd_dict = copy.deepcopy(log_dict)
                etd_dict['value'] = each['end_date']
                etd_dict['details_for'] = 'End Date'
                log_data_list.append(etd_dict)

            if 'startframe' in each or 'endframe' in each:
                try:
                    shot_obj = self.session.query("Shot where id is '%s'" % each['parent_id']).first()
                    if 'startframe' in each:
                        shot_obj['custom_attributes']['fstart'] = each['startframe']
                        stf_dict = copy.deepcopy(log_dict)
                        stf_dict['value'] = each['startframe']
                        stf_dict['details_for'] = 'Start Frame'
                        log_data_list.append(stf_dict)
                    if 'endframe' in each:
                        shot_obj['custom_attributes']['fend'] = each['endframe']
                        enf_dict = copy.deepcopy(log_dict)
                        enf_dict['value'] = each['endframe']
                        enf_dict['details_for'] = 'End Frame'
                        log_data_list.append(enf_dict)
                except :
                    print('Error while updating frames ...')

            if 'bid' in each and each['bid']:
                task_obj['bid'] = each['bid']
                bid_dict = copy.deepcopy(log_dict)
                bid_dict['value'] = each['bid']
                bid_dict['details_for'] = 'Bid'
                log_data_list.append(bid_dict)

            if 'priority' in each and each['priority']:
                pri_obj = self.session.query('Priority where name is "%s"' % each['priority']).first()
                task_obj['priority'] = pri_obj
                prt_dict = copy.deepcopy(log_dict)
                prt_dict['value'] = each['priority']
                prt_dict['details_for'] = 'Complexity'
                log_data_list.append(prt_dict)
            if not task_obj['project_id']:
                project_id = parent_obj['project_id']
            else:
                project_id = task_obj['project_id']

            org_users_list = list()
            if 'current_users' in each and each['current_users']:
                org_users_list = each['current_users'].split(',')

            changed_users_list = list()
            if 'assignee' in each and each['assignee']:
                changed_users_list = each['assignee'].split(',')

            print("Old Users:", org_users_list, '+++++', "New Users:", changed_users_list)
            proj_id = each['project_id']

            added_users = list()
            for a_user in changed_users_list:

                if a_user != '---' and a_user not in org_users_list:
                    added_users.append(a_user)

            # for delete user
            collection_name = self.mongo_database[each['project_name'] + "_tasks"]
            deleted_users = list()
            for d_user in org_users_list:
                if d_user != '---' and d_user not in changed_users_list:
                    deleted_users.append(d_user)

            for user in added_users:
                obj_user = ase_ftrack.add_user_in_project(self.session, user, project_id, True)

                # obj_user = self.session.query('User where username is "%s"' % user).one()
                obj_app = self.session.query(
                    'Appointment where context_id is "%s" and resource.username is "%s"' % (
                        task_id, user)).first()

                if obj_app:
                    current_assignee_user_list = [{'user_name': user, "email_id": user + "@intra.madassemblage.com"}]
                    collection_name.update_one({"ftrack_id": task_id},
                                               {"$addToSet": {"current_assignees":
                                                                  {"$each": current_assignee_user_list}
                                                              }
                                                })
                else:
                    self.session.create('Appointment', {
                        'context': task_obj,
                        'resource': obj_user,
                        'type': 'assignment'
                    })

		add_usr_dict = copy.deepcopy(log_dict)
                add_usr_dict['value'] = user
                add_usr_dict['details_for'] = 'User'
                add_usr_dict['action'] = 'add'
                add_usr_dict['ftrack_id'] = task_obj['id']
                log_data_list.append(add_usr_dict)


            deleted_users = list()
            for d_user in org_users_list:
                if d_user != '---' and d_user not in changed_users_list:
                    deleted_users.append(d_user)

            for del_user in deleted_users:
                if del_user != '---':
                    obj_app = self.session.query(
                        'Appointment where context_id is "%s" and resource.username is "%s"' % (
                            task_id, del_user)).first()
                    if obj_app:
                        self.session.delete(obj_app)
                        self.session.commit()
                    else:
                        delete_users_list = {'user_name': del_user, "email_id": del_user + "@intra.madassemblage.com"}
                        collection_name.update_one({"ftrack_id": task_id},
                                                   {"$pull": {"current_assignees": delete_users_list}})

		    del_usr_dict = copy.deepcopy(log_dict)
		    del_usr_dict['value'] = del_user
                    del_usr_dict['details_for'] = 'User'
                    del_usr_dict['action'] = 'delete'
                    del_usr_dict['ftrack_id'] = task_obj['id']
                    log_data_list.append(del_usr_dict)

        self.session.commit()
        time.sleep(3)
        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])

    '''
            Author:- Kunal Jamdade
            Following code creates project form,
            shot form and sequence form
            and then renders it to template file
    
        '''

    def display_project_thumbnail_manner(self):
        db = self.mongo_database
        project_list = []
        collection_names_list = db.collection_names()
        for element in collection_names_list:
            collection = self.mongo_database[str(element)]
            result = collection.find(
                {
                    'type': 'Project'
                },
                {
                    "_id": 0, "name": 1, "ftrack_id": 1,
                    "resolution": 1, "startdate": 1,
                    "enddate": 1, "startFrame": 1, "fps": 1, "updated_on": 1
                }
            )
            for elements in result:
                project_dict = {}
                for key, value in elements.iteritems():
                    if 'ftrack_status' not in key:
                        project_dict['ftrack_status'] = "NA"
                    if key == 'startdate' or key == "enddate":
                        if 'T' in value:
                            if "." in value:
                                a = datetime.datetime.strptime(str(value), "%Y-%m-%dT%H:%M:%S.%f")
                                val = datetime.datetime.strftime(a, "%Y-%m-%d")
                            else:
                                a = datetime.datetime.strptime(str(value), "%Y-%m-%dT%H:%M:%S")
                                val = datetime.datetime.strftime(a, "%Y-%m-%d")
                            project_dict[key] = val
                        else:
                            project_dict[key] = str(value).encode("utf-8").split(" ")[0]
                    else:
                        project_dict[key] = value

                updated_on = '1900-10-10 20:20:20'
                if 'updated_on' in elements:
                    updated_on = str(elements['updated_on']).split('.')[0]

                project_dict['updated_on'] = updated_on

                project_list.append(project_dict)

        project_list = sorted(project_list,
                              key=lambda x: datetime.datetime.strptime(str(x['updated_on']), '%Y-%m-%d %H:%M:%S'),
                              reverse=True)
        return project_list

    '''
        function to show the details sequence wise 
    '''

    def display_sequence_details(self, prj_name):

        new_prj_name = prj_name.lower() + "_tasks"
        collection = self.mongo_database[new_prj_name]
        fetch_project_name = self.session.query('Project where name is' + prj_name).first()
        fetch_project_id = fetch_project_name.get('id')
        sequence_list = []

        result = collection.find(
            {
                'parent_id': fetch_project_id,
                'object_type': 'Sequence'
            },
            {
                "type": 1, "name": 1, "ftrack_id": 1,
                "description": 1, "_id": 0
            }
        )
        for each in result:
            sequence_dict = {}
            for key, value in each.iteritems():
                if value:
                    sequence_dict[key] = value
                else:
                    sequence_dict[key] = "NA"
            sequence_list.append(sequence_dict)

        return sequence_list

    '''
        function to show details shot wise  
    '''

    def display_shot_details(self, seq_name, prj_name):

        new_prj_name = prj_name.lower() + "_tasks"

        collection = self.mongo_database[new_prj_name]
        shot_list = []
        fetch_seq_name = self.session.query(
            'Sequence where name is %s and project.name is %s' % (seq_name, prj_name)).first()
        fetch_seq_id = fetch_seq_name['id']
        # for i in fetch_seq_name:
        #     if i['parent']['name'] == prj_name:
        #         fetch_seq_id = i['id']

        result = collection.find(
            {
                # 'type':
                #     {
                #         "$in":
                #             [
                #                 "Static shot",
                #                 "Dynamic"
                #             ]
                #     },
                'object_type': 'Shot',
                'parent_id': fetch_seq_id
            },
            {
                "type": 1, "startframe": 1, "ftrack_id": 1,
                "endframe": 1, "_id": 0, "name": 1
            }
        )
        for ele in result:
            shot_dict = {}
            if 'name' in ele:
                shot_dict['name'] = ele['name']
            if 'ftrack_id' in ele:
                shot_dict['ftrack_id'] = ele['ftrack_id']
            if 'startframe' in ele:
                shot_dict['startframe'] = ele['startframe']
            if 'endframe' in ele:
                shot_dict['endframe'] = ele['endframe']

            #            shot_dict['total_frames'] = int(ele['endframe'].split('.')[0]) - int(ele['startframe'].split('.')[0])
            try:
                shot_dict['total_frames'] = int(str(ele['endframe']).split('.')[0]) - int(str(ele['startframe']).split('.')[0])

                shot_dict['fps'] = self.get_fps_seconds(int(str(ele['startframe']).split('.')[0]),
                                                    int(str(ele['endframe']).split('.')[0]), prj_name)
            except Exception as e:
                print "Error", e.message
            # int(ele['endframe']) - int(ele['startframe'])
            # for key, value in ele.iteritems():
            #     if value:
            #         shot_dict[key] = value
            #     else:
            #         shot_dict[key] = "NA"
            shot_list.append(shot_dict)
        return shot_list

    '''
    function to show details asset wise
    '''

    def display_asset_details(self, project_name):
        db = self.mongo_database
        new_prj_name = project_name.lower() + "_tasks"
        collection = self.mongo_database[new_prj_name]
        asset_list = []
        fetch_prject_name = self.session.query("Project where name is" + project_name).first()
        fetch_project_id = fetch_prject_name.get('id')

        result = collection.find(
            {
                'object_type': 'Asset Build',
                'parent_id': fetch_project_id
            },
            {
                'type': 1, "description": 1, "ftrack_id": 1,
                "_id": 0, "name": 1
            }
        )
        for ele in result:
            asset_dict = {}
            for key, value in ele.iteritems():
                if value:
                    asset_dict[key] = value
                else:
                    asset_dict[key] = "NA"
            asset_list.append(asset_dict)
        return asset_list

    '''
        function to show task details
    '''

    def display_task_details(self, project_name, seq_name, type_name, shot_name, asset_name):
        new_prj_name = project_name.lower() + "_tasks"
        collection = self.mongo_database[new_prj_name]
        task_list = []
        type_name = type_name.strip().split(" ")[0]
        priority_dict = {'Urgent': "A", 'High': "B", 'Medium': "C", 'Low': "D"}

        type_id = ''

        if type_name == "Sequence":
            fetch_sequence_name = self.session.query("Sequence where name is %s and project.name is %s" %
                                                     (seq_name, project_name)
                                                     ).first()
            type_id = fetch_sequence_name['id']
            # result = collection.find(
            #     {
            #         "object_type": "Task",
            #         "parent_id": seq_id
            #     },
            #     {
            #         'type': 1, "ftrack_status": 1,
            #         "_id": 0, "name": 1
            #     }
            # )
        elif type_name == "Shot":
            fetch_shot_name = self.session.query(
                "Shot where name is %s and parent.name is %s and project.name is %s" %
                (shot_name, seq_name, project_name)
            ).first()
            type_id = fetch_shot_name['id']
            # seq_id = fetch_shot_name['id']
            # result = collection.find(
            #     {
            #         "object_type": "Task",
            #         "parent_id": seq_id
            #     },
            #     {
            #         'type': 1, "ftrack_status": 1,
            #         "_id": 0, "name": 1,
            #         "object_type": 1
            #     }
            # )
        elif type_name == "Asset":
            fetch_asset_name = self.session.query("AssetBuild where name is %s and project.name is %s" %
                                                  (asset_name, project_name)
                                                  ).first()
            type_id = fetch_asset_name['id']
            # result = collection.find(
            #     {
            #         "object_type": "Task",
            #         "parent_id": seq_id
            #     },
            #     {
            #         'type': 1, "ftrack_status": 1,
            #         "_id": 0, "name": 1
            #     }
            # )
        result = collection.find(
            {
                "object_type": {"$in": ["Task", "Shot Asset Build"]},
                "parent_id": type_id
            },
            {
                'type': 1, "ftrack_status": 1, "ftrack_id": 1,
                "_id": 0, "name": 1, "bid": 1, "priority": 1,
                "startdate": 1, "enddate": 1, "current_assignees": 1
            }
        )
        for ele in result:
            task_dict = {}
            if 'ftrack_id' in ele:
                task_dict['ftrack_id'] = ele['ftrack_id']
            if 'name' in ele:
                task_dict['name'] = ele['name']
            if 'current_assignees' in ele:
                if len(ele['current_assignees']) > 0:
                    assignees = ele['current_assignees'][0]['user_name']
                    task_dict['current_assignees'] = assignees
            if 'bid' in ele:
                task_dict['bid'] = float(ele['bid']) / (60 * 60 * 10)
            if 'ftrack_status' in ele:
                task_dict['ftrack_status'] = ele['ftrack_status']
            if 'priority' in ele:
                priority = str(ele['priority']).encode('utf-8')
                if priority in priority_dict:
                    priority = priority_dict[priority]
                task_dict['priority'] = priority
            if 'startdate' in ele:
                start_date = ele['startdate']
                if 'T' in start_date:
                    start_date = start_date.split(".")[0]
                    datetime_obj = datetime.datetime.strptime(start_date, "%Y-%m-%dT%H:%M:%S")
                    string_date_format = datetime.datetime.strftime(datetime_obj, "%Y-%m-%d")
                else:
                    # start_date = start_date.split(" ")[0]
                    datetime_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d %H:%M:%S")
                    string_date_format = datetime.datetime.strftime(datetime_obj, "%Y-%m-%d")
                task_dict['startdate'] = string_date_format
            if 'enddate' in ele:
                end_date = ele['enddate']
                if 'T' in end_date:
                    end_date = end_date.split(".")[0]
                    datetime_obj = datetime.datetime.strptime(end_date, "%Y-%m-%dT%H:%M:%S")
                    string_date_format = datetime.datetime.strftime(datetime_obj, "%Y-%m-%d")
                else:
                    # start_date = start_date.split(" ")[0]
                    datetime_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d %H:%M:%S")
                    string_date_format = datetime.datetime.strftime(datetime_obj, "%Y-%m-%d")
                task_dict['enddate'] = string_date_format
            task_list.append(task_dict)
        return task_list

    '''
        function to get the details before
        update method is called
        
    '''

    def get_details_before_update(self, name, entity_id):

        if not (name and entity_id):
            print("Project Name / Entity id not found")
            return False

        collection = self.mongo_database[name.lower() + "_tasks"]
        result = collection.find_one({'ftrack_id': entity_id}, {'_id': 0, 'added_on': 0, 'updated_on': 0})

        data_list = list()
        if result:
            update_dict = {}
            try:
                if 'startdate' in result:
                    if 'T' in result['startdate']:
                        new_val = str(result['startdate']).split(".")[0]
                        a = datetime.datetime.strptime(new_val, "%Y-%m-%dT%H:%M:%S")
                    else:
                        new_val = str(result['startdate']).split(" ")[0]
                        a = datetime.datetime.strptime(new_val, "%Y-%m-%d")
                    val = datetime.datetime.strftime(a, "%Y-%m-%d")
                    update_dict['startdate'] = val
                if 'enddate' in result:
                    if 'T' in result['enddate']:
                        new_val = str(result['enddate']).split(".")[0]
                        a = datetime.datetime.strptime(new_val, "%Y-%m-%dT%H:%M:%S")
                    else:
                        new_val = str(result['enddate']).split(" ")[0]
                        a = datetime.datetime.strptime(new_val, "%Y-%m-%d")
                    val = datetime.datetime.strftime(a, "%Y-%m-%d")
                    update_dict['enddate'] = val
                if 'bid' in result:
                    val = (float(result['bid'])) / (60 * 60 * 10)
                    update_dict['bid'] = val
                if 'current_assignees' in result:
                    ll = result['current_assignees'][0]
                    update_dict['current_assignees'] = ll['user_name']
                for key, value in result.iteritems():
                    if str(key).encode("utf-8") not in update_dict:
                        update_dict[key] = value
                if 'startframe' not in result:
                    update_dict['startframe'] = '101'
                if 'fps' not in result:
                    update_dict['fps'] = '24'
                if 'project_folder' not in result:
                    update_dict['project_folder'] = str("/ASE/01prj/" + str(name).upper()).strip()
                data_list.append(update_dict)
            except KeyError as ke:
                print(ke.message)

        return data_list

    '''
        function to get task data before update
        from asset, sequence and shot
    '''

    @staticmethod
    def get_data_before_update(asset_task_id, collection, task_id):

        update_data_list = []
        result = collection.find(
            {
                'ftrack_id': task_id,
                'parent_id': asset_task_id
            },
            {
                "_id": 0, "ftrack_id": 0,
                "object_type": 0, "updated_on": 0,
                "projectschemeid": 0, "added_on": 0,
                "parent_id": 0, "parent_object_name": 0, "endframe": 0
            }
        )
        for ele in result:
            update_dict = {}
            for k, v in ele.items():
                if 'startdate' in k or 'enddate' in k:
                    if 'T' in v:
                        a = datetime.datetime.strptime(str(v), "%Y-%m-%dT%H:%M:%S")
                        val = datetime.datetime.strftime(a, "%Y-%m-%d")
                        update_dict[k] = val
                    else:
                        update_dict[k] = str(v).encode("utf-8").split(" ")[0]
                elif 'current_assignees' in k:
                    update_dict[k] = v[0]['user_name']
                else:
                    update_dict[k] = v
            update_data_list.append(update_dict)

        return update_data_list

    # function to dynamically assign task types
    # to their respective drop-down
    def get_task_types(self, type_name, asset_type_name):
        list_type_choices = self.get_tasks_template()

        type_name = type_name.strip().split(" ")[0]
        if type_name == "Shot":
            return list_type_choices[type_name]['Static shot']
        elif type_name == "Asset":
            if not asset_type_name == '' and asset_type_name in list_type_choices["Asset Build"]:
                return list_type_choices["Asset Build"][asset_type_name]
            else:
                # list_type_choices["Asset Build"]
                return list_type_choices["Asset Build"]
        elif type_name == "Sequence":
            return list_type_choices[type_name][type_name]

    # function to get multiple assignee users
    def get_multiple_assignees(self):
        return self.ldap_users()

    '''
        function to create tasks inside shot sequence and asset
        param:
        task_name,
        parent_obj,
        task_status
        task_type
    '''

    def create_tasks(self, task_name, obj_parent, task_status, task_type):

        if task_type in self.stereo_tasks:
            obj_shot_asset = self.session.query(
                "ShotAssetBuild where id is '%s' and name is 'Stereo'" % obj_parent).first()
            if obj_shot_asset:
                obj_parent = obj_shot_asset
            else:
                obj_shot_asset = self.session.query(
                    "ShotAssetBuild where parent.id is '%s' and name is 'Stereo'" % obj_parent).first()
                if obj_shot_asset:
                    obj_parent = obj_shot_asset
                else:
                    obj_shot_type = self.session.query("Type where name is 'Generic'").first()
                    obj_parent = self.session.create('ShotAssetBuild', {
                        'name': 'Stereo',
                        'parent': obj_parent,
                        'status': task_status,
                        'type': obj_shot_type
                    })
        if task_type in self.type_name:
            _task_type = self.type_name[task_type]
        else:
            _task_type = task_type
        obj_type = self.session.query("Type where name is '%s'" % _task_type).first()

        task_object = self.session.create("Task", {
            'name': task_name,
            'parent': obj_parent,
            'status': task_status,
            'type': obj_type
        })
        return task_object

    def get_fps_seconds(self, start_frame, end_frame, prj_name):

        project_obj = self.session.query("Project where name is {0}".format(prj_name)).first()
        project_fps = project_obj['custom_attributes']['fps']

        fps = (int(end_frame) - (int(start_frame) - 1)) / project_fps

        return round(fps, 2)

    def duplicate_name_check(self, task_name_check, prj_name, seq_name, shot_name, flag):

        collection = self.mongo_database[prj_name.lower() + "_tasks"]
        if flag == 'Sequence_task':
            seq_obj = self.session.query("Sequence where name is '%s' and project.name is '%s'"
                                         % (seq_name, prj_name)
                                         ).first()
            ftrack_id = seq_obj['id']
            result = collection.find(
                {
                    'name': task_name_check,
                    'parent_id': ftrack_id
                }
            )
            # count = result.count()
        if flag == 'Asset_task':
            asset_name = seq_name
            asset_obj = self.session.query("AssetBuild where name is '%s' and project.name is '%s'"
                                           % (asset_name, prj_name)
                                           ).first()
            ftrack_id = asset_obj['id']
            result = collection.find(
                {
                    'name': task_name_check,
                    'parent_id': ftrack_id
                }
            )
            # count = result.count()
        if flag == 'Shot_task':
            shot_obj = self.session.query(
                "Shot where name is '%s' and parent.name is '%s' and parent.parent.name is '%s'"
                % (shot_name, seq_name, prj_name)
            ).first()
            ftrack_id = shot_obj['id']
            result = collection.find(
                {
                    'name': task_name_check,
                    'parent_id': ftrack_id
                }
            )
            # count = result.count()
        if flag == 'prj_name':
            result = collection.find({'name': prj_name})
        if flag == 'asset_name':
            result = collection.find(
                {
                    'name': task_name_check,
                    'type': seq_name
                }
            )
        if flag == 'seq_name':
            result = collection.find(
                {
                    'name': task_name_check
                }
            )
        if flag == 'shot_name':
            if seq_name:
                ftrack_id = seq_name
            else:
                seq_obj = self.session.query(
                    "Sequence where name is '%s' and parent.name is '%s'" % (seq_name, prj_name)).first()
                ftrack_id = seq_obj['id']

            result = collection.find(
                {
                    'name': task_name_check,
                    'parent_id': ftrack_id
                }
            )
        try:
            count = result.count()
        except Exception as e:
            print(e.message)

        if count:
            return True
        else:
            return False

    def update_sequence_details(self, prj_name):
        """
        Function to update details of sequence.
        :param prj_name: Project name
        :return: List of all the sequnece
        """
        db = self.mongo_database
        fetch_prj_ids = db.create_project_document.find(
            {
                "project_name": prj_name
            },
            {
                "_id": 0,
                "ftrack_id": 1
            }
        )
        sequence_list = ''
        for ids in fetch_prj_ids:
            result = db.create_sequence_document.find(
                {
                    'parent_id': ids['ftrack_id']
                },
                {
                    'name': 1,
                    "_id": 0
                }
            )
            sequence_list = [ele for ele in result]
        return sequence_list

    def add_asset(self, task_id, selected_asset, asset_name, old_asset_ids, page, parent_path=''):
        """
        Function to add new asset to the database.
        :param task_id: Task id
        :param selected_asset: List of selected new assets
        :param asset_name: Asset type
        :param old_asset_ids: List of old selected assets
        :param page: Current activity page
        :param parent_path: Path of the parent asset
        :return: None
        """
        asset_name = asset_name.replace(' ', '')
        task_object = self.session.query(asset_name + ' where id is "%s"' % task_id).first()
        if selected_asset == '':
            selected_list = []
        else:
            selected_list = str(selected_asset).split(",")

        if old_asset_ids == '' or old_asset_ids == 'undefined':
            old_selected_list = []
        else:
            old_selected_list = str(old_asset_ids).split(",")

        # For create new  links
        log_data_list = []
        asset_list = list()
        project_name = ''
        if len(selected_list) >= 1 and selected_list != '':
            action = 'add'
            for asset_id in selected_list:
                log_dict = {}
                obj_assets = self.session.query('AssetBuild where id is "%s"' % asset_id).first()
                project_name = obj_assets['project']['name']
                if asset_id not in old_selected_list:
                    # obj_assets = self.session.query('AssetBuild where id is "%s"' % asset_id).first()

                    self.session.create('TypedContextLink', {
                        'from': obj_assets,
                        'to': task_object
                    })

                    # For activity logs
                    log_dict['project'] = obj_assets['project']['name']
                    log_dict['action'] = action
                    log_dict['object_type'] = asset_name
                    log_dict['sub_type'] = 'Asset Build'
                    log_dict['parent_id'] = obj_assets['parent_id']
                    log_dict['path'] = obj_assets['project']['name'] + ":" + parent_path.replace("_", ":")
                    log_dict['page'] = page.strip()
                    log_dict['ftrack_id'] = obj_assets['id']
                    log_dict['value'] = obj_assets['name']
                    log_dict['details_for'] = 'Links'
                    log_data_list.append(log_dict)

                # Fore save in database
                asset_list.append(asset_id)
            collection_name = self.mongo_database[project_name + "_tasks"]
            collection_name.update_one({"ftrack_id": task_id},
                                       {"$set": {"links": asset_list}
                                        })
        # For remove older links
        if len(old_selected_list) >= 1:
            action = 'delete'
            for asset_id in old_selected_list:
                log_dict1 = {}
                # For activity logs
                del_asset = self.session.query('AssetBuild where id is "%s"' % asset_id).first()
                log_dict1['project'] = del_asset['project']['name']
                log_dict1['action'] = action
                log_dict1['object_type'] = asset_name
                log_dict1['sub_type'] = 'Asset Build'
                log_dict1['parent_id'] = del_asset['parent_id']
                log_dict1['path'] = del_asset['project']['name'] + ":" + parent_path.replace("_", ":")
                log_dict1['page'] = page.strip()
                log_dict1['ftrack_id'] = del_asset['id']
                log_dict1['value'] = del_asset['name']
                log_dict1['details_for'] = 'Links'
                if len(selected_list) > 0:
                    if asset_id not in selected_list:
                        del_asset_link = self.session.query(
                            'TypedContextLink where from_id is "%s" and to_id is "%s"' % (asset_id, task_id)).first()
                        self.session.delete(del_asset_link)
                        log_data_list.append(log_dict1)

                else:
                    del_asset_link = self.session.query(
                        'TypedContextLink where from_id is "%s" and to_id is "%s"' % (asset_id, task_id)).first()
                    self.session.delete(del_asset_link)
                    log_data_list.append(log_dict1)

        self.session.commit()
        # call logs
        for log in log_data_list:
            self.add_activity_log(project=log['project'], value=log['value'], ftrack_id=log['ftrack_id'],
                                  action=log['action'], object_type=log['object_type'], details_for=log['details_for'],
                                  sub_type=log['sub_type'], parent_id=log['parent_id'],
                                  path=log['path'], page=log['page'])

    # delete note
    def delete_note(self, note_id):
        try:
            if note_id:
                note_obj = self.session.query('Note where id is "%s"' % note_id).first()
                self.session.delete(note_obj)
                self.session.commit()
                print("deteted successsfully.............")

        except:
            print("Error......")

    # ---------------------------------------------------------------------------- #
    # load task for create entity
    def load_task(self, selected_object, selected_asset_type):
        """
        Function to get list of task
        :param selcted_object: Object name
        :param selcted_asset_type: Asset type
        :return: list of taks
        """

        # query = 'Asset where parent.id is "%s"' % parent_id
        with open(self.task_template_jfile) as data_file:
            data = json.load(data_file)

            type_list = data[selected_object][selected_asset_type]

        return type_list

    # ---- for load table data---- #

    def load_asset_name(self, selected_project, selected_object, selected_asset_type, selected_task):
        """
        Function to get assets name.
        :param selected_project: Project name
        :param selected_object: Object name
        :param selected_asset_type: Selected asset type
        :param selected_task: Seolected task name
        :return:
        """
        collection = self.mongo_database['%s_tasks' % selected_project]

        time.sleep(3)
        # obj_count = collection.find(
        #     {'parent_object_type': selected_object, 'name': selected_task, 'parent_type': selected_asset_type},
        #     {'_id': 0, 'current_assignees':1, 'ftrack_id':1, 'ftrack_status': 1})
        #

        obj_count = collection.find(
            {'object_type': selected_object, 'type': selected_asset_type})

        task_name_list = list()
        for obj in obj_count:
            task_name_dict = dict()
            ftrack_id = obj['ftrack_id']
            # task_name = ('_').join(obj['path'].split(':')[1:-1])
            task_name = ('_').join(obj['path'].split(':')[1:])
            task_name_dict['ftrack_id'] = ftrack_id
            task_name_dict['task_name'] = task_name

            task_name_list.append(task_name_dict)

        return task_name_list

    # load entity tasks
    def load_entity_data(self, parent_ids, project_name, selected_object, selected_task):
        """
        Function to get data regarding to a particular task.
        :param parent_ids: Task parent id
        :param project_name: Project name
        :param selected_object: Selected object type
        :param selected_task: Selected task
        :return: List of dictionary of the task data
        """
        print("//-------------- inside load_entity_task --------------------------//")
        parent_ids = parent_ids.split(',')
        priority_dict = {'Urgent': 'A', 'High': 'B', 'Medium': 'C', 'Low': 'D', 'None': 'None'}
        task_data_list = list()
        task_parent_dict = dict()

        collection = self.mongo_database['%s_tasks' % project_name]

        obj_count = collection.find({'parent_id': {'$in': parent_ids}, 'object_type': "Task", 'name': selected_task})

        now = datetime.datetime.now()
        for obj in obj_count:
            task_data_dict = dict()

            task_name = ('_').join(obj['path'].split(':')[1:-1])
            task_data_dict['name'] = task_name
            task_data_dict['current_assignees'] = "---"
            task_data_dict['status'] = "Ready to start"
            task_data_dict['bid'] = "0"
            task_data_dict['complexity'] = "D"
            # now.strftime("%Y-%m-%d %H:%M")
            task_data_dict['startdate'] = now.strftime("%Y-%m-%d")
            task_data_dict['enddate'] = now.strftime("%Y-%m-%d")
            task_data_dict['description'] = "---"
            task_data_dict['startframe'] = "101"
            task_data_dict['endframe'] = "101"
            task_data_dict['asset_ids'] = ""

            if selected_object == 'Shot':
                frame_obj = collection.find_one({'ftrack_id': obj['parent_id']})
                if 'startframe' in frame_obj:
                    task_data_dict['startframe'] = int(float(frame_obj['startframe']))
                if 'endframe' in frame_obj:
                    task_data_dict['endframe'] = int(float(frame_obj['endframe']))
            if 'current_assignees' in obj and len(obj['current_assignees']) >= 1:
                user_list = list()
                for user in obj['current_assignees']:
                    user_list.append(user['user_name'])

                task_data_dict['current_assignees'] = sorted(user_list)
            if 'ftrack_status' in obj:
                task_data_dict['status'] = obj['ftrack_status']
                status_lbl = (obj['ftrack_status']).lower()
                task_data_dict['status_label'] = status_lbl.replace(" ", "_")

            if 'bid' in obj:
                bid = obj['bid']
                bid = float(bid) / (10 * 60 * 60)
                task_data_dict['bid'] = bid
            if 'priority' in obj:
                task_data_dict['complexity'] = priority_dict[obj['priority']]
            if 'startdate' in obj:
                st = str(obj['startdate'])
                task_data_dict['startdate'] = datetime.datetime.strftime(
                    datetime.datetime.strptime(st.split("T")[0], "%Y-%m-%d"), "%Y-%m-%d")
            if 'enddate' in obj:
                ed = str(obj['enddate'])
                task_data_dict['enddate'] = ed
            if 'description' in obj and obj['description'] != '':
                task_data_dict['description'] = obj['description']
            if 'ftrack_id' in obj:
                task_data_dict['ftrack_id'] = obj['ftrack_id']
            if 'parent_id' in obj:
                task_data_dict['parent_id'] = obj['parent_id']
            if 'parent_object_type' in obj:
                task_data_dict['parent_object_type'] = obj['parent_object_type']
            task_parent_dict[obj['parent_id']] = task_data_dict

        for id in parent_ids:
            if id in task_parent_dict.keys():
                task_data_list.append(task_parent_dict[id])
            else:
                default_dict = dict()
                task_name = ''
                if selected_object == 'Shot':
                    obj_name_count = collection.find_one({'ftrack_id': id, 'object_type': 'Shot'})
                    task_name = ('_').join(obj_name_count['path'].split(':')[1:3])
                    default_dict['startframe'] = "101"
                    default_dict['endframe'] = "101"
                    if 'startframe' in obj_name_count:
                        default_dict['startframe'] = int(float(obj_name_count['startframe']))
                    if 'endframe' in obj_name_count:
                        default_dict['endframe'] = int(float(obj_name_count['endframe']))
                elif selected_object == 'Sequence':

                    obj_name_count = collection.find_one({'ftrack_id': id, 'object_type': 'Sequence'})
                    task_name = ('_').join(obj_name_count['path'].split(':')[1:3])
                else:
                    obj_name_count = collection.find_one({'ftrack_id': id, 'object_type': 'Asset Build'})
                    task_name = obj_name_count['name']

                if obj_name_count:
                    default_dict['ftrack_id'] = ""
                    default_dict['name'] = task_name
                    default_dict['current_assignees'] = "---"
                    default_dict['status'] = "Ready to start"
                    default_dict['status_label'] = "ready_to_start"
                    default_dict['bid'] = "0"
                    default_dict['complexity'] = "D"
                    default_dict['startdate'] = now.strftime("%Y-%m-%d")
                    default_dict['enddate'] = now.strftime("%Y-%m-%d")
                    default_dict['description'] = obj_name_count['description']
                    default_dict['parent_id'] = id
                    default_dict['parent_object_type'] = selected_object
                    task_data_list.append(default_dict)

        return task_data_list

    @staticmethod
    def get_range(start, stop, step):
        range_list = list()
        i = start
        while i < stop:
            yield i
            i += step
        range_list.append(i)

    def save_entity_data(self, data_list):
        print("//---------------------- save data --------------------------------//")
        self.update_form_data(entity_name="Task", data_list=data_list)
        task_data_list = []
        return task_data_list

    def asset_build_create(self, entity_name, data_list):
        self.update_form_data(entity_name, data_list)
        print("asset_build_create success.......")

    # range from 000 - 999 and 0000 - 9999
    @staticmethod
    def range_sq_sc(task_name, project_name, x_range=1):
        range_list = list()
        x_range = int(x_range)
        if task_name == 'sq':
            if project_name == 'swn' or project_name == 'SWAN' or project_name == 'sw9':
                range_list = ["sq%03d" % x for x in range(1, 1000, x_range)]
            else:
                range_list = ["%03d" % x for x in range(1, 1000, x_range)]
        if task_name == 'sc':
            if project_name == 'swn' or project_name == 'SWAN' or project_name == 'sw9':
                range_list = ["sc%03d" % x for x in range(0, 1000, x_range)]
            else:
                range_list = ["%04d" % x for x in range(0, 1000, x_range)]
        return range_list

    def sequence_delivery(self, request, project='ice'):

        username = request.user.username
        if not username:
            return HttpResponseRedirect("/login")

#	self.get_user_columns(username)
        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect("/login/")

        template_name = 'sequence_delivery.html'

        seq_dict = {}
        projects = self.get_projects()
#        self.get_user_details()
        seq_dict['emp_code'] = 'blank'
        if username in self.employee_details:
            seq_dict['emp_code'] = self.employee_details[username]['emp_code']

        seq_dict['user_id'] = username.upper()

        seq_dict['data'] = {'projects': projects,
                            'current_project': project,
                            'user_role': self.user_role}
        # seq_dict['total_time'] = total_sequence_duration
        # seq_dict['current_project'] = project
        # order_dict = OrderedDict(sorted(total_sequence_duration.items(), key=lambda (k, v): (v, k)))
        #
        return render(request, template_name, seq_dict)

    def sequence_task_total_time_duration(self, first, last, project='ice'):

        collection_name = self.mongo_database[project + "_tasks"]
        total_sequence_duration = {}
        summary_dict = {}
        start_date = end_date = 0

        start_date = first + " 00:00:00"
        end_date = last + " 23:59:59"
        start_date = datetime.datetime.strptime(str(start_date).strip(), "%Y-%m-%d %H:%M:%S")
        end_date = datetime.datetime.strptime(str(end_date).strip(), "%Y-%m-%d %H:%M:%S")

        project_fps = 0

        task_list = ['Layout', 'Animation', 'Lighting', 'Shave Hair', 'Set Dressing']
        ftrack_status_list = ['Client Reject', 'In progress', 'Internal Approved', 'Outsource Client Review',
                              'Client approved', 'Pending Client Review', 'Outsource Client Approved']

        query_dict = {
            "parent_object_type": "Shot",
            "updated_on": {
                "$gte": start_date,
                "$lte": end_date
            },
            "ftrack_status": {"$in": ftrack_status_list}
        }
        if '2013' in str(first).strip():
            query_dict['updated_on'].pop("$gte")

        # if str(first).strip() != str(last).strip():
        #     query_dict['updated_on']["$gte"] = start_date
        if str(first).strip() == str(last).strip():
            status_list = ['In progress', 'Client Reject']
            query_dict['ftrack_status']['$in'] = status_list

        data = collection_name.find(query_dict)

        proj_data = collection_name.find_one({"name": project, "object_type": "Project"}, {'fps': 1})
        try:
            project_fps = int(proj_data['fps'])
        except KeyError as ke:
            print(ke.message)

        print(str(start_date), str(end_date))

        query_result = collection_name.find({
            "parent_object_type": "Sequence",
            "object_type": "Shot",
            "name": {"$exists": True}
        })

        shot_data = list(query_result.sort('name', pymongo.ASCENDING))
        total_sequence_time = shot_duration = 0
        check_uniq_shot = dict()
        for ele in data:
            task_name = ele['name']
            full_path = str(ele['path'])
            split_var = full_path.split(":")
            sequence_name = split_var[1]
            shot_name = split_var[2]
            project_name = split_var[0]
            shot_path = project_name + ":" + sequence_name + ":" + shot_name
            if task_name in task_list:
                try:
                    ftrack_status = ele['ftrack_status']
                except KeyError as ke:
                    ftrack_status = 'None'
                shot_list = filter(lambda x: x if sequence_name in x['path'] and shot_name in x['path'] else None,
                                   shot_data)
                # shot_based_query = collection_name.find_one({"path": shot_path}, {"startframe": 1, "endframe": 1})
                try:
                    start_frame = float(shot_list[0]['startframe'])
                    end_frame = float(shot_list[0]['endframe'])
                    shot_duration = round(float(end_frame - start_frame) / project_fps, 2)
                    total_sequence_time = round((shot_duration / 60), 2)

                    # start_frame = int(shot_based_query['startframe']) - 1
                    # end_frame = int(shot_based_query['endframe'])
                    #
                    # shot_duration = round(float((end_frame - start_frame)) / project_fps, 2)
                    # total_sequence_time = (shot_duration / 60)

                except KeyError:
                    pass

                if sequence_name not in total_sequence_duration:
                    total_sequence_duration[sequence_name] = {}

                if 'total_time' not in total_sequence_duration[sequence_name]:
                    total_sequence_duration[sequence_name]['total_time'] = total_sequence_time

                else:
                    if sequence_name+':'+shot_name not in check_uniq_shot:
                        total_sequence_duration[sequence_name]['total_time'] = \
                            round(total_sequence_duration[sequence_name]['total_time'] + total_sequence_time, 1)

                check_uniq_shot[sequence_name+':'+shot_name] = 1

                if task_name not in total_sequence_duration[sequence_name]:
                    total_sequence_duration[sequence_name][task_name] = {}

                    total_sequence_duration[sequence_name][task_name]['IA'] = {}
                    total_sequence_duration[sequence_name][task_name]['IA']['total_secs'] = 0
                    total_sequence_duration[sequence_name][task_name]['IA']['total_minutes'] = 0
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_count'] = []
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_details'] = []

                    total_sequence_duration[sequence_name][task_name]['CA'] = {}
                    total_sequence_duration[sequence_name][task_name]['CA']['total_secs'] = 0
                    total_sequence_duration[sequence_name][task_name]['CA']['total_minutes'] = 0
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_count'] = []
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_details'] = []

                    total_sequence_duration[sequence_name][task_name]['WIP'] = {}
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_secs'] = 0
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_minutes'] = 0
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_count'] = []
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_details'] = []

                    total_sequence_duration[sequence_name][task_name]['PA'] = {}
                    total_sequence_duration[sequence_name][task_name]['PA']['total_secs'] = 0
                    total_sequence_duration[sequence_name][task_name]['PA']['total_minutes'] = 0
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_count'] = []
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_details'] = []

                    total_sequence_duration[sequence_name][task_name]['CR'] = {}
                    total_sequence_duration[sequence_name][task_name]['CR']['total_secs'] = 0
                    total_sequence_duration[sequence_name][task_name]['CR']['total_minutes'] = 0
                    total_sequence_duration[sequence_name][task_name]['CR']['shot_count'] = []
                    total_sequence_duration[sequence_name][task_name]['CR']['shot_details'] = []

                if task_name not in summary_dict:
                    summary_dict[task_name] = {}
                    summary_dict[task_name]['IA'] = 0
                    summary_dict[task_name]['CA'] = 0
                    summary_dict[task_name]['WIP'] = 0
                    summary_dict[task_name]['PA'] = 0
                    summary_dict[task_name]['CR'] = 0

                if ftrack_status == 'Internal Approved':
                    total_sequence_duration[sequence_name][task_name]['IA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['IA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['IA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['IA'] += shot_duration #round(summary_dict[task_name]['IA'] +
                    # total_sequence_time, 2)

                if ftrack_status in ['Client approved', 'Outsource Client Approved']:
                    total_sequence_duration[sequence_name][task_name]['CA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['CA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['CA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['CA'] += shot_duration
                if ftrack_status == 'In progress':
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['WIP']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['WIP'] += shot_duration#round(summary_dict[task_name]['WIP'] +
                    # total_sequence_time, 2)

                if ftrack_status in ['Pending Client Review', 'Outsource Client Review']:
                    total_sequence_duration[sequence_name][task_name]['PA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['PA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['PA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['PA'] += shot_duration#round(summary_dict[task_name]['PA'] +
                    # total_sequence_time, 2)

                if ftrack_status == "Client Reject":
                    total_sequence_duration[sequence_name][task_name]['CR']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['CR']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['CR']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['CR']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['CR']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['CR'] += shot_duration#round(summary_dict[task_name]['CR'] +
                    # total_sequence_time, 2)

        total_sequence_duration['summary'] = summary_dict

        return total_sequence_duration

    def get_shot_frame_duration(self, startframe, endframe, ftrack_status, project_fps):

        if ftrack_status == '':
            # query_shot_frame = collection_name.find_one({"path": shot_path}, {"startframe": 1, "endframe": 1})
            try:
                total_time = round((int(endframe) - (int(startframe) - 1)) / project_fps, 0)
                return total_time
            except KeyError as ke:
                pprint(ke.message)

    def published_version_detail_view(self, request):
        if not request.user.username:
            return HttpResponseRedirect("/login")

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect("/login/")

        template_name = 'publi_ver_detail_view.html'

        return render(request, template_name, {})

    def get_note_history(self, from_name, project, last_row, page=''):
        """
        Function to get the history of notes.
        :param from_name: Path of current task
        :param project: Project name
        :param last_row: Last row index for getting data on index basis
        :param page: Current page name
        :return: List of dictionary of notes data

        """
        print("------------- get_note_history-----------------")
        start_row = int(last_row) - 15
        last_row = int(last_row) - 1
        from_name = from_name.replace(from_name.split(':')[0], from_name.split(':')[0].lower())
        model_class = getModel(str(project) + '_notes')
        if page.strip() == 'Task Entity':
            notes_obj = model_class.objects.order_by('-added_on').filter(Q(from_name__icontains=from_name) | Q(to_name__icontains=from_name))[start_row:last_row]
        else:
            notes_obj = model_class.objects.order_by('-added_on').filter(Q(from_name__iexact=from_name) | Q(to_name__iexact=from_name))[start_row:last_row]

        print("notes_obj: ", len(notes_obj))
        data_list = list()
        for obj in notes_obj:
            data_dict = dict()
            data_dict['department'] = obj.task
            data_dict['status'] = obj.status
            data_dict['added_by'] = obj.added_by
            data_dict['added_on'] = str(obj.added_on).split('.')[0]
            # version
            path = obj.task_path
            task_path = path.replace(path.split(':')[-1], obj.pub_version)
            data_dict['task_path'] = task_path
            data_dict['note_text'] = obj.note_text

            data_list.append(data_dict)

        return data_list

    def get_activity_log_details(self, from_name, project, last_row, task='', page='', parent_id=''):
        """
        Function to get the activity logs detail from database !
        :param from_name: Path of current task
        :param project: Project name
        :param last_row: Last row index for getting data on index basis
        :param task: Task name
        :param page: Current page name
        :param parent_id: Parent id of Task
        :return: List of dictionary of activity logs data
        """
        print("------------- get_activity_log_details -----------------")
        start_row = int(last_row) - 25
        last_row = int(last_row) - 1
        from_name = from_name.replace(from_name.split(':')[0], from_name.split(':')[0].lower())
        model_class = getModel(str(project) + '_activity_log')
        from_name = from_name.replace("/", ":")
        q = Q(path=from_name) | Q(parent_id=parent_id)
        if task:
            from_name = from_name + ':' + task
            q = Q(path=from_name, parent_id=parent_id)
        act_log_obj = model_class.objects.order_by('-acitivity_date').filter(q)[start_row:last_row]
        data_list = list()
        for obj in act_log_obj:
            data_dict = dict()
            data_dict['details_for'] = obj.details_for
            data_dict['activity_by'] = obj.activity_by
            data_dict['action'] = obj.action
            data_dict['value'] = obj.value
            data_dict['activity_date'] = str(obj.acitivity_date).split('.')[0]
            data_dict['path'] = obj.path

            data_list.append(data_dict)

        return data_list

    def add_activity_log(self, project='', value='', ftrack_id='', action='add', object_type='', details_for='',
                         sub_type='', parent_id='', path='', page=''):
        """
        Function for add user activity details in database !
        :param project: Project name
        :param value: Value to be changed
        :param ftrack_id: Task id or parent id
        :param action: Action performed by user
        :param object_type: Object type of task
        :param details_for: Detail for change value
        :param sub_type: Sub type of Task
        :param parent_id: Parent id of Task
        :param path: Path of Task
        :param page: Current page name
        :return: None
        """
        db_name = str(project) + '_activity_log'
        db_obj = getModel(db_name)
        model_obj = db_obj.objects.create(activity_by=self.username, page=page)
        date_now = datetime.datetime.now()
        model_obj.acitivity_date = date_now
        model_obj.value = value
        model_obj.ftrack_id = ftrack_id
        model_obj.action = action
        model_obj.object_type = object_type
        model_obj.details_for = details_for
        model_obj.sub_type = sub_type
        model_obj.parent_id = parent_id
        model_obj.path = path
        model_obj.save()
        print(self.username, str(date_now), project, value, ftrack_id, action, object_type, details_for, sub_type, parent_id, path, page)

        # ATOM help documentation code

    def help_document(self, request):
        user_name = request.user.username
        if not user_name:
            return HttpResponseRedirect("/login/")

        return render(request, 'help_documentation.html', {})
