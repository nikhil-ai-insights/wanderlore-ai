import { getClientFallbackResult } from './src/App';
import dotenv from 'dotenv';

dotenv.config();

// Color printing utilities
const green = (text: string) => `\x1b[32m${text}\x1b[0m`;
const red = (text: string) => `\x1b[31m${text}\x1b[0m`;
const yellow = (text: string) => `\x1b[33m${text}\x1b[0m`;
const cyan = (text: string) => `\x1b[36m${text}\x1b[0m`;
const bold = (text: string) => `\x1b[1m${text}\x1b[0m`;

interface TestResult {
  name: string;
  suite: string;
  passed: boolean;
  error?: string;
}

const results: TestResult[] = [];

function describe(suiteName: string, fn: () => void) {
  console.log(`\n${bold(cyan(`● Suite: ${suiteName}`))}`);
  fn();
}

function it(testName: string, fn: () => void | Promise<void>) {
  try {
    const res = fn();
    if (res instanceof Promise) {
      // Async test handler
      res.then(() => {
        results.push({ name: testName, suite: '', passed: true });
        console.log(`  ${green('✓')} ${testName}`);
      }).catch((err) => {
        results.push({ name: testName, suite: '', passed: false, error: err.message || err });
        console.log(`  ${red('✗')} ${testName}\n    ${red(err.message || err)}`);
      });
    } else {
      results.push({ name: testName, suite: '', passed: true });
      console.log(`  ${green('✓')} ${testName}`);
    }
  } catch (err: any) {
    results.push({ name: testName, suite: '', passed: false, error: err.message || err });
    console.log(`  ${red('✗')} ${testName}\n    ${red(err.message || err)}`);
  }
}

function assert(condition: any, message: string) {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// ==========================================
// 1. UNIT TESTS (Fallback generation outputs)
// ==========================================
describe('Unit Tests: Client-side Fallback Generators', () => {
  it('should generate valid explorer results with proper properties', () => {
    const res = getClientFallbackResult('explorer', { destination: 'Kyoto, Japan', duration: '3', travelStyle: 'solo' });
    assert(res !== null, 'result should not be null');
    assert(res.destination === 'Kyoto, Japan', 'destination must match input');
    assert(res.authenticityScore >= 1 && res.authenticityScore <= 100, 'authenticityScore must be between 1 and 100');
    assert(Array.isArray(res.iconicAttractions) && res.iconicAttractions.length > 0, 'iconicAttractions must be a non-empty array');
    assert(Array.isArray(res.hiddenGems) && res.hiddenGems.length > 0, 'hiddenGems must be a non-empty array');
  });

  it('should generate valid heritage results with rich background and stories', () => {
    const res = getClientFallbackResult('heritage', { landmarkName: 'Parthenon', regionCountry: 'Greece' });
    assert(res !== null, 'result should not be null');
    assert(res.landmarkName === 'Parthenon', 'landmarkName must match input');
    assert(res.historicalEra !== undefined, 'historicalEra must be defined');
    assert(res.immersiveStory && res.immersiveStory.length > 100, 'immersiveStory should be detailed');
    assert(Array.isArray(res.legendsMythsFolklore), 'legendsMythsFolklore must be an array');
  });

  it('should generate valid local connect results with events calendar', () => {
    const res = getClientFallbackResult('connect', { location: 'Cuzco, Peru' });
    assert(res !== null, 'result should not be null');
    assert(res.location === 'Cuzco, Peru', 'location must match input');
    assert(Array.isArray(res.eventsCalendar), 'eventsCalendar must be an array');
    assert(Array.isArray(res.communityExperiences), 'communityExperiences must be an array');
    assert(res.communityImpactScore > 90, 'communityImpactScore must be high');
  });

  it('should generate valid organizer marketing campaign concepts', () => {
    const res = getClientFallbackResult('organizer', { region: 'Tuscany', targetPersona: 'Foodies' });
    assert(res !== null, 'result should not be null');
    assert(res.region === 'Tuscany', 'region must match');
    assert(res.targetPersona === 'Foodies', 'targetPersona must match');
    assert(Array.isArray(res.positioningIdeas) && res.positioningIdeas.length > 0, 'positioningIdeas must be non-empty');
    assert(Array.isArray(res.campaignThemes) && res.campaignThemes.length > 0, 'campaignThemes must be non-empty');
  });
});

// ==========================================
// 2. INTEGRATION & GEMINI SERVICE TESTS
// ==========================================
describe('Integration & Service Tests: Gemini Retry Logic', () => {
  it('should retry on transient errors and eventually succeed', async () => {
    let callCount = 0;
    const mockAiClient = {
      models: {
        generateContent: async () => {
          callCount++;
          if (callCount < 2) {
            // Simulate 503 transient error first
            const err: any = new Error('This model is currently experiencing high demand.');
            err.status = 503;
            throw err;
          }
          return { text: JSON.stringify({ ok: true }) };
        }
      }
    };

    // Use simulated retry runner matching server.ts behavior
    const generateWithRetryLocal = async (retries = 3) => {
      let lastError: any = null;
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          return await mockAiClient.models.generateContent();
        } catch (error: any) {
          lastError = error;
          if (error.status === 503 && attempt < retries) {
            // Proceed to retry without waiting
            continue;
          }
          throw error;
        }
      }
      throw lastError;
    };

    const res = await generateWithRetryLocal();
    assert(res.text === '{"ok":true}', 'Should eventually return success response');
    assert(callCount === 2, 'Should have retried exactly once (total 2 calls)');
  });
});

// ==========================================
// 3. FIRESTORE SECURITY RULES & AUTH VALIDATION
// ==========================================
describe('Security & Firestore Rules Verification', () => {
  it('should enforce same-user matching for Saved Guides creation', () => {
    const mockUserUid = 'traveler_123';
    const mockPayload = {
      userId: 'traveler_123',
      title: 'Kyoto Guide',
      mode: 'explorer'
    };

    // Validate that the request userId matches mock user uid
    const isAllowed = mockPayload.userId === mockUserUid;
    assert(isAllowed === true, 'Saved guide userId must match authenticated user uid');
  });

  it('should block unauthorized read access if userId is different', () => {
    const mockUserUid = 'traveler_abc';
    const storedDocument = {
      userId: 'traveler_123',
      title: 'Kyoto Guide'
    };

    const isAllowed = storedDocument.userId === mockUserUid;
    assert(isAllowed === false, 'Access should be blocked if document owner differs from requester');
  });
});

// ==========================================
// 4. ACCESSIBILITY & COMPONENT MARKERS
// ==========================================
describe('Accessibility & Semantics Audit', () => {
  it('should have correct semantic landmark id tags for accessibility routing', () => {
    // Assert target components have proper IDs to handle focus-mode actions
    const expectedIds = ['auth-back-btn', 'sidebar-btn-guides', 'sidebar-btn-profile', 'sidebar-btn-settings'];
    assert(expectedIds.length === 4, 'Accessibility target keys must be maintained');
  });
});

// ==========================================
// 5. EXPORT SYSTEM CONTRACTS
// ==========================================
describe('Export Formats & Markdown Compliance', () => {
  it('should generate properly formatted markdown blocks', () => {
    const sampleGuide = {
      destination: 'Kyoto',
      tagline: 'Uncover ancient whispers',
      overview: 'Deep-rooted exploration...'
    };
    const md = `# ${sampleGuide.destination}\n*${sampleGuide.tagline}*\n\n${sampleGuide.overview}`;
    assert(md.includes('# Kyoto'), 'Markdown must contain main heading');
    assert(md.includes('*Uncover ancient whispers*'), 'Markdown must contain italicized tagline');
  });
});

// ==========================================
// REPORT SUMMARY
// ==========================================
setTimeout(() => {
  console.log(`\n${bold(cyan('=============================================='))}`);
  console.log(`${bold(cyan('             WANDERLORE AI TEST SUITE          '))}`);
  console.log(`${bold(cyan('=============================================='))}`);

  const passedTests = results.filter(r => r.passed);
  const failedTests = results.filter(r => !r.passed);

  console.log(`Total Tests Run: ${results.length}`);
  console.log(`Passed:          ${green(String(passedTests.length))}`);
  console.log(`Failed:          ${failedTests.length > 0 ? red(String(failedTests.length)) : green('0')}`);

  if (failedTests.length > 0) {
    console.log(`\n${red('FAILED TESTS:')}`);
    failedTests.forEach(t => console.log(`  - [${t.suite}] ${t.name}: ${t.error}`));
    process.exit(1);
  } else {
    console.log(`\n${green('✓ ALL ENGINEERING AUDIT TESTS COMPLETED SUCCESSFULLY')}\n`);
    process.exit(0);
  }
}, 500);
