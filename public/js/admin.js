// Administrative Panel Workspace Management Logic
document.addEventListener('DOMContentLoaded', () => {
  const loginView = document.getElementById('login-view');
  const dashboardView = document.getElementById('dashboard-view');
  
  // Forms & Inputs
  const loginForm = document.getElementById('login-form');
  const settingsForm = document.getElementById('settings-form');
  const jobForm = document.getElementById('job-form');
  const blogForm = document.getElementById('blog-form');
  const logoutBtn = document.getElementById('logout-btn');

  // Active state holders for updates
  let currentInquiryId = null;
  let loadedContacts = [];
  let loadedCandidates = [];

  // Initialize
  checkAuthentication();

  // Handle Login Form Submission
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const u = document.getElementById('username').value;
    const p = document.getElementById('password').value;
    
    const submitBtn = loginForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Authenticating...';

    try {
      const data = await API.adminLogin(u, p);
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminUsername', data.username);
      
      window.showToast('Login successful!', 'success');
      showDashboardView();
    } catch (err) {
      window.showToast(err.message || 'Invalid username or password.', 'error');
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Authenticate Login';
    }
  });

  // Handle Logout Event
  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUsername');
    window.location.reload();
  });

  // Handle Sidebar Tabs Navigation Switching
  const menuItems = document.querySelectorAll('.admin-menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      menuItems.forEach(mi => mi.classList.remove('active'));
      e.currentTarget.classList.add('active');

      const targetTab = e.currentTarget.getAttribute('data-tab');
      document.querySelectorAll('.admin-panel').forEach(panel => panel.classList.remove('active'));
      document.getElementById(targetTab).classList.add('active');

      // Update Header Text dynamically based on active tab
      updateHeaderDetails(targetTab);
    });
  });

  // Helper function to update panel title & description
  function updateHeaderDetails(tabId) {
    const titleEl = document.getElementById('panel-title');
    const descEl = document.getElementById('panel-desc');

    if (tabId === 'tab-inbox') {
      titleEl.textContent = 'Inbox Messages';
      descEl.textContent = 'View and manage contact inquiries submitted through the website.';
      loadInboxData();
    } else if (tabId === 'tab-candidates') {
      titleEl.textContent = 'Job Applications';
      descEl.textContent = 'Review candidate profiles, experience levels, and download resumes.';
      loadCandidatesData();
    } else if (tabId === 'tab-jobs') {
      titleEl.textContent = 'Manage Jobs';
      descEl.textContent = 'Publish new job openings or update status of active opportunities.';
      loadJobsData();
    } else if (tabId === 'tab-blogs') {
      titleEl.textContent = 'Manage Blogs';
      descEl.textContent = 'Compose new articles, tips, or insights for the company blog.';
      loadBlogsData();
    } else if (tabId === 'tab-settings') {
      titleEl.textContent = 'Portal Settings';
      descEl.textContent = 'Update general website configurations like corporate emails and LinkedIn handles.';
      loadSettingsData();
    }
  }

  // Check if adminToken exists and validates
  async function checkAuthentication() {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showLoginView();
    } else {
      showDashboardView();
    }
  }

  function showLoginView() {
    loginView.style.display = 'flex';
    dashboardView.style.display = 'none';
  }

  function showDashboardView() {
    loginView.style.display = 'none';
    dashboardView.style.display = 'grid';
    
    // Set admin user name
    const name = localStorage.getItem('adminUsername') || 'admin';
    document.getElementById('admin-user-tag').textContent = name;
    
    // Load Stats and first active tab details
    loadInboxData();
    loadDashboardStats();
  }

  // Auth fetch wrapper helper
  async function authFetch(url, options = {}) {
    const token = localStorage.getItem('adminToken');
    if (!token) {
      showLoginView();
      throw new Error('Unauthenticated admin session');
    }

    options.headers = {
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };

    if (!(options.body instanceof FormData)) {
      options.headers['Content-Type'] = 'application/json';
    }

    const response = await fetch(url, options);
    if (response.status === 401) {
      localStorage.removeItem('adminToken');
      window.location.reload();
      throw new Error('Admin session expired. Please sign in again.');
    }
    return response;
  }

  // ==========================================
  // DASHBOARD STATISTICS LOADERS
  // ==========================================
  async function loadDashboardStats() {
    try {
      const token = localStorage.getItem('adminToken');
      // Fetch datasets using token wrapper
      const contactsRes = await authFetch('/api/admin/contacts');
      const contacts = await contactsRes.json();
      document.getElementById('stat-inquiries').textContent = contacts.length;

      const candidatesRes = await authFetch('/api/admin/candidates');
      const candidates = await candidatesRes.json();
      document.getElementById('stat-candidates').textContent = candidates.length;

      // Public routes can be queried directly, or through auth
      const jobs = await API.getJobs();
      document.getElementById('stat-jobs').textContent = jobs.length;

      const blogs = await API.getBlogs();
      document.getElementById('stat-blogs').textContent = blogs.length;

    } catch (error) {
      console.error('Failed loading stats panel:', error);
    }
  }

  // ==========================================
  // TAB 1: INBOX DATA LOADER & VIEW MODAL
  // ==========================================
  async function loadInboxData() {
    const tbody = document.getElementById('inbox-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Retrieving inbox list...</td></tr>';
    
    // Reset header select-all checkbox
    const selectAllBox = document.getElementById('select-all-inbox');
    if (selectAllBox) selectAllBox.checked = false;

    try {
      const response = await authFetch('/api/admin/contacts');
      const contacts = await response.json();
      loadedContacts = contacts;

      if (contacts.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-gray);">No messages in inbox.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      contacts.forEach(contact => {
        const tr = document.createElement('tr');
        const date = new Date(contact.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });

        let statusClass = 'badge-unread';
        if (contact.status === 'Read') statusClass = 'badge-read';
        if (contact.status === 'Replied') statusClass = 'badge-replied';

        tr.innerHTML = `
          <td style="text-align: center;"><input type="checkbox" class="inbox-select" data-id="${contact._id}"></td>
          <td>${date}</td>
          <td><strong>${contact.name}</strong><br><small style="color: var(--text-gray);">${contact.phone}</small></td>
          <td>${contact.email}</td>
          <td>${contact.subject}</td>
          <td><span class="badge-status ${statusClass}">${contact.status}</span></td>
          <td>
            <button class="action-btn btn-action-view view-contact-btn" data-id="${contact._id}">View</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Bind View Message click
      document.querySelectorAll('.view-contact-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          const id = e.target.getAttribute('data-id');
          const targetMsg = loadedContacts.find(c => c._id === id);
          if (targetMsg) {
            currentInquiryId = id;
            document.getElementById('inquiry-modal-subject').textContent = targetMsg.subject;
            document.getElementById('inquiry-modal-name').textContent = targetMsg.name;
            document.getElementById('inquiry-modal-email').textContent = targetMsg.email;
            document.getElementById('inquiry-modal-phone').textContent = targetMsg.phone;
            document.getElementById('inquiry-modal-date').textContent = new Date(targetMsg.createdAt).toLocaleString();
            document.getElementById('inquiry-modal-message').textContent = targetMsg.message;
            
            // Open Modal
            document.getElementById('inquiry-modal').classList.add('active');
          }
        });
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="6" style="text-align: center; color: red;">Failed to retrieve inbox messages.</td></tr>';
    }
  }

  // Update contact message status
  document.querySelectorAll('.btn-action-status').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const status = e.target.getAttribute('data-status');
      if (!currentInquiryId) return;

      try {
        const response = await authFetch(`/api/admin/contacts/${currentInquiryId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
        
        if (response.ok) {
          window.showToast(`Message marked as ${status}`, 'success');
          // Close Modal & reload data
          document.getElementById('inquiry-modal').classList.remove('active');
          loadInboxData();
          loadDashboardStats();
        }
      } catch (error) {
        window.showToast('Failed to update status', 'error');
      }
    });
  });

  document.getElementById('inquiry-modal-close').addEventListener('click', () => {
    document.getElementById('inquiry-modal').classList.remove('active');
  });

  // ==========================================
  // TAB 2: CANDIDATES LIST LOADER
  // ==========================================
  async function loadCandidatesData() {
    const tbody = document.getElementById('candidates-tbody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Retrieving candidates list...</td></tr>';

    // Reset header select-all checkbox
    const selectAllBox = document.getElementById('select-all-candidates');
    if (selectAllBox) selectAllBox.checked = false;

    try {
      const response = await authFetch('/api/admin/candidates');
      const candidates = await response.json();
      loadedCandidates = candidates;
      const token = localStorage.getItem('adminToken');

      if (candidates.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-gray);">No candidates registered.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      candidates.forEach(candidate => {
        const tr = document.createElement('tr');
        const date = new Date(candidate.createdAt).toLocaleDateString('en-US', {
          month: 'short', day: 'numeric', year: 'numeric'
        });

        // Split download route using auth query param
        const filename = candidate.resumePath.split('/').pop();
        const dlUrl = `/api/admin/resumes/download/${filename}?token=${token}`;

        tr.innerHTML = `
          <td style="text-align: center;"><input type="checkbox" class="candidate-select" data-id="${candidate._id}"></td>
          <td>${date}</td>
          <td><strong>${candidate.name}</strong></td>
          <td>${candidate.email}<br><small style="color: var(--text-gray);">${candidate.phone}</small></td>
          <td>${candidate.experience}</td>
          <td><span class="job-badge" style="background-color: var(--frosted-blue-2); color: var(--deep-twilight);">${candidate.appliedFor}</span></td>
          <td>
            <a href="${dlUrl}" class="action-btn btn-action-view" download style="text-align: center; display: inline-block;">Download CV</a>
          </td>
        `;
        tbody.appendChild(tr);
      });
    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Failed to retrieve candidate profiles.</td></tr>';
    }
  }

  // ==========================================
  // TAB 3: JOBS CRUD MANAGEMENT
  // ==========================================
  const jobCancelBtn = document.getElementById('job-cancel-btn');
  const jobSubmitBtn = document.getElementById('job-submit-btn');
  const jobFormTitle = document.getElementById('job-form-title');
  const jobStatusGroup = document.getElementById('job-status-group');

  async function loadJobsData() {
    const tbody = document.getElementById('jobs-tbody');
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center;">Loading jobs list...</td></tr>';

    try {
      // Query direct API routes for active jobs lists
      const response = await fetch('/api/jobs');
      const jobs = await response.json();

      if (jobs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-gray);">No jobs listed in portal.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      jobs.forEach(job => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${job.title}</strong><br><small style="color: var(--text-gray);">${job.location} | ${job.experience}</small></td>
          <td>${job.department}</td>
          <td><span class="badge-status badge-read">${job.status}</span></td>
          <td>
            <div class="action-btn-group">
              <button class="action-btn btn-action-edit edit-job-btn" data-id="${job._id}">Edit</button>
              <button class="action-btn btn-action-delete delete-job-btn" data-id="${job._id}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Edit Job listener
      document.querySelectorAll('.edit-job-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const job = jobs.find(j => j._id === id);
          if (job) {
            document.getElementById('jobId').value = job._id;
            document.getElementById('jobTitle').value = job.title;
            document.getElementById('jobDepartment').value = job.department;
            document.getElementById('jobType').value = job.type;
            document.getElementById('jobLocation').value = job.location;
            document.getElementById('jobExperience').value = job.experience;
            document.getElementById('jobSalary').value = job.salary || '';
            document.getElementById('jobDesc').value = job.description;
            document.getElementById('jobRequirements').value = job.requirements.join('\n');
            document.getElementById('jobStatus').value = job.status;

            // Update UI components
            jobFormTitle.textContent = 'Edit Job Opening';
            jobSubmitBtn.textContent = 'Save Changes';
            jobStatusGroup.style.display = 'block';
            jobCancelBtn.style.display = 'block';
          }
        });
      });

      // Delete Job listener
      document.querySelectorAll('.delete-job-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Are you sure you want to delete this job listing?')) return;
          const id = e.target.getAttribute('data-id');
          try {
            const res = await authFetch(`/api/admin/jobs/${id}`, {
              method: 'DELETE'
            });
            if (res.ok) {
              window.showToast('Job listing deleted successfully', 'success');
              loadJobsData();
              loadDashboardStats();
            }
          } catch (err) {
            window.showToast('Failed to delete job', 'error');
          }
        });
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: red;">Failed to retrieve jobs.</td></tr>';
    }
  }

  // Submit Job (Create/Update)
  jobForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const jobId = document.getElementById('jobId').value;
    const reqText = document.getElementById('jobRequirements').value;
    const requirements = reqText.split('\n').map(r => r.trim()).filter(r => r.length > 0);

    const jobData = {
      title: document.getElementById('jobTitle').value,
      department: document.getElementById('jobDepartment').value,
      type: document.getElementById('jobType').value,
      location: document.getElementById('jobLocation').value,
      experience: document.getElementById('jobExperience').value,
      salary: document.getElementById('jobSalary').value,
      description: document.getElementById('jobDesc').value,
      requirements: requirements
    };

    let url = '/api/admin/jobs';
    let method = 'POST';

    if (jobId) {
      url = `/api/admin/jobs/${jobId}`;
      method = 'PUT';
      jobData.status = document.getElementById('jobStatus').value;
    }

    try {
      const response = await authFetch(url, {
        method: method,
        body: JSON.stringify(jobData)
      });

      const data = await response.json();
      if (response.ok) {
        window.showToast(data.msg || 'Operation complete!', 'success');
        resetJobForm();
        loadJobsData();
        loadDashboardStats();
      } else {
        window.showToast(data.msg || 'Save failed.', 'error');
      }
    } catch (error) {
      window.showToast('Authentication or server error occurred.', 'error');
    }
  });

  jobCancelBtn.addEventListener('click', resetJobForm);

  function resetJobForm() {
    jobForm.reset();
    document.getElementById('jobId').value = '';
    jobFormTitle.textContent = 'Post New Job Opening';
    jobSubmitBtn.textContent = 'Publish Opening';
    jobStatusGroup.style.display = 'none';
    jobCancelBtn.style.display = 'none';
  }

  // ==========================================
  // TAB 4: BLOGS CRUD MANAGEMENT
  // ==========================================
  const blogCancelBtn = document.getElementById('blog-cancel-btn');
  const blogSubmitBtn = document.getElementById('blog-submit-btn');
  const blogFormTitle = document.getElementById('blog-form-title');

  async function loadBlogsData() {
    const tbody = document.getElementById('blogs-tbody');
    tbody.innerHTML = '<tr><td colspan="3" style="text-align: center;">Loading articles list...</td></tr>';

    try {
      const response = await fetch('/api/blogs');
      const blogs = await response.json();

      if (blogs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-gray);">No blog articles found.</td></tr>';
        return;
      }

      tbody.innerHTML = '';
      blogs.forEach(blog => {
        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td><strong>${blog.title}</strong><br><small style="color: var(--text-gray);">${blog.author} | ${blog.readTime}</small></td>
          <td>${blog.category}</td>
          <td>
            <div class="action-btn-group">
              <button class="action-btn btn-action-edit edit-blog-btn" data-id="${blog._id}">Edit</button>
              <button class="action-btn btn-action-delete delete-blog-btn" data-id="${blog._id}">Delete</button>
            </div>
          </td>
        `;
        tbody.appendChild(tr);
      });

      // Edit Blog click event
      document.querySelectorAll('.edit-blog-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const id = e.target.getAttribute('data-id');
          const blog = blogs.find(b => b._id === id);
          if (blog) {
            document.getElementById('blogId').value = blog._id;
            document.getElementById('blogTitle').value = blog.title;
            document.getElementById('blogCategory').value = blog.category;
            document.getElementById('blogReadtime').value = blog.readTime;
            document.getElementById('blogImageFile').value = '';
            document.getElementById('blogSummary').value = blog.summary;
            document.getElementById('blogContent').value = blog.content;

            // Render preview
            const previewContainer = document.getElementById('blog-image-preview-container');
            const previewImg = document.getElementById('blog-image-preview-img');
            if (blog.image) {
              previewImg.src = blog.image;
              previewContainer.style.display = 'flex';
            } else {
              previewContainer.style.display = 'none';
            }

            // UI updates
            blogFormTitle.textContent = 'Edit Blog Post';
            blogSubmitBtn.textContent = 'Save Changes';
            blogCancelBtn.style.display = 'block';
          }
        });
      });

      // Delete Blog click event
      document.querySelectorAll('.delete-blog-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
          if (!confirm('Are you sure you want to delete this article?')) return;
          const id = e.target.getAttribute('data-id');
          try {
            const res = await authFetch(`/api/admin/blogs/${id}`, {
              method: 'DELETE'
            });
            if (res.ok) {
              window.showToast('Article deleted successfully', 'success');
              loadBlogsData();
              loadDashboardStats();
            }
          } catch (err) {
            window.showToast('Failed to delete article', 'error');
          }
        });
      });

    } catch (err) {
      tbody.innerHTML = '<tr><td colspan="3" style="text-align: center; color: red;">Failed to retrieve blogs list.</td></tr>';
    }
  }

  // Submit Blog Form (Create/Update)
  blogForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const blogId = document.getElementById('blogId').value;
    const formData = new FormData();
    formData.append('title', document.getElementById('blogTitle').value);
    formData.append('category', document.getElementById('blogCategory').value);
    formData.append('readTime', document.getElementById('blogReadtime').value || '5 min read');
    formData.append('summary', document.getElementById('blogSummary').value);
    formData.append('content', document.getElementById('blogContent').value);

    const imageFile = document.getElementById('blogImageFile').files[0];
    if (imageFile) {
      formData.append('blogImage', imageFile);
    }

    let url = '/api/admin/blogs';
    let method = 'POST';

    if (blogId) {
      url = `/api/admin/blogs/${blogId}`;
      method = 'PUT';
    }

    try {
      const response = await authFetch(url, {
        method: method,
        body: formData
      });

      const data = await response.json();
      if (response.ok) {
        window.showToast(data.msg || 'Article saved successfully!', 'success');
        resetBlogForm();
        loadBlogsData();
        loadDashboardStats();
      } else {
        window.showToast(data.msg || 'Save article failed.', 'error');
      }
    } catch (error) {
      window.showToast('Error connecting to backend services.', 'error');
    }
  });

  blogCancelBtn.addEventListener('click', resetBlogForm);

  function resetBlogForm() {
    blogForm.reset();
    document.getElementById('blogId').value = '';
    document.getElementById('blogImageFile').value = '';
    document.getElementById('blog-image-preview-container').style.display = 'none';
    blogFormTitle.textContent = 'Write Blog Post';
    blogSubmitBtn.textContent = 'Publish Article';
    blogCancelBtn.style.display = 'none';
  }

  // ==========================================
  // TAB 5: DYNAMIC CONFIG SETTINGS MANAGEMENT
  // ==========================================
  async function loadSettingsData() {
    try {
      const settings = await API.getSettings();
      if (settings) {
        document.getElementById('settingsPhone').value = settings.phone;
        document.getElementById('settingsEmail').value = settings.email;
        document.getElementById('settingsLinkedin').value = settings.linkedinUrl;
        document.getElementById('settingsLocation').value = settings.location || 'Chennai, Tamil Nadu, India';
        document.getElementById('settingsFounderName').value = settings.founderName || 'Founder & Managing Partner';
        document.getElementById('settingsFounderBio').value = settings.founderBio || '';

        // Render logo preview
        const previewContainer = document.getElementById('logo-preview-container');
        const previewImg = document.getElementById('logo-preview-img');
        if (settings.logoPath) {
          previewImg.src = settings.logoPath;
          previewContainer.style.display = 'flex';
        } else {
          previewContainer.style.display = 'none';
        }

        // Render founder photo preview
        const founderPreviewContainer = document.getElementById('founder-photo-preview-container');
        const founderPreviewImg = document.getElementById('founder-photo-preview-img');
        if (settings.founderPhotoPath) {
          founderPreviewImg.src = settings.founderPhotoPath;
          founderPreviewContainer.style.display = 'flex';
        } else {
          founderPreviewContainer.style.display = 'none';
        }
      }
    } catch (error) {
      console.error('Failed to load configuration settings:', error);
    }
  }

  // Update site credentials settings
  settingsForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('phone', document.getElementById('settingsPhone').value);
    formData.append('email', document.getElementById('settingsEmail').value);
    formData.append('linkedinUrl', document.getElementById('settingsLinkedin').value);
    formData.append('location', document.getElementById('settingsLocation').value);
    formData.append('founderName', document.getElementById('settingsFounderName').value);
    formData.append('founderBio', document.getElementById('settingsFounderBio').value);

    const logoFile = document.getElementById('settingsLogoFile').files[0];
    if (logoFile) {
      formData.append('logo', logoFile);
    }

    const founderPhotoFile = document.getElementById('settingsFounderPhoto').files[0];
    if (founderPhotoFile) {
      formData.append('founderPhoto', founderPhotoFile);
    }

    try {
      const response = await authFetch('/api/admin/settings', {
        method: 'POST',
        body: formData
      });
      const data = await response.json();
      if (response.ok) {
        window.showToast(data.msg || 'Website config saved!', 'success');
        
        // Reset file inputs
        document.getElementById('settingsLogoFile').value = '';
        document.getElementById('settingsFounderPhoto').value = '';
        
        loadSettingsData();
      } else {
        window.showToast(data.msg || 'Failed to save config settings.', 'error');
      }
    } catch (err) {
      window.showToast('Error updating configuration parameters.', 'error');
    }
  });

  // ==========================================
  // EXCEL / CSV EXPORT UTILITIES & CHECKBOXES
  // ==========================================
  
  // Select All checkboxes toggle
  const selectAllInbox = document.getElementById('select-all-inbox');
  if (selectAllInbox) {
    selectAllInbox.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('.inbox-select').forEach(box => {
        box.checked = checked;
      });
    });
  }

  const selectAllCandidates = document.getElementById('select-all-candidates');
  if (selectAllCandidates) {
    selectAllCandidates.addEventListener('change', (e) => {
      const checked = e.target.checked;
      document.querySelectorAll('.candidate-select').forEach(box => {
        box.checked = checked;
      });
    });
  }

  // Blob CSV exporter utility
  function exportToCSV(filename, headers, rows) {
    const csvContent = "\uFEFF" + [
      headers.join(","),
      ...rows.map(row => row.map(val => {
        if (val === null || val === undefined) return '""';
        // Escape double quotes and enclose in double quotes
        return `"${String(val).replace(/"/g, '""')}"`;
      }).join(","))
    ].join("\r\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Download selected inbox messages
  const downloadInboxBtn = document.getElementById('download-inbox-xl');
  if (downloadInboxBtn) {
    downloadInboxBtn.addEventListener('click', () => {
      const selectedBoxes = document.querySelectorAll('.inbox-select:checked');
      if (selectedBoxes.length === 0) {
        window.showToast('Please select at least one inbox message to export.', 'error');
        return;
      }

      const selectedIds = Array.from(selectedBoxes).map(box => box.getAttribute('data-id'));
      const itemsToExport = loadedContacts.filter(c => selectedIds.includes(c._id));

      const headers = ["Date", "Name", "Email", "Phone", "Subject", "Message", "Status"];
      const rows = itemsToExport.map(item => [
        new Date(item.createdAt).toLocaleString(),
        item.name,
        item.email,
        item.phone,
        item.subject,
        item.message,
        item.status
      ]);

      const dateStr = new Date().toISOString().slice(0,10);
      exportToCSV(`SGS_HR_Inquiries_${dateStr}.csv`, headers, rows);
      window.showToast(`Exported ${itemsToExport.length} inquiry records successfully.`, 'success');
    });
  }

  // Download selected candidate registrations
  const downloadCandidatesBtn = document.getElementById('download-candidates-xl');
  if (downloadCandidatesBtn) {
    downloadCandidatesBtn.addEventListener('click', () => {
      const selectedBoxes = document.querySelectorAll('.candidate-select:checked');
      if (selectedBoxes.length === 0) {
        window.showToast('Please select at least one job application to export.', 'error');
        return;
      }

      const selectedIds = Array.from(selectedBoxes).map(box => box.getAttribute('data-id'));
      const itemsToExport = loadedCandidates.filter(c => selectedIds.includes(c._id));

      const headers = ["Applied On", "Name", "Email", "Phone", "Experience", "Applied For", "Cover Letter", "Resume URL"];
      const rows = itemsToExport.map(item => [
        new Date(item.createdAt).toLocaleString(),
        item.name,
        item.email,
        item.phone,
        item.experience,
        item.appliedFor,
        item.coverLetter || '',
        window.location.origin + item.resumePath
      ]);

      const dateStr = new Date().toISOString().slice(0,10);
      exportToCSV(`SGS_HR_Candidates_${dateStr}.csv`, headers, rows);
      window.showToast(`Exported ${itemsToExport.length} candidate applications successfully.`, 'success');
    });
  }

});
