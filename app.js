const supabaseUrl = 'https://lhxgaoxpbheliwwihyuk.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// Free Tier Limits
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

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
    const { user, error } = await supabase.auth.signIn({ email, password });

    if (error) {
      throw error;
    }

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
    const { user, error } = await supabase.auth.signUp({ email, password });

    if (error) {
      throw error;
    }

    alert('Signup successful! Please check your email for confirmation.');
  } catch (error) {
    console.error('Signup error:', error.message);
    alert('Signup failed. Please try again.');
  }
});

// Logout
document.getElementById('logoutBtn')?.addEventListener('click', async () => {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw error;
    }

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

  // Load notes
  loadNotes();

  // Load files
  loadFiles();

  // Note form submission
  document.getElementById('noteForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const title = document.getElementById('noteTitle').value;
    const content = document.getElementById('noteContent').value;

    try {
      const { data, error } = await supabase
        .from('notes')
        .insert([{ user_id: supabase.auth.user().id, title, content }]);

      if (error) {
        throw error;
      }

      alert('Note saved successfully!');
      loadNotes(); // Refresh notes list
    } catch (error) {
      console.error('Error saving note:', error.message);
      alert('Failed to save note. Please try again.');
    }
  });

  // File upload
  document.getElementById('fileUpload').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (file.size > MAX_FILE_SIZE) {
      alert('File size exceeds 5MB limit');
      return;
    }

    try {
      const { data, error } = await supabase
        .storage
        .from('files')
        .upload(`users/${supabase.auth.user().id}/${file.name}`, file);

      if (error) {
        throw error;
      }

      alert('File uploaded successfully!');
      loadFiles(); // Refresh files list
    } catch (error) {
      console.error('Error uploading file:', error.message);
      alert('Failed to upload file. Please try again.');
    }
  });
}

// Load notes
async function loadNotes() {
  try {
    const { data, error } = await supabase
      .from('notes')
      .select('*')
      .eq('user_id', supabase.auth.user().id);

    if (error) {
      throw error;
    }

    const notesContainer = document.getElementById('notesContainer');
    notesContainer.innerHTML = data.map(note => `
      <div class="col s12 m6">
        <div class="card note-card">
          <div class="card-content">
            <span class="card-title">${note.title}</span>
            <p>${note.content}</p>
          </div>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading notes:', error.message);
    alert('Failed to load notes. Please try again.');
  }
}

// Load files
async function loadFiles() {
  try {
    const { data, error } = await supabase
      .storage
      .from('files')
      .list(`users/${supabase.auth.user().id}/`);

    if (error) {
      throw error;
    }

    const filesList = document.getElementById('filesList');
    filesList.innerHTML = data.map(file => `
      <div class="file-item">
        <span>${file.name}</span>
        <button class="btn red btn-micro" onclick="deleteFile('${file.name}')">Delete</button>
      </div>
    `).join('');
  } catch (error) {
    console.error('Error loading files:', error.message);
    alert('Failed to load files. Please try again.');
  }
}

// Delete file
async function deleteFile(fileName) {
  try {
    const { data, error } = await supabase
      .storage
      .from('files')
      .remove([`users/${supabase.auth.user().id}/${fileName}`]);

    if (error) {
      throw error;
    }

    alert('File deleted successfully!');
    loadFiles(); // Refresh files list
  } catch (error) {
    console.error('Error deleting file:', error.message);
    alert('Failed to delete file. Please try again.');
  }
}
