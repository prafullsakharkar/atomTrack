from django.http import HttpResponseRedirect
from django.contrib import auth

def auth_view(request):
    username = request.POST.get('username')
    password = request.POST.get('password')
    user = auth.authenticate(username=username, password=password)
    if user is not None:
	auth.login(request, user)
	return HttpResponseRedirect('/role_login/')
    else:
	return HttpResponseRedirect('/login/')
