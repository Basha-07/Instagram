/* =====================================================
   Instagram Professional Web App — script.js
   Full Interactive State, Dynamic Features & Animations
   ===================================================== */

function normalizeImagePath(path) {
  if (!path) return path;
  // If Windows full path or backslashes are provided, extract filename or fix slashes
  const filename = path.split(/[/\\]/).pop();
  if (filename && filename.toLowerCase().includes('whatsapp image')) {
    return filename;
  }
  return path.replace(/\\/g, '/');
}

const USER = {
  username:   'alex_creator',
  fullName:   'Alex Rivera',
  bio:        '📸 Visual Storyteller & Digital Creator\n🌍 Exploring hidden aesthetic places\n✉️ contact@alexrivera.io',
  website:    'www.alexrivera.io',
  profilePic: 'WhatsApp Image 2026-10-13 at 1.36.40 PM.jpeg',
};

// ── Theme Management ──────────────────────────────────
function initTheme() {
  const savedTheme = localStorage.getItem('insta_theme');
  if (savedTheme === 'dark') {
    document.documentElement.setAttribute('data-theme', 'dark');
    updateThemeIcons(true);
  }
}

function toggleTheme() {
  const currentTheme = document.documentElement.getAttribute('data-theme');
  if (currentTheme === 'dark') {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('insta_theme', 'light');
    updateThemeIcons(false);
  } else {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('insta_theme', 'dark');
    updateThemeIcons(true);
  }
}

function updateThemeIcons(isDark) {
  document.querySelectorAll('.theme-toggle-btn i').forEach(icon => {
    icon.className = isDark ? 'fas fa-sun' : 'fas fa-moon';
  });
}

// ── Page Navigation ──────────────────────────────────
function showPage(pageId) {
  document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
  const page = document.getElementById(pageId);
  if (page) {
    page.classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  // Close any open notifications
  const notifDropdown = document.getElementById('notifications-dropdown');
  if (notifDropdown) notifDropdown.classList.add('hidden');
}

// ── Auth Handlers ─────────────────────────────────────
function handleLogin(e) {
  e.preventDefault();
  const unameInput = document.getElementById('login-username-input').value.trim();
  if (unameInput) {
    USER.username = unameInput;
    applyUserProfile();
  }
  showPage('page-home');
}

function handleSignup(e) {
  e.preventDefault();
  const uname = document.getElementById('signup-username').value.trim();
  const fname = document.getElementById('signup-fullname').value.trim();
  if (uname) USER.username = uname;
  if (fname) USER.fullName = fname;
  applyUserProfile();
  showPage('page-home');
}

// ── Modal Control ─────────────────────────────────────
function showModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
  if (modalId === 'modal-story') {
    clearInterval(window.storyInterval);
  }
}

function closeModalOutside(event, modalId) {
  if (event.target.id === modalId) {
    closeModal(modalId);
  }
}

document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay').forEach(m => {
      m.classList.add('hidden');
    });
    document.body.style.overflow = '';
    clearInterval(window.storyInterval);
  }
});

// ── Like Toggle & Counters ────────────────────────────
function toggleLike(btn) {
  const icon = btn.querySelector('i');
  const card = btn.closest('.post-card, .post-detail-box, .reel-view');
  const likeCountEl = card ? card.querySelector('.like-count, #detail-modal-likes, .reel-action-count') : null;
  const isLiked = btn.classList.contains('liked');

  if (isLiked) {
    btn.classList.remove('liked');
    if (icon) { icon.className = 'far fa-heart'; }
    if (likeCountEl) {
      let currentVal = parseLikeCount(likeCountEl.textContent);
      likeCountEl.textContent = formatLikeCount(Math.max(0, currentVal - 1));
    }
  } else {
    btn.classList.add('liked');
    if (icon) { icon.className = 'fas fa-heart'; }
    if (likeCountEl) {
      let currentVal = parseLikeCount(likeCountEl.textContent);
      likeCountEl.textContent = formatLikeCount(currentVal + 1);
    }
  }
}

function parseLikeCount(str) {
  if (!str) return 0;
  let numStr = str.replace(/,/g, '').replace(/k/i, '000').replace(/[^0-9]/g, '');
  return parseInt(numStr, 10) || 0;
}

function formatLikeCount(num) {
  return num.toLocaleString();
}

// ── Save/Bookmark Toggle ──────────────────────────────
function toggleSave(btn) {
  const icon = btn.querySelector('i');
  const isSaved = btn.classList.contains('saved');
  if (isSaved) {
    btn.classList.remove('saved');
    if (icon) icon.className = 'far fa-bookmark';
  } else {
    btn.classList.add('saved');
    if (icon) icon.className = 'fas fa-bookmark';
  }
}

// ── Follow Button Toggle ──────────────────────────────
function toggleFollow(btn) {
  if (btn.classList.contains('following')) {
    btn.classList.remove('following');
    btn.textContent = 'Follow';
  } else {
    btn.classList.add('following');
    btn.textContent = 'Following';
  }
}

// ── Notifications Dropdown ────────────────────────────
function toggleNotifications() {
  const dropdown = document.getElementById('notifications-dropdown');
  if (dropdown) dropdown.classList.toggle('hidden');
}

document.addEventListener('click', function(e) {
  const dropdown = document.getElementById('notifications-dropdown');
  if (!dropdown) return;
  if (!dropdown.contains(e.target) && !e.target.closest('.nav-icon-btn[title="Notifications"]')) {
    dropdown.classList.add('hidden');
  }
});

// ── Comments Handling ─────────────────────────────────
function handleCommentEnter(e, input) {
  if (e.key === 'Enter') {
    postComment(input.nextElementSibling);
  }
}

function postComment(btn) {
  const row = btn.closest('.add-comment-row');
  const input = row.querySelector('.comment-input');
  const text = input.value.trim();
  if (!text) return;

  const card = btn.closest('.post-card');
  const previewContainer = card.querySelector('.comment-list-preview');

  const commentEl = document.createElement('div');
  commentEl.className = 'comment-preview';
  commentEl.innerHTML = `<p><strong>${USER.username}</strong> ${escapeHtml(text)}</p>`;
  previewContainer.appendChild(commentEl);

  // Update count
  const countEl = card.querySelector('.comment-count');
  if (countEl) {
    let current = parseInt(countEl.textContent, 10) || 0;
    countEl.textContent = current + 1;
  }

  input.value = '';
}

function handleModalCommentEnter(e, input) {
  if (e.key === 'Enter') {
    postModalComment(input.nextElementSibling);
  }
}

function postModalComment(btn) {
  const row = btn.closest('.add-comment-row');
  const input = row.querySelector('.comment-input');
  const text = input.value.trim();
  if (!text) return;

  const list = document.getElementById('detail-modal-comments-list');
  const item = document.createElement('div');
  item.className = 'comment-item';
  item.innerHTML = `
    <img src="${USER.profilePic}" class="comment-avatar-img" />
    <div class="comment-content">
      <p><strong>${USER.username}</strong> ${escapeHtml(text)}</p>
      <div class="comment-meta"><span>Just now</span><span>Reply</span></div>
    </div>
  `;
  list.appendChild(item);
  input.value = '';
}

// ── Open Post Detail Modal ────────────────────────────
function openPostDetail(username, imageSrc, caption, likes) {
  document.getElementById('detail-modal-img').src = imageSrc;
  document.getElementById('detail-modal-avatar').src = 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80';
  document.getElementById('detail-modal-username').textContent = username;
  document.getElementById('detail-modal-likes').textContent = likes;

  const commentsList = document.getElementById('detail-modal-comments-list');
  commentsList.innerHTML = `
    <div class="comment-item">
      <img src="${imageSrc}" class="comment-avatar-img" />
      <div class="comment-content">
        <p><strong>${username}</strong> ${caption}</p>
        <div class="comment-meta"><span>2h</span><span>Reply</span></div>
      </div>
    </div>
    <div class="comment-item">
      <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&q=80" class="comment-avatar-img" />
      <div class="comment-content">
        <p><strong>john_doe</strong> Love this shot so much!</p>
        <div class="comment-meta"><span>1h</span><span>Reply</span></div>
      </div>
    </div>
  `;

  showModal('modal-post-detail');
}

// ── Story Viewer Modal ────────────────────────────────
function openStory(username, avatarSrc, storyImgSrc) {
  document.getElementById('story-modal-username').textContent = username;
  document.getElementById('story-modal-user-avatar').src = avatarSrc;
  document.getElementById('story-modal-img').src = storyImgSrc;

  showModal('modal-story');

  const fill = document.getElementById('story-progress-fill');
  fill.style.width = '0%';
  let progress = 0;
  clearInterval(window.storyInterval);
  window.storyInterval = setInterval(() => {
    progress += 2;
    fill.style.width = progress + '%';
    if (progress >= 100) {
      clearInterval(window.storyInterval);
      closeModal('modal-story');
    }
  }, 100);
}

// ── Create New Post ───────────────────────────────────
function createNewPost() {
  const urlInput = document.getElementById('new-post-url').value.trim();
  const captionInput = document.getElementById('new-post-caption').value.trim();

  const imgUrl = urlInput || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=1000&q=80';
  const caption = captionInput || 'New post update ✨';

  // Append post to feed
  const feedContainer = document.getElementById('posts-list-container');
  const postArticle = document.createElement('article');
  postArticle.className = 'post-card';
  postArticle.innerHTML = `
    <div class="post-header">
      <div class="post-user-info">
        <div class="post-avatar-ring">
          <img src="${USER.profilePic}" class="post-avatar-img" />
        </div>
        <div class="post-user-meta">
          <span class="post-username" onclick="showPage('page-profile')">${USER.username}</span>
          <span class="post-location">Just posted</span>
        </div>
      </div>
      <button class="post-more-btn"><i class="fas fa-ellipsis-h"></i></button>
    </div>
    <div class="post-image-wrapper">
      <img src="${imgUrl}" alt="Post image" class="post-real-img" />
      <div class="double-tap-heart"><i class="fas fa-heart"></i></div>
    </div>
    <div class="post-actions">
      <div class="post-actions-left">
        <button class="action-btn like-btn" onclick="toggleLike(this)"><i class="far fa-heart"></i></button>
        <button class="action-btn" onclick="openPostDetail('${USER.username}', '${imgUrl}', '${escapeHtml(caption)}', '1')"><i class="far fa-comment"></i></button>
        <button class="action-btn"><i class="far fa-paper-plane"></i></button>
      </div>
      <button class="action-btn save-btn" onclick="toggleSave(this)"><i class="far fa-bookmark"></i></button>
    </div>
    <div class="post-likes">
      <p class="likes-text"><strong class="like-count">1</strong> like</p>
    </div>
    <div class="post-caption">
      <p><strong>${USER.username}</strong> ${escapeHtml(caption)}</p>
    </div>
    <button class="view-comments-btn" onclick="openPostDetail('${USER.username}', '${imgUrl}', '${escapeHtml(caption)}', '1')">View all <span class="comment-count">0</span> comments</button>
    <div class="comment-list-preview"></div>
    <div class="add-comment-row">
      <span class="emoji-picker-btn"><i class="far fa-smile"></i></span>
      <input type="text" placeholder="Add a comment…" class="comment-input" onkeyup="handleCommentEnter(event, this)" />
      <button class="post-comment-btn" onclick="postComment(this)">Post</button>
    </div>
    <span class="post-timestamp">JUST NOW</span>
  `;

  feedContainer.prepend(postArticle);

  // Also add to Profile grid
  const profileGrid = document.getElementById('user-profile-posts-grid');
  if (profileGrid) {
    const gridItem = document.createElement('div');
    gridItem.className = 'profile-grid-item';
    gridItem.onclick = () => openPostDetail(USER.username, imgUrl, caption, '1');
    gridItem.innerHTML = `
      <img src="${imgUrl}" class="profile-grid-img" />
      <div class="grid-overlay"><span><i class="fas fa-heart"></i> 1</span><span><i class="fas fa-comment"></i> 0</span></div>
    `;
    profileGrid.prepend(gridItem);
  }

  // Reset & close modal
  document.getElementById('new-post-url').value = '';
  document.getElementById('new-post-caption').value = '';
  closeModal('modal-new-post');
  showPage('page-home');
}

// ── Profile Editing Modal ─────────────────────────────
function openEditProfileModal() {
  document.getElementById('edit-profile-pic-input').value = USER.profilePic;
  document.getElementById('edit-fullname-input').value = USER.fullName;
  document.getElementById('edit-username-input').value = USER.username;
  document.getElementById('edit-bio-input').value = USER.bio;
  document.getElementById('edit-website-input').value = USER.website;
  showModal('modal-edit-profile');
}

function saveProfileChanges(e) {
  e.preventDefault();
  const pic = document.getElementById('edit-profile-pic-input').value.trim();
  const fname = document.getElementById('edit-fullname-input').value.trim();
  const uname = document.getElementById('edit-username-input').value.trim();
  const bio = document.getElementById('edit-bio-input').value.trim();
  const web = document.getElementById('edit-website-input').value.trim();

  if (pic) USER.profilePic = normalizeImagePath(pic);
  if (fname) USER.fullName = fname;
  if (uname) USER.username = uname;
  if (bio) USER.bio = bio;
  if (web) USER.website = web;

  applyUserProfile();
  closeModal('modal-edit-profile');
}

// ── Chat Messaging ────────────────────────────────────
function selectConvo(item, username, avatarSrc) {
  item.closest('.conversation-list').querySelectorAll('.conversation-item').forEach(c => {
    c.classList.remove('active-convo');
  });
  item.classList.add('active-convo');

  document.getElementById('chat-active-username').textContent = username;
  document.getElementById('chat-active-avatar').src = avatarSrc;
}

function sendChatMessage(e) {
  e.preventDefault();
  const input = document.getElementById('chat-text-input');
  const text = input.value.trim();
  if (!text) return;

  const chatContainer = document.getElementById('chat-messages-container');
  const msgEl = document.createElement('div');
  msgEl.className = 'message sent';
  msgEl.innerHTML = `<div class="msg-bubble">${escapeHtml(text)}</div>`;
  chatContainer.appendChild(msgEl);

  input.value = '';
  chatContainer.scrollTop = chatContainer.scrollHeight;

  // Auto response simulation
  setTimeout(() => {
    const activeAvatar = document.getElementById('chat-active-avatar').src;
    const replyEl = document.createElement('div');
    replyEl.className = 'message received';
    replyEl.innerHTML = `
      <img src="${activeAvatar}" class="msg-avatar-img" />
      <div class="msg-bubble">Sounds good! 👌</div>
    `;
    chatContainer.appendChild(replyEl);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }, 1000);
}

// ── Carousel Controls ─────────────────────────────────
function prevCarousel(btn) {
  const dots = btn.parentElement.querySelectorAll('.dot');
  dots.forEach(d => d.classList.toggle('active'));
}
function nextCarousel(btn) {
  const dots = btn.parentElement.querySelectorAll('.dot');
  dots.forEach(d => d.classList.toggle('active'));
}

// ── Profile Tab Switching ─────────────────────────────
function switchProfileTab(tabBtn, tabId) {
  tabBtn.closest('.profile-tabs').querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  tabBtn.classList.add('active');

  document.querySelectorAll('.profile-tab-content').forEach(c => c.classList.add('hidden'));
  const target = document.getElementById(tabId);
  if (target) target.classList.remove('hidden');
}

// ── Global Search Filter ──────────────────────────────
function handleGlobalSearch(query) {
  const q = query.toLowerCase().trim();
  document.querySelectorAll('.post-card').forEach(card => {
    const text = card.textContent.toLowerCase();
    card.style.display = q === '' || text.includes(q) ? 'block' : 'none';
  });
}

// ── Helper Utilities ──────────────────────────────────
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function applyUserProfile() {
  document.querySelectorAll('#sidebar-username, #profile-username, #inbox-username').forEach(el => {
    if (el) el.textContent = USER.username;
  });
  document.querySelectorAll('#sidebar-fullname, #profile-fullname').forEach(el => {
    if (el) el.textContent = USER.fullName;
  });

  const bioEl = document.getElementById('profile-bio');
  if (bioEl) bioEl.innerHTML = USER.bio.replace(/\n/g, '<br>');

  const websiteEl = document.getElementById('profile-website');
  if (websiteEl) {
    websiteEl.textContent = USER.website;
    websiteEl.href = USER.website.startsWith('http') ? USER.website : 'https://' + USER.website;
  }

  document.querySelectorAll('.user-avatar-sync, #profile-pic, #sidebar-pic').forEach(img => {
    if (img) img.src = USER.profilePic;
  });

  document.querySelectorAll('.nav-avatar').forEach(div => {
    div.innerHTML = `<img src="${USER.profilePic}" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />`;
  });
}

// ── Double Tap Heart Gesture ──────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  applyUserProfile();

  document.querySelectorAll('.post-image-wrapper').forEach(wrapper => {
    let lastTap = 0;
    wrapper.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        const likeBtn = wrapper.closest('.post-card')?.querySelector('.like-btn');
        if (likeBtn && !likeBtn.classList.contains('liked')) {
          toggleLike(likeBtn);
        }
        const heart = wrapper.querySelector('.double-tap-heart');
        if (heart) {
          heart.classList.add('animate');
          setTimeout(() => heart.classList.remove('animate'), 800);
        }
      }
      lastTap = now;
    });
  });
});
