from sqlalchemy.orm import Session
from app.models import Subject, Branch, Topic, Question
from app.core.database import engine
import json # Import the json module

def seed_data():
    """
    Seeds the database with GCE Cameroon data for Chemistry, Physics, and Computer Science.
    """
    session = Session(bind=engine)

    # Subject IDs based on GCE Cameroon standards
    GCE_IDS = {
        "Chemistry": {"O-Level": "0515", "A-Level": "0715"},
        "Physics": {"O-Level": "0580", "A-Level": "0780"},
        "Computer Science": {"O-Level": "0595", "A-Level": "0795"}
    }
    
    # Define the data structure
    subjects_data = [
        # --- Chemistry ---
        {
            "name": "Chemistry",
            "level": "Ordinary",
            "gce_id": GCE_IDS["Chemistry"]["O-Level"],
            "branches": [
                {
                    "name": "General Chemistry",
                    "topics": [
                        {"name": "Particulate Nature of Matter"},
                        {"name": "Stoichiometry"},
                        {"name": "Redox Reactions"},
                        {"name": "The Periodic Table"}
                    ]
                },
                {
                    "name": "Organic Chemistry",
                    "topics": [
                        {"name": "Alkanes"},
                        {"name": "Alkenes"},
                        {"name": "Alcohols and Carboxylic Acids"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "What is the oxidation state of sulfur in H₂SO₄?",
                    "topic_name": "Redox Reactions",
                    "correct_option": "A) +6",
                    "options": ["A) +6", "B) +4", "C) -2", "D) 0"]
                },
                {
                    "question_text": "What is the general formula of an alkane?",
                    "topic_name": "Alkanes",
                    "correct_option": "C) CnH2n+2",
                    "options": ["A) CnHn", "B) CnH2n", "C) CnH2n+2", "D) CnH2n-2"]
                }
            ]
        },
        {
            "name": "Chemistry",
            "level": "Advanced",
            "gce_id": GCE_IDS["Chemistry"]["A-Level"],
            "branches": [
                {
                    "name": "Physical Chemistry",
                    "topics": [
                        {"name": "Thermodynamics"},
                        {"name": "Reaction Kinetics"},
                        {"name": "Electrochemistry"}
                    ]
                },
                {
                    "name": "Inorganic Chemistry",
                    "topics": [
                        {"name": "Transition Elements"},
                        {"name": "Group 2 Elements"},
                        {"name": "Chemical Periodicity"}
                    ]
                },
                {
                    "name": "Organic Chemistry",
                    "topics": [
                        {"name": "Stereoisomerism"},
                        {"name": "Hydrocarbons"},
                        {"name": "Nitrogen Compounds"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "Describe the mechanism of SN₁ nucleophilic substitution.",
                    "topic_name": "Hydrocarbons",
                    "correct_option": "The formation of a carbocation intermediate.",
                    "options": ["The formation of a carbocation intermediate.", "A concerted reaction.", "Requires a strong nucleophile.", "Involves inversion of stereochemistry."]
                },
                {
                    "question_text": "What happens to the rate of a reaction when a catalyst is added?",
                    "topic_name": "Reaction Kinetics",
                    "correct_option": "C) It increases the rate by lowering activation energy.",
                    "options": ["A) It decreases the rate of the reaction.", "B) It increases the rate and changes the equilibrium.", "C) It increases the rate by lowering activation energy.", "D) It does not affect the reaction rate."]
                }
            ]
        },

        # --- Physics ---
        {
            "name": "Physics",
            "level": "Ordinary",
            "gce_id": GCE_IDS["Physics"]["O-Level"],
            "branches": [
                {
                    "name": "Mechanics",
                    "topics": [
                        {"name": "Vectors and Scalars"},
                        {"name": "Motion in a straight line"},
                        {"name": "Force and Newton’s Laws"}
                    ]
                },
                {
                    "name": "Electricity and Magnetism",
                    "topics": [
                        {"name": "Static electricity"},
                        {"name": "DC circuits"},
                        {"name": "Electromagnetism"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "What is the unit of force in the SI system?",
                    "topic_name": "Force and Newton’s Laws",
                    "correct_option": "B) Newton",
                    "options": ["A) Joule", "B) Newton", "C) Watt", "D) Pascal"]
                },
                {
                    "question_text": "Which of these is a scalar quantity?",
                    "topic_name": "Vectors and Scalars",
                    "correct_option": "A) Mass",
                    "options": ["A) Mass", "B) Velocity", "C) Force", "D) Acceleration"]
                }
            ]
        },
        {
            "name": "Physics",
            "level": "Advanced",
            "gce_id": GCE_IDS["Physics"]["A-Level"],
            "branches": [
                {
                    "name": "General Physics",
                    "topics": [
                        {"name": "Measurement and its errors"},
                        {"name": "Vectors and Moments"}
                    ]
                },
                {
                    "name": "Thermal Physics",
                    "topics": [
                        {"name": "Thermal properties of materials"},
                        {"name": "Ideal gases"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "State Newton's Second Law of Motion.",
                    "topic_name": "Vectors and Moments",
                    "correct_option": "The rate of change of momentum of an object is directly proportional to the resultant force.",
                    "options": ["The force is equal to mass times acceleration.", "The rate of change of momentum of an object is directly proportional to the resultant force.", "For every action, there is an equal and opposite reaction.", "An object at rest stays at rest and an object in motion stays in motion with the same speed and in the same direction unless acted upon by an unbalanced force."]
                }
            ]
        },

        # --- Computer Science ---
        {
            "name": "Computer Science",
            "level": "Ordinary",
            "gce_id": GCE_IDS["Computer Science"]["O-Level"],
            "branches": [
                {
                    "name": "Computer Systems",
                    "topics": [
                        {"name": "Data Representation"},
                        {"name": "Hardware"},
                        {"name": "Software"}
                    ]
                },
                {
                    "name": "Programming",
                    "topics": [
                        {"name": "Programming Concepts"},
                        {"name": "Algorithms and Pseudocode"},
                        {"name": "Structured Programming"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "What is a hexadecimal number system?",
                    "topic_name": "Data Representation",
                    "correct_option": "A) Base 16",
                    "options": ["A) Base 16", "B) Base 10", "C) Base 8", "D) Base 2"]
                },
                {
                    "question_text": "What is the primary function of an operating system?",
                    "topic_name": "Software",
                    "correct_option": "B) To manage hardware and software resources.",
                    "options": ["A) To browse the internet.", "B) To manage hardware and software resources.", "C) To write code.", "D) To create documents."]
                }
            ]
        },
        {
            "name": "Computer Science",
            "level": "Advanced",
            "gce_id": GCE_IDS["Computer Science"]["A-Level"],
            "branches": [
                {
                    "name": "Fundamental Theory",
                    "topics": [
                        {"name": "Data Types and Structures"},
                        {"name": "Databases"}
                    ]
                },
                {
                    "name": "Fundamental Problem-Solving",
                    "topics": [
                        {"name": "Pseudocode"},
                        {"name": "Flowcharts"}
                    ]
                },
                {
                    "name": "Advanced Theory",
                    "topics": [
                        {"name": "Computational Thinking"},
                        {"name": "Ethics and Law"}
                    ]
                }
            ],
            "questions": [
                {
                    "question_text": "What is the difference between a stack and a queue?",
                    "topic_name": "Data Types and Structures",
                    "correct_option": "A stack is LIFO, while a queue is FIFO.",
                    "options": ["A stack is LIFO, while a queue is FIFO.", "A stack is a linear data structure, a queue is not.", "A stack can hold more data than a queue.", "A queue uses pointers, a stack does not."]
                }
            ]
        }
    ]
    
    # Use a dictionary to store existing objects to avoid duplication and get IDs
    db_objects = {
        "subjects": {},
        "branches": {},
        "topics": {}
    }

    try:
        for subj_data in subjects_data:
            # Add or get the Subject
            subject = session.query(Subject).filter_by(
                name=subj_data["name"], 
                level=subj_data["level"]
            ).first()
            if not subject:
                subject = Subject(
                    name=subj_data["name"],
                    level=subj_data["level"],
                    id=subj_data["gce_id"]
                )
                session.add(subject)
                session.commit()
            db_objects["subjects"][(subject.name, subject.level)] = subject

            # Add or get Branches and their Topics
            for branch_data in subj_data.get("branches", []):
                branch = session.query(Branch).filter_by(
                    name=branch_data["name"],
                    subject_id=subject.id
                ).first()
                if not branch:
                    branch = Branch(
                        name=branch_data["name"],
                        subject_id=subject.id
                    )
                    session.add(branch)
                    session.commit()
                db_objects["branches"][(branch.name, subject.level)] = branch

                for topic_data in branch_data["topics"]:
                    topic = session.query(Topic).filter_by(
                        name=topic_data["name"],
                        subject_id=subject.id,
                        branch_id=branch.id
                    ).first()
                    if not topic:
                        topic = Topic(
                            name=topic_data["name"],
                            subject_id=subject.id,
                            branch_id=branch.id
                        )
                        session.add(topic)
                        session.commit()
                    db_objects["topics"][(topic.name, subject.level)] = topic

            # Add Questions
            for q_data in subj_data.get("questions", []):
                # Find the topic and branch for the question
                topic_obj = db_objects["topics"].get((q_data["topic_name"], subj_data["level"]))
                if not topic_obj:
                    # Handle topics with no branch (if applicable in a different subject)
                    # This implies a topic might exist directly under a subject without a branch
                    # For this dataset, all topics are under branches, so this might not be hit
                    topic_obj = session.query(Topic).filter_by(
                        name=q_data["topic_name"],
                        subject_id=subject.id,
                        branch_id=None # Specifically look for topics without a branch
                    ).first()
                
                # Assume a branch exists for this topic; otherwise, use None
                # This logic tries to find the branch connected to the topic
                branch_obj = None
                if topic_obj and topic_obj.branch_id:
                    branch_obj = session.query(Branch).filter_by(id=topic_obj.branch_id).first()

                if topic_obj:
                    # Serialize the options list to a JSON string
                    options_json = json.dumps(q_data["options"])

                    question = Question(
                        question_text=q_data["question_text"],
                        options=options_json, # Pass the JSON string
                        correct_option=q_data["correct_option"],
                        topic_id=topic_obj.id,
                        branch_id=branch_obj.id if branch_obj else None,
                        # level=subj_data["level"] # Add the level here
                    )
                    session.add(question)
                else:
                    print(f"Skipping question: Topic '{q_data['topic_name']}' not found for subject '{subj_data['name']}' ({subj_data['level']}).")

        session.commit()
        print("Seeded subjects, branches, topics, and questions successfully.")
    except Exception as e:
        session.rollback()
        print(f"An error occurred: {e}")
    finally:
        session.close()

if __name__ == "__main__":
    seed_data()