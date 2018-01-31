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
	url(r'^ftp/', act.ftp_serve, name='status'),
	url(r'^dashboard/', act.sup_dashboard, name='sup_dashboard'),
	url(r'^mgm_dashboard/', act.mgm_dashboard, name='mgm_dashboard'),
	url(r'^create/', act.create_entities, name='create_entities'),
]
