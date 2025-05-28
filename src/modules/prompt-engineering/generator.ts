import type { PromptTemplate, PromptConfig, GeneratedPrompt } from './types';

export function generatePrompt(
  template: PromptTemplate,
  variables: Record<string, string>,
  config: Partial<PromptConfig> = {}
): GeneratedPrompt {
  let prompt = template.template;

  // Replace variables in template
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(`{${key}}`, value);
  });

  // Add examples if they exist
  if (template.examples && template.examples.length > 0) {
    prompt += '\n\nExamples:\n';
    template.examples.forEach((example, index) => {
      prompt += `\nExample ${index + 1}:\nInput: ${JSON.stringify(example.input)}\nOutput: ${example.output}\n`;
    });
  }

  // Add constraints if they exist
  if (template.constraints && template.constraints.length > 0) {
    prompt += '\n\nConstraints:\n';
    template.constraints.forEach(constraint => {
      prompt += `- ${constraint}\n`;
    });
  }

  // Add format specification if it exists
  if (template.format) {
    prompt += `\nProvide the response in ${template.format} format.`;
  }

  // Default configuration values
  const defaultConfig: PromptConfig = {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1,
    frequencyPenalty: 0,
    presencePenalty: 0,
    ...config
  };

  return {
    prompt,
    config: defaultConfig
  };
}