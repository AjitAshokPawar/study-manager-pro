const supabaseUrl = 'https://lhxgaoxpbheliwwihyuk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxoeGdhb3hwYmhlbGl3d2loeXVrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0Njk2MDQsImV4cCI6MjA1NjA0NTYwNH0.c5CqmG33nlMKULw27py9jYqPcxTJyAXbBZixRXmeKbc';
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Free Tier Limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const MAX_USER_STORAGE = 500 * 1024 * 1024; // 500MB

supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    loadDashboard();
  } else {
    window.location.href = 'login.html';
  }
});

document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await supabase.auth.signIn({ email, password });
  if (error) alert(error.message);
});

document.getElementById('signupBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const { user, error } = await supabase.auth.signUp({ email, password });
  if (error) alert(error.message);
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  const { error } = await supabase.auth.signOut();
  if (error) alert(error.message);
});

async function loadDashboard() {
  document.getElementById('mainContent').innerHTML = `
    <div class="row">
      <div class="col s12">
        <h4>My Notes</h4>
        <div class="row">
          <form id="noteForm">
            <div class="input-field col s6">
              <input id="noteTitle" type="text" class="validate">
              <label for="noteTitle">Note Title</label>
            </div>
            <div class="input-field col s6">
              <textarea id="noteContent" class="materialize-textarea"></textarea>
              <label for="noteContent">Content</label>
            </div>
            <button class="btn waves-effect waves-light btn-micro" type="submit">Save Note</button>
          </form>
        </div>
        <div class="row" id="notesContainer"></div>
      </div>
    </div>
    <div class="row">
      <div class="col s12">
        <h4>My Files</h4>
        <div class="file-dropzone">
          <input type="file" id="fileUpload">
          <p>Max 5MB per file</p>
          <div id="filesList"></div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('fileUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 5MB limit');
      return;
    }

    const { data, error } = await supabase
      .storage
      .from('files')
      .upload(`users/${supabase.auth.user().id}/${file.name}`, file);

    if (error) {
      alert(error.message);
    } else {
      alert('File uploaded successfully');
    }
  });
}