from django.urls import path
from .views import *
from .assessment import *
from . import assessment  # Import views from the current app

urlpatterns = [
    path("login/", staff_login, name="staff_login"),
    path("signup/", staff_signup, name="staff_signup"),
 path('api/create-assessment/', assessment.create_assessment, name='create_assessment'),
 
 # path('api/assessment/<str:assessment_id>/', views.get_assessment, name='get_assessment'),
]