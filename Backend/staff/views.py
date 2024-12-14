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
