/**
 * @fileoverview JSON schema for the AI lesson planner
 * NOTE: This module is not active in the MVP version and is reserved for future development
 */

export const lessonPlanSchema = {
  type: 'object',
  required: ['year_group', 'topic'],
  properties: {
    year_group: {
      type: 'string',
      description: 'The year group for the lesson plan',
      examples: ['Year 3', 'Year 4']
    },
    topic: {
      type: 'string',
      description: 'The musical topic or concept to be taught',
      examples: ['Rhythm', 'Pitch', 'Dynamics']
    },
    song: {
      type: 'string',
      description: 'Optional specific song to base the lesson around'
    },
    framework: {
      type: 'string',
      description: 'Optional pedagogical framework to use',
      enum: ['Kodály', 'Orff', 'Dalcroze']
    }
  }
} as const;