import { Queue } from 'bullmq';

const tourGenerationQueue = new Queue('tour-generation', {
  connection: {
    host: 'localhost',
    port: 6379,
  },
});

const url = 'https://travel.liontravel.com/detail?NormGroupID=ac60c50a-372a-4d7f-a7a4-afd4f93a5b6a&Platform=APP&GroupID=26SS326BRH-T';

console.log('🚀 Starting AI tour generation test...');
console.log('📝 Source URL:', url);
console.log('⏰ Start time:', new Date().toISOString());

try {
  const job = await tourGenerationQueue.add('generate-tour', {
    url,
    userId: 1,
    requestId: `test-${Date.now()}`,
  });

  console.log('✅ Job added to queue successfully!');
  console.log('🆔 Job ID:', job.id);
  console.log('📊 Job data:', job.data);
  console.log('\n💡 You can monitor the job progress in the logs...');
  console.log('💡 Run: tail -f .manus-logs/devserver.log');
  
} catch (error) {
  console.error('❌ Error adding job to queue:', error);
  process.exit(1);
}

process.exit(0);
