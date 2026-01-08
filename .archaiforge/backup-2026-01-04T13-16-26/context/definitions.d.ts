// Archaiforge CLI Type Definitions
// Agent-readable type definitions for CLI inputs and outputs

// ============================================================================
// Realm3X Types
// ============================================================================

interface Realm3XInput {
  directive: string;
  context: {
    cpt: string;
    constraints: string[];
    existing_architecture?: string;
  };
}

interface Realm3XOutput {
  status: 'analyzed' | 'error';
  ambiguities: Ambiguity[];
  scenarios: Scenario[];
  clarifying_questions: string[];
  recommended_scenario: string;
  confidence: number;
}

interface Ambiguity {
  id: string;
  description: string;
  severity: 'low' | 'medium' | 'high';
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  risk: 'low' | 'medium' | 'high';
  tradeoffs: string[];
}

// ============================================================================
// Adaptive Persona Synthesis Types
// ============================================================================

interface PersonaGenerateInput {
  domain: string;
  phase: 'clarity' | 'limits' | 'examples' | 'adaptation' | 'reflection';
  project_context: {
    cpt: string;
    user_expertise: string;
    current_challenge: string;
  };
}

interface PersonaOutput {
  persona_id: string;
  name: string;
  identity: string;
  mission: string;
  communication_style: {
    tone: string;
    vocabulary: string[];
    approach: string;
  };
  embodiment_prompt: string;
}

// ============================================================================
// Semantic UI Types
// ============================================================================

interface SemanticUIMapInput {
  system: string;
  intelligence_dimensions: string[];
  data_sources: string[];
  user_workflows: string[];
}

interface SemanticUIMapOutput {
  semantic_dimensions: SemanticDimension[];
  semantic_regions: SemanticRegion[];
  movement_rules: MovementRule[];
  recommended_patterns: string[];
}

interface SemanticDimension {
  name: string;
  scale?: string;
  expression?: string;
  layers?: string[];
}

interface SemanticRegion {
  name: string;
  role: string;
}

interface MovementRule {
  from: string;
  to: string;
  condition: string;
}

// ============================================================================
// CLEAR AI Types
// ============================================================================

interface CLEARPlanInput {
  directive: string;
  context: {
    cpt: string;
    constraints: string[];
    existing_architecture?: string;
  };
}

interface CLEARPlanOutput {
  plan_id: string;
  phases: {
    clarity: string;
    limits: string;
    examples: string;
    adaptation: string;
    reflection: string;
  };
  tasks: string[];
  success_criteria: string[];
}

interface CLEARPhaseOutput {
  phase: string;
  guidance: string;
  questions: string[];
  outputs_expected: string[];
}

// ============================================================================
// UX Advanced Types
// ============================================================================

interface UXJobsInput {
  feature: string;
  target_users: string[];
  existing_pain_points: string[];
}

interface UXJobsOutput {
  functional_jobs: Job[];
  emotional_jobs: Job[];
  social_jobs: Job[];
  recommended_features: string[];
}

interface Job {
  job: string;
  importance: 'low' | 'medium' | 'high';
}

interface UXJourneyOutput {
  persona: string;
  job: string;
  stages: JourneyStage[];
}

interface JourneyStage {
  name: string;
  actions: string[];
  touchpoints: string[];
  emotions: string;
  opportunities: string[];
}

// ============================================================================
// CLI Response Types
// ============================================================================

interface CLISuccess<T> {
  status: 'success';
  data: T;
}

interface CLIError {
  status: 'error';
  code: string;
  message: string;
  action_required?: string;
}

type CLIResponse<T> = CLISuccess<T> | CLIError;

// ============================================================================
// Ledger Types
// ============================================================================

interface Ledger {
  current_plan: string | null;
  plans: LedgerPlan[];
  uncertainty_entries: UncertaintyEntry[];
  context: LedgerContext;
}

interface LedgerPlan {
  id: string;
  title: string;
  clear_phases: {
    clarity: string;
    limits: string;
    examples: string;
    adapt: string;
    reflect: string;
  };
  status: 'active' | 'completed' | 'paused';
  completed: string[];
  pending: string[];
  reflections: string[];
}

interface UncertaintyEntry {
  id: string;
  status: 'unresolved' | 'resolved' | 'accepted_risk';
  description: string;
  scenarios: string[];
  resolution?: string;
}

interface LedgerContext {
  cpt: string;
  architecture_summary?: string;
  last_updated: string;
}
