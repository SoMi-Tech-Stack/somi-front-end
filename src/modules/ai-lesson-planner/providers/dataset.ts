import type { LessonPlanInput, LessonPlanOutput } from '../types';
import lessonPlansData from '../../../data/lesson-plans-dataset.json';

export async function generateDatasetLesson(input: LessonPlanInput): Promise<LessonPlanOutput> {
  // Filter dataset based on input criteria
  const matchingPlans = lessonPlansData.filter(plan => {
    const yearMatch = plan.year_group === input.year_group;
    const topicMatch = plan.topic.toLowerCase().includes(input.topic.toLowerCase());
    const keywordMatch = !input.keywords?.length || input.keywords.some(kw => 
      plan.learning_objectives.some(obj => obj.toLowerCase().includes(kw.toLowerCase()))
    );
    const pieceMatch = !input.piece || plan.song_title.toLowerCase().includes(input.piece.toLowerCase());
    
    return yearMatch && topicMatch && keywordMatch && pieceMatch;
  });

  if (matchingPlans.length === 0) {
    throw new Error('No matching lesson plans found in dataset');
  }

  // Select best matching plan
  const plan = matchingPlans[0];

  return {
    title: `${plan.topic} - ${plan.song_title}`,
    objectives: plan.learning_objectives,
    warmUp: {
      duration: '10 minutes',
      description: plan.warmup_activities.join('\n'),
      resources: ['Solfa cards', 'Rhythm cards']
    },
    mainActivities: plan.main_activities.map(activity => ({
      duration: '15 minutes',
      description: activity,
      resources: []
    })),
    plenary: {
      duration: '10 minutes',
      description: 'Review learning objectives and assess understanding',
    },
    assessment: [plan.assessment.formative, plan.assessment.summative],
    differentiation: {
      support: [plan.differentiation.support],
      extension: [plan.differentiation.challenge]
    },
    resources: ['Interactive whiteboard', 'Musical instruments'],
    nextSteps: plan.notes
  };
}