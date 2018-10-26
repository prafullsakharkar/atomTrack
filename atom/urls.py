from django.conf.urls import url
from . import views

from atom.classActivity import Activity

act = Activity()

urlpatterns = [
    #    url(r'^user/', views.post_list, name='post_list'),
    url(r'^auth/', views.auth_view),
    url(r'^role_login/', act.get_login, name='roleLogin'),
    url(r'^callajax/', act.ajax_call, name='ajax_call'),
    url(r'^tasks/', act.artist_tasks, name='tasks'),
    url(r'^review/', act.review_tasks, name='Review'),
    url(r'^status/', act.task_status, name='status'),
    url(r'^ftp_upload/', act.ftp_serve, name='status'),
    url(r'^dashboard/', act.sup_dashboard, name='sup_dashboard'),
    url(r'^mgm_dashboard/', act.mgm_dashboard, name='mgm_dashboard'),
    url(r'^create_entity/', act.create_entities, name='create_entities'),
    url(r'^task_entity/', act.show_task_entities, name='show_task_entities'),
    url(r'^artist_prod/', act.artist_productivity, name='artist_productivity'),
    url(r'^month_wise/', act.month_wise_reports, name='month_wise_reports'),
    url(r'^sequence_delivery/', act.sequence_delivery, name='sequence_delivery'),
    url(r'^help_documentation/', act.help_document, name='help_documentation'),
    url(r'^create_role/', act.create_role, name='createRole'),
    url(r'^add_email/', act.add_emails, name='addEmails'),
    url(r'^update_user/', act.update_users, name='updateUsers'),
]
