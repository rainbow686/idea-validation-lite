/**
 * Generate idea validation report using Tavily Search API + Claude
 * Analysis framework inspired by Y Combinator office hours and gstack skills
 */
export interface SearchResult {
    title: string;
    snippet: string;
    link: string;
}
export interface ValidationReport {
    overallScore: number;
    executiveSummary: string;
    greenLights: string[];
    redFlags: string[];
    problemValidation?: {
        problemExists: boolean;
        problemSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        problemEvidence: string[];
        currentWorkaround: string;
        workaroundCost: string;
        willingnessToPay: 'HIGH' | 'MEDIUM' | 'LOW';
        evidenceType: 'PAYING' | 'WAITING' | 'INTERESTED' | 'HYPOTHETICAL';
    };
    customerSpecificity?: {
        primaryICP: string;
        specificCompanyTypes: string[];
        geographicFocus: string;
        budgetAuthority: string;
        buyingProcess: string;
        earlyAdopterCount: number;
    };
    marketSize: {
        TAM: string;
        SAM: string;
        SOM: string;
    };
    marketReality?: {
        marketSize: {
            TAM: string;
            SAM: string;
            SOM: string;
        };
        marketTrend: 'GROWING' | 'STABLE' | 'DECLINING';
        marketEvidence: string[];
        timingRisk: 'TOO_EARLY' | 'RIGHT_TIME' | 'TOO_LATE';
    };
    competitors: Array<{
        name: string;
        description: string;
        differentiation: string;
        strengths?: string[];
        weaknesses?: string[];
    }>;
    competitiveLandscape?: {
        directCompetitors: Array<{
            name: string;
            description: string;
            pricing: string;
            strengths: string[];
            weaknesses: string[];
        }>;
        indirectCompetitors: string[];
        realCompetitor: string;
        differentiation: string;
        moatPotential: 'HIGH' | 'MEDIUM' | 'LOW';
    };
    recommendations: string[];
    assignments?: string[];
    marketTrends?: Array<{
        trend: string;
        impact: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL';
        description: string;
    }>;
    customerValidation?: {
        problemSeverity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
        problemEvidence: string[];
        willingnessToPay: 'HIGH' | 'MEDIUM' | 'LOW';
        suggestedPricePoint: string;
        earlyAdopterProfile: string;
    };
    swotAnalysis: {
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        threats: string[];
    };
    targetAudience: {
        primaryICP: string;
        demographics: string;
        psychographics: string;
        painPoints: string[];
        behaviorPatterns?: string[];
    };
    goNoGoRecommendation: {
        recommendation: 'GO' | 'NO-GO' | 'CONDITIONAL';
        confidence: number;
        rationale: string;
        keyConditions?: string[];
        dealBreakers?: string[];
    };
    riskMatrix: Array<{
        risk: string;
        level: 'HIGH' | 'MEDIUM' | 'LOW';
        impact: 'HIGH' | 'MEDIUM' | 'LOW';
        likelihood: 'HIGH' | 'MEDIUM' | 'LOW';
        mitigation: string;
    }>;
    revenueModelSuggestions: Array<{
        model: string;
        description: string;
        pros: string[];
        cons: string[];
        estimatedMRR: string;
        implementationSteps?: string[];
        fitForThisMarket?: 'HIGH' | 'MEDIUM' | 'LOW';
    }>;
    financialProjections?: {
        year1Revenue: string;
        year2Revenue: string;
        year3Revenue: string;
        keyAssumptions: string[];
        breakEvenTimeline: string;
        capitalRequired: string;
        unitEconomics?: {
            targetCAC: string;
            targetLTV: string;
            targetRatio: string;
        };
    };
    mvpRoadmap?: {
        phase1: {
            name: string;
            timeline: string;
            features: string[];
            goal: string;
            successMetrics?: string[];
        };
        phase2: {
            name: string;
            timeline: string;
            features: string[];
            goal: string;
            successMetrics?: string[];
        };
        phase3: {
            name: string;
            timeline: string;
            features: string[];
            goal: string;
            successMetrics?: string[];
        };
    };
    goToMarketStrategy?: {
        positioning: string;
        channels: Array<{
            channel: string;
            rationale: string;
            expectedCAC: string;
            priority: 'HIGH' | 'MEDIUM' | 'LOW';
        }>;
        launchStrategy: string;
    };
    brandArchetype?: {
        archetype: string;
        name: string;
        description: string;
        characteristics: string[];
        brandVoice: string;
        visualStyle: string;
        examples: string[];
        recommendation: string;
    };
    marketingCopy?: {
        elevatorPitch: string;
        twitterCopy: string[];
        adHeadlines: string[];
        landingPageHeadlines: string[];
        taglines: string[];
    };
}
export declare function googleSearch(query: string): Promise<SearchResult[]>;
export declare function generateValidationReport(ideaTitle: string, ideaDescription: string): Promise<ValidationReport>;
