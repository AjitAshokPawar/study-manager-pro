const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Free Tier Limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const allowedTypes = ['image/png', 'image/jpeg', 'application/pdf']; // Allowed file types

// Check authentication state
supabase.auth.onAuthStateChange((event, session) => {
  if (session) {
    loadDashboard();
  } else {
    window.location.href = 'login.html';
  }
});

// Login
document.getElementById('loginBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) throw error;
    
    alert('Login successful!');
  } catch (error) {
    console.error('Login error:', error.message);
    alert('Login failed. Please check your credentials.');
  }
});

// Signup
document.getElementById('signupBtn')?.addEventListener('click', async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  try {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (data.user) {
      alert('Signup successful! Please check your email for confirmation.');
    }
  } catch (error) {
    console.error('Signup error:', error.message);
    alert('Signup failed. Please try again.');
  }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) throw error;

    alert('Logout successful!');
    window.location.href = 'login.html';
  } catch (error) {
    console.error('Logout error:', error.message);
    alert('Logout failed. Please try again.');
  }
});

// Load Dashboard
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

  loadNotes();
  loadFiles();

  document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    const { data: user } = await supabase.auth.getUser(); // Fix for user retrieval

    try {
      const { data, error } = await supabase.from('notes').insert([{ user_id: user.id, title, content }]);
      if (error) throw error;

      alert('Note saved successfully!');
      loadNotes();
    } catch (error) {
      console.error('Error saving note:', error.message);
      alert('Failed to save note.');
    }
  });

  document.getElementById('fileUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file.size > MAX_FILE_SIZE || !allowedTypes.includes(file.type)) {
      alert('Invalid file type or size.');
      return;
    }

    const { data: user } = await supabase.auth.getUser();
    
    try {
      const { data, error } = await supabase.storage.from('files').upload(`users/${user.id}/${file.name}`, file);
      if (error) throw error;

      alert('File uploaded successfully!');
      loadFiles();
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('Failed to upload file.');
    }
  });
}
