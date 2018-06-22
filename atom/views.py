from django.http import HttpResponseRedirect
from django.contrib import auth
from django.contrib import messages

def auth_view(request):
	username = request.POST.get('username')
	password = request.POST.get('password')
	user = auth.authenticate(username=username, password=password)
	if user is not None:
		auth.login(request, user)
		return HttpResponseRedirect('/role_login/')
	else:
                messages.error(request, "Password Invalid / Expired")
		return HttpResponseRedirect('/login/')
