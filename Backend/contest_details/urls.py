# urls.py
from django.urls import path
from . import views
from .views import *

urlpatterns = [
    path('contestdetails/', views.saveDetails, name='save_details'),
    path('userinfo/', views.saveUserInfo, name='save_user_info'),  # New endpoint
    path('api/contests/', get_contests, name='get_contests'),
    path('api/contests/delete/<str:contest_id>/', delete_contest, name='delete_contest'),
    path('api/start_test/', start_test, name='start_test'),
    path('api/finish_test/', finish_test, name='finish_test'),
    path("api/contests/stats/<str:contest_id>/", contest_stats, name="contest_stats"),
    path("api/contests/<str:contest_id>/students/", contest_students, name="contest_students"),


]