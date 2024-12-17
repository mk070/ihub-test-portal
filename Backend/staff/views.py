from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password, make_password
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import logging
import jwt
from .utils import *
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from datetime import datetime, timezone

# MongoDB connection
client = MongoClient("mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority")
db = client['test_portal_db']
assessments_collection = db['coding_assessments']

logger = logging.getLogger(__name__)

JWT_SECRET = 'test'
JWT_ALGORITHM = "HS256"

def generate_tokens_for_staff(staff_user):
    """
    Generate tokens for authentication. Modify this with JWT implementation if needed.
    """
    access_payload = {
        'staff_user': str(staff_user),
        'exp': datetime.utcnow() + timedelta(minutes=600),  # Access token expiration
        'iat': datetime.utcnow(),
    }

    # Encode the token
    token = jwt.encode(access_payload, JWT_SECRET, algorithm=JWT_ALGORITHM)
    return {'jwt': token}

@api_view(["POST"])
@permission_classes([AllowAny])  # Allow unauthenticated access for login
def staff_login(request):
    """
    Login view for staff
    """
    try:
        data = request.data
        email = data.get("email")
        password = data.get("password")

        # Validate input
        if not email or not password:
            return Response({"error": "Email and password are required"}, status=400)

        # Fetch staff user from MongoDB
        staff_user = db['staff'].find_one({"email": email})
        if not staff_user:
            return Response({"error": "Invalid email or password"}, status=401)

        # Check password
        stored_password = staff_user["password"]
        if check_password(password, stored_password):
            # Generate tokens
            tokens = generate_tokens_for_staff(str(staff_user["_id"]))

            # Create response and set secure cookie
            response = Response({
                "messages": "Login successful",
                "tokens": tokens,
                "staffId": str(staff_user["_id"]),
                "name": staff_user["full_name"],
                "email": staff_user["email"],
                "department": staff_user["department"],
                "collegename": staff_user["collegename"]
            })
            response.set_cookie(
                key='jwt', 
                value=tokens['jwt'], 
                httponly=True, 
                samesite='Lax', 
                secure=False,
                max_age=1 * 24 * 60 * 60
            )

            return response

        return Response({"error": "Invalid email or password"}, status=401)
    
    except Exception as e:
        logger.error(f"Error during staff login: {e}")
        return Response({"error": "Something went wrong. Please try again later."}, status=500)

@api_view(["POST"])
@permission_classes([AllowAny])  # Allow signup without authentication
def staff_signup(request):
    """
    Signup view for staff
    """
    try:
        # Extract data from request
        data = request.data
        staff_user = {
            "email": data.get("email"),
            "password": make_password(data.get("password")),
            "full_name": data.get("name"),
            "department": data.get("department"),
            "collegename": data.get("collegename"),
            "created_at": datetime.now(),
            "updated_at": datetime.now(),
        }

        # Validate required fields
        required_fields = ["email", "password", "name", "department", "collegename"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return Response(
                {"error": f"Missing required fields: {', '.join(missing_fields)}"},
                status=400,
            )

        # Check if email already exists
        if db['staff'].find_one({"email": staff_user["email"]}):
            return Response({"error": "Email already exists"}, status=400)

        # Insert staff profile into MongoDB
        db['staff'].insert_one(staff_user)
        return Response({"message": "Signup successful"}, status=201)

    except Exception as e:
        logger.error(f"Error during staff signup: {e}")
        return Response(
            {"error": "Something went wrong. Please try again later."}, status=500
        )
#Student Counts Fetching 
@api_view(['GET'])
@permission_classes([AllowAny])
def fetch_student_stats(request):
    """
    Fetch total number of students and other student-related statistics
    """
    try:
        students_collection = db['students']
        
        # Total number of students
        total_students = students_collection.count_documents({})
        
        # Optional: Additional statistics you might want to include
        students_by_department = list(students_collection.aggregate([
            {"$group": {
                "_id": "$department",
                "count": {"$sum": 1}
            }}
        ]))
        
        # Optional: Active students (if you have a way to define 'active')
        active_students = students_collection.count_documents({"status": "active"})
        
        return Response({
            "total_students": total_students,
            "students_by_department": students_by_department,
            "active_students": active_students
        })
    
    except Exception as e:
        logger.error(f"Error fetching student stats: {e}")
        return Response({"error": "Something went wrong. Please try again later."}, status=500)
    
@api_view(['GET'])
@permission_classes([AllowAny])
def fetch_contests(request):
    """ 
    Fetch live or all contests from MongoDB based on query parameters.
    Handles two different collection structures.
    """
    try:
        contest_type = request.query_params.get('type', 'live')
        coding_assessments = db['coding_assessments']
        current_time = datetime.utcnow().replace(tzinfo=timezone.utc)  # Ensure UTC timezone for consistency
        current_date = current_time.date()  # Extract only the current date

        # Base query to match assessment documents
        base_query = {}

        # Add time-based filters for live contests
        if contest_type == 'live':
            base_query.update({
                "$or": [
                    # Structure 1: Direct startDate and endDate
                    {
                        "startDate": {"$lte": current_time},
                        "endDate": {"$gte": current_time}
                    },
                    # Structure 2: Registration-based filtering
                    {
                        "assessmentOverview.registrationStart": {"$lte": current_time},
                        "$or": [
                            {"assessmentOverview.registrationEnd": {"$gte": current_time}},
                            {"assessmentOverview.registrationEnd": None}
                        ]
                    }
                ]
            })

        contests_cursor = coding_assessments.find(base_query)
        contests = []

        for contest in contests_cursor:
            try:
                # Determine which structure we're dealing with
                if "assessmentOverview" in contest:
                    # Structure 2
                    start_date = contest.get("assessmentOverview", {}).get("registrationStart")
                    end_date = contest.get("assessmentOverview", {}).get("registrationEnd")
                    assessment_name = contest.get("assessmentOverview", {}).get("name", "Unnamed Contest")
                    guidelines = contest.get("assessmentOverview", {}).get("guidelines", [])
                    
                    # Get the test configuration
                    test_config = contest.get("testConfiguration", {})
                    
                    # Get the number of problems
                    problems_count = len(contest.get("problems", []))

                    # Updated logic for status determination
                    if start_date and end_date:
                        start_date_only = start_date.date()  # Extract only the date
                        end_date_only = end_date.date()

                        if current_date < start_date_only:
                            status = "Upcoming"
                        elif start_date_only <= current_date <= end_date_only:
                            status = "Live"
                        elif current_date > end_date_only:
                            status = "Completed"
                    else:
                        status = "Upcoming"  # Fallback status if dates are incomplete

                    contests.append({
                        "_id": str(contest.get("_id", "")),
                        "contestId": contest.get("contestId", ""),
                        "assessmentName": assessment_name,
                        "type": "Coding",
                        "category": "Technical",
                        "startDate": start_date,
                        "endDate": end_date,
                        "duration": test_config.get("duration", ""),
                        "guidelines": guidelines,
                        "assigned": len(contest.get("visible_to", [])),
                        "register": contest.get("register", 0),
                        "complete": contest.get("complete", 0),
                        "totalQuestions": problems_count,
                        "status": status
                    })
                else:
                    # Structure 1
                    start_date = contest.get("startDate")
                    end_date = contest.get("endDate")

                    # Updated logic for status determination
                    if start_date and end_date:
                        start_date_only = start_date.date()
                        end_date_only = end_date.date()

                        if current_date < start_date_only:
                            status = "Upcoming"
                        elif start_date_only <= current_date <= end_date_only:
                            status = "Live"
                        elif current_date > end_date_only:
                            status = "Completed"
                    else:
                        status = "Upcoming"  # Fallback status if dates are incomplete

                    contests.append({
                        "_id": str(contest.get("_id", "")),
                        "contestId": contest.get("contestId", ""),
                        "assessmentName": contest.get("assessmentName", "Unnamed Contest"),
                        "type": "Coding",
                        "category": "Technical",
                        "startDate": start_date,
                        "endDate": end_date,
                        "guidelines": contest.get("guidelines", []),
                        "status": status
                    })

            except Exception as e:
                logger.error(f"Error processing contest {contest.get('_id', 'unknown')}: {e}")
                continue

        return Response({
            "contests": contests,
            "total": len(contests)
        })

    except Exception as e:
        logger.error(f"Error fetching contests: {e}")
        return Response({"error": "Something went wrong. Please try again later."}, status=500)
    
#View_Test 
@csrf_exempt
def view_test_details(request, contestId):
    """
    Fetch details of a specific test from MongoDB using the contestId.
    """
    try:
        # Fetch the test details using the contestId field
        test_details = assessments_collection.find_one({"contestId": contestId}, {"_id": 0})

        if test_details:
            # Prepare the response data
            # context = {
            #     "assessment_name": test_details.get("assessmentName", "N/A"),
            #     "start_date": test_details.get("startDate", "N/A"),
            #     "end_date": test_details.get("endDate", "N/A"),
            #     "guidelines": test_details.get("guidelines", []),
            #     "contest_id": test_details.get("contestId", "N/A"),
            # }
            return JsonResponse(test_details, safe=False)  
        else:
            return JsonResponse({"error": "Test not found"}, status=404)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
    
def contest_details(request, contestID):
    """
    Fetch the contest details from MongoDB using the contest_id.
    """
    try:
        # Fetch the contest details from the MongoDB collection using contest_id
        contest_details = assessments_collection.find_one({"contestId": contestID})
        if contest_details:
            return JsonResponse(contest_details, safe=False)
        else:
            return JsonResponse({"error": "Contest not found"}, status=404)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)