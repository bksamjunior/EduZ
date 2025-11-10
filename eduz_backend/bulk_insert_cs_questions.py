"""Bulk insert Computer Science questions into the project's database.

This script uses SQLAlchemy ORM models from `app.models` and creates the
required User (id=6 Sam), Subject 'Computer Science', Branches and Topics
listed in the TO‑DO, then generates and bulk-inserts ~120 MCQs using
`session.add_all()`.

Usage:
  - Edit DATABASE_URL below or set the environment variable DATABASE_URL.
  - Run: python bulk_insert_cs_questions.py

Notes:
  - This script is idempotent for the FK records (it will reuse existing
    users/subjects/branches/topics). It does NOT attempt to deduplicate
    question texts — running multiple times will insert more questions.
"""
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker
import os
import random
from typing import Dict, List, Tuple

from app.core.database import SQLALCHEMY_DATABASE_URL
from app.models import Base, User, Subject, Branch, Topic, Question

# Placeholder - replace with your database URL or export DATABASE_URL env var
DATABASE_URL = SQLALCHEMY_DATABASE_URL


def get_engine_and_session(database_url: str):
    engine = create_engine(database_url, pool_pre_ping=True)
    Session = sessionmaker(bind=engine, autocommit=False, autoflush=False)
    return engine, Session


def create_fk_records(session) -> Tuple[User, Subject, Dict[str, Branch], Dict[str, List[Topic]]]:
    # 1) Ensure user with id=6 exists
    # Use Session.get to avoid the legacy Query.get warning
    user = session.get(User, 6)
    if not user:
        user = User(id=6, name="Sam", email="boupdakamsj@gmail.com", role="teacher")
        session.add(user)
        session.flush()

    # 2) Ensure subject
    # Query for subject; some older DB schemas may lack the 'subject_code' column
    # which would raise a DB error when ORM maps all columns. If that occurs,
    # attempt to read/insert without referencing subject_code.
    try:
        subject = session.query(Subject).filter(Subject.name == "Computer Science").first()
    except Exception as e:
        # The DB schema may be missing the 'gce_id' column which causes the ORM-mapped
        # query to fail. Fall back to raw SQL that only references existing columns.
        msg = str(e)
        if "subject_code" in msg or "gce_id" in msg or "UndefinedColumn" in msg or "does not exist" in msg:
            try:
                session.rollback()
            except Exception:
                pass

            res = session.execute(
                text("SELECT id, name, level FROM subjects WHERE name = :name LIMIT 1"),
                {"name": "Computer Science"},
            ).fetchone()
            if res:
                # create a lightweight subject-like object with required id
                class _S:
                    pass

                subject = _S()
                subject.id = res[0]
                subject.name = res[1]
                subject.level = res[2] if len(res) > 2 else None
            else:
                # Insert using raw SQL only specifying name and level (avoid subject_code)
                ins = session.execute(
                    text("INSERT INTO subjects (name, level) VALUES (:name, :level) RETURNING id"),
                    {"name": "Computer Science", "level": "University"},
                )
                newid = ins.fetchone()[0]
                session.commit()
                class _S:
                    pass

                subject = _S()
                subject.id = newid
                subject.name = "Computer Science"
                subject.level = "University"
        else:
            raise

    if not subject:
        subject = Subject(name="Computer Science", level="University")
        session.add(subject)
        session.flush()

    # Branches and topics mapping as required
    branches_map = {
        "Programming": [
            "Algorithms",
            "Data Structures",
            "Python Basics",
            "Object-Oriented Concepts",
            "Recursion",
            "Sorting",
            "Searching",
        ],
        "Networking": [
            "OSI Model",
            "TCP/IP",
            "Routing & Switching",
            "Network Security",
            "Subnetting",
            "Firewalls",
            "DNS",
        ],
        "Database": [
            "SQL Queries",
            "Relational Algebra",
            "Normalization",
            "NoSQL Concepts",
            "Transactions",
            "Indexing",
        ],
        "System Software": [
            "Operating Systems",
            "Memory Management",
            "Process Scheduling",
            "Compilers",
            "Linkers",
            "Loaders",
        ],
        "Web Development": [
            "HTML/CSS",
            "JavaScript Basics",
            "Frontend Frameworks",
            "Backend Development",
        ],
    }

    created_branches: Dict[str, Branch] = {}
    created_topics: Dict[str, List[Topic]] = {}

    for bname, tlist in branches_map.items():
        branch = (
            session.query(Branch)
            .filter(Branch.name == bname, Branch.subject_id == subject.id)
            .first()
        )
        if not branch:
            branch = Branch(name=bname, subject_id=subject.id)
            session.add(branch)
            session.flush()

        created_branches[bname] = branch
        created_topics[bname] = []

        for tname in tlist:
            topic = (
                session.query(Topic)
                .filter(Topic.name == tname, Topic.branch_id == branch.id)
                .first()
            )
            if not topic:
                topic = Topic(name=tname, subject_id=subject.id, branch_id=branch.id)
                session.add(topic)
                session.flush()
            created_topics[bname].append(topic)

    session.commit()
    return user, subject, created_branches, created_topics


def _label_options(opts: List[str]) -> Tuple[str, str]:
    """Turn a list of option strings into a comma-separated labeled string and return (labeled_str, correct_label)"""
    labels = ["A", "B", "C", "D"]
    # ensure exactly 4 options
    opts = opts[:4] + [""] * max(0, 4 - len(opts))
    combined = ", ".join(f"{labels[i]}) {opts[i]}" for i in range(4))
    return combined, None  # correct label is set by caller after shuffling


def build_question_by_type(topic: Topic, branch: Branch, qtype: str) -> Question:
    """Create one question for the given topic and type. qtype in {definition, application, code, comparison}"""
    topic_name = topic.name

    # central pool for correct answers and plausible distractors (context-specific)
    correct_map = {
        "Algorithms": "Designing step-by-step procedures to solve computational problems",
        "Data Structures": "Structures such as arrays, lists, trees, and hashes to store and organize data",
        "Python Basics": "A high-level, interpreted programming language with dynamic typing",
        "Object-Oriented Concepts": "Encapsulating data and behavior into objects and classes",
        "Recursion": "A function that calls itself with modified parameters",
        "Sorting": "Arranging elements in a defined order (e.g., ascending)",
        "Searching": "Locating an element within a collection",
        "OSI Model": "A conceptual framework that standardizes network communication into layers",
        "TCP/IP": "A suite of protocols used to interconnect network devices, commonly used on the Internet",
        "Routing & Switching": "Techniques for forwarding packets between and within networks",
        "Network Security": "Practices and tools to protect networks from threats",
        "Subnetting": "Dividing a larger network into smaller logical networks",
        "Firewalls": "Systems that filter network traffic according to rules",
        "DNS": "Service that resolves domain names to IP addresses",
        "SQL Queries": "Statements used to read or write data in a relational database",
        "Relational Algebra": "A set of operations for manipulating relations (tables) in databases",
        "Normalization": "Organizing relational tables to reduce redundancy",
        "NoSQL Concepts": "Database approaches that relax schemas for scalability and flexibility",
        "Transactions": "A group of operations treated as a single unit ensuring ACID properties",
        "Indexing": "Structures that speed up data retrieval operations",
        "Operating Systems": "Software that manages hardware resources and provides services to programs",
        "Memory Management": "Allocating and freeing memory for processes efficiently",
        "Process Scheduling": "Deciding the order in which processes access the CPU",
        "Compilers": "Translating high-level source code into machine code",
        "Linkers": "Combining compiled modules into an executable",
        "Loaders": "Placing programs into memory for execution",
        "HTML/CSS": "Languages for structuring and presenting content on the web",
        "JavaScript Basics": "A scripting language used for client-side web interactivity",
        "Frontend Frameworks": "Libraries that help build structured UI code for the browser",
        "Backend Development": "Server-side development, handling requests, and databases",
    }

    distractor_map = {
        "Algorithms": ["Data Structures", "Sorting technique", "Big-O notation"],
        "Data Structures": ["Algorithms", "Database index", "Network topology"],
        "Python Basics": ["Compiled language like C", "Java virtual machine language", "Shell scripting"],
        "Object-Oriented Concepts": ["Functional programming paradigm", "Procedural decomposition", "Database normalization"],
        "Recursion": ["Iterative loops", "Tail-call elimination (not always supported)", "Memoization technique"],
        "Sorting": ["Searching algorithms", "Hashing", "Encryption"],
        "Searching": ["Sorting algorithms", "Indexing", "Routing"],
        "OSI Model": ["TCP/IP model", "Ethernet frame format", "HTML document structure"],
        "TCP/IP": ["UDP", "IPX/SPX", "HTTP"],
        "Routing & Switching": ["Firewall rules", "SQL joins", "DNS resolution"],
        "Network Security": ["Database transactions", "Access control lists", "Indexing strategies"],
        "Subnetting": ["CIDR vs subnet masks", "MAC addressing", "DNS zones"],
        "Firewalls": ["Load balancers", "Antivirus software", "Database backups"],
        "DNS": ["DHCP", "ARP", "SMTP"],
        "SQL Queries": ["NoSQL queries", "Shell commands", "HTML forms"],
        "Relational Algebra": ["Set theory", "Graph traversal", "Regular expressions"],
        "Normalization": ["Denormalization for performance", "Indexing approach", "Sharding"],
        "NoSQL Concepts": ["Relational joins", "ACID transactions across shards", "Stored procedures"],
        "Transactions": ["Index rebuilding", "Backups", "Normalization"],
        "Indexing": ["Full table scan", "Caching layer", "Firewall rules"],
        "Operating Systems": ["Database engine", "Web server", "Network switch"],
        "Memory Management": ["Disk paging", "CPU scheduling", "DNS caching"],
        "Process Scheduling": ["Thread-local storage", "Database deadlock", "Index optimization"],
        "Compilers": ["Interpreters", "Linkers", "Loaders"],
        "Linkers": ["Compilers", "Runtime loaders", "Package managers"],
        "Loaders": ["Linkers", "Bootloaders (separate concept)", "Database loaders"],
        "HTML/CSS": ["SQL markup", "Python syntax", "TCP payloads"],
        "JavaScript Basics": ["Server-side Python code", "CSS selectors", "SQL queries"],
        "Frontend Frameworks": ["Backend frameworks", "Database migration tools", "Firewall configurations"],
        "Backend Development": ["Frontend templating", "CSS frameworks", "Client-side routing"],
    }

    # Helper to assemble labeled options and find correct label
    def make_options(correct_answer: str, distractors: List[str]) -> Tuple[str, str]:
        opts = [correct_answer] + distractors[:3]
        random.shuffle(opts)
        labels = ["A", "B", "C", "D"]
        combined = ", ".join(f"{labels[i]}) {opts[i]}" for i in range(4))
        correct_label = labels[opts.index(correct_answer)]
        return combined, correct_label

    # Build question according to type
    if qtype == "definition":
        correct = correct_map.get(topic_name, f"Core concept related to {topic_name}")
        distractors = distractor_map.get(topic_name, [])
        options_combined, correct_label = make_options(correct, distractors)
        q_text = f"Which of the following best defines '{topic_name}'?"
        difficulty = random.randint(1, 2)

    elif qtype == "application":
        # Simple scenario templates per branch; distractors are plausible alternatives
        scenario = f"You are designing a solution that needs {topic_name.lower()}. Which approach best fits the requirement?"
        correct = correct_map.get(topic_name, f"A solution approach for {topic_name}")
        distractors = distractor_map.get(topic_name, [])
        options_combined, correct_label = make_options(correct, distractors)
        q_text = scenario
        difficulty = random.randint(4, 5)

    elif qtype == "code":
        # Only for programming/web topics; provide short snippet for some known topics
        if topic_name == "Python Basics":
            snippet = "\nfor i in range(3):\n    print(i)\n"
            q_text = f"What is the output of the following Python code?{snippet}"
            opts = ["0\n1\n2", "1\n2\n3", "0 1 2", "Error"]
            random.shuffle(opts)
            options_combined, _ = _label_options(opts)
            correct_label = ["A", "B", "C", "D"][opts.index("0\n1\n2")]
            difficulty = random.randint(3, 4)

        elif topic_name == "Data Structures":
            snippet = "\narr = [1,2,3]\nprint(len(arr))\n"
            q_text = f"What does the following Python snippet print?{snippet}"
            opts = ["3", "2", "Error", "None"]
            random.shuffle(opts)
            options_combined, _ = _label_options(opts)
            correct_label = ["A", "B", "C", "D"][opts.index("3")]
            difficulty = random.randint(3, 4)

        elif topic_name == "SQL Queries":
            snippet = "\nSELECT COUNT(*) FROM users;\n"
            q_text = f"What does the SQL query return?{snippet}"
            opts = ["Number of rows in users", "First user row", "Column names", "Database size"]
            random.shuffle(opts)
            options_combined, _ = _label_options(opts)
            correct_label = ["A", "B", "C", "D"][opts.index("Number of rows in users")]
            difficulty = random.randint(3, 5)

        elif topic_name == "JavaScript Basics":
            snippet = "\nconsole.log(typeof []);\n"
            q_text = f"What does the following JavaScript code log?{snippet}"
            opts = ["object", "array", "undefined", "string"]
            random.shuffle(opts)
            options_combined, _ = _label_options(opts)
            correct_label = ["A", "B", "C", "D"][opts.index("object")]
            difficulty = random.randint(3, 4)

        else:
            # fallback to definition when no code example is available
            correct = correct_map.get(topic_name, f"Core concept related to {topic_name}")
            distractors = distractor_map.get(topic_name, [])
            options_combined, correct_label = make_options(correct, distractors)
            q_text = f"Which of the following best describes '{topic_name}'?"
            difficulty = random.randint(3, 4)

    elif qtype == "comparison":
        # Choose a natural pair to compare using the topic; fallback to a simple prompt
        pairs = {
            "TCP/IP": ("TCP", "UDP", "TCP provides reliable connection-oriented service, UDP is connectionless"),
            "Data Structures": ("Array", "Linked List", "Arrays provide O(1) index access, linked lists provide O(1) insertion at head"),
            "SQL Queries": ("INNER JOIN", "LEFT JOIN", "INNER JOIN returns only matching rows, LEFT JOIN includes non-matching from left table"),
        }
        if topic_name in pairs:
            left, right, correct_text = pairs[topic_name]
            q_text = f"What is the primary difference between {left} and {right}?"
            opts = [correct_text, f"{right} is always faster than {left}", f"Both are identical", f"{left} is a networking protocol"]
            random.shuffle(opts)
            options_combined, _ = _label_options(opts)
            correct_label = ["A", "B", "C", "D"][opts.index(correct_text)]
            difficulty = random.randint(4, 5)
        else:
            correct = correct_map.get(topic_name, f"Key difference related to {topic_name}")
            distractors = distractor_map.get(topic_name, [])
            options_combined, correct_label = make_options(correct, distractors)
            q_text = f"Which of the following best contrasts two related concepts for '{topic_name}'?"
            difficulty = random.randint(4, 5)

    else:
        # fallback definition
        correct = correct_map.get(topic_name, f"Core concept related to {topic_name}")
        distractors = distractor_map.get(topic_name, [])
        options_combined, correct_label = make_options(correct, distractors)
        q_text = f"Which of the following best describes '{topic_name}'?"
        difficulty = random.randint(1, 3)

    # Build Question object
    question = Question(
        question_text=q_text,
        options=options_combined,
        correct_option=correct_label,
        topic_id=topic.id,
        branch_id=branch.id,
        created_by=6,
        approved=False,
        difficulty=difficulty,
    )

    return question


def generate_questions_for_all_topics(branches_topics: Dict[str, List[Topic]], total_questions: int = 120) -> List[Question]:
    """Generate a list of questions obeying the requested distribution of types.

    Distribution:
      - definition: 30%
      - application: 40%
      - code: 20% (only for Programming/Web Development topics)
      - comparison: 10%
    """
    # Flatten topic list preserving branch name
    flat = []
    for bname, topics in branches_topics.items():
        for t in topics:
            flat.append((bname, t))

    if not flat:
        return []

    n = total_questions
    counts = {
        "definition": max(1, round(n * 0.30)),
        "application": max(1, round(n * 0.40)),
        "code": max(1, round(n * 0.20)),
        "comparison": max(1, round(n * 0.10)),
    }

    # Ensure sum equals n (adjust by difference)
    diff = n - sum(counts.values())
    if diff != 0:
        counts["application"] += diff

    questions: List[Question] = []

    # helper to pick topics eligible for code questions
    code_eligible = [t for b, t in flat if b in ("Programming", "Web Development")]

    # create definition and application and comparison across topics in round-robin
    def pick_topic_for(idx: int) -> Tuple[Topic, Branch]:
        bname, topic = flat[idx % len(flat)]
        # find branch object via topic.branch if available else dummy
        return topic, topic.branch or topic

    idx = 0
    for _ in range(counts["definition"]):
        topic, branch = pick_topic_for(idx)
        questions.append(build_question_by_type(topic, branch, "definition"))
        idx += 1

    for _ in range(counts["application"]):
        topic, branch = pick_topic_for(idx)
        questions.append(build_question_by_type(topic, branch, "application"))
        idx += 1

    # code questions: try to distribute across code_eligible topics; if not enough, fallback
    for i in range(counts["code"]):
        if code_eligible:
            topic = code_eligible[i % len(code_eligible)]
            branch = topic.branch or topic
            questions.append(build_question_by_type(topic, branch, "code"))
        else:
            topic, branch = pick_topic_for(idx)
            questions.append(build_question_by_type(topic, branch, "definition"))
        idx += 1

    for _ in range(counts["comparison"]):
        topic, branch = pick_topic_for(idx)
        questions.append(build_question_by_type(topic, branch, "comparison"))
        idx += 1

    # If there's any shortfall or overage due to rounding, trim or extend with definitions
    if len(questions) < n:
        needed = n - len(questions)
        for i in range(needed):
            topic, branch = pick_topic_for(idx)
            questions.append(build_question_by_type(topic, branch, "definition"))
            idx += 1
    elif len(questions) > n:
        questions = questions[:n]

    return questions


def main():
    engine, Session = get_engine_and_session(DATABASE_URL)
    # ensure tables exist (safe - no-op if already created)
    Base.metadata.create_all(engine)

    session = Session()
    try:
        user, subject, branches, topics = create_fk_records(session)

        # Generate questions across topics (default total 120)
        questions = generate_questions_for_all_topics(topics, total_questions=120)

        # Bulk insert using add_all
        session.add_all(questions)
        session.commit()

        print(f"Inserted {len(questions)} new questions into the database.")
    except Exception as exc:
        session.rollback()
        print("Error during insertion:", exc)
    finally:
        session.close()


if __name__ == "__main__":
    main()
