import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Alert,
  IconButton,
  Stack,
} from "@mui/material";
import { useForm, useFieldArray, Controller } from "react-hook-form";
import type { Control } from "react-hook-form";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../api";

interface QuestionForm {
  question_text: string;
  options: { value: string }[];
  correct_option: string;
  level?: string; // per-question level
  subject_id?: string | number | null;
  topic_id?: string | number | null;
  branch_id?: string | number | null;
  systems?: string | null;
  difficulty: number;
}

interface FormData {
  questions: QuestionForm[];
}

// OptionsFieldArray: manages only the options for a single question
function OptionsFieldArray({
  control,
  baseName,
  index,
  errors,
}: {
  control: Control<FormData>;
  baseName: string; // e.g. `questions.0.options`
  index: number;
  errors: any;
}) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: baseName as any,
  });

  // ensure at least 4 options on mount
  useEffect(() => {
    if (fields.length < 4) {
      for (let i = fields.length; i < 4; i++) append({ value: "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Typography sx={{ mt: 2, mb: 1 }}>Options</Typography>
      {fields.map((field, optIdx) => (
        <Box key={field.id} display="flex" alignItems="center" mb={1}>
          <Controller
            control={control}
            name={`${baseName}.${optIdx}.value` as any}
            defaultValue={(field as any).value ?? ""}
            rules={{ required: "Option is required" }}
            render={({ field: ctrlField }) => (
              <TextField
                label={`Option ${optIdx + 1}`}
                fullWidth
                {...{
                  value: ctrlField.value,
                  onChange: (e: any) => ctrlField.onChange(e.target.value),
                }}
                error={!!errors?.questions?.[index]?.options?.[optIdx]?.value}
                helperText={errors?.questions?.[index]?.options?.[optIdx]?.value?.message}
              />
            )}
          />

          {fields.length > 4 && (
            <IconButton onClick={() => remove(optIdx)} color="error">
              <RemoveIcon />
            </IconButton>
          )}

          {optIdx === fields.length - 1 && fields.length < 8 && (
            <IconButton onClick={() => append({ value: "" })} color="primary">
              <AddIcon />
            </IconButton>
          )}
        </Box>
      ))}
    </>
  );
}

const AddQuestionPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { control, register, handleSubmit, setValue, getValues, watch, formState: { errors } } = useForm<FormData>({
    defaultValues: {
      questions: [
        {
          question_text: "",
          options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
          correct_option: "",
          level: "",
          subject_id: "",
          topic_id: "",
          branch_id: "",
          systems: "",
          difficulty: 3,
        },
      ],
    },
  });

  const { fields: questionFields, append: addQuestion, remove: removeQuestion } = useFieldArray({
    control,
    name: "questions",
  });

  // Entities and UI state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [topics, setTopics] = useState<any[]>([]);
  const [systems, setSystems] = useState<string[]>([]);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  // per-question "add new" inputs
  const [showNewLevelMap, setShowNewLevelMap] = useState<Record<string, boolean>>({});
  const [newLevelMap, setNewLevelMap] = useState<Record<string, string>>({});
  const [showNewSubjectMap, setShowNewSubjectMap] = useState<Record<string, boolean>>({});
  const [newSubjectMap, setNewSubjectMap] = useState<Record<string, string>>({});
  const [showNewTopicMap, setShowNewTopicMap] = useState<Record<string, boolean>>({});
  const [newTopicMap, setNewTopicMap] = useState<Record<string, string>>({});
  const [showNewBranchMap, setShowNewBranchMap] = useState<Record<string, boolean>>({});
  const [newBranchMap, setNewBranchMap] = useState<Record<string, string>>({});
  const [showNewSystemMap, setShowNewSystemMap] = useState<Record<string, boolean>>({});
  const [newSystemMap, setNewSystemMap] = useState<Record<string, string>>({});

  // fetch lists and restore draft or location.state on mount
  useEffect(() => {
    async function init() {
      try {
        const [subjectsRes, branchesRes, topicsRes, systemsRes] = await Promise.all([
          api.get("/questions/subjects"),
          api.get("/questions/branches"),
          api.get("/questions/topics"),
          api.get("/questions/systems"),
        ]);
        setSubjects(subjectsRes.data || []);
        setBranches(branchesRes.data || []);
        setTopics(topicsRes.data || []);
        setSystems(systemsRes.data || []);
      } catch (e) {
        setApiError("Failed to load subjects/branches/topics/systems");
      }

      // Pre-populate if location.state has questions
      if ((location as any)?.state?.questions && (location as any).state.questions.length > 0) {
        const incoming: QuestionForm[] = (location as any).state.questions;
        setValue("questions", incoming.map(q => ({
          question_text: q.question_text || "",
          options: (q.options || []).map((o: any) => (typeof o === "string" ? { value: o } : o)),
          correct_option: q.correct_option || "",
          level: q.level || "",
          subject_id: q.subject_id ?? "",
          topic_id: q.topic_id ?? "",
          branch_id: q.branch_id ?? "",
          systems: q.systems ?? "",
          difficulty: q.difficulty ?? 3,
        })));
      } else {
        // restore draft from sessionStorage if available
        try {
          const draft = sessionStorage.getItem('add_questions_draft');
          if (draft) {
            const parsed = JSON.parse(draft);
            if (Array.isArray(parsed) && parsed.length > 0) {
              setValue('questions', parsed.map((q: any) => ({
                question_text: q.question_text || "",
                options: (q.options || []).map((o: any) => (typeof o === 'string' ? { value: o } : o)),
                correct_option: q.correct_option || "",
                level: q.level || "",
                subject_id: q.subject_id ?? "",
                topic_id: q.topic_id ?? "",
                branch_id: q.branch_id ?? "",
                systems: q.systems ?? "",
                difficulty: q.difficulty ?? 3,
              })));
            }
          }
        } catch (e) {
          // ignore JSON errors
        }
      }
    }

    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // helpers
  const getLevels = () => Array.from(new Set(subjects.map(s => s.level).filter(Boolean)));
  const subjectsByLevel = (level?: string) => subjects.filter(s => (level ? s.level === level : true));
  const topicsBySubject = (subjectId?: string | number) => topics.filter(t => String(t.subject_id) === String(subjectId));
  const branchesBySubject = (subjectId?: string | number) => branches.filter(b => String(b.subject_id) === String(subjectId));

  // create helpers
  const createSubject = async (qId: string, name: string, level: string) => {
    try {
      const res = await api.post("/questions/subjects", { name, level });
      setSubjects(prev => [...prev, res.data]);
      const idx = questionFields.findIndex(f => f.id === qId);
      if (idx !== -1) setValue(`questions.${idx}.subject_id`, res.data.id);
    } catch (e) {
      setApiError("Failed to create subject");
    }
  };

  const createTopic = async (qId: string, name: string, subject_id: number | string, level?: string) => {
    try {
      const res = await api.post("/questions/topics", { name, subject_id, level });
      setTopics(prev => [...prev, res.data]);
      const idx = questionFields.findIndex(f => f.id === qId);
      if (idx !== -1) setValue(`questions.${idx}.topic_id`, res.data.id);
    } catch (e) {
      setApiError("Failed to create topic");
    }
  };

  const createBranch = async (qId: string, name: string, subject_id: number | string) => {
    try {
      const res = await api.post("/questions/branches", { name, subject_id });
      setBranches(prev => [...prev, res.data]);
      const idx = questionFields.findIndex(f => f.id === qId);
      if (idx !== -1) setValue(`questions.${idx}.branch_id`, res.data.id);
    } catch (e) {
      setApiError("Failed to create branch");
    }
  };

  const createSystem = async (qId: string, systemName: string) => {
    try {
      const res = await api.post("/questions/systems", { name: systemName });
      setSystems(prev => [...prev, res.data.name || res.data]);
      const idx = questionFields.findIndex(f => f.id === qId);
      if (idx !== -1) setValue(`questions.${idx}.systems`, res.data.name || res.data);
    } catch (e) {
      setSystems(prev => [...prev, systemName]);
      const idx = questionFields.findIndex(f => f.id === qId);
      if (idx !== -1) setValue(`questions.${idx}.systems`, systemName);
    }
  };

  const createLevel = async (qId: string, levelName: string) => {
    const idx = questionFields.findIndex(f => f.id === qId);
    if (idx !== -1) setValue(`questions.${idx}.level`, levelName);
    setNewLevelMap(prev => ({ ...prev, [qId]: "" }));
    setShowNewLevelMap(prev => ({ ...prev, [qId]: false }));
  };

  // submit and preview
  const onSubmit = async (data: FormData) => {
  setApiError(""); 
  setSuccess(false);
  try {
    for (const q of data.questions) {
      // Make sure topic_id is a number
      if (!q.topic_id) {
        setApiError("Each question must have a topic selected.");
        return;
      }
      const payload = {
        question_text: q.question_text,
        options: q.options.map(o => o.value),
        correct_option: q.correct_option,
        branch_id: q.branch_id || null,
        systems: q.systems || null,
        topic_id: Number(q.topic_id),
        difficulty: q.difficulty ?? 3,
      };
      await api.post("/questions/", payload);
    }
    setSuccess(true);
    sessionStorage.removeItem("add_questions_draft");
  } catch (err: any) {
    console.error(err);
    setApiError(err?.response?.data?.detail || "Failed to add question(s)");
  }
};


  const handlePreview = () => {
    const formData = getValues();
    const cleaned = formData.questions.map(q => ({
      ...q,
      options: q.options.map(o => (o.value?.trim() ? o.value.trim() : null)),
      question_text: q.question_text?.trim() || null,
      correct_option: q.correct_option || null,
      subject_id: q.subject_id || null,
      topic_id: q.topic_id || null,
      branch_id: q.branch_id || null,
      systems: q.systems || null,
      difficulty: q.difficulty || null,
      level: q.level || null,
    }));

    try { sessionStorage.setItem('add_questions_draft', JSON.stringify(formData.questions)); } catch (e) { /* ignore */ }

    navigate("/questions/preview", { state: { questions: cleaned } });
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="grey.100">
      <Paper elevation={3} sx={{ p: 6, minWidth: 400, width: 1000, maxHeight: "90vh", overflowY: "auto" }}>
        <Typography variant="h5" gutterBottom>Add Questions</Typography>
        <form onSubmit={handleSubmit(onSubmit)}>
          {questionFields.map((qField, qIndex) => {
            const qId = qField.id;
            const qWatch = watch(`questions.${qIndex}`) as QuestionForm;
            const availableLevels = getLevels();

            return (
              <Box key={qField.id} mb={4} p={2} border="1px solid #ddd" borderRadius="8px">
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Typography variant="h6">Question {qIndex + 1}</Typography>
                  <Button color="error" onClick={() => removeQuestion(qIndex)}>Remove</Button>
                </Stack>

                <TextField
                  label="Question Text"
                  fullWidth
                  margin="normal"
                  {...register(`questions.${qIndex}.question_text` as any, { required: "Question text is required" })}
                  error={!!errors?.questions?.[qIndex]?.question_text}
                  helperText={errors?.questions?.[qIndex]?.question_text?.message}
                />

                <OptionsFieldArray
                  control={control}
                  baseName={`questions.${qIndex}.options`}
                  index={qIndex}
                  errors={errors}
                />

                <FormControl fullWidth margin="normal">
                  <InputLabel>Correct Option</InputLabel>
                  <Controller
                    control={control}
                    name={`questions.${qIndex}.correct_option` as any}
                    rules={{ required: "Select the correct option" }}
                    render={({ field }) => (
                      <Select {...field} label="Correct Option">
                        {(getValues(`questions.${qIndex}.options`) || []).map((opt: any, idx: number) => (
                          <MenuItem key={idx} value={opt.value}>{opt.value || `Option ${idx + 1}`}</MenuItem>
                        ))}
                      </Select>
                    )}
                  />
                </FormControl>

                <FormControl fullWidth margin="normal">
                  <InputLabel>Level</InputLabel>
                  <Select
                    value={qWatch?.level || ""}
                    onChange={e => setValue(`questions.${qIndex}.level`, e.target.value)}
                    label="Level"
                  >
                    <MenuItem value="">Select Level</MenuItem>
                    {availableLevels.map(level => (
                      <MenuItem key={level} value={level}>{level}</MenuItem>
                    ))}
                    <MenuItem value="__add_new__">+ Add new level</MenuItem>
                  </Select>
                </FormControl>

                {qWatch?.level === "__add_new__" || showNewLevelMap[qId] ? (
                  <TextField
                    label="New Level"
                    fullWidth
                    margin="normal"
                    value={newLevelMap[qId] || ""}
                    onChange={e => setNewLevelMap(prev => ({ ...prev, [qId]: e.target.value }))}
                    onBlur={() => {
                      const val = newLevelMap[qId];
                      if (val && val.trim()) {
                        createLevel(qId, val.trim());
                        setValue(`questions.${qIndex}.level`, val.trim());
                      }
                    }}
                  />
                ) : null}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Subject</InputLabel>
                  <Select
                    value={qWatch?.subject_id ?? ""}
                    onChange={e => setValue(`questions.${qIndex}.subject_id`, e.target.value)}
                    label="Subject"
                    disabled={!qWatch?.level}
                  >
                    <MenuItem value="">Select Subject</MenuItem>
                    {subjectsByLevel(qWatch?.level).map(s => (
                      <MenuItem key={s.id} value={s.id}>{s.name}</MenuItem>
                    ))}
                    <MenuItem value="__add_new__">+ Add new subject</MenuItem>
                  </Select>
                </FormControl>

                {qWatch?.subject_id === "__add_new__" || showNewSubjectMap[qId] ? (
                  <TextField
                    label="New Subject"
                    fullWidth
                    margin="normal"
                    value={newSubjectMap[qId] || ""}
                    onChange={e => setNewSubjectMap(prev => ({ ...prev, [qId]: e.target.value }))}
                    onBlur={() => {
                      const val = newSubjectMap[qId];
                      if (val && val.trim()) {
                        const level = qWatch?.level || "";
                        createSubject(qId, val.trim(), level);
                        setShowNewSubjectMap(prev => ({ ...prev, [qId]: false }));
                        setNewSubjectMap(prev => ({ ...prev, [qId]: "" }));
                      }
                    }}
                  />
                ) : null}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Topic</InputLabel>
                  <Select
                    value={qWatch?.topic_id ?? ""}
                    onChange={e => setValue(`questions.${qIndex}.topic_id`, e.target.value)}
                    label="Topic"
                    disabled={!qWatch?.subject_id}
                  >
                    <MenuItem value="">Select Topic</MenuItem>
                    {topicsBySubject(String(qWatch?.subject_id)).map(t => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                    <MenuItem value="__add_new__">+ Add new topic</MenuItem>
                  </Select>
                </FormControl>

                {qWatch?.topic_id === "__add_new__" || showNewTopicMap[qId] ? (
                  <TextField
                    label="New Topic"
                    fullWidth
                    margin="normal"
                    value={newTopicMap[qId] || ""}
                    onChange={e => setNewTopicMap(prev => ({ ...prev, [qId]: e.target.value }))}
                    onBlur={() => {
                      const val = newTopicMap[qId];
                      const subjectId = qWatch?.subject_id;
                      if (val && val.trim() && subjectId) {
                        createTopic(qId, val.trim(), subjectId, qWatch?.level);
                        setShowNewTopicMap(prev => ({ ...prev, [qId]: false }));
                        setNewTopicMap(prev => ({ ...prev, [qId]: "" }));
                      }
                    }}
                  />
                ) : null}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Branch (optional)</InputLabel>
                  <Select
                    value={qWatch?.branch_id ?? ""}
                    onChange={e => setValue(`questions.${qIndex}.branch_id`, e.target.value)}
                    label="Branch (optional)"
                    disabled={!qWatch?.subject_id}
                  >
                    <MenuItem value="">None</MenuItem>
                    {branchesBySubject(String(qWatch?.subject_id)).map(b => (
                      <MenuItem key={b.id} value={b.id}>{b.name}</MenuItem>
                    ))}
                    <MenuItem value="__add_new__">+ Add new branch</MenuItem>
                  </Select>
                </FormControl>

                {qWatch?.branch_id === "__add_new__" || showNewBranchMap[qId] ? (
                  <TextField
                    label="New Branch"
                    fullWidth
                    margin="normal"
                    value={newBranchMap[qId] || ""}
                    onChange={e => setNewBranchMap(prev => ({ ...prev, [qId]: e.target.value }))}
                    onBlur={() => {
                      const val = newBranchMap[qId];
                      const subjectId = qWatch?.subject_id;
                      if (val && val.trim() && subjectId) {
                        createBranch(qId, val.trim(), subjectId);
                        setShowNewBranchMap(prev => ({ ...prev, [qId]: false }));
                        setNewBranchMap(prev => ({ ...prev, [qId]: "" }));
                      }
                    }}
                  />
                ) : null}

                <FormControl fullWidth margin="normal">
                  <InputLabel>System (optional)</InputLabel>
                  <Select
                    value={qWatch?.systems ?? ""}
                    onChange={e => setValue(`questions.${qIndex}.systems`, e.target.value)}
                    label="System (optional)"
                  >
                    <MenuItem value="">None</MenuItem>
                    {systems.map(s => (
                      <MenuItem key={s} value={s}>{s}</MenuItem>
                    ))}
                    <MenuItem value="__add_new__">+ Add new system</MenuItem>
                  </Select>
                </FormControl>

                {qWatch?.systems === "__add_new__" || showNewSystemMap[qId] ? (
                  <TextField
                    label="New System"
                    fullWidth
                    margin="normal"
                    value={newSystemMap[qId] || ""}
                    onChange={e => setNewSystemMap(prev => ({ ...prev, [qId]: e.target.value }))}
                    onBlur={() => {
                      const val = newSystemMap[qId];
                      if (val && val.trim()) {
                        createSystem(qId, val.trim());
                        setShowNewSystemMap(prev => ({ ...prev, [qId]: false }));
                        setNewSystemMap(prev => ({ ...prev, [qId]: "" }));
                      }
                    }}
                  />
                ) : null}

                <FormControl fullWidth margin="normal">
                  <InputLabel>Difficulty</InputLabel>
                  <Controller
                    control={control}
                    name={`questions.${qIndex}.difficulty` as any}
                    render={({ field }) => (
                      <Select {...field} label="Difficulty">
                        <MenuItem value={1}>Easy</MenuItem>
                        <MenuItem value={2}>Slightly Hard</MenuItem>
                        <MenuItem value={3}>Medium</MenuItem>
                        <MenuItem value={4}>Hard</MenuItem>
                        <MenuItem value={5}>Very Hard</MenuItem>
                      </Select>
                    )}
                  />
                </FormControl>

              </Box>
            );
          })}

          <Button
            variant="outlined"
            color="secondary"
            onClick={() => addQuestion({
              question_text: "",
              options: [{ value: "" }, { value: "" }, { value: "" }, { value: "" }],
              correct_option: "",
              level: "",
              subject_id: "",
              topic_id: "",
              branch_id: "",
              systems: "",
              difficulty: 3,
            })}
            sx={{ mb: 3 }}
          >
            + Add Another Question
          </Button>

          {apiError && <Alert severity="error" sx={{ mt: 2 }}>{apiError}</Alert>}
          {success && <Alert severity="success" sx={{ mt: 2 }}>Questions added successfully!</Alert>}

          <Box mt={3} display="flex" justifyContent="space-between">
            <Button variant="outlined" color="primary" onClick={handlePreview}>
              Preview All
            </Button>
            <Button type="submit" variant="contained" color="success">
              Save Questions
            </Button>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default AddQuestionPage;
