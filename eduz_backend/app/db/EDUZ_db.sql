SELECT
    id,
    question_text,
    options,
    correct_option
FROM
    questions
WHERE
    question_text = 'Which characteristic primarily determines whether a specific search algorithm (e.g., linear vs. binary search) is the most efficient choice for a given dataset?';