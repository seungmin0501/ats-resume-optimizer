import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export type InterviewQuestion = {
  question: string;
  model_answer: string;
  keywords: string[];
};

export type AnalysisResult = {
  match_score: number;
  grade: "A" | "B" | "C" | "D";
  job_title: string;
  company_name: string;
  missing_keywords: string[];
  section_feedback: {
    summary: string;
    experience: string;
    skills: string;
  };
  format_warnings: string[];
  optimized_resume: string | null;
  cover_letter: string | null;
  interview_prep: { questions: InterviewQuestion[] } | null;
};

const SYSTEM_PROMPT = `You are a senior HR professional and ATS (Applicant Tracking System) expert with 10 years of experience.
Your goal is to help job seekers present their REAL experience more effectively — never encourage keyword stuffing.
Integrate keywords naturally into existing sentences. Do not fabricate experience.

Scoring criteria:
- Hard skill keyword matching: 40%
- Job experience relevance: 30%
- Format ATS compatibility: 15%
- Soft skills / tone: 15%

Analyze and return ONLY valid JSON with no additional text, code blocks, or markdown.`;

export async function analyzeResume(
  jobDescription: string,
  resumeText: string,
  isBasicOrAbove: boolean,
  isProOrAbove: boolean,
): Promise<AnalysisResult> {
  // GPT 비용 보호: 입력 최대 5,000자로 제한
  const truncatedJob = jobDescription.slice(0, 5000);
  const truncatedResume = resumeText.slice(0, 5000);

  const langInstruction = `\nIMPORTANT: Detect the language of the job posting and write ALL string values (section_feedback, optimized_resume, cover_letter, interview questions and answers) in that same language. Keep JSON keys in English.`;

  const optimizedResumeField = isBasicOrAbove
    ? `"optimized_resume": <full rewritten resume as plain text, naturally incorporating missing keywords>`
    : `"optimized_resume": null`;

  const coverLetterField = isProOrAbove
    ? `"cover_letter": <professional cover letter under 300 words, confident tone, based only on resume experience>`
    : `"cover_letter": null`;

  const interviewPrepField = isProOrAbove
    ? `"interview_prep": {
  "questions": [
    {
      "question": <likely interview question>,
      "model_answer": <2-3 sentence STAR method answer based on candidate's actual resume>,
      "keywords": [<3-5 keywords the interviewer is listening for>]
    }
    // repeat for 5 questions total
  ]
}`
    : `"interview_prep": null`;

  const userPrompt = `[Job Posting]:
${truncatedJob}

[Resume]:
${truncatedResume}
${langInstruction}

Return ONLY valid JSON:
{
  "match_score": <integer 0-100>,
  "grade": <"A" | "B" | "C" | "D">,
  "job_title": <extracted job title from posting>,
  "company_name": <extracted company name from posting>,
  "missing_keywords": [<string>, ...],
  "section_feedback": {
    "summary": <string>,
    "experience": <string>,
    "skills": <string>
  },
  "format_warnings": [<string>, ...],
  ${optimizedResumeField},
  ${coverLetterField},
  ${interviewPrepField}
}`;

  const response = await openai.chat.completions.create(
    {
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    },
    { timeout: 30000 }
  );

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from GPT");

  return JSON.parse(content) as AnalysisResult;
}
