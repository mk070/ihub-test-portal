from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.contrib.auth.hashers import check_password, make_password
from rest_framework.exceptions import AuthenticationFailed
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime, timedelta
import logging
from .utils import *
import jwt
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient


client = MongoClient('mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority')
db = client['test_portal_db']
assessments_collection = db['coding_assessments']
staff_collection = db['staff']


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

logger = logging.getLogger(__name__)

@api_view(["POST"])
@permission_classes([AllowAny])
def staff_login(request):
    try:
        data = request.data
        email = data.get("email")
        password = data.get("password")

        # Validate input
        if not email or not password:
            logger.warning(f"Login failed: Missing email or password")
            return Response(
                {"error": "Email and password are required"},
                status=400
            )

        # Fetch staff user from MongoDB
        staff_user = db['staff'].find_one({"email": email})
        if not staff_user:
            logger.warning(f"Login failed: User with email {email} not found")
            return Response({"error": "Invalid email or password"}, status=401)

        # Check password hash
        stored_password = staff_user.get("password")
        if not check_password(password, stored_password):
            logger.warning(f"Login failed: Incorrect password for {email}")
            return Response({"error": "Invalid email or password"}, status=401)

        # Generate tokens
        staff_id = str(staff_user["_id"])
        tokens = generate_tokens_for_staff(staff_id)

        # Create response
        response = Response({
            "message": "Login successful",
            "tokens": tokens,
            "staffId": staff_id,
            "name": staff_user.get("full_name"),
            "email": staff_user.get("email"),
            "department": staff_user.get("department"),
            "collegename": staff_user.get("collegename"),
        }, status=200)

        # Set secure cookie for JWT
        response.set_cookie(
            key='jwt',
            value=tokens['jwt'],
            httponly=True,
            samesite='Lax',
            secure=os.getenv("ENV") == "production",
            max_age=1 * 24 * 60 * 60  # 1 day expiration
        )

        logger.info(f"Login successful for staff: {email}")
        return response

    except Exception as e:
        logger.error(f"Error during staff login: {str(e)}")
        return Response(
            {"error": "Something went wrong. Please try again later."},
            status=500
        )


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

@api_view(['GET']) 
@permission_classes([AllowAny])
def fetch_contests(request):
    """
    Fetch live or all contests from MongoDB based on query parameters.
    """
    try:
        # Extract query parameter
        contest_type = request.query_params.get('type', 'live')  # Default to "live"

        # MongoDB collection
        coding_assessments = db['coding_assessments']
        current_time = datetime.utcnow()

        # Query for contests
        if contest_type == 'live':
            contests_cursor = coding_assessments.find({
                "$and": [
                    {"startDate": {"$lte": current_time}},  # Contest has started
                    {"$or": [
                        {"endDate": {"$gte": current_time}}, 
                        {"endDate": None}
                    ]}  # Contest is ongoing
                ]
            })
        elif contest_type == 'all':
            contests_cursor = coding_assessments.find()
        else:
            return Response({"error": "Invalid type parameter. Use 'live' or 'all'."}, status=400)

        # Process contests
        contests = []
        for contest in contests_cursor:
            try:
                start_date = contest.get("startDate")
                end_date = contest.get("endDate")

                # Ensure startDate and endDate are parsed correctly
                if isinstance(start_date, str):
                    start_date = datetime.fromisoformat(start_date.replace('Z', '+00:00'))
                if isinstance(end_date, str):
                    end_date = datetime.fromisoformat(end_date.replace('Z', '+00:00')) if end_date else None

                # Dynamically calculate 'assigned' count based on 'visible_to' array length
                assigned_count = len(contest.get("visible_to", []))

                contests.append({
                    "_id": str(contest.get("_id", "")),
                    "assessmentName": contest.get("assessmentName", "Unnamed Contest"),
                    "startDate": start_date,
                    "endDate": end_date,
                    "guidelines": contest.get("guidelines", []),
                    "contestId": contest.get("contestId", ""),
                    "assigned": assigned_count,  # Use calculated 'assigned' count
                    "register": contest.get("register", 0),
                    "complete": contest.get("complete", 0),
                    "status": "Live" if start_date and current_time >= start_date and (
                        not end_date or current_time <= end_date
                    ) else "Upcoming"
                })
            except Exception as e:
                logger.error(f"Error processing contest: {contest.get('_id', 'unknown')} - {e}")

        if not contests:
            logger.info("No contests found for the given type.")

        return Response({"contests": contests})

    except Exception as e:  
        logger.error(f"Error fetching contests: {e}")
        return Response({"error": "Something went wrong. Please try again later."}, status=500)

# @api_view(["GET"])
# @permission_classes([AllowAny])  # Allow access without authentication
# @authentication_classes([])
# def get_staff_profile(request):
#     """
#     Get staff profile using the staff_user object ID from the JWT token.
#     """
#     try:
#         # Retrieve JWT token from cookies or headers
#         jwt_token = request.COOKIES.get("jwt")  # Or use request.headers.get('Authorization')
#         if not jwt_token:
#             raise AuthenticationFailed("Authentication credentials were not provided.")

#         try:
#             decoded_token = jwt.decode(jwt_token, 'test', algorithms=["HS256"])
#         except jwt.ExpiredSignatureError:
#             raise AuthenticationFailed("Access token has expired. Please log in again.")
#         except jwt.InvalidTokenError:
#             raise AuthenticationFailed("Invalid token. Please log in again.")
        
#         staff_id = decoded_token.get("staff_user")

#         if not staff_id:
#             raise AuthenticationFailed("Invalid token payload.")

#         # Fetch the staff details from MongoDB using ObjectId
#         staff = staff_collection.find_one({"_id": ObjectId(staff_id)})

#         if not staff:
#             return Response({"error": "Staff not found"}, status=404)

#         # Return staff details
#         staff_details = {
#             "name": staff.get("full_name"),
#             "email": staff.get("email"),
#             "department": staff.get("department"),
#             "collegename": staff.get("collegename"),
#         }

#         return Response(staff_details, status=200)
#     except AuthenticationFailed as auth_error:
#         return Response({"error": str(auth_error)}, status=401)
#     except Exception as e:
#         print(f"Unexpected error in student_profile: {e}")
#         return Response({"error": "An unexpected error occurred"}, status=500)

@api_view(["GET", "PUT"])  # Allow both GET and PUT requests
@permission_classes([AllowAny])
@authentication_classes([])
def get_staff_profile(request):
    """
    GET: Retrieve staff profile using the JWT token.
    PUT: Update staff profile details.
    """
    try:
        jwt_token = request.COOKIES.get("jwt")
        if not jwt_token:
            raise AuthenticationFailed("Authentication credentials were not provided.")

        # Decode JWT token
        try:
            decoded_token = jwt.decode(jwt_token, 'test', algorithms=["HS256"])
        except jwt.ExpiredSignatureError:
            raise AuthenticationFailed("Access token has expired. Please log in again.")
        except jwt.InvalidTokenError:
            raise AuthenticationFailed("Invalid token. Please log in again.")
        
        staff_id = decoded_token.get("staff_user")

        if not staff_id:
            raise AuthenticationFailed("Invalid token payload.")

        # Fetch the staff details from MongoDB using ObjectId
        staff = staff_collection.find_one({"_id": ObjectId(staff_id)})

        if not staff:
            return Response({"error": "Staff not found"}, status=404)

        # Handle GET request
        if request.method == "GET":
            staff_details = {
                "name": staff.get("full_name"),
                "email": staff.get("email"),
                "department": staff.get("department"),
                "collegename": staff.get("collegename"),
            }
            return Response(staff_details, status=200)

        # Handle PUT request
        if request.method == "PUT":
            data = request.data  # Extract new data from request body
            updated_data = {}

            # Update fields if they are provided
            if "name" in data:
                updated_data["full_name"] = data["name"]
            if "email" in data:
                updated_data["email"] = data["email"]
            if "department" in data:
                updated_data["department"] = data["department"]
            if "collegename" in data:
                updated_data["collegename"] = data["collegename"]

            if updated_data:
                # Update the document in the database
                staff_collection.update_one(
                    {"_id": ObjectId(staff_id)},
                    {"$set": updated_data}
                )
                return Response({"message": "Profile updated successfully"}, status=200)

            return Response({"error": "No fields provided for update"}, status=400)

    except AuthenticationFailed as auth_error:
        return Response({"error": str(auth_error)}, status=401)
    except Exception as e:
        print(f"Unexpected error: {e}")
        return Response({"error": "An unexpected error occurred"}, status=500)

