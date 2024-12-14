import csv
from pymongo import MongoClient
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.core.files.storage import FileSystemStorage
import json 

# MongoDB connection
client = MongoClient('mongodb+srv://projecthunt:123@projecthunt.ke18j.mongodb.net/')
db = client['projecthunt']
questions_collection = db['Mcq_Questions_Library']

@csrf_exempt
def bulk_upload(request):
    if request.method == "POST" and request.FILES.get("file"):
        # Save the uploaded file temporarily
        file = request.FILES["file"]
        fs = FileSystemStorage(location="uploads/")
        filename = fs.save(file.name, file)
        file_path = fs.path(filename)
        
        try:
            # Process the CSV file with UTF-8-BOM encoding
            with open(file_path, "r", encoding='utf-8-sig') as csv_file:
                csv_reader = csv.DictReader(csv_file)
                questions = []
                for row in csv_reader:
                    # Clean up potential BOM issues
                    first_key = list(row.keys())[0]
                    question = row.get(first_key, "").strip() if '\ufeff' in first_key else row.get("question", "").strip()
                    option1 = row.get("option1", "").strip()
                    option2 = row.get("option2", "").strip()
                    option3 = row.get("option3", "").strip()
                    option4 = row.get("option4", "").strip()
                    answer = row.get("answer", "").strip()
                    level = row.get("Level", "general").strip()  # Remove trailing space
                    tags = row.get("tags", "").strip().split(",") if "tags" in row else []  # Parse tags as a list

                    # Skip rows with missing critical information
                    if not all([question, option1, option2, option3, option4, answer]):
                        print(f"Skipping invalid row: {row}")
                        continue

                    # Validate answer is one of the options
                    options = [option1, option2, option3, option4]
                    if answer not in options:
                        print(f"Invalid answer for question: {question}")
                        continue

                    # Prepare question data
                    question_data = {
                        "question": question,
                        "options": options,
                        "answer": answer,
                        "level": level,
                        "tags": tags
                    }
                    questions.append(question_data)

                # Insert all questions into MongoDB
                if questions:
                    result = questions_collection.insert_many(questions)
                    print(f"Inserted {len(result.inserted_ids)} questions")
                    return JsonResponse({
                        "message": f"File uploaded and {len(result.inserted_ids)} questions stored in MongoDB successfully!",
                        "inserted_count": len(result.inserted_ids)
                    }, status=200)
                else:
                    return JsonResponse({"error": "No valid questions found in the CSV file."}, status=400)
        
        except csv.Error as csv_error:
            print(f"CSV Error: {csv_error}")
            return JsonResponse({"error": f"CSV parsing error: {str(csv_error)}"}, status=400)
        except Exception as e:
            print(f"Unexpected error: {e}")
            return JsonResponse({"error": str(e)}, status=400)
        finally:
            # Clean up the uploaded file
            fs.delete(filename)
    
    return JsonResponse({"error": "Invalid request. Please upload a file."}, status=400)


@csrf_exempt
def upload_single_question(request):
    if request.method == "POST":
        try:
            # Parse JSON data from the request body
            data = json.loads(request.body)
            
            # Extract question details
            question = data.get("question", "").strip()
            option1 = data.get("option1", "").strip()
            option2 = data.get("option2", "").strip()
            option3 = data.get("option3", "").strip()
            option4 = data.get("option4", "").strip()
            answer = data.get("answer", "").strip()
            level = data.get("level", "general").strip()  # Fix inconsistent key
            tags = data.get("tags", [])  # Default to an empty list if no tags provided

            # Validate input
            if not all([question, option1, option2, option3, option4, answer]):
                return JsonResponse({
                    "error": "Missing required fields. Please provide all question details."
                }, status=400)

            # Validate answer is one of the options
            options = [option1, option2, option3, option4]
            if answer not in options:
                return JsonResponse({
                    "error": "Invalid answer. The answer must be one of the provided options."
                }, status=400)

            # Prepare question data
            question_data = {
                "question": question,
                "options": options,
                "answer": answer,
                "level": level,
                "tags": tags
            }

            # Insert the question into MongoDB
            result = questions_collection.insert_one(question_data)
            
            return JsonResponse({
                "message": "Question uploaded successfully!",
                "question_id": str(result.inserted_id)
            }, status=200)
        
        except json.JSONDecodeError:
            return JsonResponse({
                "error": "Invalid JSON format. Please send a valid JSON payload."
            }, status=400)
        except Exception as e:
            return JsonResponse({
                "error": f"An unexpected error occurred: {str(e)}"
            }, status=500)
    
    return JsonResponse({
        "error": "Only POST requests are allowed."
    }, status=405)


def fetch_all_questions(request):
    try:
        # Fetch all questions from MongoDB
        questions = list(questions_collection.find({}, {"_id": 0}))  # Exclude MongoDB's _id field
        return JsonResponse({"questions": questions}, status=200)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
