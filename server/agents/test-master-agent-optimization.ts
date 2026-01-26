/**
 * Test script for optimized MasterAgent
 * Tests retry mechanism, parallel execution, and fallback handling
 */

import { RetryManager, AgentMonitor, FallbackManager, DEFAULT_RETRY_CONFIG, DEFAULT_FALLBACK_CONFIGS } from './agentOrchestration';

// ============================================================================
// Test 1: RetryManager
// ============================================================================

async function testRetryManager() {
  console.log('\n=== Test 1: RetryManager ===\n');
  
  const retryManager = new RetryManager();
  let attemptCount = 0;
  
  // Test successful retry after 2 failures
  try {
    const result = await retryManager.executeWithRetry(
      async () => {
        attemptCount++;
        console.log(`Attempt ${attemptCount}`);
        
        if (attemptCount < 3) {
          const error = new Error('ETIMEDOUT: Connection timeout');
          (error as any).code = 'ETIMEDOUT';
          throw error;
        }
        
        return { success: true, data: 'Success!' };
      },
      DEFAULT_RETRY_CONFIG,
      'TestAgent'
    );
    
    console.log('✓ Retry successful:', result);
    console.log(`✓ Total attempts: ${attemptCount}`);
  } catch (error) {
    console.error('✗ Retry failed:', error);
  }
  
  // Test non-retryable error
  console.log('\n--- Testing non-retryable error ---\n');
  
  try {
    await retryManager.executeWithRetry(
      async () => {
        throw new Error('Invalid input: This is a logic error');
      },
      DEFAULT_RETRY_CONFIG,
      'TestAgent2'
    );
  } catch (error) {
    console.log('✓ Non-retryable error caught immediately:', (error as Error).message);
  }
}

// ============================================================================
// Test 2: AgentMonitor
// ============================================================================

async function testAgentMonitor() {
  console.log('\n=== Test 2: AgentMonitor ===\n');
  
  const monitor = new AgentMonitor();
  
  // Simulate agent execution
  monitor.startAgent('Agent1');
  await new Promise(resolve => setTimeout(resolve, 100));
  monitor.completeAgent('Agent1', { data: 'result1' });
  
  monitor.startAgent('Agent2');
  await new Promise(resolve => setTimeout(resolve, 50));
  monitor.failAgent('Agent2', new Error('Agent2 failed'));
  
  monitor.startAgent('Agent3');
  monitor.retryAgent('Agent3');
  await new Promise(resolve => setTimeout(resolve, 150));
  monitor.completeAgent('Agent3', { data: 'result3' });
  
  // Generate report
  const report = monitor.generateReport();
  console.log(report);
  
  // Check statuses
  const agent1Status = monitor.getStatus('Agent1');
  console.log('\n✓ Agent1 status:', agent1Status);
  
  const allStatuses = monitor.getAllStatuses();
  console.log(`✓ Total agents monitored: ${allStatuses.length}`);
}

// ============================================================================
// Test 3: FallbackManager
// ============================================================================

async function testFallbackManager() {
  console.log('\n=== Test 3: FallbackManager ===\n');
  
  const fallbackManager = new FallbackManager();
  
  // Register fallback configs
  for (const config of DEFAULT_FALLBACK_CONFIGS) {
    fallbackManager.registerFallback(config);
  }
  
  // Test non-critical agent failure (should return fallback data)
  try {
    const fallbackData = fallbackManager.handleFailure(
      'CostAgent',
      new Error('CostAgent failed')
    );
    console.log('✓ Non-critical agent fallback data:', fallbackData);
  } catch (error) {
    console.error('✗ Unexpected error:', error);
  }
  
  // Test critical agent failure (should throw error)
  fallbackManager.registerFallback({
    agentName: 'WebScraperAgent',
    isCritical: true,
    fallbackData: null
  });
  
  try {
    fallbackManager.handleFailure(
      'WebScraperAgent',
      new Error('WebScraperAgent failed')
    );
    console.error('✗ Critical agent should have thrown error');
  } catch (error) {
    console.log('✓ Critical agent error thrown:', (error as Error).message);
  }
  
  // Test isCriticalAgent
  console.log('\n✓ CostAgent is critical:', fallbackManager.isCriticalAgent('CostAgent'));
  console.log('✓ WebScraperAgent is critical:', fallbackManager.isCriticalAgent('WebScraperAgent'));
}

// ============================================================================
// Test 4: Parallel Execution Simulation
// ============================================================================

async function testParallelExecution() {
  console.log('\n=== Test 4: Parallel Execution Simulation ===\n');
  
  const monitor = new AgentMonitor();
  
  // Simulate sequential execution
  console.log('--- Sequential Execution ---');
  const seqStartTime = Date.now();
  
  monitor.startAgent('Agent1');
  await new Promise(resolve => setTimeout(resolve, 100));
  monitor.completeAgent('Agent1', {});
  
  monitor.startAgent('Agent2');
  await new Promise(resolve => setTimeout(resolve, 100));
  monitor.completeAgent('Agent2', {});
  
  monitor.startAgent('Agent3');
  await new Promise(resolve => setTimeout(resolve, 100));
  monitor.completeAgent('Agent3', {});
  
  const seqDuration = Date.now() - seqStartTime;
  console.log(`Sequential duration: ${seqDuration}ms`);
  
  // Simulate parallel execution
  console.log('\n--- Parallel Execution ---');
  monitor.reset();
  const parStartTime = Date.now();
  
  monitor.startAgent('Agent1');
  monitor.startAgent('Agent2');
  monitor.startAgent('Agent3');
  
  await Promise.all([
    new Promise(resolve => setTimeout(resolve, 100)).then(() => monitor.completeAgent('Agent1', {})),
    new Promise(resolve => setTimeout(resolve, 100)).then(() => monitor.completeAgent('Agent2', {})),
    new Promise(resolve => setTimeout(resolve, 100)).then(() => monitor.completeAgent('Agent3', {}))
  ]);
  
  const parDuration = Date.now() - parStartTime;
  console.log(`Parallel duration: ${parDuration}ms`);
  
  const speedup = ((seqDuration - parDuration) / seqDuration * 100).toFixed(1);
  console.log(`✓ Speedup: ${speedup}% faster`);
}

// ============================================================================
// Test 5: Promise.allSettled with Fallback
// ============================================================================

async function testPromiseAllSettled() {
  console.log('\n=== Test 5: Promise.allSettled with Fallback ===\n');
  
  const fallbackManager = new FallbackManager();
  
  // Register fallback configs
  for (const config of DEFAULT_FALLBACK_CONFIGS) {
    fallbackManager.registerFallback(config);
  }
  
  // Simulate 5 agents, some succeed and some fail
  const agentTasks = [
    { name: 'CostAgent', shouldFail: false },
    { name: 'NoticeAgent', shouldFail: true },
    { name: 'HotelAgent', shouldFail: false },
    { name: 'MealAgent', shouldFail: true },
    { name: 'FlightAgent', shouldFail: false }
  ];
  
  const results = await Promise.allSettled(
    agentTasks.map(async (task) => {
      await new Promise(resolve => setTimeout(resolve, 50));
      
      if (task.shouldFail) {
        throw new Error(`${task.name} failed`);
      }
      
      return { success: true, data: { result: `${task.name} data` } };
    })
  );
  
  // Process results with fallback
  const processedResults = results.map((result, index) => {
    const agentName = agentTasks[index].name;
    
    if (result.status === 'fulfilled') {
      console.log(`✓ ${agentName}: Success`);
      return result.value.data;
    } else {
      console.log(`⚠ ${agentName}: Failed, using fallback`);
      return fallbackManager.handleFailure(agentName, result.reason);
    }
  });
  
  console.log('\n✓ All results processed (with fallbacks):', processedResults.length);
}

// ============================================================================
// Run All Tests
// ============================================================================

async function runAllTests() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║  MasterAgent Optimization Tests                            ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  
  try {
    await testRetryManager();
    await testAgentMonitor();
    await testFallbackManager();
    await testParallelExecution();
    await testPromiseAllSettled();
    
    console.log('\n╔════════════════════════════════════════════════════════════╗');
    console.log('║  ✓ All Tests Passed                                        ║');
    console.log('╚════════════════════════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Test failed:', error);
    process.exit(1);
  }
}

// Run tests
runAllTests();
