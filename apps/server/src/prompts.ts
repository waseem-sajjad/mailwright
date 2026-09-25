/**
 * Prompt formats shared by the dataset builder and the Python service. Keep
 * these in sync with ai/serve.py and ai/train.py.
 */
export const GENERATE_PREFIX = 'Generate an email template.\nRequest: ';

export const REFINE_PREFIX = (dsl: string, instruction: string): string =>
    `Edit an email template.\nCurrent:\n${dsl}\nInstruction: ${instruction}`;
