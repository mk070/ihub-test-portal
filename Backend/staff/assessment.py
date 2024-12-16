import json
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId
from .utils import *

# MongoDB connection
client = MongoClient('mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority')
db = client['test_portal_db']
assessments_collection = db['coding_assessments']

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

            # Extract necessary fields from the payload
            contest_id = str(ObjectId())
            assessment_overview = data.get('assessmentOverview', {})
            test_configuration = data.get('testConfiguration', {})

            # Validation for required fields
            if not contest_id:
                return JsonResponse({'error': 'contestId is required'}, status=400)
            if not assessment_overview.get('name'):
                return JsonResponse({'error': 'assessmentName is required'}, status=400)
            if not assessment_overview.get('guidelines'):
                return JsonResponse({'error': 'guidelines are required'}, status=400)

            # Optional: Parse registration start and end dates
            try:
                registration_start = (
                    str_to_datetime(assessment_overview['registrationStart'])
                    if assessment_overview.get('registrationStart')
                    else None
                )
                registration_end = (
                    str_to_datetime(assessment_overview['registrationEnd'])
                    if assessment_overview.get('registrationEnd')
                    else None
                )
            except ValueError as e:
                return JsonResponse({'error': f'Date parsing error: {str(e)}'}, status=400)

            # Construct the assessment object
            assessment_document = {
                'contestId': contest_id,
                'assessmentOverview': {
                    'name': assessment_overview['name'],
                    'description': assessment_overview.get('description', ""),
                    'registrationStart': registration_start,
                    'registrationEnd': registration_end,
                    'guidelines': assessment_overview['guidelines'],
                },
                'testConfiguration': {
                    'questions': test_configuration.get('questions', ""),
                    'duration': test_configuration.get('duration', ""),
                    'fullScreenMode': test_configuration.get('fullScreenMode', False),
                    'faceDetection': test_configuration.get('faceDetection', False),
                    'deviceRestriction': test_configuration.get('deviceRestriction', False),
                    'noiseDetection': test_configuration.get('noiseDetection', False),
                    'passPercentage': test_configuration.get('passPercentage', ""),
                },
            }

            # Insert the assessment into MongoDB
            result = coding_assessments_collection.insert_one(assessment_document)
            print("result: ",result)

            # Return the generated ObjectId in the response
            return JsonResponse({
                'message': 'Assessment created successfully!',
                'assessmentId': contest_id
            }, status=201)

        except Exception as e:
            # Catch and handle any unexpected errors
            return JsonResponse({'error': f'Internal Server Error: {str(e)}'}, status=500)
    else:
        return JsonResponse({'error': 'Only POST method is allowed'}, status=405)
