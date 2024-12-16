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

# MongoDB connection
client = MongoClient("mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority")
db = client['test_portal_db']

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
        current_time = datetime.utcnow()

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
                    
                    # Determine status
                    status = "Live"
                    if start_date:
                        if current_time < start_date:
                            status = "Upcoming"
                        elif end_date and current_time > end_date:
                            status = "Completed"

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
                    
                    # Determine status
                    status = "Live"
                    if start_date:
                        if current_time < start_date:
                            status = "Upcoming"
                        elif end_date and current_time > end_date:
                            status = "Completed"

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