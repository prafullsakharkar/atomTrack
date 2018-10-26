import base64
import datetime
import json
import os
import re
import smtplib
import time

import ldap
import pymongo
import csv
import copy
import ase_atomsession

from bson.objectid import ObjectId
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from settings import BASE_DIR, PROJ_BASE_DIR, MONGO_SERVER, DEVMODE, MONGO_DB

from pprint import pprint
from socket import socket, AF_INET, SOCK_DGRAM

from mongoengine.queryset.visitor import Q
from .forms import CreateProject, CreateSequence, CreateShot, CreateAsset, CreateTask, AttachmentForm
from .models import Attachment, getModel

class Activity:
    def __init__(self):

        mongo_server = MONGO_SERVER
        self.debug = DEVMODE
        mongo_default_db = MONGO_DB

	self.atom = ase_atomsession.Session()

        self.mongo_client = pymongo.MongoClient(mongo_server, 27017)
        self.mongo_database = self.mongo_client[mongo_default_db]

        print("**************** START ******************")
        print(mongo_server, mongo_default_db, self.debug)

        self.password_str = base64.b64decode("bWFkQHBpcDE=")
        self.projects = self.get_projects()
        self.task_template_jfile = os.path.join(BASE_DIR, 'atomTrack/static/json/task_template.json')
        self.review_statuses = ["Pending Client Review", "Pending Internal Review", "Outsource",
                                "Outsource Client Review"]

        self.users_columns = ''
        self.object_name = ''
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

        self.disabled_statuses = ['In Progress', 'Pending Internal Review', 'Ready To Publish',
                                  'Pending Client Review']

        self.months_str = {1: 'Jan', 2: 'Feb', 3: 'Mar', 4: 'Apr', 5: 'May', 6: 'Jun', 7: 'Jul', 8: 'Aug', 9: 'Sep',
                           10: 'Oct', 11: 'Nov', 12: 'Dec'}

	self.emp_db = self.mongo_client['employees']

        self.durations = ['Daily', 'Weekly', 'Monthly', 'Date Wise']
        self.empcode = {'prafull.sakharkar': 'RCP0713', 'muqtar.shaikh': 'RCM0800', 'ayush.goel': 'RCA0633'}
        self.employee_details = dict()

	# reload configuration
	self.reload_config()

        self.sequence_name = ''
        self.ftp, self.sftp = '', ''

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

        self.reload_config()
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
        self.atom.username = username
        self.reload_config()

        if request.method == 'POST':
            data = []
            if request.is_ajax():
                proj_id = request.POST.get('proj_id')
                project_name = request.POST.get('project')
                object_name = request.POST.get('object_name')
                page = request.POST.get('page')
                if object_name == 'Update Form Data':
                    entity_name = request.POST.get('entity_name')
                    data_list = request.POST.get('data_list')
                    data = self.update_form_data(project_name, entity_name, data_list)
                elif object_name == 'Project':
                    data = self.get_projects()
                elif object_name == 'Sequence':
                    data = self.get_sequences(project_name)
                elif object_name == 'Shot':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_shots(project_name, parent_id)
                elif object_name == 'Asset Build':
                    obj_type = request.POST.get('object_type')
                    data = self.get_asset_builds(project_name, obj_type)
                elif object_name == 'Task':
                    parent_ids = request.POST.get('parent_ids')
		    self.object_name = request.POST.get('parent_object_name')
                    data = self.get_task_details(project_name, parent_ids)
                elif object_name == 'Asset Type':
                    parent_object = request.POST.get('parent_object')
                    parent_name = request.POST.get('parent_name')
                    data = self.get_asset_types(parent_object, parent_name)

		# Artist
                elif object_name == 'Artist Tasks':
                    data = self.get_artist_tasks(username, project_name)
                elif object_name == 'Artist Action':
                    task_id = request.POST.get('task_id')
                    action = request.POST.get('action')
                    page = request.POST.get('page')
                    path = request.POST.get('path')
                    parent_id = request.POST.get('parent_id')
                    data = self.apply_artist_action(project_name, task_id, action, page, path, parent_id)
                elif object_name == 'Select Task':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_tasks(parent_id, project_name)
                elif object_name == 'Save Version Changes':
                    data_list = request.POST.get('data_list')
                    page = request.POST.get('page')
                    self.save_version_changes(project_name, data_list, page)
                elif object_name == 'Show Task Details':
                    task_id = request.POST.get('task_id')
                    project = request.POST.get('project')
                    data = self.show_task_details(project, task_id)
                elif object_name == 'Show Note Details':
                    task_id = request.POST.get('task_id')
                    last_row = request.POST.get('last_row')
                    note_on = request.POST.get('note_on')
                    note_category = request.POST.get('note_category')
                    data = self.get_note_details(project_name, task_id, last_row, note_category, note_on)
                elif object_name == 'Show Link Details':
                    parent_id = request.POST.get('parent_id')
                    data = self.get_link_details(parent_id, project_name)
                elif object_name == 'Create Note':
                    entity_id = request.POST.get('entity_id')
                    note_text = request.POST.get('note_text')
                    note_category = request.POST.get('note_category')
                    note_on = request.POST.get('note_on')
                    attach_files = request.POST.get('attach_files')
                    page = request.POST.get('page')
                    from_task = request.POST.get('from_task')
                    to_task = request.POST.get('to_task')
                    change_status = request.POST.get('change_status')
                    data = self.create_new_note(project_name, entity_id, note_text, note_category, note_on, attach_files, page, from_task, to_task, change_status)
                elif object_name == 'Reply Note':
                    note_id = request.POST.get('note_id')
                    reply_text = request.POST.get('reply_text')
                    self.reply_note(project_name, note_id, reply_text)
                elif object_name == 'Delete Note':
                    note_id = request.POST.get('note_id')
                    project = request.POST.get('project')
                    page = request.POST.get('page')
                    self.delete_note(project, note_id, page)
                elif object_name == 'Show Tab Link Details':
                    task_id = request.POST.get('task_id')
                    data = self.get_tab_link_details(task_id, project_name)
                elif object_name == 'Note History':
                    from_task = request.POST.get('from_task')
                    last_row = request.POST.get('last_row')
                    page = request.POST.get('page')
                    data = self.get_note_history(from_task, project_name, last_row, page)

		# FTP UPLOAD
                elif object_name == 'Ftp Shot':
                    parent_ids = request.POST.get('parent_ids')
                    task_name = request.POST.get('task_name')
                    upload_for = request.POST.get('upload_for')
                    data = self.get_ftp_shots(project_name, parent_ids, task_name, upload_for)
                elif object_name == 'Ftp Asset Build':
                    task_name = request.POST.get('task_name')
                    upload_for = request.POST.get('upload_for')
                    asset_build_type = request.POST.get('asset_build_type')
                    data = self.get_ftp_asset_builds(project_name, asset_build_type, task_name, upload_for)
                elif object_name == 'Ftp Asset Type':
                    parent_object = request.POST.get('parent_object')
                    task_name = request.POST.get('task_name')
                    data = self.get_ftp_asset_types(parent_object, task_name)
                elif object_name == 'Ftp Asset Name':
                    task_ids = request.POST.get('task_ids')
                    asset_type = request.POST.get('asset_type')
                    data = self.get_ftp_asset_name(project_name, task_ids, asset_type)
                elif object_name == 'Ftp Component':
                    parent_object = request.POST.get('parent_object')
                    task_name = request.POST.get('task_name')
                    asset_type = request.POST.get('asset_type')
                    data = self.get_ftp_components(parent_object, task_name, asset_type)
                elif object_name == 'Ftp Versions':
                    data_array = request.POST.get('data_array')
                    data = self.get_ftp_versions(project_name, data_array)
                elif object_name == 'Ftp Upload':
                    versions = request.POST.get('data_array')
                    dest_upload_path = request.POST.get('dest_upload_path')
                    data = self.upload_versions(versions, dest_upload_path)

		# Create Entity
                elif object_name == 'Show Projects':
                    data = self.show_projects()
                elif object_name == 'display_asset_details':
                    data = self.display_asset_details(project_name)
                elif object_name == 'display_sequence_details':
                    data = self.display_sequence_details(project_name)
                elif object_name == 'display_shot_details':
		    seq_name = request.POST.get('seq_name')
                    data = self.display_shot_details(project_name, seq_name)
                elif object_name == 'display_task_details':
                    parent_id = request.POST.get('parent_id')
                    data = self.display_task_details(project_name, parent_id)
                elif object_name == 'get_details':
                    name = request.POST.get('project_name')
                    entity_id = request.POST.get('entity_id')
                    entity = request.POST.get('flag')
                    data = self.get_details_before_update(project_name, entity_id, entity)
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
                    data = self.get_fps_seconds(start_frame, end_frame, prj_name)
                elif object_name == 'Show Upload CSV':
                    entity = request.POST.get('create_entity')
                    parent_id = request.POST.get('parent_id')
                    file_path = request.POST.get('file_path')
                    data = self.show_upload_data(file_path, entity, parent_id, project_name)
                elif object_name == 'Load Task':
                    selected_object = request.POST.get('selected_object')
                    selected_asset_type = request.POST.get('selected_asset_type')
                    data = self.load_task(selected_object, selected_asset_type)
                elif object_name == 'Load Entity Task':
                    parent_ids = request.POST.get('parent_ids')
                    selected_object = request.POST.get('selected_object')
                    selected_task = request.POST.get('selected_task')
                    data = self.load_entity_data(parent_ids, project_name, selected_object, selected_task)
                elif object_name == 'Get Range':
                    task_name = request.POST.get('task_name')
                    x_range = request.POST.get('x_range')
                    data = self.range_sq_sc(task_name, project_name, x_range)
                elif object_name == 'Link Asset':
                    task_id = request.POST.get('task_id')
                    selected_asset = request.POST.get('selected_asset')
                    page = request.POST.get('page')
                    self.add_asset(project_name, task_id, selected_asset, page)
                elif object_name == 'Show Latest Asset Version':
                    task_id = request.POST.get('parent_id')
                    asset_type = request.POST.get('asset_type')
                    data = self.show_latest_asset_version(project_name, task_id, asset_type)
                elif object_name == 'Show Asset Versions':
                    task_id = request.POST.get('task_id')
                    asset_type = request.POST.get('asset_type')
                    data = self.show_asset_versions(project_name, task_id, asset_type)
                elif object_name == 'Change Status':
                    new_status = request.POST.get('new_status')
                    object_id = request.POST.get('object_id')
                    status_for = request.POST.get('status_for')
                    page = request.POST.get('page')
                    data = self.object_change_status(project_name, object_id, status_for, new_status, page)
                elif object_name == 'Activity Log':
                    task_id = request.POST.get('task_id')
                    data = self.get_activity_log_details(project_name, task_id)

		# Reports
                elif object_name == 'User Dashboard':
                    project = request.POST.get('project')
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    task = request.POST.get('task')
                    data = self.get_user_task_reports(project, first, last, task)
                elif object_name == 'MGM Dashboard':
                    data = self.get_project_reports(project_name)
                elif object_name == 'Review Tasks':
                    review_status = request.POST.get('status')
                    data = self.get_review_tasks(project_name, review_status)
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
                elif object_name == 'Sequence Delivery':
                    first = request.POST.get('first')
                    last = request.POST.get('last')
                    data = self.sequence_task_total_time_duration(first, last, project_name)

                elif object_name == 'Role Pages':
                    role = request.POST.get('role')
		    data = self.get_role_page_details(role)
                elif object_name == 'Update Role Page':
                    role = request.POST.get('role')
                    page_details = request.POST.get('page_details')
		    data = self.update_page_details(role, page_details)
                elif object_name == 'Update Users Role':
                    role = request.POST.get('role')
                    columns = request.POST.get('columns')
                    user = request.POST.get('user_name')
		    data = self.update_users_role(user, role, columns)
                elif object_name == 'Assigned Emails':
                    tool_name = request.POST.get('tool_name')
                    task_name = request.POST.get('task_name')
		    data = self.get_assigned_emails(project_name, tool_name, task_name)
                elif object_name == 'Add Emails':
                    tool_name = request.POST.get('tool_name')
                    task_name = request.POST.get('task_name')
                    email_list = request.POST.get('email_list')
		    data = self.add_email_tool_wise(project_name, tool_name, task_name, email_list)

            if request.FILES:
                data = self.attach_upload_files(request)

            # pprint(data)
            data = json.dumps(data)
            return HttpResponse(data, content_type="application/json")

    # Page --- Create Role
    def create_role(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        # Get task details
        task_hash = {}

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()

	left_side_menu = self.get_left_side_pages(self.user_role)

	role_list = self.get_roles()

        task_hash['data'] = {'user_role': self.user_role, 'left_side_menu': left_side_menu, 'role_list': role_list}

        return render(request, 'create_role.html', task_hash)

    # Page --- Users
    def update_users(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        # Get task details
        task_hash = {}
        task_hash['user_id'] = username.upper()

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

	user_details = self.emp_user_details(self.employee_details)

	left_side_menu = self.get_left_side_pages(self.user_role)
	role_list = self.get_roles()

        task_hash['data'] = {'user_role': self.user_role, 'left_side_menu': left_side_menu, 'user_details' : user_details, 'role_list': role_list, 'all_tasks': self.all_tasks}

        return render(request, 'update_users.html', task_hash)

    # Page --- Add Emails
    def add_emails(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        # Get task details
        task_hash = {}
        task_hash['user_id'] = username.upper()

	tool_list = ['Review Tasks', 'FTP Upload', 'Create Package', 'Render Manager', 'Fox Render']

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

	left_side_menu = self.get_left_side_pages(self.user_role)
	user_details = self.emp_user_details(self.employee_details)

	role_wise = dict()
	for each in user_details:
	    if each['role'] != 'Artist':
		if each['role'] not in role_wise:
		    role_wise[each['role']] = [each['email_id']]
		else:
		    role_wise[each['role']].append(each['email_id'])

        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'left_side_menu': left_side_menu, 'tool_list': tool_list, 'all_tasks': self.all_tasks, 'emails': role_wise}

        return render(request, 'add_emails.html', task_hash)

    # Page --- To Do List
    def artist_tasks(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        # Current Project
        project = 'ice'
        status = ''

        # Get task details
        task_hash = {}

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'left_side_menu': left_side_menu,
                             'project': project}

        return render(request, 'artist_tasks.html', task_hash)

    # Page --- Task Entity
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

        self.reload_config()

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = dict()

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()

        objects = ['Asset Build', 'Shot', 'Sequence']
        asset_type = ['Set', 'Character', 'Prop', 'Vehicle', 'FX']
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'objects': objects, 'left_side_menu': left_side_menu, 
                             'asset_type': asset_type}
        statuses = self.atom.getStatuses()
        ldap_users = self.ldap_users()

        task_hash['statuses'] = statuses
        task_hash['users'] = ldap_users
        bid_range = self.get_range(0.0, 20.0, 0.25)
        bids = [str(i).replace(".0", "") for i in bid_range]
        task_hash['bids'] = bids

        task_hash['stf_range'] = ["%03d" % x for x in range(101, 9999)]
        task_hash['enf_range'] = ["%03d" % x for x in range(101, 9999)]

        return render(request, 'task_entities.html', task_hash)
    
    # Page --- Task Status
    def task_status(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

        self.reload_config()

        task_hash = {}

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
        task_temp_data = self.get_tasks_template()

        task_hash['task_temp_data'] = task_temp_data

	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'columns': self.users_columns, 'user_role': self.user_role, 'left_side_menu': left_side_menu}

        task_hash['statement'] = 'Yahoooooooooooooooo'
        return render(request, 'task_status.html', task_hash)

    # Page --- Create Entity
    def create_entities(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = {}

        task_temp_data = self.get_tasks_template()

        task_hash['task_temp_data'] = task_temp_data

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()

	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'left_side_menu': left_side_menu}

        statuses = self.atom.getStatuses()
        list_statuses = list()

        for status in statuses:
            list_statuses.append((status, status))

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

    # Page --- Review Tasks
    def review_tasks(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = {}

        project = 'ice'

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'project': project, 'left_side_menu': left_side_menu,
                             'review_status': self.review_statuses}

        return render(request, 'review_tasks.html', task_hash)

    # Page --- FTP Upload
    def ftp_serve(self, request):

        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        ftp_hash = {}
        self.reload_config()

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/tasks/')

        ftp_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            ftp_hash['emp_code'] = self.employee_details[username]['emp_code']
        ftp_hash['user_id'] = username.upper()
        task_temp_data = self.get_tasks_template()

        ftp_hash['task_temp_data'] = task_temp_data

	left_side_menu = self.get_left_side_pages(self.user_role)
        ftp_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'left_side_menu': left_side_menu}

        return render(request, 'upload_ftp.html', ftp_hash)

    # Page --- Dashboard
    def sup_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

        self.reload_config()

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = {}

        project = 'ice'
        duration = 'Monthly'

        reports = dict()
        reports['project'] = project
        reports['duration'] = duration

        today = datetime.date.today()
        this_month_first = today.replace(day=1)
        last = this_month_first - datetime.timedelta(days=1)
        first = last.replace(day=1)

        reports['from_date'] = str(first)
        reports['to_date'] = str(last)

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'durations': self.durations, 'left_side_menu': left_side_menu,
                             'reports': reports, 'all_tasks': self.all_tasks}

        return render(request, 'dashboard.html', task_hash)

    # Page --- Month Wise
    def month_wise_reports(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

        if not self.user_role or self.user_role not in ['Supervisor', 'Co-ordinator']:
            return HttpResponseRedirect('/login/')

        # Get task details
        task_hash = dict()

        project = 'ice'

        task_temp_data = self.get_tasks_template()

        task_hash['task_temp_data'] = task_temp_data

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'current_project': project, 'left_side_menu': left_side_menu}

        return render(request, 'month_wise_reports.html', task_hash)

    # Page --- Management
    def mgm_dashboard(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username
        self.reload_config()

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

        status = {"Internal": "Internal", "OutSource": "OutSource"}

        task_hash['emp_code'] = 'blank'

        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']
        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'current_project': project, 'left_side_menu': left_side_menu,
                             'status': status}

        return render(request, 'mgm_dashboard.html', task_hash)

    # Page --- Artist Productivity
    def artist_productivity(self, request):
        username = request.user.username
        if not username:
            return HttpResponseRedirect('/login/')

        self.username = username

        self.reload_config()

        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect('/tasks/')

        # Get task details
        task_hash = {}

        ldap_users = self.ldap_users()

        project = 'ice'
        duration = 'Monthly'

        reports = dict()
        reports['project'] = project
        reports['duration'] = duration

        task_hash['emp_code'] = 'blank'
        if username in self.employee_details:
            task_hash['emp_code'] = self.employee_details[username]['emp_code']

        task_hash['user_id'] = username.upper()
	left_side_menu = self.get_left_side_pages(self.user_role)
        task_hash['data'] = {'projects': self.projects, 'user_role': self.user_role, 'durations': self.durations, 'left_side_menu': left_side_menu,
                             'reports': reports, 'current_project': project, 'all_users': ldap_users,
                             'all_tasks': self.all_tasks}

        return render(request, 'artist_productivity.html', task_hash)

    # Page --- Sequence Delivery
    def sequence_delivery(self, request, project='ice'):

        username = request.user.username
        if not username:
            return HttpResponseRedirect("/login")

	self.reload_config()
        if not self.user_role or self.user_role != 'Supervisor':
            return HttpResponseRedirect("/login/")

        template_name = 'sequence_delivery.html'

        seq_dict = {}
        seq_dict['emp_code'] = 'blank'
        if username in self.employee_details:
            seq_dict['emp_code'] = self.employee_details[username]['emp_code']

        seq_dict['user_id'] = username.upper()

	left_side_menu = self.get_left_side_pages(self.user_role)
        seq_dict['data'] = {'projects': self.projects,
                            'current_project': project,
                            'user_role': self.user_role, 'left_side_menu': left_side_menu}
        return render(request, template_name, seq_dict)

    def reload_config(self):
	self.get_user_columns()
        self.email_address = self.atom.getEmailIds()

    def get_left_side_pages(self, role=''):
	page_list = self.get_page_details(role)
	new_list = list()
	parent = dict()
	for each in page_list:
	    if 'name' in each:
		pages = each['name'].split('/')
		if isinstance(pages, list) and len(pages) > 1:
		    each['name'] = pages[1]
		    if pages[0] not in parent:
			parent[pages[0]] = [each]
		    else:
			parent[pages[0]].append(each)
		else:
		    new_list.append(each)

	if parent:
	    new_list.append(parent)

	return new_list

    def get_role_page_details(self, role):
	default_pages = self.get_page_details('Developer')
	role_pages = self.get_page_details(role)
	role_list = map(lambda x:x['id'], role_pages)

	page_list = list()
	for each in default_pages:
	    if each['id'] not in role_list:
		each['active'] = 'inactive'
		each['access'] = []
		role_pages.append(each)

	return role_pages

    def get_page_details(self, role=''):
	collection = self.emp_db["role_map"]
	data = collection.find_one({'role':role})
	data_list = list()
	if 'pages' in data:
	    data_list = data['pages']

	return data_list

    def emp_user_details(self, emp_details):
	data_list = list()
	if not isinstance(emp_details, dict):
	    return data_list
	not_required_dept = ['Accounts', 'Information Technology', 'Creative Management', 'Human Resources',
                                 'Strategy and Corporate Finance', 'Management', "Administration"]
	for user, data in emp_details.iteritems():
	    if data['department'] in not_required_dept:
		continue

	    columns = ''
	    if 'columns' in data and isinstance(data['columns'], list):
		columns = ','.join(data['columns'])
		
	    data['columns'] = columns
	    data_list.append(data)

	return data_list

    def update_page_details(self, role='', page_details=''):
	page_details = json.loads(page_details)

	collection = self.emp_db["role_map"]
	collection.update_one({'role':role},{'$set':{'pages':page_details}},upsert=True)

    def update_users_role(self, user='', role='', columns=''):

	data = dict()
	if role and role != '---':
	    data['role'] = role

	if columns:
	    if columns == '---':
		data['columns'] = []
	    else:
		data['columns'] = columns.split(',')
	
	collection = self.emp_db["employee_details"]
	collection.update_one({'user_name':user},{'$set': data})

    def add_email_tool_wise(self, project_name, tool_name, task_name, email_list):

	email_list = json.loads(email_list)

	email_dict = dict()
	email_dict['email'] = email_list

	search_key = {
		'project_name' : project_name,
		'tool_name' : tool_name,
		'task_name' : task_name
	    }
	collection = self.emp_db["email"]
	collection.update_one(search_key,{'$set': email_dict}, upsert=True)

    def get_assigned_emails(self, project_name, tool_name, task_name):

	search_key = {
		'project_name' : project_name,
		'tool_name' : tool_name,
		'task_name' : task_name
	    }
	collection = self.emp_db["email"]
	email_cursor = collection.find_one(search_key)

	email_dict = dict()
	if not email_cursor or 'email' not in email_cursor:
	    email_dict['to'] = []
	    email_dict['cc'] = []
	else:
	    email_dict['to'] = email_cursor['email']['to']
	    email_dict['cc'] = email_cursor['email']['cc']
	
	user_details = self.emp_user_details(self.employee_details)

	to_cc = email_dict['to'] + email_dict['cc']

	to = []
	cc = []
	role_wise = dict()
	for each in user_details:
	    if each['email_id'] in email_dict['to']: 
		to.append({'role':each['role'], 'email': each['email_id']})
		continue
	    elif each['email_id'] in email_dict['cc']:
		cc.append({'role':each['role'], 'email': each['email_id']})
		continue
	    if each['role'] != 'Artist':
		if each['role'] not in role_wise:
		    role_wise[each['role']] = [each['email_id']]
		else:
		    role_wise[each['role']].append(each['email_id'])

	email_dict['unique_list'] = role_wise
	email_dict['to'] = to
	email_dict['cc'] = cc

	return email_dict

    def get_roles(self):
	collection = self.emp_db["role_map"]
	data = collection.find({})
	role_list = list()
	for each in data:
	    if 'role' in each:
		role_list.append(each['role'])

	return role_list

    def get_user_details(self):

        json_data = {}

	col_emp_details = self.emp_db['employee_details']
	emp_data = col_emp_details.find({"user_name":{"$exists":True}, "active": 1})
	for each in emp_data:
	    json_data[each['user_name']] = each

        self.employee_details = json_data

    def get_user_columns(self):

	self.get_user_details()
	username = self.username
        self.user_role = 'Artist'
	self.users_columns = ''
        if username in self.employee_details:
	    if 'role' in self.employee_details[username]:
		self.user_role = self.employee_details[username]['role']
		self.users_columns = ','.join(self.employee_details[username]['columns'])

    def get_projects(self):
        """
        gets the list of projects from ftrack
        :return:
        """
	projects = dict()
        obj_projects = self.atom.getProjects()
        for project, data in obj_projects.iteritems():
            projects[project] = project

        return projects

    def get_sequences(self, project_name=''):
        """
        Gets the sequences list when project is selected
        :param proj_id: ftrack Project id of the selected project
        :return:
        """

	obj_seqs = self.atom.getSequences(project_name)
	seq_list = list()
        for seq, data in obj_seqs.iteritems():
            sequences = dict()
            sequences['name'] = data['name']
            sequences['id'] = str(data['_id'])
            seq_list.append(sequences)

        s_list = sorted(seq_list, key=lambda x: x['name'])
        return s_list

    def get_shots(self, project_name='', parent_id=''):
        """
        Gets the list of shots for selected sequences and project
        :param proj_id: ftrack Project id of the selected project
        :param parent_id: ftrack sequence id of the selected sequence
        :return:
        """
	parent_obj = self.atom.getFromId(project_name,[parent_id])
	parent_name = parent_obj[parent_id]['name']

        obj_shots = self.atom.getShots(project_name, [parent_name])
        shot_list = list()
        for seq, values in obj_shots.iteritems():
	    for data in values:
		shots = dict()	    
		shots['name'] = data['name']
		shots['id'] = str(data['_id'])
		shots['parent_name'] = parent_name
		shot_list.append(shots)

        sh_list = sorted(shot_list, key=lambda x: x['name'])
        return sh_list

    def get_asset_builds(self, project_name='', obj_type=''):
        """
        Gets the list of Asset Builds from ftrack for selected project
        :param proj_id: ftrack project id of the selected project
        :param obj_type: ftrack Asset Build type (prop, chars,set,vehicles)
        :return:
        """

	obj_assets = dict()
	if not obj_type:
	    obj_assets = self.atom.getAssetBuilds(project_name)
	else:
	    obj_assets = self.atom.getAssetBuildFromType(project_name, obj_type)

        asset_list = list()
        for asset, data in obj_assets.iteritems():
            asset_builds = dict()
            asset_builds['name'] = data['name']
            asset_builds['id'] = str(data['_id'])
            asset_list.append(asset_builds)

        a_list = sorted(asset_list, key=lambda x: x['name'])
        return a_list

    # FTP Upload
    def get_ftp_shots(self, project_name, parent_ids, task_name, upload_for):
        """
        Gets list of shots for compout upload page
        :param sequence_id: ftrack sequence id of the selected sequence
        :param task_name: ftrack task name of the selected sequence
        :param status_name: UI selection for compout upload in 'Upload For' combo box
        :param upload_for: UI selection for compout upload in 'Asset Name' combo box
        :return:
        """
        check_status = ''
        if upload_for == 'Client':
            check_status = 'Internal Approved'
        elif upload_for == 'Review':
            check_status = 'Client approved'
        elif upload_for == 'DI':
            check_status = 'Review Approved'
        elif upload_for == 'Outsource':
            check_status = 'Outsource Approved'

	parent_ids = json.loads(parent_ids)

#	tasks = self.atom.getTasksFromStatus(project_name, check_status, [task_name])

	collection = self.mongo_database['%s_tasks' %project_name]

	shots = collection.find({'parent_id' : {'$in' : parent_ids}, 'object_type': 'Shot'})
	shots = list(shots)
	shot_ids = list()
	filter_tasks = list()
	if list(shots):
	    shot_ids = map(lambda x: str(x['_id']), list(shots))
#	    filter_tasks = filter(lambda x: x['parent_id'] in shot_ids, tasks)
	    filter_tasks = collection.find({'parent_id' : {'$in' : shot_ids}, 'object_type': 'Task', 'status': check_status, 'name': task_name})

        shots_list = []
        for task in filter_tasks:
            details = dict()
	    if 'path' not in task:
		continue
	    parent = task['path'].split(':')
	    shot_name = '_'.join(parent[1:-1])
            details['name'] = shot_name
            details['task_id'] = str(task['_id'])
            details['id'] = task['parent_id']
            shots_list.append(details)

        shots_list = sorted(shots_list, key=lambda x: x['name'])
        return shots_list

    def get_ftp_asset_builds(self, project_name, asset_build_type, task_name, upload_for):
        check_status = ''
        if upload_for == 'Client':
            check_status = 'Internal Approved'
        elif upload_for == 'Review':
            check_status = 'Client approved'
        elif upload_for == 'DI':
            check_status = 'Review Approved'
        elif upload_for == 'Outsource':
            check_status = 'Outsource Approved'

	print(project_name, asset_build_type, task_name, check_status)

	collection = self.mongo_database['%s_tasks' %project_name]

	tasks = collection.find({'parent_type' : asset_build_type, 'parent_object_type': 'Asset Build', 'object_type': 'Task', 'status': check_status, 'name': task_name})

        assets_list = []
        for task in tasks:
            details = dict()
	    if 'path' not in task:
		continue
	    parent = task['path'].split(':')
	    shot_name = '_'.join(parent[1:-1])
            details['name'] = shot_name
            details['task_id'] = str(task['_id'])
            details['id'] = task['parent_id']
            assets_list.append(details)

        assets_list = sorted(assets_list, key=lambda x: x['name'])
        return assets_list

    def get_ftp_asset_types(self, parent_object, task_name):
        """
        Gets list of asset type
        :param parent_id: parent id of task shot or asset build
        :return:
        """

        asset = self.atom.getAssetTypes(parent_object, task_name)

        type_list = []
        for data in asset:

            details = dict()
            details['name'] = data['name']

            type_list.append(details)

        type_list = sorted(type_list, key=lambda x: x['name'])

        return type_list

    def get_ftp_asset_name(self, project, task_ids, asset_type):
        """
        Gets list of asset name
        :param parent_id: parent id of task shot or asset build
        :param asset_type: selected asset type
        :return:
        """

	task_ids = json.loads(task_ids)
	collection = self.mongo_database['%s_versions' %project]

	asset_name_list = collection.distinct('asset_name', {'task_id': {'$in' : task_ids}, 'asset_type': asset_type})
	asset_name_list = list(asset_name_list)
        name_list = []
        for data in asset_name_list:

            details = dict()
            details['name'] = data

            name_list.append(details)

        name_list = sorted(name_list, key=lambda x: x['name'])

        return name_list


    def get_ftp_components(self, parent_object, task_name, asset_type):

        asset_comp = self.atom.getAssetComponents(parent_object, task_name, asset_type)

        asset_comp_list = []
        for data in asset_comp:

            details = dict()
            details['name'] = data

            asset_comp_list.append(details)

        asset_comp_list = sorted(asset_comp_list, key=lambda x: x['name'])

        return asset_comp_list

    def get_ftp_versions(self, project, data_array=''):
        """
        Gets the list of all the versions whose status are been set as per the requirement on Compout Upload tool
        :param data_array: List in which each item is a combined format of all the selections based on the Comp Upload
         For eg: ["aaj_080_0010:642629a4-91d3-11e6-b6f4-001e67d20c13_Client_Lighting_final_exr_both"]
        :return: returns a list which carries ample number of dictionaries consisting of versions from ftrack whose
        files are avaialble on 'ASE' folder system
        """
        if not data_array:
            return False

	collection = self.mongo_database['%s_versions' %project]

        import ase_prod_srv
        self.ftp, self.sftp = ase_prod_srv.makeServerConnection()
        data_array = json.loads(data_array)

        final_list = set(data_array)
        final_list = list(final_list)
        data_list = []
        for items in final_list:
            # aaj|999_0010|b9320c4e920311e68620|Internal|final|jpg|both
            # aaj|dummy|77f939b275b811e6b2b6|Review|geom|mov
            data = items.split('|')
	    proj_name = data[0]
	    name = data[1]
	    task_id = data[2]
	    version_status = data[3]
	    asset_name = data[4]
	    comp = data[5]
	    camera_angle = data[6]

            data_hash = {
		'name' : name,
		'published_version' : '---',
		'upload_version' : '---',
		'status' : 'Ready To Upload',
		'published_by' : '---',
		'version_id' : '---',
		'task_id' : '---',
		'source_path' : '---',
		'upload_error' : 0,
		'camera_angle' : '---'
	    }

            reject_status = ''
            approve_status = ''

            if version_status == 'Client':
                reject_status = 'Client Reject'
                approve_status = 'Internal Approved'
            elif version_status == 'Review':
                reject_status = 'Review Reject'
                approve_status = 'Client approved'
            elif version_status == 'DI':
                reject_status = 'DI Reject'
                approve_status = 'Review Approved'
            elif version_status == 'Outsource':
                reject_status = 'Outsource Client Reject'
                approve_status = 'Outsource Approved'

            reject_obj = collection.find({'status': reject_status, 'task_id': task_id, 'asset_name': asset_name})
	    reject_versions = reject_obj.count()

            approved_version_number = '%003d' %(reject_versions + 1)
            upload_version = asset_name + '_' + comp + '_v' + approved_version_number

            data_hash['upload_version'] = upload_version

            approve_obj = collection.find({'status': approve_status, 'task_id': task_id, 'asset_name': asset_name})
	    approve_versions = approve_obj.count()

	    if asset_name == 'final':
		# check sequence version 
		approve_seq = collection.find({'status': approve_status, 'task_id': task_id, 'asset_name': 'sequence'})
		approve_seq_vers = approve_seq.count()
		if not approve_seq_vers:
		    data_hash['status'] = '%s sequence version not found' % approve_status
		    data_hash['upload_error'] = 1

	    if not approve_versions:
		data_hash['status'] = '%s version not found' % approve_status
		data_hash['upload_error'] = 1
	    elif approve_versions > 1:
		data_hash['status'] = 'Multiple version has status %s' % approve_status
		data_hash['upload_error'] = 1
	    else:

		obj_version = approve_obj[0]
		try:
		    data_hash['version_id'] = str(obj_version['_id'])
		    data_hash['published_version'] = obj_version['name']
		    data_hash['published_by'] = obj_version['published_by']
		    data_hash['task_id'] = obj_version['task_id']
		    comp_flag = 0
		    if 'components' in obj_version:
			for each in obj_version['components']:
			    if each['name'] == comp:
				comp_flag = 1
				source_path = each['location']
				data_hash['source_path'] = source_path
		
				if camera_angle == 'both':
				    left_path = os.path.join(source_path, 'left')
				    right_path = os.path.join(source_path, 'right')
				    try:
					self.sftp.stat(left_path)
					self.sftp.stat(right_path)
				    except ValueError:
					data_hash['status'] = 'Source folder not available'
					data_hash['upload_error'] = 1
				elif camera_angle:
				    path = os.path.join(source_path, camera_angle)
				    try:
					self.sftp.stat(source_path)
				    except ValueError:
					data_hash['status'] = 'Source folder not available'
					data_hash['upload_error'] = 1
				else:
				    try:
					self.sftp.stat(source_path)
				    except ValueError:
					data_hash['status'] = 'Source folder not available'
					data_hash['upload_error'] = 1

		    if not comp_flag:
			data_hash['status'] = 'Component (%s) not published ...' % comp
			data_hash['upload_error'] = 1

		except Exception as e:
		    data_hash['status'] = 'Something went worng with version attributes'
		    data_hash['upload_error'] = 1
		    print("FTP Upload error:%s" %e)

            data_list.append(data_hash)

        return data_list

    def upload_versions(self, versions, dest_upload_path):
        """
        Function used to upload all the selected versions on Compout Upload tool when clicked "Upload" button
        :param versions:
        :param destination:
        :return:
        """

        task_names_abbr = {'Animation': 'anm', 'Layout': 'lyt', 'Blocking': 'blk'}

        if not versions:
            return False

        versions = json.loads(versions)
        destination = json.loads(dest_upload_path)
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

        match = re.match(r'^%s' % fol_search, destined)

        success_dict = []
        if not match:
            success_dict = [{'status': 'Invalid Destination'}]
	    return success_dict

        os.system("sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 "
                          "sudo chown -R pip:prod %s" % (self.password_str, destined))
        os.system("sshpass -p %s ssh -tty -o StrictHostKeyChecking=no pip@192.168.1.36 sudo chmod 775 %s" % (
                    self.password_str, destined))

        time.sleep(3)
        import ase_prod_srv
        self.ftp, self.sftp = ase_prod_srv.makeServerConnection()

	self.user_details_log = list()
	for each in versions:
	    projname = each['project'].lower()
	    source_path = each['source_path']
	    department = each['department']
	    obj_name = each['obj_name']
	    obj_path = obj_name.replace('_','/')
	    version_id = each['version_id']
	    task_id = each['task_id']
	    upload_version = each['upload_version']
	    internal_version = each['internal_version']
	    camera_angle = each['camera_angle']
	    upload_for = each['upload_for']

	    ver_list = upload_version.split('_')
	    asset_name = ver_list[0]
	    version = ver_list[-1]
	    folder_type = '_'.join(ver_list[1:-1]) # mov, jpg, review_img

	    source_path1 = source_path2 = destination_folder1 = destination_folder2 = ''
            destination_path = os.path.join(destined, obj_path, folder_type)

	    log_details = dict()
	    log_details['project_name'] = projname
	    log_details['task_name'] = department
	    log_details['asset_name'] = asset_name
	    log_details['component'] = folder_type
	    log_details['parent_path'] = projname + '_' + obj_name
	    log_details['internal_version'] = internal_version
	    log_details['upload_version'] = upload_version
	    log_details['upload_for'] = upload_for
            log_details['source'] = source_path
            log_details['publishing_time'] = time.strftime("%Y/%m/%d %H:%M:%S")
            log_details['uploaded_by'] = self.username
	    log_details['destination'] = destination_path
	    log_details['camera_angle'] = camera_angle
	    log_details['status'] = 'Upload Successful'
	    log_details['task_id'] = task_id
	    log_details['version_id'] = version_id

            self.user_details_log.append(log_details)

            '''
                In case of sw9 & and task names is Animation, Layout, Blocking 
		then client version will be ex:- Animation ==> anm_v01  followed by the extension
            '''

	    client_version = ''
            if projname == 'sw9' and department in task_names_abbr:
		dept_abbr_name = task_names_abbr[department]
                client_version = dept_abbr_name + "_v" + version.split('v0')[-1]
            else:
                client_version = version.split('v')[-1]

            if camera_angle == 'both':
		source_path1 = source_path + '/' + 'left'
                source_path2 = source_path + '/' + 'right'
                destination_folder1 = os.path.join(destined, obj_path, folder_type, 'l')
                destination_folder2 = os.path.join(destined, obj_path, folder_type, 'r')
	    elif camera_angle == 'left':
		source_path1 = source_path + '/' + 'left'
                destination_folder1 = os.path.join(destined, obj_path, folder_type, 'l')
                if asset_name == 'master':
                    destination_folder1 = os.path.join(destined, obj_path, folder_type, 'master')
	    elif camera_angle == 'right':
		source_path2 = source_path + '/' + 'right'
                destination_folder2 = os.path.join(destined, obj_path, folder_type, 'r')
                if asset_name == 'master':
                    destination_folder2 = os.path.join(destined, obj_path, folder_type, 'master')
	    else:
		# no camera	
                try:
		    if not os.path.exists(destination_path):
			self.ftp.exec_command('/bin/mkdir -p %s' % destination_path)
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))

                time.sleep(2)
		if os.path.isdir(source_path): 
		    source_files = self.listdir(source_path)
		else:
		    source_files = [os.path.basename(source_path)]
		    source_path = os.path.dirname(source_path)

		for ver_file in source_files:
		    ext = ver_file.split('.')[-1]
		    '''
			If folder is review_img then it will
			symlink based on the file names followed by
			version .
		    '''
		    if folder_type == 'review_img':
			file_name = ver_file.split(".")[0] + "_v" + client_version + "." + ext
		    else:
			file_name = projname + '_' + obj_name + '_' + client_version + '.' + ext

                    # For SW9 project copy mov outside ....
                    if projname == 'sw9' and folder_type == 'mov':
                        destination_path = destined

                    source_file = os.path.join(source_path, ver_file)
                    dest_file = os.path.join(destination_path, file_name)

                    if not os.path.exists(dest_file):
			self.upload_ftp_file(source_file, dest_file)

	    if destination_folder1:
                try:
		    if not os.path.exists(destination_folder1):
			self.ftp.exec_command('/bin/mkdir -p %s' % destination_folder1)
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))

                time.sleep(2)
                source_left = self.listdir(source_path1)
                for ver_file in source_left:
		    version_number = ver_file.split('.')[1]
		    init_side = 'l'
		    if asset_name == 'master':
			init_side = 'master'

                    if version_number == folder_type:
			file_name = projname + '_' + obj_name + '_' + init_side + '_' + client_version + '.' + folder_type
                    else:
			file_name = projname + '_' + obj_name + '_' + init_side + '_' + client_version + '.' + version_number + '.' + folder_type

                    source_file = os.path.join(source_path1, ver_file)
                    dest_file = os.path.join(destination_folder1, file_name)

                    if not os.path.exists(dest_file):
			self.upload_ftp_file(source_file, dest_file)

	    if destination_folder2:
                try:
                    if not os.path.exists(destination_folder2):
                        self.ftp.exec_command('/bin/mkdir -p %s' % destination_folder2)
                except IOError as e:
                    print("I/O error({0}): {1}".format(e.errno, e.strerror))

                time.sleep(2)
                source_right = self.listdir(source_path2)
                for ver_file in source_right:
		    version_number = ver_file.split('.')[1]
		    init_side = 'r'
		    if asset_name == 'master':
			init_side = 'master'

                    if version_number == folder_type:
			file_name = projname + '_' + obj_name + '_' + init_side + '_' + client_version + '.' + folder_type
                    else:
			file_name = projname + '_' + obj_name + '_' + init_side + '_' + client_version + '.' + version_number + '.' + folder_type

                    source_file = os.path.join(source_path2, ver_file)
                    dest_file = os.path.join(destination_folder2, file_name)

                    if not os.path.exists(dest_file):
			self.upload_ftp_file(source_file, dest_file)

	    # Changing status after upload
	    self.change_status_after_upload(log_details)
	
        if self.user_details_log:
            self.send_upload_mail(self.user_details_log)

        success_dict = [{'status': 'Upload Complete'}]

        return success_dict

    def change_status_after_upload(self, log_details):
        changed_status = ''
	upload_status = log_details['upload_for']

        if upload_status == 'Internal':
	    changed_status = 'Pending Internal Review'
        elif upload_status == 'Client':
            changed_status = 'Pending Client Review'
        elif upload_status == 'Review':
            changed_status = 'Review Approved'
        elif upload_status == 'DI':
            changed_status = 'DI Approved'
        elif upload_status == 'Outsource':
            changed_status = 'Outsource Client Review'

	task_id = log_details['task_id']
	version_id = log_details['version_id']
	project = log_details['project_name']

	if task_id:
	    self.object_change_status(project, task_id, 'Task', changed_status)
	if version_id:
	    self.object_change_status(project, version_id, 'Version', changed_status)
	
	self.ftp_upload_log(log_details)

    def send_upload_mail(self, user_details_log):

        project = user_details_log[0]['project_name']
	task_name = user_details_log[0]['task_name']
	asset_name = user_details_log[0]['asset_name']
	publishing_time = user_details_log[0]['publishing_time']
	camera_angle = user_details_log[0]['camera_angle']

        user_id = user_details_log[0]['uploaded_by']
        from_addr = user_id + '@intra.madassemblage.com'

        to_addr = from_addr

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'
	try:
            to_addr = to_addr + ',' + ','.join(self.email_address[project.lower()]['FTP Upload'][task_name]['to'])
            cc_addr = cc_addr + ',' + ','.join(self.email_address[project.lower()]['FTP Upload'][task_name]['cc'])
        except:
            print("No emails ids for task reject : %s" %task_name)

        subject = '[' + project.upper() + '] ' + task_name + ' Upload' + '(' + asset_name + ')(' + publishing_time + ')'

        body_list = []
        for user in user_details_log:
            side_head = ''
            if camera_angle:
		side_head = '(' + camera_angle + ')'

            heading_mail = user['parent_path'] + '-' + asset_name + '[' + user['component'] + ']' + side_head

            htmlhead = """
                    <table border="1">
                    <tr style="font-weight:bold;"><td>%s</td><td>%s</td><td>%s</td></tr>
                <tr><td colspan="3">
                <table border="1">
                    <tbody>
            """ % (heading_mail, user['publishing_time'], user['upload_for'])
            htmlbody = ''
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Status</td><' \
                                  'td style="font-size:12px;">%s</td></tr>' % user['status']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Internal Version</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['internal_version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Upload Version</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['upload_version']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Source File</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['source']
            htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Destination File</td>' \
                                  '<td style="font-size:12px;">%s</td></tr>' % user['destination']

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

    def upload_ftp_file(self, source_file, dest_file):

        try:
            self.ftp.exec_command('/bin/ln -s %s %s' % (source_file, dest_file))
        except IOError as e:
            print("Symlink failed({0}): {1}".format(e.errno, e.strerror))

    def get_asset_types(self, parent_object, task_name):
        """
        Gets list of asset type
        :param parent_name: parent name of task or asset build
        :return:
        """

        asset = self.atom.getAssetTypes(parent_object, task_name)

        type_list = []
        for data in asset:

            details = dict()
            details['name'] = data['name']

            type_list.append(details)

        type_list = sorted(type_list, key=lambda x: x['name'])

        return type_list

    def get_tasks(self, parent_id='', project_name=''):
        """
        Gets the list of Tasks from ftrack for selected parent
        :param parent_id: parent id of task (will be shot, seq, assetbuild)
        :return: list of task
        """

        task_list = list()
        if not parent_id:
            return task_list

        obj_tasks = self.atom.getTasks(project_name, [parent_id])

        if parent_id in obj_tasks:
	    tasks = obj_tasks[parent_id]
            for task in tasks:
		dict_task = dict()
                dict_task['name'] = task['name']
                dict_task['id'] = str(task['_id'])
                dict_task['path'] = task['path']
		users = ['prafull.sakharkar']
		if 'current_assignees' in task:
		    users = map(lambda x: x['user_name'], task['current_assignees'])
		users = sorted(users)
                dict_task['task_assignee'] = ','.join(users)

                task_list.append(dict_task)

        task_list = sorted(task_list, key=lambda x: x['name'])
        return task_list

    def get_task_details(self, project_name, parent_ids):
        '''
        :param project_name: Name of selected project
        :param parent_ids: To get tasks present inside particular
        parent_id
        :return: dict containing tasks inside Shot/Asset
        '''
        if not parent_ids:
            return False

        parent_ids = json.loads(parent_ids)

        parent_dict = {}
        coll = self.mongo_database[project_name + "_tasks"]
        ver_coll = self.mongo_database[project_name + "_versions"]
        proj_coll = self.mongo_database["projects"]

        proj_find = proj_coll.find_one({'name': project_name})
        fps = 0
        if proj_find:
            fps = int(proj_find['fps'])

	if self.object_name == 'Shot Asset Build':
	    shot_parent_ids = map(lambda x : ObjectId(x), parent_ids)
	    shot_results = coll.find(
		{"_id": {"$in": shot_parent_ids}, "links" : {"$exists": True}},
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
            task_id = str(ele['_id'])
	    task_status = ele['status'] if 'status' in ele else 'Not started'
	    parent_type = ele["parent_type"]

            # Getting bid & shot seconds
            seconds = 0
            if self.object_name == 'Shot':
                f_start = f_end = 0
                shot_find = coll.find_one({'_id': ObjectId(parent_id)})
                if 'startframe' in shot_find:
                    f_start = float(shot_find['startframe'])
                if 'endframe' in shot_find:
                    f_end = float(shot_find['endframe'])

                seconds = round(float(f_end - (f_start - 1)) / fps, 2)

            try:
                path_arr = ele['path'].split(':')[:-1]
                parent_path = ':'.join(path_arr)

                task_name = ele['name']
                ver_cur = ver_coll.find({"task_path": ele['path'], "status": {"$regex": ".*Client.*"}}).sort(
                    'updated_on', -1).limit(1)
                if ver_cur.count():
                    client_status = ver_cur[0]['status']
            except:
                client_status = '---'

            try:
                inner_dict = {'id': task_id, 'name': task_name, 'parent_d': parent_id, 'project': project_name,
                              'parent_type': parent_type, 'status': task_status, 'bid': bid,
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

    def show_task_details(self, project, task_id):

        task_obj = self.atom.getFromId(project, [task_id])
        details = dict()
        details_list = list()
        if task_obj:
            details['name'] = task_obj[task_id]['name']
            details['link_path'] = task_obj[task_id]['path']
            details['parent_path'] = ':'.join(details['link_path'].split(':')[:-1])
            details['object_id'] = task_id
            details['parent_id'] = task_obj[task_id]['parent_id']
            details['parent_object'] = task_obj[task_id]['parent_object_type']
            details['project'] = project

        details_list.append(details)

        return details_list

    def get_note_details(self, project, task_id, last_row, note_category='', note_on=''):
        """
        Function to get details data for notes of task.
        :param task_id: Task id
        :param type_name: Object type
        :param last_row: Last row
        :param note_task: Task name
        :param note_category: Note category
        :return: List of dictionary of note data
        """

        start_row = int(last_row) - 15
        last_row = int(last_row) - 1

	parent_id = [task_id]
	if note_on == 'Version':
	    versions = self.atom.getVersions(project, task_id)
	    parent_id = map(lambda x: str(x['_id']), versions)

	obj_notes = self.atom.getNotes(project, parent_id, note_category)[start_row:last_row]

        note_list = self.get_note_data(obj_notes)

        return note_list

    def get_note_data(self,obj_notes):

	note_list = list()	
	for note in obj_notes:
	    comments_hash = dict()
	    try:
		comments_hash['note_category'] = note['note_category']
		comments_hash['note_author'] = note['added_by']
		comments_hash['note_head'] = note['note_text'] or 'Null'
                comments_hash['note_id'] = str(note['_id'])
		comments_hash['note_date'] = str(note['added_on']).split('.')[0]
		parent_id = note['parent_id']
		comments_hash['parent_id'] = parent_id
		project = note['project']
		comments_hash['project'] = project

		parent_obj = ''
		task_name = ''
		if note['note_on'] == 'Version':
		    parent_obj = self.atom.getFromVersionId(project, [parent_id])
		    task_name = parent_obj[parent_id]['task_name']
		else:
		    parent_obj = self.atom.getFromId(project, [parent_id])
		    task_name = parent_obj[parent_id]['name']
		    
                comments_hash['current_user'] = self.username
		comments_hash['task_name'] = task_name
		comments_hash['note_info'] = parent_obj[parent_id]['path'].replace(':',' / ')
		comments_hash['replies'] = []

		if 'replies' in note and isinstance(note['replies'], list):
		    replies = list()
		    for each in note['replies']:
			reply_on = str(each['reply_on']).split('.')[0]
			each['reply_on'] = reply_on
			replies.append(each)
		    comments_hash['replies'] = replies

		comments_hash['note_components'] = []
		if 'note_components' in note:
		    comments_hash['note_components'] = note['note_components']

		note_list.append(comments_hash)
	    except KeyError as e:
		print("Note Data Error: %s" %e)

	return note_list
 
    def get_link_details(self, parent_id, project_name=''):
        """
        Function to get links details.
        :param task_id: Task id
        :param project_name: Project name
        :return: List of dictionay of linke data.
        """
	links = list()
	parent_obj = self.atom.getFromId(project_name, [parent_id])
	if 'links' in parent_obj[parent_id]:
	    link_ids = parent_obj[parent_id]['links']
	    link_obj = self.atom.getFromId(project_name, link_ids)
	    if link_obj:
		for asset_id, data in link_obj.iteritems():
		    link_dict = dict()
		    link_dict['name'] = data['name']
		    link_dict['id'] = str(asset_id)

		    links.append(link_dict)

        return links

    def get_tab_link_details(self, task_id, project_name=''):
        """
        Function to get links details of a task.
        :param task_id: Task id
        :param project_name: Project name
        :return: List of dictionay of linke data.
        """

	parent_obj = self.atom.getFromId(project_name,[task_id])
        links = list()

	if not parent_obj or 'links' not in parent_obj[task_id]:
	    return links

	link_ids = parent_obj[task_id]['links']

	for link_id in link_ids:

            link_dict = dict()

	    obj_notes = self.atom.getNotes(project_name, [task_id])
	    note_list = self.get_note_data(obj_notes)
	    link_dict['notes'] = note_list
	    link_dict['asset_id'] = link_id
	    asset_obj = self.atom.getFromId(project_name, [link_id])
	    link_dict['name'] = asset_obj[link_id]['name']
    
            links.append(link_dict)

        return links

    def show_latest_asset_version(self, project_name, task_id, asset_type):
        """
        Function to get the list of assset versions for task
        :param project: Project name
        :param task_id: Task id
        :param asset_type: asset_type
        :return: List of dictionary of version data
        """

	versions = self.atom.getVersions(project_name, task_id, asset_type)

        list_versions = list()

	if versions:
	    each = versions[0]
            version_hash = dict()
            try:
                version_hash['id'] = str(each['_id'])
                version_hash['name'] = each['name']
                version_hash['path'] = each['path']
            except Exception as e:
		print("Fetch version Error : %s" %e)

            list_versions.append(version_hash)

        return list_versions

    def show_asset_versions(self, project_name, task_id, asset_type):
        """
        Function to get the list of assset versions for task
        :param project: Project name
        :param task_id: Task id
        :param asset_type: asset_type
        :return: List of dictionary of version data
        """

	versions = self.atom.getVersions(project_name, task_id, asset_type)

        list_versions = list()

	for each in versions:
            version_hash = dict()
            try:
                version_hash['version_id'] = str(each['_id'])
                version_hash['version_name'] = each['name']
                version_hash['asset_type'] = each['asset_type']
                version_hash['asset_name'] = each['asset_name']
                version_hash['status_name'] = each['status']
                version_hash['published_on'] = str(each['published_on']).split('.')[0]
                version_hash['user_role'] = self.user_role
                version_hash['published_by'] = each['published_by']
                version_hash['comment'] = each['description']
            except Exception as e:
		print("Fetch version Error : %s" %e)

            list_versions.append(version_hash)

        return list_versions

    def save_version_changes(self, project, data_list, page):

        if not data_list:
            return False

        data_list = json.loads(data_list)
        log_data_list = []
        for data in data_list:
            change_value = str(data[0])
            version_id = str(data[1])  # version id
            row_org_val = str(data[2])
	    self.object_change_status(project, version_id, 'Version', change_value, page)

    def object_change_status(self, project, object_id, status_for, new_status, page=''):
        """
        Function to change status of the task.
        :param new_status: New status
        :param object_id: Selected object id
        :param status_for: Value of the entity for which the status changed.
        :param page: Current page name
        :return: None
        """
        print('%s : Change Object Status :- %s : %s : %s ' % (self.username, new_status, object_id, status_for))
        if not object_id:
            return False

	data = { 'status' : new_status }

	task_obj = dict()
	task_id = ''
	if status_for == 'Task':
	    data['entity_id'] = object_id
	    self.atom.updateFromId(project, data)
	    task_obj = self.atom.getFromId(project, [object_id])
	    task_id = str(task_obj[object_id]['_id'])
	elif status_for == 'Version':
	    self.atom.updateVersionStatus(project, object_id, new_status)
	    task_obj = self.atom.getFromVersionId(project, [object_id])
	    task_id = str(task_obj[object_id]['task_id'])

	try:
	    act_log_dict = dict()
	    act_log_dict['key'] = 'status'
	    act_log_dict['value'] = new_status
	    act_log_dict['object_type'] = status_for
	    act_log_dict['action'] = 'update'
	    act_log_dict['path'] = task_obj[object_id]['path']
	    act_log_dict['object_parent_id'] = task_obj[object_id]['parent_id']
	    act_log_dict['project'] = project
	    act_log_dict['page'] = page
	    act_log_dict['task_id'] = task_id
	    # Log activity 
	    self.activity_log(act_log_dict)
	except Exception as e:
	    print("object_change_status error : %s" %e)
	

    def insert_review(self, project, note_id, version_id, from_task, to_task, change_status):
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

        collection = self.mongo_database['%s_review' % project]

	data = dict()
	data['project'] = project
	data['note_id'] = note_id
	data['version_id'] = version_id
	data['status'] = change_status
	data['from_task'] = from_task
	data['to_task'] = to_task
	data['added_by'] = self.username
	data['added_on'] = datetime.datetime.now()

	task_data = dict()
	version_dict = self.atom.getFromVersionId(project, [version_id])
	if version_id in version_dict:
	    data['pub_version'] = version_dict[version_id]['name']
	    task_data['published_by'] = version_dict[version_id]['published_by']

	collection.insert_one(data)
	note_dict = self.atom.getFromNoteId(project, [note_id])
	if note_id in note_dict:
	    task_data['note_text'] = note_dict[note_id]['note_text']

	task_data.update(data)
        # Send reject email or approve mail
        approved_status = ['Client Approved', 'Ready To Publish', 'Outsource Approved', 'Outsource Client Approved', 'Final Publish', 'Internal Approved']

        if change_status in approved_status:
            print("************ Task Approved ****************")
            self.approve_mail(task_data)
        else:
            print("************ Task Reject ****************")
            self.reject_mail(task_data)

    def reject_mail(self, details):
        """
        Function for creating task reject mail content and call send mail function inside this.
        :param details: Details of Task
        :return: None
        """
        if 'published_by' not in details:
            print("No user found to send a reject mail")

        subject = 'Task Reject (' + details['to_task'] + ') [' + details['status'] + ']'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        to_addr = details['published_by'] + '@intra.madassemblage.com'

        project = details['to_task'].split(':')[0].upper()
        task_name = details['to_task'].split(':')[-1]

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

        from_task_name = ''
        if 'from_task' in details:
            from_task_name = details['from_task'].split(':')[-1]

	try:
            to_addr = to_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][task_name]['to'])
            cc_addr = cc_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][task_name]['cc'])
        except:
            print("No emails ids for task reject : %s" %task_name)

	try:
	    if task_name != from_task_name:
		to_addr = to_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][from_task_name]['to'])
		cc_addr = cc_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][from_task_name]['cc'])
        except:
            print("No emails ids for task reject : %s" %from_task_name)

        htmlhead = """
        Hello Artist(s),</br>Your task has been rejected with below details ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['to_task'], details['status'])

        htmlbody = ''
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">From</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['from_task'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">To</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['to_task'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Reason</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
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
        if 'published_by' not in details:
            print("No user found to send a approved mail")

        subject = 'Task Approved (' + details['to_task'] + ') [' + details['status'] + ']'
        from_addr = details['added_by'] + '@intra.madassemblage.com'

        to_addr = details['published_by'] + '@intra.madassemblage.com'

        project = details['to_task'].split(':')[0].upper()
        task_name = details['to_task'].split(':')[-1]

        cc_addr = 'prafull.sakharkar@intra.madassemblage.com,ajay.maurya@intra.madassemblage.com'

	try:
            to_addr = to_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][task_name]['to'])
            cc_addr = cc_addr + ',' + ','.join(self.email_address[project.lower()]['Review Tasks'][task_name]['cc'])
        except:
            print("No emails ids for task approval : %s" %task_name)

        htmlhead = """
        Hello Artist(s),</br>Your task has been approved with below details ... </br></br>
        <table border="1">
        <tr style="font-weight:bold;"><td>%s</td><td>%s</td></tr>
        <tr><td colspan="3">
        <table border="1">
        <tbody>
        """ % (details['to_task'], details['status'])

        htmlbody = ''
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">From</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['from_task'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">To</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % str(details['to_task'])
        htmlbody = htmlbody + '<tr><td style="font-weight:bold;font-size:12px;">Note</td>' \
                              '<td style="font-size:12px;">%s</td></tr>' % details['note_text']
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
            receiver_mail = ['prafull.sakharkar@intra.madassemblage.com', 'kunal.jamdade@intra.madassemblage.com']

        part = MIMEText(mail_body, 'html')
        msg.attach(part)
        s = smtplib.SMTP('localhost')
        s.sendmail(sender_mail, receiver_mail, msg.as_string())
        print("Mail Send from %s to %s" % (sender_mail, receiver_mail))
        s.quit()

    def create_new_note(self, project, entity_id, note_text, note_category, note_on, attach_files, page, from_task, to_task, change_status=''):
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
	data = {
	    "parent_id": entity_id,
	    "added_by": self.username,
	    "note_text": note_text,
	    "note_category": note_category,
	    "note_on": note_on,
	    "project": project
	}

	if len(attach_files):
	    attach_files = json.loads(attach_files)
	    data["note_components"] = list()
	    for each in attach_files:
		file_type = each.split('.')[-1]
		url = '/%s' %each
		data["note_components"].append({'file_type': file_type, 'url': url})

	new_data = self.atom.createNote(project, data)
	time.sleep(1)
	note_id = str(new_data['_id'])

	task_id = ''
	task_obj = self.atom.getFromId(project, [entity_id])
	if change_status and note_on == 'Version':
	    self.insert_review(project, note_id, entity_id, from_task, to_task, change_status)
	    task_obj = self.atom.getFromVersionId(project, [entity_id])
	    task_id = str(task_obj[entity_id]['task_id'])
	elif note_on == 'Task':
	    task_id = str(task_obj[entity_id]['_id'])
	    

	try:
	    act_log_dict = dict()
	    act_log_dict['key'] = 'note'
	    act_log_dict['value'] = note_text
	    act_log_dict['object_type'] = note_on
	    act_log_dict['action'] = 'add'
	    act_log_dict['path'] = task_obj[entity_id]['path']
	    act_log_dict['object_parent_id'] = task_obj[entity_id]['parent_id']
	    act_log_dict['project'] = project
	    act_log_dict['page'] = page
	    act_log_dict['task_id'] = task_id
	    # Log activity 
	    self.activity_log(act_log_dict)
	except Exception as e:
	    print("create_new_note : %s" %e)

	new_data = [new_data]
	note_list = self.get_note_data(new_data)
        return note_list

    def reply_note(self, project, note_id, reply_text):
        """
        Function for reply on version notes.
        :param reply_text: Message text
        :param note_id: Note id of the replied note
        :return: None
        """

	reply = self.atom.replyNote(project, note_id, reply_text)

    def get_tasks_template(self):

        json_data = {}
        if os.path.isfile(self.task_template_jfile):
            data_file = open(self.task_template_jfile, 'r')
            try:
                json_data = json.load(data_file)
            finally:
                data_file.close()

        return json_data

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

    def asset_csv_data_validation(self, csv_data, project):
        """
        Function to validate data inside csv file to upload
        :param reader: List of rows from csv file.
        :param project: Project name
        :return: CSV data list
        """
        duplicate = dict()
        csv_data_list = list()
        asset_types = ['Set', 'FX', 'Prop', 'Character', 'Vehicle', 'Environment']

	asset_builds = self.atom.getAssetBuilds(project)

        prg = re.compile("^[0-9a-zA-Z]+$")
        for row in csv_data:
            if not row:
                continue

            invalid = 0
            name = row[0].strip()
            name = name.replace(" ", "")
            val_match = prg.match(name)
            if not val_match:
                invalid = 1

            desc = 'New Asset Created'
            if len(row) > 1:
                desc = row[2]

                asset_type = row[1].strip()
                if asset_type not in asset_types:
                    invalid = 1

            if name in asset_builds:
                invalid = 1

            if name in duplicate:
                invalid = 1
	    else:
		duplicate[name] = 1

            csv_data_list.append(
                {'asset_name': name, 'asset_type': asset_type, 'description': desc, 'invalid': invalid})

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

    def get_month_wise_reports(self, project='ice', first='', last='', parent_object_type='Asset Build', months=''):

        print('get_month_wise_reports', project, first, last)

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
                    "status": 1,
                    "month": {"$month": "$updated_on"},
                    "year": {"$year": "$updated_on"}
                }
            },
            {
                "$group": {
                    "_id": {"name": "$name", "type": "$type", "status": "$status", "month": "$month",
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
            task_status = each['_id']['status']
            total = int(each['total'])

            task = each['_id']['name']
            self.initialize_asset_month(task_data, task, status_keys, month, parent_type)
            self.calculate_asset_month(task_data, task, each, task_status, month, parent_type, total)

            task = 'Gross'
            self.initialize_asset_month(task_data, task, status_keys, month, parent_type)
            self.calculate_asset_month(task_data, task, each, task_status, month, parent_type, total)


	# For Shot Tab
        shot_data_cursor = task_col.find(
            {"object_type": 'Task', "parent_object_type": "Shot",
             "updated_on": {"$exists": True},
             'name': {"$in": ['Layout', 'Animation', 'Lighting']},
             }, {"_id": 0, "parent_object_type": 1, "path": 1, "name": 1,
                 "status": 1, "updated_on": 1})

        shot_data = dict()
        for element in shot_data_cursor:
            task_name = element['name']
            updated_date = element['updated_on']
            format_date = datetime.datetime.strftime(datetime.datetime.strptime(str(updated_date).split(".")[0],
                                                                                "%Y-%m-%d ""%H:%M:%S"), "%Y/%-m/%-d")
            month = self.months_str[int(format_date.split("/")[1])] + "-" + format_date.split("/")[0]
            task_status = element['status']

            sequence_name = element['path'].split(":")[1]
            self.initialize_asset_month(shot_data, sequence_name, status_keys, month, task_name)
            self.calculate_asset_month(shot_data, sequence_name, element, task_status, month, task_name, 1)

            task = 'Gross'
            self.initialize_asset_month(shot_data, task, status_keys, month, task_name)
            self.calculate_asset_month(shot_data, task, element, task_status, month, task_name, 1)

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

    def calculate_asset_month(self, task_data, task, each, task_status, month, parent_type, total):

        path = each['path']

	report_status = 'WIP'
        if task_status == 'Internal Approved':
            report_status = 'Internal'
        elif task_status == 'Pending Client Review':
            report_status = 'Review'
        elif task_status == 'Client Approved':
            report_status = 'Approved'
        elif task_status == 'In Progress':
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

            task_status = ''
            if 'status' in cur_task:
                task_status = cur_task['status']

            if task_status not in ['In Progress', 'Ready To Start']:
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

    def get_project_reports(self, project='ice'):

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
            task_status = each['status']
            user_name = '-'
            if 'current_assignees' in each:
                try:
                    user_name = map(lambda user: user['user_name'],
                                    each['current_assignees'])
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

                if task_status == 'In Progress':
                    sequence_dict[seq]['WIP'][task_name]['Count'] += 1
                    sequence_dict[seq]['WIP'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Internal Approved':
                    sequence_dict[seq]['DONE'][task_name]['Count'] += 1
                    sequence_dict[seq]['DONE'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Client approved':
                    sequence_dict[seq]['APPROVED'][task_name]['Count'] += 1
                    sequence_dict[seq]['APPROVED'][task_name]['Task'].append({task: user_name})

                if task_status == 'Outsource':
                    outsource_sequence_dict[seq]['WIP'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['WIP'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Outsource Approved':
                    outsource_sequence_dict[seq]['DONE'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['DONE'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Outsource Client Approved':
                    outsource_sequence_dict[seq]['APPROVED'][task_name]['Count'] += 1
                    outsource_sequence_dict[seq]['APPROVED'][task_name]['Task'].append({task: user_name})

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

                if task_status == 'In Progress':
                    asset_dict[parent_type]['WIP'][task_name]['Count'] += 1
                    asset_dict[parent_type]['WIP'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Internal Approved':
                    asset_dict[parent_type]['DONE'][task_name]['Count'] += 1
                    asset_dict[parent_type]['DONE'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Client approved':
                    asset_dict[parent_type]['APPROVED'][task_name]['Count'] += 1
                    asset_dict[parent_type]['APPROVED'][task_name]['Task'].append({task: user_name})

                if task_status == 'Outsource':
                    outsource_asset_dict[parent_type]['WIP'][task_name]['Count'] += 1
                    outsource_asset_dict[parent_type]['WIP'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Outsource Approved':
                    outsource_asset_dict[parent_type]['DONE'][task_name]['Count'] += 1
                    outsource_asset_dict[parent_type]['DONE'][task_name]['Task'].append({task: user_name})

                elif task_status == 'Outsource Client Approved':
                    outsource_asset_dict[parent_type]['APPROVED'][task_name]['Count'] = 1
                    outsource_asset_dict[parent_type]['APPROVED'][task_name]['Task'].append({task: user_name})
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

        data = self.atom.getTasksFromStatus(project, review_status, user_columns)

	obj_col_ver = self.mongo_database[project + "_versions"]
        for each in data:
            task_details = dict()
            task_details['project'] = project
            task_details['task'] = 'None'
            task_details['path'] = 'None'
            task_details['status'] = review_status
            task_details['task_name'] = 'None'
            task_details['updated_on'] = '0000-00-00 00:00:00'
            task_details['version'] = 'None'
            task_details['object_type'] = 'Task'
            task_details['users'] = 'None'
            task_details['task_id'] = str(each['_id'])
            task_details['task_name'] = each['name']

            if 'path' in each:
                task_details['path'] = each['path']
		
            if 'updated_on' in each:
                task_details['updated_on'] = str(each['updated_on']).split('.')[0]

	    obj_versions = obj_col_ver.find({"status":review_status,"task_id":task_details['task_id']}).sort("updated_on", -1).limit(1)

            if obj_versions.count():
                task_details['version'] = obj_versions[0]['name']
                task_details['object_type'] = 'AssetVersion'
                task_details['version_id'] = str(obj_versions[0]['_id'])
                task_details['published_by'] = obj_versions[0]['published_by'] if 'published_by' in obj_versions[0] else None
                task_details['published_on'] = str(obj_versions[0]['published_on']).split('.')[0]
	    else:
		continue

            if 'status' in each:
                task_status_label = each['status'].replace(' ', '_')
                task_status_label = task_status_label.lower()
                task_details['status_label'] = task_status_label

            task_list.append(task_details)

        return task_list

    def get_artist_tasks(self, user, project, path=''):

        task_list = list()
        task_user_details = self.get_spend_time(user, project, path=None)
        status_list = ['Ready To Start', 'In Progress', 'Internal Reject', 'Client Reject', 'Ready To Publish']
	parent_object_type=''
	user_task_details = self.atom.user_assignments(project, user, parent_object_type, status_list)

        for each_key, each_val in user_task_details.iteritems():
	    if path and each_key != path:
		continue
            task_details = dict()
	    try:
		task_path = each_key
                task_details['task_id'] = str(each_val['_id'])
                task_details['user_name'] = user
                task_details['project'] = project
                task_details['path'] = task_path
                task_details['task_status'] = each_val['status']
                task_details['start_date'] = 'None'
                task_details['finish_date'] = 'None'
                task_details['upload_date'] = 'None'
                task_details['backup_status'] = 'None'
                task_details['bid_hours'] = "00:00:00"
                task_details['time_left'] = "00:00:00"
                task_details['parent_id'] = each_val['parent_id']
                task_details['task_pub_status'] = ''
                task_details['total_hours'] = "00:00:00"
                task_details['total_secs'] = 0
                task_details['parent_object_type'] = each_val['parent_object_type']
		if task_path in task_user_details:
		    task_details['total_hours'] = task_user_details[task_path]['time_spend']
		    task_details['total_secs'] = task_user_details[task_path]['time_spend_sec']
                from_task = str(task_path)
                status = str(each_val['status'])
                model_class = getModel(str(project) + '_review')
                reject_obj = model_class.objects.order_by('-added_on').filter(from_task__iexact=from_task, status='Internal Reject')
                if reject_obj:
		    reject_obj = reject_obj[0]
		    to_task = reject_obj.to_task
                    pub_version = reject_obj.pub_version
		    ver_list = pub_version.split('v')
		    next_version = ver_list[0] + '%003d' % (int(ver_list[-1]) + 1)

                    model_version_class = getModel(str(project) + '_versions')
                    version_obj = model_version_class.objects.order_by('-published_on').filter(task_path=to_task, name=next_version)
                    if version_obj:
                        task_details['task_pub_status'] = 'published'
                    else:
                        task_details['task_pub_status'] = 'reject'

                if 'bid' in each_val:
                    bid = int(each_val['bid']) or 0
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

                if 'status' in each_val:
                    task_details['status'] = each_val['status']
                    task_status_label = each_val['status'].replace(' ', '_')
                    task_status_label = task_status_label.lower()
                    task_details['status_label'] = task_status_label

                if 'backup_status' in each_val['current_assignees'][0]:
                    task_details['backup_status'] = each_val['current_assignees'][0]['backup_status']
                if 'start_date' in each_val['current_assignees'][0]:
                    start_date = str(each_val['current_assignees'][0]['start_date']).split('.')[0]
                    task_details['start_date'] = start_date
                if 'finish_date' in each_val['current_assignees'][0]:
                    finish_date = str(each_val['current_assignees'][0]['finish_date']).split('.')[0]
                    task_details['finish_date'] = finish_date
                if 'upload_date' in each_val['current_assignees'][0]:
                    upload_date = str(each_val['current_assignees'][0]['upload_date']).split('.')[0]
                    task_details['upload_date'] = upload_date

	    except ValueError as e:
		print("Artist Task Error : %s" % e)

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

    def apply_artist_action(self, project, task_id, action, page, task_path, parent_id):
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

	if not task_id:
	    return False

        update_value = dict()
        log_update_value = dict()
        update_value['current_assignees.$.backup_status'] = action
        log_update_value['backup_status'] = action
        log_update_value[action] = datetime.datetime.now()
        if action == 'Started':
            update_value['current_assignees.$.start_date'] = datetime.datetime.now()
        elif action == 'Paused':
            update_value['current_assignees.$.pause_date'] = datetime.datetime.now()
        else:
            update_value['current_assignees.$.finish_date'] = datetime.datetime.now()
            self.stop_active_task(project, task_path)

        if action == 'Started':
            change_status = 'In Progress'

            update_value['status'] = change_status
	    log_update_value['status'] = change_status

        # update backup status and task status
        obj_col = self.mongo_database[project + '_tasks']
        search_key = {'current_assignees.user_name': self.username, '_id': ObjectId(task_id)}
        obj_col.update_one(search_key, {'$set': update_value})

	for key, value in log_update_value.iteritems():
	    act_log_dict = dict()
	    act_log_dict['key'] = key
	    act_log_dict['value'] = value
	    act_log_dict['object_type'] = 'Task'
	    act_log_dict['action'] = 'update'
	    act_log_dict['path'] = task_path
	    act_log_dict['object_parent_id'] = parent_id
	    act_log_dict['project'] = project
	    act_log_dict['page'] = page
	    act_log_dict['task_id'] = task_id
	    # Log activity 
	    self.activity_log(act_log_dict)

        task_details = self.get_artist_tasks(self.username, project, task_path)
        return task_details

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
                                {'current_assignees.$': 1, 'path': 1, 'status': 1}).sort(
                "current_assignees.$.start_date", -1)
            for each in data:
                try:
                    task_status = each['status']
                except Exception as e:
                    task_status = 'undefined'

                task_user_reports['task_status'] = task_status

                if task_status in status_graph:
                    status_graph[task_status] = status_graph[task_status] + 1
                else:
                    status_graph[task_status] = 1

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

    def get_spend_time(self, user, project, path=None):

        task_user_details = dict()
        daily_task_col = self.mongo_database[project + "_daily_task_details"]
        if path is None:
            # for col in self.mongo_database.collection_names():
            #     if not col.endswith('_daily_task_details'):
            #         continue
            #     daily_task_col = self.mongo_database[col]
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
        else:
            aggregate = [{
                "$match": {
                    "user": user,
                    "task": path
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
        except ldap.LDAPError as ld:
            print("Ldap error")

        ldap_con.unbind_s()
        return sorted(uid_list)

    # Update form elements

    def update_form_data(self, project_name, entity_name, data_list):
        """
        Function to update the on the basis of entity name.
        :param entity_name: Name of entity
        :param data_list: List of data to be update.
        :return: Success message
        """

        data_list = json.loads(data_list)

        msg = 'Nothing to happen ...'

        if entity_name == 'Project':
            self.update_project(data_list)
            msg = 'Project has been updated ...'
        elif entity_name == 'AssetBuild':
            self.update_asset_build(project_name, data_list)
            msg = 'Asset Build has been updated ...'
        elif entity_name == 'Sequence':
            self.update_sequence(project_name, data_list)
            msg = 'Sequence has been updated ...'
        elif entity_name == 'Shot':
            self.update_shot(project_name, data_list)
            msg = 'Shot has been updated ...'
        elif entity_name == 'Task':
            self.update_task(project_name, data_list)
            msg = 'Task has been updated ...'

        return {'message': msg}

    def update_project(self, data_list=None):
        """
        Function to add and update project.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """
	if not isinstance(data_list, list) or not data_list:
            return False

	act_log_list = list()
        for each in data_list:
	    project_dict = dict()
	    project_dict['start_date'] = each['start_date']
	    project_dict['end_date'] = each['end_date']
	    project_dict['start_frame'] = each['start_frame']
	    project_dict['fps'] = each['fps']
	    project_dict['resolution'] = each['resolution']

	    if 'action' in each and each['action'] == 'add':
		project_dict['name'] = each['project_code']
		project_dict['full_name'] = each['project_name']
		self.atom.createProject(project_dict)
	    elif 'action' in each and each['action'] == 'update':
		project_id = each['project_id']
		self.atom.updateProject(project_id, project_dict)
	    
	    for key in ['start_date', 'end_date', 'start_frame', 'fps', 'resolution']:
		act_log_dict = dict()
		act_log_dict['object_type'] = 'Project'
		act_log_dict['action'] = each['action']
		act_log_dict['path'] = each['project_code']
		act_log_dict['project'] = each['project_code']
		act_log_dict['page'] = each['page']
		if key in each:
		    act_log_dict['key'] = key
		    act_log_dict['value'] = each[key]

		# Log activity 
		self.activity_log(act_log_dict)

    def update_asset_build(self, project_name, data_list=None):
        """
        Function to add and update the asset build.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """

	if not isinstance(data_list, list) or not data_list:
            return False

	asset_build_list = list()
	for data in data_list:
	    asset_build_dict = dict()
	    if 'asset_build_name' not in data or 'project_name' not in data:
		print("Invalid Asset Build or Project not defined: %s" % data)
		continue

	    asset_build_dict['name'] = data['asset_build_name']
	    asset_build_dict['parent_id'] = data['parent_id']

	    if 'asset_build_type' in data:
		asset_build_dict['asset_build_type'] = data['asset_build_type']

	    if 'description' in data:
		asset_build_dict['description'] = data['description']

	    asset_build_list.append(asset_build_dict)

	if asset_build_list:
	    self.atom.createAssetBuilds(project_name, asset_build_list)
	    for key_dict in asset_build_list:
                act_log_dict = dict()
                act_log_dict['object_type'] = 'Asset Build'
                act_log_dict['action'] = 'add'
                act_log_dict['path'] = project_name + ':' + key_dict['name']
                act_log_dict['project'] = project_name
                act_log_dict['page'] = data_list[0]['page']
                act_log_dict['object_parent_id'] = key_dict['parent_id']
                act_log_dict['key'] = 'name'
                act_log_dict['value'] = key_dict['name']

                # Log activity 
                self.activity_log(act_log_dict)

    def update_sequence(self, project_name, data_list=[]):
        """
        Function to add and update the shot.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """

	seq_list = list()
	for data in data_list:
	    seq_dict = dict()
	    seq_dict['name'] = data['seq_name']
	    seq_dict['description'] = data['description']
	    seq_dict['parent_id'] = data['parent_id']
	    seq_list.append(seq_dict)

	if seq_list:
	    self.atom.createSequences(project_name, seq_list)
	    for key_dict in seq_list:
                act_log_dict = dict()
                act_log_dict['object_type'] = 'Sequence'
                act_log_dict['action'] = 'add'
                act_log_dict['path'] = project_name + ':' + key_dict['name']
                act_log_dict['project'] = project_name
                act_log_dict['object_parent_id'] = key_dict['parent_id']
                act_log_dict['page'] = data_list[0]['page']
                act_log_dict['key'] = 'name'
                act_log_dict['value'] = key_dict['name']

                # Log activity 
                self.activity_log(act_log_dict)

    def update_shot(self, project_name, data_list=[]):
        """
        Function to add and update the shot.
        :param data_list: List of dictionary with new or change values.
        :return: None
        """

	parent_id = ''
	shot_list = list()
	for data in data_list:
	    shot_dict = dict()
	    shot_dict['name'] = data['shot_name']
	    shot_dict['description'] = data['description']
	    parent_id = data['parent_id']
	    shot_list.append(shot_dict)
	    

	parent_obj = self.atom.getFromId(project_name,[parent_id])
	if parent_id in parent_obj:
	    parent_name = parent_obj[parent_id]['name']
	    self.atom.createShots(project_name, parent_name, shot_list)
	    for key_dict in shot_list:
                act_log_dict = dict()
                act_log_dict['object_type'] = 'Shot'
                act_log_dict['action'] = 'add'
                act_log_dict['path'] = project_name + ':' + parent_name + ':' + key_dict['name']
                act_log_dict['project'] = project_name
                act_log_dict['object_parent_id'] = parent_id
                act_log_dict['page'] = data_list[0]['page']
                act_log_dict['key'] = 'name'
                act_log_dict['value'] = key_dict['name']

                # Log activity 
                self.activity_log(act_log_dict)


    def update_task(self, project_name, data_list=None):
        """
        Function to add and update the details of task into database according to the changes has done by the user.
        :param data_list: List of dictionary with new or updated values.
        :return: None
        """
	if not isinstance(data_list, list) or not data_list:
            return False

	create_task_list = list()
	update_task_list = list()
	for data in data_list:
	    task_id = ''
	    data_dict = dict()
	    if 'task_id' in data:
		task_id = data['task_id']
		data_dict['task_id'] = task_id

	    if 'bid' in data:
		data_dict['bid'] = data['bid']

	    if 'path' in data:
		data_dict['path'] = data['path']

	    if 'parent_id' in data:
		data_dict['parent_id'] = data['parent_id']

	    if 'task_name' in data:
		data_dict['name'] = data['task_name']

	    if 'task_status' in data:
		data_dict['status'] = data['task_status']

	    if 'description' in data:
                data_dict['description'] = data['description']

	    if 'priority' in data:
                data_dict['priority'] = data['priority']

	    if 'page' in data:
                data_dict['page'] = data['page'].strip()

	    if 'start_date' in data and data['start_date']:
                start_date = data['start_date']
                start_date_datetime_obj = datetime.datetime.strptime(start_date, "%Y-%m-%d")
                start_date = datetime.datetime.strftime(start_date_datetime_obj, "%Y-%m-%dT%H:%M:%S")
                data_dict['start_date'] = start_date

            if 'end_date' in data and data['end_date']:
                end_date = data['end_date']
                end_date_datetime_obj = datetime.datetime.strptime(end_date, "%Y-%m-%d")
                end_date = datetime.datetime.strftime(end_date_datetime_obj, "%Y-%m-%dT%H:%M:%S")
                data_dict['end_date'] = end_date

	    org_users_list = list()
            if 'current_users' in data and data['current_users']:
                org_users_list = data['current_users'].split(',')

            changed_users_list = list()
            if 'assignee' in data and data['assignee']:
                changed_users_list = data['assignee'].split(',')

            added_users = list()
            for a_user in changed_users_list:
                if a_user != '---' and a_user not in org_users_list:
                    added_users.append(a_user)

	    if added_users:
		data_dict['current_assignees'] = added_users

            # for delete user
            deleted_users = list()
            for d_user in org_users_list:
                if d_user != '---' and d_user not in changed_users_list:
                    deleted_users.append(d_user)

	    if deleted_users:
		data_dict['remove_assignees'] = deleted_users

	    if task_id and task_id != 'undefined' and task_id != 'null':
		update_task_list.append(data_dict)
	    else:
		data_dict.pop('task_id')
		create_task_list.append(data_dict)

	    shot_data_dict = dict()
	    if 'startframe' in data:
		shot_data_dict['startframe'] = data['startframe']
		shot_data_dict['shot_id'] = data['parent_id']

	    if 'endframe' in data:
		shot_data_dict['endframe'] = data['endframe']
		shot_data_dict['shot_id'] = data['parent_id']

	    if shot_data_dict:
		self.atom.updateShot(project_name, shot_data_dict)
		try:
		    parent_obj = self.atom.getFromId(project_name,[data['parent_id']])
		    for key in ['startframe', 'endframe']:
			act_log_dict = dict()
			if key in shot_data_dict:
			    act_log_dict['key'] = key
			    act_log_dict['value'] = shot_data_dict[key]
			else:
			    continue

			act_log_dict['object_type'] = 'Shot'
			act_log_dict['action'] = 'update'
			act_log_dict['path'] = ':'.join(data['path'].split(':')[:-1])
			act_log_dict['object_parent_id'] = parent_obj[data['parent_id']]['parent_id']
			act_log_dict['project'] = project_name
			act_log_dict['page'] = data['page']
			# Log activity 
			self.activity_log(act_log_dict)
		except Exception as e:
		    print("Activity log error: Task : %s" %e)

	if create_task_list:
	    try:
		create_task_list = self.atom.createTasks(project_name, create_task_list)
		for each in create_task_list:
		    for key in ['bid', 'name', 'status', 'priority', 'start_date', 'end_date', 'current_assignees']:
			act_log_dict = dict()
			if key in each:
			    act_log_dict['key'] = key
			    act_log_dict['value'] = each[key] if not isinstance(each[key], list) else ','.join(map(lambda x: x['user_name'], each[key]))
			else:
			    continue

			act_log_dict['object_type'] = 'Task'
			act_log_dict['action'] = 'add'
			act_log_dict['path'] = each['path']
			act_log_dict['object_parent_id'] = each['parent_id']
			act_log_dict['project'] = project_name
			act_log_dict['page'] = each['page']
			act_log_dict['task_id'] = str(each['_id']) if '_id' in each else '---'
			# Log activity 
			self.activity_log(act_log_dict)
	    except Exception as e:
		print("Activity log error: Task : %s" %e)
 
	if update_task_list:
	    try:
		for each in update_task_list:
		    task_id = each['task_id']
		    for key in ['bid', 'status', 'priority', 'start_date', 'end_date', 'current_assignees', 'remove_assignees']:
			act_log_dict = dict()
			if key in each:
			    act_log_dict['key'] = key
			    act_log_dict['value'] = each[key] if not isinstance(each[key], list) else ','.join(each[key])
			else:
			    continue

			act_log_dict['object_type'] = 'Task'
			act_log_dict['action'] = 'update' if key != 'remove_assignees' else 'delete'
			act_log_dict['path'] = each['path']
			act_log_dict['object_parent_id'] = each['parent_id']
			act_log_dict['project'] = project_name
			act_log_dict['page'] = each['page']
			act_log_dict['task_id'] = task_id
			# Log activity 
			self.activity_log(act_log_dict)
		self.atom.updateTasks(project_name, update_task_list) 
	    except Exception as e:
		print("Activity log error: Task : %s" %e)

    # Entity - Project
    def show_projects(self):

	obj_projects = self.atom.getProjects()

	project_list = list()
	for project, data in obj_projects.iteritems():
	    project_dict = dict()
	    project_dict['proj_id'] = str(data['_id'])
	    project_dict['name'] = str(data['name'])
	    project_dict['fps'] = str(data['fps'])
	    project_dict['fullname'] = str(data['full_name']) if 'full_name' in data else '---'
	    project_dict['resolution'] = str(data['resolution'])
	    project_dict['proj_path'] = str(data['root'])
	    project_dict['start_frame'] = str(data['start_frame'])
	    project_dict['start_date'] = str(data['start_date'])

	    project_list.append(project_dict)

        return project_list

    def display_asset_details(self, project_name):

	asset_dict = self.atom.getAssetBuilds(project_name)

        asset_list = list()

	for key, value in asset_dict.iteritems():
	    try:
		asset_dict = dict()
		asset_dict['name'] = value['name']
		asset_dict['asset_id'] = str(value['_id'])
		asset_dict['description'] = value['description']
		asset_dict['type'] = value['type']
	    except Exception as e:
		print("display_asset_details : %s" %e)

	    asset_list.append(asset_dict)

        return asset_list

    def display_sequence_details(self, project_name):

	seq_dict = self.atom.getSequences(project_name)

        seq_list = list()

	for key, value in seq_dict.iteritems():
	    try:
		seq_dict = dict()
		seq_dict['name'] = value['name']
		seq_dict['seq_id'] = str(value['_id'])
		seq_dict['type'] = value['type']
		seq_dict['description'] = value['description'] if 'description' in value else '---'
	    except Exception as e:
		print("display_sequence_details : %s" %e)

	    seq_list.append(seq_dict)

        return seq_list

    def display_shot_details(self, project_name, seq_name):

	shot_dict = self.atom.getShots(project_name, [seq_name])

        shot_list = list()

	for seq, shots in shot_dict.iteritems():
	    for value in shots:
		try:
		    shot_dict = dict()
		    shot_dict['name'] = value['name']
		    shot_dict['shot_id'] = str(value['_id'])
		    shot_dict['duration'] = 0
		    shot_dict['total_frames'] = 0
		    shot_dict['start_frame'] = value['startframe']
		    shot_dict['end_frame'] = value['endframe']
	
		    if shot_dict['start_frame'] and shot_dict['end_frame']:
			shot_dict['duration'] = self.get_shot_duration(shot_dict['start_frame'], shot_dict['end_frame'], project_name)
			shot_dict['total_frames'] = int(str(shot_dict['end_frame']).split('.')[0]) - int(str(shot_dict['start_frame']).split('.')[0])
		except Exception as e:
		    print("display_shot_details : %s" %e)

		shot_list.append(shot_dict)

        return shot_list

    def display_task_details(self, project_name, parent_id):
        priority_dict = {'Urgent': "A", 'High': "B", 'Medium': "C", 'Low': "D"}

	task_dict = self.atom.getTasks(project_name, [parent_id])

	task_list = list()
	for key, tasks in task_dict.iteritems():
	    for value in tasks:
		try:
		    task_dict = dict()
		    task_dict['name'] = value['name']
		    task_dict['task_id'] = str(value['_id'])
		    task_dict['task_status'] = value['status']
		    users = '---'
		    if 'current_assignees' in value:
			users = map(lambda x: x['user_name'], value['current_assignees'])
			users = ','.join(users)
		    task_dict['users'] = users
		    task_dict['priority'] = priority_dict[value['priority']]
		    task_dict['bid'] = round(float(value['bid']) / (10*60*60),2)
		    task_dict['start_date'] = value['start_date']
		    task_dict['end_date'] = value['end_date']
		except Exception as e:
		    print("display_task_details : %s" %e)

		task_list.append(task_dict)
	    
        return task_list

    def get_details_before_update(self, name, entity_id, entity):

        if not (name and entity_id and entity):
            print("Project Name / Entity id not found")
            return False

	entity_dict = dict()
	if entity == 'project':
	    entity_dict = self.atom.getProjects([name])

        data_list = list()
	for key, value in entity_dict.iteritems():
	    update_dict = dict()
	    try:
		update_dict['full_name'] = value['full_name']
		update_dict['name'] = value['name']
		update_dict['start_frame'] = value['start_frame']
		update_dict['start_date'] = value['start_date']
		update_dict['end_date'] = value['end_date']
		update_dict['resolution'] = value['resolution']
		update_dict['fps'] = value['fps']
		update_dict['proj_id'] = str(value['_id'])
	    except Exception as e:
		print("get_details_before_update : %s" %e)

	    data_list.append(update_dict)

        return data_list

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

    def get_shot_duration(self, start_frame, end_frame, prj_name):

        project_obj = self.atom.getProjects([prj_name])
	project_fps = 0
	if prj_name in project_obj:
	    project_fps = int(project_obj[prj_name]['fps'])

        duration = float(int(end_frame) - (int(start_frame) - 1)) / project_fps

        return round(duration,2)

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

    def add_asset(self, project_name, entity_id, selected_asset, page):
        """
        Function to add new asset to the database.
        :param entity_id: entity_id can be shot_id or asset_id
        :param selected_asset: List of selected new assets
        :param page: Current activity page
        :return: None
        """

	links = list()
	if selected_asset:
	    links = selected_asset.split(',')

	data = dict()
	data['entity_id'] = entity_id
	data['links'] = links

	self.atom.updateFromId(project_name, data)
	entity_obj = self.atom.getFromId(project_name, [entity_id])
	if entity_obj:
	    try:
		act_log_dict = dict()
		act_log_dict['key'] = 'links' 
		act_log_dict['value'] = selected_asset
		act_log_dict['object_type'] = entity_obj[entity_id]['object_type']
		act_log_dict['action'] = 'update'
		act_log_dict['object_parent_id'] = entity_obj[entity_id]['parent_id']
		act_log_dict['task_id'] = entity_id
		act_log_dict['project'] = project_name
		act_log_dict['page'] = page
		act_log_dict['path'] = entity_obj[entity_id]['path']
		# Log activity 
		self.activity_log(act_log_dict)
	    except Exception as e:
		print("add_asset : %s" %e)

    # delete note
    def delete_note(self, project, note_id, page):
	note_obj = self.atom.getFromNoteId(project, [note_id])
	parent_obj = dict()
	task_id = parent_id = ''
	if note_obj:
	    note_on = note_obj[note_id]['note_on']
	    parent_id = note_obj[note_id]['parent_id']
	    task_id = parent_id
	    if note_on == 'Task':
		parent_obj = self.atom.getFromId(project, [parent_id])
	    elif note_on == 'Version':
		parent_obj = self.atom.getFromVersionId(project, [parent_id])
		task_id = parent_obj[parent_id]['task_id']

	if parent_obj:
	    try:
		act_log_dict = dict()
		act_log_dict['key'] = 'note' 
		act_log_dict['value'] = note_obj[note_id]['note_text']
		act_log_dict['object_type'] = note_obj[note_id]['note_on']
		act_log_dict['action'] = 'delete'
		act_log_dict['object_parent_id'] = parent_obj[parent_id]['parent_id']
		act_log_dict['task_id'] = task_id
		act_log_dict['project'] = project
		act_log_dict['page'] = page
		act_log_dict['path'] = parent_obj[parent_id]['path']
		# Log activity 
		self.activity_log(act_log_dict)
	    except Exception as e:
		print("delete_note : %s" %e)

	self.atom.deleteNote(project, note_id)



    # ---------------------------------------------------------------------------- #
    # load task for create entity
    def load_task(self, selected_object, selected_asset_type):
        """
        Function to get list of task
        :param selcted_object: Object name
        :param selcted_asset_type: Asset type
        :return: list of taks
        """

        with open(self.task_template_jfile) as data_file:
            data = json.load(data_file)

            type_list = data[selected_object][selected_asset_type]

        return type_list

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

        priority_dict = {'Urgent': 'A', 'High': 'B', 'Medium': 'C', 'Low': 'D', 'None': 'None'}
        parent_ids = parent_ids.split(',')

        task_data_list = list()
        now = datetime.datetime.now()
	obj_parents = self.atom.getFromId(project_name, parent_ids)
	obj_tasks = self.atom.getTasks(project_name, parent_ids, [selected_task])

	for parent_id, data in obj_parents.iteritems():
	    shot_data_dict = dict()
            shot_data_dict['startframe'] = "101"
            shot_data_dict['endframe'] = "101"
	    if 'object_type' in data and data['object_type'] == 'Shot':
                if 'startframe' in data:
                    shot_data_dict['startframe'] = int(float(data['startframe']))
                if 'endframe' in data:
                    shot_data_dict['endframe'] = int(float(data['endframe']))
	    
	    task_data_dict = dict()
            task_data_dict['task_id'] = None
            task_data_dict['parent_id'] = parent_id
	    task_data_dict['name'] = '_'.join(data['path'].split(':')[1:])
	    task_data_dict['current_assignees'] = "---"
	    task_data_dict['status'] = "Ready To Start"
	    task_data_dict['bid'] = "0"
	    task_data_dict['project'] = project_name
	    task_data_dict['complexity'] = "D"
	    task_data_dict['startdate'] = now.strftime("%Y-%m-%d")
	    task_data_dict['enddate'] = now.strftime("%Y-%m-%d")
	    task_data_dict['description'] = "---"
	    task_data_dict['asset_ids'] = ""
	    task_data_dict.update(shot_data_dict)

	    if parent_id in obj_tasks:
		tasks = obj_tasks[parent_id]
		obj = tasks[0]

		task_data_dict['task_id'] = str(obj['_id'])

		if 'current_assignees' in obj and len(obj['current_assignees']) >= 1:
		    user_list = list()
		    for user in obj['current_assignees']:
			user_list.append(user['user_name'])
		    task_data_dict['current_assignees'] = sorted(user_list)

		if 'status' in obj:
		    task_data_dict['status'] = obj['status']

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

		if 'parent_object_type' in obj:
		    task_data_dict['parent_object_type'] = obj['parent_object_type']

	    status_lbl = task_data_dict['status'].lower()
	    task_data_dict['status_label'] = status_lbl.replace(" ", "_")

	    task_data_list.append(task_data_dict)

        return task_data_list

    @staticmethod
    def get_range(start, stop, step):
        range_list = list()
        i = start
        while i < stop:
            yield i
            i += step
        range_list.append(i)

    # range from 000 - 999 and 0000 - 9999
    @staticmethod
    def range_sq_sc(task_name, project_name, x_range=1):
        range_list = list()
        x_range = int(x_range)
	print(task_name, project_name, x_range)
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

    def sequence_task_total_time_duration(self, first, last, project='ice'):

        collection_name = self.mongo_database[project + "_tasks"]
        total_sequence_duration = {}
        summary_dict = {}
        start_date = end_date = 0

        start_date = first + " 00:00:00"
        end_date = last + " 23:59:59"
        start_date = datetime.datetime.strptime(str(start_date).strip(), "%Y-%m-%d %H:%M:%S")
        end_date = datetime.datetime.strptime(str(end_date).strip(), "%Y-%m-%d %H:%M:%S")

        task_list = ['Layout', 'Animation', 'Set Dressing', 'Lighting', 'Shave Hair']
        task_status_list = ['Client Reject', 'In Progress', 'Internal Approved', 'Outsource Client Review',
                              'Client Approved', 'Pending Client Review', 'Outsource Client Approved']

        query_dict = {
            "parent_object_type": "Shot",
            "updated_on": {
                "$gte": start_date,
                "$lte": end_date
            },
            "status": {"$in": task_status_list}
        }
        if '2013' in str(first).strip():
            query_dict['updated_on'].pop("$gte")

        if str(first).strip() == str(last).strip():
            status_list = ['In Progress', 'Client Reject']
            query_dict['status']['$in'] = status_list

        data = collection_name.find(query_dict)

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
                    task_status = ele['status']
                except KeyError as ke:
                    task_status = 'None'
                shot_list = filter(lambda x: x if sequence_name in x['path'] and shot_name in x['path'] else None,
                                   shot_data)
                try:
                    start_frame = float(shot_list[0]['startframe'])
                    end_frame = float(shot_list[0]['endframe'])
                    shot_duration = self.get_shot_duration(start_frame, end_frame, project)
                    total_sequence_time = round((shot_duration / 60), 2)
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

                if task_status == 'Internal Approved':
                    total_sequence_duration[sequence_name][task_name]['IA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['IA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['IA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['IA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['IA'] += shot_duration #round(summary_dict[task_name]['IA'] +
                    # total_sequence_time, 2)

                if task_status in ['Client approved', 'Outsource Client Approved']:
                    total_sequence_duration[sequence_name][task_name]['CA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['CA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['CA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['CA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['CA'] += shot_duration
                if task_status == 'In Progress':
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['WIP']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['WIP']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['WIP']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['WIP'] += shot_duration#round(summary_dict[task_name]['WIP'] +
                    # total_sequence_time, 2)

                if task_status in ['Pending Client Review', 'Outsource Client Review']:
                    total_sequence_duration[sequence_name][task_name]['PA']['total_secs'] += shot_duration
                    total_sequence_duration[sequence_name][task_name]['PA']['total_minutes'] = \
                        round(total_sequence_duration[sequence_name][task_name]['PA']['total_minutes']
                              + total_sequence_time, 1)
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_count'].append(shot_name)
                    total_sequence_duration[sequence_name][task_name]['PA']['shot_details'].append(
                        {'shot_name': shot_name, 'total': shot_duration})

                    summary_dict[task_name]['PA'] += shot_duration#round(summary_dict[task_name]['PA'] +
                    # total_sequence_time, 2)

                if task_status == "Client Reject":
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

    def get_shot_frame_duration(self, startframe, endframe, task_status, project_fps):

        if task_status == '':
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
        start_row = int(last_row) - 15
        last_row = int(last_row) - 1
        model_class = getModel(str(project) + '_review')
        review_obj = model_class.objects.order_by('-added_on').filter(Q(from_task__icontains=from_name) | Q(to_task__icontains=from_name))[start_row:last_row]

        data_list = list()
        for obj in review_obj:
            data_dict = dict()
	    task_path = obj.to_task
	    note_id = obj.note_id
            data_dict['department'] = task_path.split(':')[-1]
            data_dict['status'] = obj.status
            data_dict['added_by'] = obj.added_by
            data_dict['added_on'] = str(obj.added_on).split('.')[0]
            task_path = task_path.replace(task_path.split(':')[-1], obj.pub_version)
            data_dict['task_path'] = task_path.replace(':',' / ')

	    note_dict = self.atom.getFromNoteId(project, [note_id])
	    if note_id in note_dict:
		data_dict['note_text'] = note_dict[note_id]['note_text']

            data_list.append(data_dict)

        return data_list

    def get_activity_log_details(self, project, task_id):
        model_class = getModel(str(project) + '_activity_log')
        q = Q(task_id=task_id) | Q(object_parent_id=task_id)
        act_log_obj = model_class.objects.order_by('-acitivity_date').filter(q)
        data_list = list()
        for obj in act_log_obj:
            data_dict = dict()
            data_dict['details_for'] = obj.key
            data_dict['activity_by'] = obj.activity_by
            data_dict['action'] = obj.action
            data_dict['value'] = str(obj.value)
            data_dict['activity_date'] = str(obj.acitivity_date).split('.')[0]
            data_dict['path'] = obj.path

            data_list.append(data_dict)

        return data_list

    def ftp_upload_log(self, details):
        """
        Function for add ftp upload details in database !
        :param details: Dict of all required columns
        :return: None
        """
        db_name = 'ftp_upload_log'
        db_obj = getModel(db_name)
        date_now = datetime.datetime.now()
	page = 'FTP Upload'
        model_obj = db_obj.objects.create(uploaded_by=self.username, uploaded_on=date_now, page=page)
        model_obj.ftrack_id = details['ftrack_id'] if 'ftrack_id' in details else ''
        model_obj.task_id = details['task_id'] if 'task_id' in details else ''
        model_obj.task_parent_id = details['task_parent_id'] if 'task_parent_id' in details else ''
        model_obj.status = details['status'] if 'status' in details else ''
        model_obj.parent_path = details['parent_path'] if 'parent_path' in details else ''
        model_obj.upload_for = details['upload_for'] if 'upload_for' in details else ''
        model_obj.project_name = details['project_name'] if 'project_name' in details else ''
        model_obj.task_name = details['task_name'] if 'task_name' in details else ''
        model_obj.asset_type = details['asset_type'] if 'asset_type' in details else ''
        model_obj.asset_name = details['asset_name'] if 'asset_name' in details else ''
        model_obj.component = details['component'] if 'component' in details else ''
        model_obj.internal_version = details['internal_version'] if 'internal_version' in details else ''
        model_obj.upload_version = details['upload_version'] if 'upload_version' in details else ''
        model_obj.source = details['source'] if 'source' in details else ''
        model_obj.destination = details['destination'] if 'destination' in details else ''
        model_obj.save()
        print(details)

    def activity_log(self, details):
        """
        Function for add ftp upload details in database !
        :param details: Dict of all required columns
        :return: None
        """
	if 'project' not in details:
	    return False

        db_name = '%s_activity_log' %details['project']
        db_obj = getModel(db_name)

        date_now = datetime.datetime.now()
        model_obj = db_obj.objects.create(activity_by=self.username, acitivity_date=date_now)

        model_obj.key = details['key'] if 'key' in details else '---'
        model_obj.value = details['value'] if 'value' in details else '---'
        model_obj.page = details['page'] if 'page' in details else '---'
        model_obj.object_type = details['object_type'] if 'object_type' in details else '---'
        model_obj.action = details['action'] if 'action' in details else '---'
        model_obj.object_parent_id = details['object_parent_id'] if 'object_parent_id' in details else '---'
        model_obj.path = details['path'] if 'path' in details else '---'
        model_obj.task_id = details['task_id'] if 'task_id' in details else '---'
        model_obj.save()
        print(details)

    def help_document(self, request):
        user_name = request.user.username
        if not user_name:
            return HttpResponseRedirect("/login/")

        return render(request, 'help_documentation.html', {})
