from django.urls import path
from .views import *
from .assessment import *
from . import assessment  # Import views from the current app
from . import studentsprofile
from staff.studentstats import studentstats
from .studentstats import studentstats
urlpatterns = [
    path("login/", staff_login, name="staff_login"),
    path("signup/", staff_signup, name="staff_signup"),
    path('api/create-assessment/', assessment.create_assessment, name='create_assessment'),
    path('studentprofile/', studentsprofile.student_profile, name='student_profile'), 
    path('studentstats/<str:regno>/', studentstats, name='studentstats'),
    path('api/student/<str:regno>/', studentstats, name='student_stats'),
 # path('api/assessment/<str:assessment_id>/', views.get_assessment, name='get_assessment'),

 
    # path("get_students/", get_students, name="get_students"),

]
