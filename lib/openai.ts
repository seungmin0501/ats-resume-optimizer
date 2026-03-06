import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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
  isPro: boolean
): Promise<AnalysisResult> {
  // GPT 비용 보호: 입력 최대 5,000자로 제한
  const truncatedJob = jobDescription.slice(0, 5000);
  const truncatedResume = resumeText.slice(0, 5000);

  const userPrompt = `[Job Posting]:
${truncatedJob}

[Resume]:
${truncatedResume}

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
  "optimized_resume": ${isPro ? "<full rewritten resume as string>" : "null"}
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
