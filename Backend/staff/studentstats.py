from django.http import JsonResponse
from pymongo import MongoClient
from datetime import datetime

def studentstats(request, regno):
    # MongoDB connection
    client = MongoClient('mongodb+srv://ihub:ihub@test-portal.lcgyx.mongodb.net/test_portal_db?retryWrites=true&w=majority')
    db = client['test_portal_db']

    # Fetch student data
    student_data = db.students.find_one({"regno": regno})
    if not student_data:
        return JsonResponse({"error": "Student not found"}, status=404)

    # Fetch contest data where the student is visible
    contest_data = db.coding_assessments.find({"visible_to": regno}, {"_id": 0})
    contest_list = list(contest_data)

    # Initialize statistics
    total_contests = len(contest_list)
    total_problems = sum(len(contest.get('problems', [])) for contest in contest_list)
    total_guidelines = sum(len(contest.get('guidelines', [])) for contest in contest_list)

    # Performance stats
    total_tests = total_contests  # assuming each contest is a test
    completed_tests = 0  # Assuming you can add logic to track completed tests if available
    in_progress_tests = total_tests - completed_tests  # A placeholder, adjust if tracking is available
    average_score = 0  # Adjust this if you have scoring information available per contest

    # Assemble the response
    response_data = {
        "student": {
            "name": student_data.get("name", ""),
            "email": student_data.get("email", ""),
            "collegename": student_data.get("collegename", ""),
            "dept": student_data.get("dept", ""),
            "regno": regno,
        },
        "performance": {
            "total_tests": total_tests,
            "completed_tests": completed_tests,
            "in_progress_tests": in_progress_tests,
            "average_score": average_score,
        },
        "assessments": [
            {
                "assessmentName": contest.get("assessmentName", ""),
                "contestId": contest.get("contestId", ""),
                "startDate": contest.get("startDate", ""),
                "endDate": contest.get("endDate", ""),
                "guidelines": contest.get("guidelines", []),
                "problems": contest.get("problems", []),
            }
            for contest in contest_list
        ]
    }

    return JsonResponse(response_data)
