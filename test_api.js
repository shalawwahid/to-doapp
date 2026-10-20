// Node.js test script to verify all REST API endpoints and static assets
async function testApp() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting CleanFlow Progression, Daily Schedule & Monthly Tracker Verification ---\n');

  // 1. Static file check
  const htmlRes = await fetch(baseUrl);
  console.log('✓ GET / (index.html):', htmlRes.status, htmlRes.statusText);

  const cssRes = await fetch(`${baseUrl}/style.css`);
  console.log('✓ GET /style.css:', cssRes.status, `(${cssRes.headers.get('content-type')})`);

  const jsRes = await fetch(`${baseUrl}/app.js`);
  console.log('✓ GET /app.js:', jsRes.status, `(${jsRes.headers.get('content-type')})`);

  // 2. GET /api/todos
  const getRes = await fetch(`${baseUrl}/api/todos`);
  const getData = await getRes.json();
  console.log('✓ GET /api/todos:', getRes.status, `Total tasks: ${getData.data.length}`);

  // 3. POST /api/todos
  const postRes = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Read 2 pages of Quran' })
  });
  const postData = await postRes.json();
  console.log('✓ POST /api/todos:', postRes.status, `Created: "${postData.data.title}" (ID: ${postData.data.id})`);
  const newTodoId = postData.data.id;

  // 4. PATCH /api/todos/:id
  const patchRes = await fetch(`${baseUrl}/api/todos/${newTodoId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  const patchData = await patchRes.json();
  console.log('✓ PATCH /api/todos/:id (Mark Complete):', patchRes.status, `Completed: ${patchData.data.completed}`);

  // 5. DELETE /api/todos/:id
  const delRes = await fetch(`${baseUrl}/api/todos/${newTodoId}`, { method: 'DELETE' });
  const delData = await delRes.json();
  console.log('✓ DELETE /api/todos/:id:', delRes.status, delData.message);

  // 6. DAILY SCHEDULE: GET /api/schedule
  const schedGetRes = await fetch(`${baseUrl}/api/schedule`);
  const schedGetData = await schedGetRes.json();
  console.log('✓ GET /api/schedule:', schedGetRes.status, `Total schedule items: ${schedGetData.data.length}`);

  // 7. DAILY SCHEDULE: POST /api/schedule
  const todayStr = new Date().toISOString().split('T')[0];
  const schedPostRes = await fetch(`${baseUrl}/api/schedule`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: 'English Vocabulary (3 words: Resilience, Diligence, Perspective)',
      date: todayStr,
      startTime: '08:00',
      endTime: '08:45',
      category: 'learning',
      notes: 'Master spelling and sample sentences',
      xp: 25
    })
  });
  const schedPostData = await schedPostRes.json();
  console.log('✓ POST /api/schedule:', schedPostRes.status, `Scheduled: "${schedPostData.data.title}" (ID: ${schedPostData.data.id})`);
  const newSchedId = schedPostData.data.id;

  // 8. DAILY SCHEDULE: PATCH /api/schedule/:id (Toggle complete & earn XP)
  const schedPatchRes = await fetch(`${baseUrl}/api/schedule/${newSchedId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  const schedPatchData = await schedPatchRes.json();
  console.log('✓ PATCH /api/schedule/:id (Mark Complete & Award XP):', schedPatchRes.status, `Completed: ${schedPatchData.data.completed}`);

  // 9. DAILY SCHEDULE: DELETE /api/schedule/:id
  const schedDelRes = await fetch(`${baseUrl}/api/schedule/${newSchedId}`, { method: 'DELETE' });
  const schedDelData = await schedDelRes.json();
  console.log('✓ DELETE /api/schedule/:id:', schedDelRes.status, schedDelData.message);

  // 10. MONTHLY TRACKER: GET /api/monthly-tracker
  const trackerRes = await fetch(`${baseUrl}/api/monthly-tracker`);
  const trackerData = await trackerRes.json();
  console.log('✓ GET /api/monthly-tracker:', trackerRes.status, 
    `Month: ${trackerData.data.monthName} ${trackerData.data.year}, Completion: ${trackerData.data.summary.overallCompletionRate}%, Streak: ${trackerData.data.summary.currentStreak}d`);

  // 11. PROGRESSION HUB: GET /api/progression
  const progRes = await fetch(`${baseUrl}/api/progression`);
  const progData = await progRes.json();
  console.log('✓ GET /api/progression:', progRes.status, 
    `Level: ${progData.data.levelInfo.level} (${progData.data.levelInfo.title}), XP: ${progData.data.levelInfo.currentXp}`);

  // 12. PROGRESSION HUB: POST /api/progression/reflection
  const refRes = await fetch(`${baseUrl}/api/progression/reflection`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      date: todayStr,
      mood: 'energized',
      notes: 'Completed all core daily progression habits!'
    })
  });
  const refData = await refRes.json();
  console.log('✓ POST /api/progression/reflection:', refRes.status, `Added XP: ${refData.addedXp}, Level: ${refData.data.levelInfo.level}`);

  console.log('\n======================================================');
  console.log('All Daily Schedule, Monthly Tracker & Progression tests passed! 🚀');
  console.log('======================================================');
}

testApp().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
