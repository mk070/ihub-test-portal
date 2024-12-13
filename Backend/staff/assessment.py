import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# MongoDB connection
client = MongoClient('mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority')
db = client['test_portal_db']
assessments_collection = db['assessments']

# Helper function to convert string to datetime object (for registration dates)
from datetime import datetime

from datetime import datetime
def str_to_datetime(date_str):
    if not date_str or date_str == 'T':
        # If the date string is empty or just contains 'T', return None or raise an error
        raise ValueError(f"Invalid datetime format: {date_str}")

    try:
        # Try parsing the full datetime format (with seconds)
        return datetime.strptime(date_str, '%Y-%m-%dT%H:%M:%S')
    except ValueError:
        try:
            # If there's no seconds, try parsing without seconds
            return datetime.strptime(date_str, '%Y-%m-%dT%H:%M')
        except ValueError:
            # If both parsing methods fail, raise an error
            raise ValueError(f"Invalid datetime format: {date_str}")# Create Assessment (POST method)
@csrf_exempt
def create_assessment(request):
    if request.method == "POST":
        try:
            # Parse the incoming JSON request body
            data = json.loads(request.body.decode('utf-8'))

            # Validation (simplified, you can add more validations as needed)
            required_fields = ['assessmentName', 'startDateTime', 'guidelines']
            for field in required_fields:
                if field not in data:
                    return JsonResponse({'error': f'{field} is required'}, status=400)

            # Convert start and end dates to datetime objects
            try:
                start_datetime = str_to_datetime(data['startDateTime'])
                end_datetime = str_to_datetime(data['endDateTime']) if data['endDateTime'] else None
            except ValueError as e:
                return JsonResponse({'error': str(e)}, status=400)

            # Create the assessment object to store in MongoDB
            assessment = {
                'assessmentName': data['assessmentName'],
                'startDate': start_datetime,
                'endDate': end_datetime,
                'guidelines': data['guidelines'],  # Store the array of guidelines
                'contestId': str(ObjectId()),  # Creating a unique contest ID
            }

            # Insert the assessment into MongoDB
            assessments_collection.insert_one(assessment)

            # Return the contestId in the response
            return JsonResponse({'message': 'Assessment created successfully!', 'contestId': assessment['contestId']}, status=201)

        except Exception as e:
            return JsonResponse({'error': str(e)}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)