import type { PromptTemplate } from './types';
 
export const listeningActivityTemplate: PromptTemplate = {
  template: `Generate a listening-focused music activity for {yearGroup}, themed around "{theme}".

Key Requirements:
- Age-appropriate classical or folk music only
- Clear connection to the UK Music Curriculum
- Safe and educational content
- Engaging discussion questions
- Practical teaching tips

Include:
1. Musical piece selection
2. Historical and musical context
3. Specific learning focus
4. Discussion questions
5. Implementation guidance

The piece should be:
- Appropriate for {yearGroup} students
- Related to the theme: {theme}
- Available on YouTube (classical/folk recordings only)
- Historically or culturally significant`,
  variables: {
    yearGroup: "The year group (e.g., Year 2)",
    theme: "The lesson theme or topic"
  },
  constraints: [
    "Only suggest classical or folk music",
    "Ensure age-appropriate content",
    "Focus on musical learning objectives",
    "Include accurate historical information",
    "Provide clear teaching guidance"
  ],
  format: "JSON"
};

export const lessonPlanTemplate: PromptTemplate = {
}