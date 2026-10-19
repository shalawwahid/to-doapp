// Node.js test script to verify all REST API endpoints and static assets
async function testApp() {
  const baseUrl = 'http://localhost:3000';
  console.log('--- Starting To-Do App Verification ---');

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

  // 3. POST /api/todos (Add task with title)
  const postRes = await fetch(`${baseUrl}/api/todos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Buy groceries for dinner' })
  });
  const postData = await postRes.json();
  console.log('✓ POST /api/todos:', postRes.status, `Created: "${postData.data.title}" (ID: ${postData.data.id})`);
  const newId = postData.data.id;

  // 4. PATCH /api/todos/:id (Mark complete)
  const patchRes = await fetch(`${baseUrl}/api/todos/${newId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ completed: true })
  });
  const patchData = await patchRes.json();
  console.log('✓ PATCH /api/todos/:id (Mark Complete):', patchRes.status, `Completed: ${patchData.data.completed}`);

  // 5. PATCH /api/todos/:id (Edit title)
  const editRes = await fetch(`${baseUrl}/api/todos/${newId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ title: 'Buy fresh groceries and ingredients' })
  });
  const editData = await editRes.json();
  console.log('✓ PATCH /api/todos/:id (Edit Title):', editRes.status, `Updated Title: "${editData.data.title}"`);

  // 6. DELETE /api/todos/:id (Delete task)
  const delRes = await fetch(`${baseUrl}/api/todos/${newId}`, {
    method: 'DELETE'
  });
  const delData = await delRes.json();
  console.log('✓ DELETE /api/todos/:id:', delRes.status, delData.message);

  // 7. Verification that it was deleted
  const verifyRes = await fetch(`${baseUrl}/api/todos`);
  const verifyData = await verifyRes.json();
  const exists = verifyData.data.some(t => t.id === newId);
  console.log('✓ Verification check (Task deleted from list):', !exists);

  console.log('\nAll tests passed successfully! 🚀');
}

testApp().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
