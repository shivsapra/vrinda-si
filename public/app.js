/**
 * ===================================================================
 * VRINDA AI — Client Application Engine
 * "Your Personal AI Companion"
 * ===================================================================
 */

(() => {
  'use strict';

  // --- 1. LOCAL STORAGE KEYS ---
  const STORAGE_KEYS = {
    USER_NAME: 'vrinda_user_name',
    THEME: 'vrinda_theme',
    TUNE: 'vrinda_tune',
    CHATS: 'vrinda_chats',
    ACTIVE_CHAT_ID: 'vrinda_active_chat_id',
    OFFLINE_NOTES: 'vrinda_offline_notes'
  };

  const THEMES = ['midnight-nature', 'soft-light', 'forest-calm', 'natural-earth'];

  // --- 2. APPLICATION STATE ---
  const state = {
    userName: localStorage.getItem(STORAGE_KEYS.USER_NAME) || '',
    theme: localStorage.getItem(STORAGE_KEYS.THEME) || 'midnight-nature',
    tune: (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.TUNE)) || { style: 'natural', customInstructions: '' };
      } catch (e) {
        return { style: 'natural', customInstructions: '' };
      }
    })(),
    chats: (() => {
      try {
        return JSON.parse(localStorage.getItem(STORAGE_KEYS.CHATS)) || [];
      } catch (e) {
        return [];
      }
    })(),
    activeChatId: localStorage.getItem(STORAGE_KEYS.ACTIVE_CHAT_ID) || null,
    currentView: 'home',
    isLoading: false,
    backendStatus: { online: false, model: 'gemini-3.5-flash' }
  };

  // Configure marked if available
  if (window.marked) {
    window.marked.setOptions({
      gfm: true,
      breaks: true
    });
  }

  // --- 3. DOM ELEMENT REFERENCES ---
  const el = {
    // Layout
    appRoot: document.getElementById('app-root'),
    sidebar: document.getElementById('main-sidebar'),
    mobileBackdrop: document.getElementById('mobile-sidebar-backdrop'),
    btnMobileMenu: document.getElementById('btn-mobile-menu'),
    btnBrandLogo: document.getElementById('brand-logo-btn'),

    // Navigation
    navBtns: document.querySelectorAll('.nav-item'),
    mobileNavBtns: document.querySelectorAll('.mobile-nav-item'),
    viewPanels: document.querySelectorAll('.view-panel'),

    // User Profile
    sidebarDisplayName: document.getElementById('sidebar-display-name'),
    userAvatarInitials: document.getElementById('user-avatar-initials'),
    btnThemeQuickCycle: document.getElementById('btn-theme-quick-cycle'),

    // Home View
    heroGreetingText: document.getElementById('hero-greeting-text'),
    homeMainInput: document.getElementById('home-main-input'),
    homeSendBtn: document.getElementById('home-send-btn'),
    homeRecentChatsList: document.getElementById('home-recent-chats-list'),
    homeRecentsContainer: document.getElementById('home-recents-container'),
    btnHomeViewAllChats: document.getElementById('btn-home-view-all-chats'),
    cardPillBtns: document.querySelectorAll('.card-pill-btn'),

    // Chat View
    chatMessagesContainer: document.getElementById('chat-messages-container'),
    chatMainInput: document.getElementById('chat-main-input'),
    btnChatSend: document.getElementById('btn-chat-send'),
    currentChatTitle: document.getElementById('current-chat-title'),
    btnRenameCurrentChat: document.getElementById('btn-rename-current-chat'),
    chatActiveToneBadge: document.getElementById('chat-active-tone-badge'),
    chatModelBadge: document.getElementById('chat-model-badge'),
    btnChatNew: document.getElementById('btn-chat-new'),
    btnSidebarNewChat: document.getElementById('btn-sidebar-new-chat'),
    btnMobileNewChat: document.getElementById('btn-mobile-new-chat'),
    btnExportChat: document.getElementById('btn-export-chat'),
    btnClearChat: document.getElementById('btnClearChat') || document.getElementById('btn-clear-chat'),
    sidebarHistoryList: document.getElementById('sidebar-history-list'),
    sidebarChatCount: document.getElementById('sidebar-chat-count'),

    // My Tune View
    tuneStylesGrid: document.getElementById('tune-styles-grid'),
    tuneCustomInstructions: document.getElementById('tune-custom-instructions'),
    btnSaveTune: document.getElementById('btn-save-tune'),
    tuneSaveStatus: document.getElementById('tune-save-status'),
    activeTuneIndicator: document.getElementById('active-tune-indicator'),
    presetChips: document.querySelectorAll('.preset-chip'),

    // Settings View
    settingUserName: document.getElementById('setting-user-name'),
    btnSaveName: document.getElementById('btn-save-name'),
    themeCards: document.querySelectorAll('.theme-card'),
    backendHealthBadge: document.getElementById('backend-health-badge'),
    backendModelBadge: document.getElementById('backend-model-badge'),
    btnExportAllData: document.getElementById('btn-export-all-data'),
    btnClearAllHistory: document.getElementById('btn-clear-all-history'),
    btnResetPreferences: document.getElementById('btn-reset-preferences'),

    // Modals
    welcomeOverlay: document.getElementById('welcome-modal-overlay'),
    welcomeForm: document.getElementById('welcome-form'),
    welcomeUserNameInput: document.getElementById('welcome-user-name-input'),
    confirmOverlay: document.getElementById('confirm-modal-overlay'),
    confirmModalTitle: document.getElementById('confirm-modal-title'),
    confirmModalMessage: document.getElementById('confirm-modal-message'),
    btnConfirmCancel: document.getElementById('btn-confirm-cancel'),
    btnConfirmAction: document.getElementById('btn-confirm-action'),
    toastContainer: document.getElementById('toast-container'),

    // Student Modes & Predefined Questions
    predefinedQBtns: document.querySelectorAll('.btn-predefined-q'),
    btnModesOpenOffline: document.getElementById('btn-modes-open-offline'),

    // Expert Modal
    expertOverlay: document.getElementById('expert-modal-overlay'),
    btnCloseExpertModal: document.getElementById('btn-close-expert-modal'),
    expertGmailBtn: document.getElementById('expert-contact-gmail'),
    expertTelegramBtn: document.getElementById('expert-contact-telegram'),
    gmailPriorityBadge: document.getElementById('gmail-priority-badge'),
    expertPopupTitle: document.getElementById('expert-popup-title'),
    expertPopupSubtitle: document.getElementById('expert-popup-subtitle'),

    // Handwritten Notes Studio
    notesOverlay: document.getElementById('notes-modal-overlay'),
    btnCloseNotesModal: document.getElementById('btn-close-notes-modal'),
    btnDownloadNoteImage: document.getElementById('btn-download-note-image'),
    btnPrintNotePdf: document.getElementById('btn-print-note-pdf'),
    btnSaveNoteOffline: document.getElementById('btn-save-note-offline'),
    notebookBodyContent: document.getElementById('notebook-body-content'),
    notebookTopicHeading: document.getElementById('notebook-topic-heading'),
    notebookUniName: document.getElementById('notebook-uni-name'),
    notebookDateText: document.getElementById('notebook-date-text'),

    // Offline Study Vault & Pomodoro Timer
    offlineOverlay: document.getElementById('offline-modal-overlay'),
    btnCloseOfflineModal: document.getElementById('btn-close-offline-modal'),
    btnTimerStartToggle: document.getElementById('btn-timer-start-toggle'),
    btnTimerReset: document.getElementById('btn-timer-reset'),
    offlineTimerDisplay: document.getElementById('offline-timer-display'),
    offlineNotesContainer: document.getElementById('offline-notes-container'),
    offlineNotesCount: document.getElementById('offline-notes-count'),
    btnViewPreloaded: document.querySelectorAll('.btn-view-preloaded')
  };

  // --- 4. INITIALIZATION ---
  function init() {
    applyTheme(state.theme);
    setupFirstTimeWelcome();
    setupNavigation();
    setupMyTune();
    setupModesSystem();
    setupExpertModal();
    setupHandwrittenStudio();
    setupOfflineVault();
    setupSettings();
    setupChatSystem();
    setupModalsAndToasts();
    checkBackendHealth();

    renderUserProfile();
    renderSidebarHistory();
    renderHomeRecents();

    // Check if initial chat is set
    if (state.activeChatId && getActiveChat()) {
      renderChatMessages();
    }
  }

  // --- 5. THEME ENGINE ---
  function applyTheme(themeName) {
    if (!THEMES.includes(themeName)) themeName = 'midnight-nature';
    state.theme = themeName;
    document.documentElement.setAttribute('data-theme', themeName);
    localStorage.setItem(STORAGE_KEYS.THEME, themeName);

    // Update Theme Cards in Settings
    el.themeCards.forEach(card => {
      if (card.dataset.themeName === themeName) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });
  }

  function cycleTheme() {
    const currentIndex = THEMES.indexOf(state.theme);
    const nextIndex = (currentIndex + 1) % THEMES.length;
    applyTheme(THEMES[nextIndex]);
    showToast(`Theme switched to ${formatThemeName(THEMES[nextIndex])} 🎨`);
  }

  function formatThemeName(key) {
    const names = {
      'midnight-nature': 'Midnight Nature',
      'soft-light': 'Soft Light',
      'forest-calm': 'Forest Calm',
      'natural-earth': 'Natural Earth'
    };
    return names[key] || key;
  }

  // --- 6. FIRST-TIME WELCOME EXPERIENCE ---
  function setupFirstTimeWelcome() {
    if (!state.userName || !state.userName.trim()) {
      el.welcomeOverlay.classList.remove('hidden');
      setTimeout(() => el.welcomeUserNameInput.focus(), 250);
    } else {
      el.welcomeOverlay.classList.add('hidden');
    }

    el.welcomeForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const enteredName = el.welcomeUserNameInput.value.trim();
      if (!enteredName) return;

      state.userName = enteredName;
      localStorage.setItem(STORAGE_KEYS.USER_NAME, enteredName);
      
      renderUserProfile();
      el.welcomeOverlay.classList.add('hidden');
      showToast(`Welcome, ${state.userName}! VRINDA AI is ready. 🌿`);
    });
  }

  function renderUserProfile() {
    const name = state.userName || 'Shiv';
    el.sidebarDisplayName.textContent = name;
    el.heroGreetingText.textContent = `Hey ${name}! 🌿`;
    el.settingUserName.value = name;

    const initial = name.charAt(0).toUpperCase() || 'S';
    el.userAvatarInitials.textContent = initial;
  }

  // --- 7. NAVIGATION SYSTEM ---
  function setupNavigation() {
    const switchView = (viewName) => {
      if (viewName === 'offline') {
        openOfflineModal();
        closeMobileSidebar();
        return;
      }

      if (state.currentView === viewName) return;
      state.currentView = viewName;

      // Update Panel visibility
      el.viewPanels.forEach(panel => {
        if (panel.id === `view-${viewName}`) {
          panel.classList.add('active');
        } else {
          panel.classList.remove('active');
        }
      });

      // Update Nav Buttons
      el.navBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      el.mobileNavBtns.forEach(btn => {
        if (btn.dataset.view === viewName) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });

      // Close mobile drawer
      closeMobileSidebar();

      // View-specific refreshes
      if (viewName === 'home') {
        renderHomeRecents();
      } else if (viewName === 'chat') {
        if (!state.activeChatId || !getActiveChat()) {
          startNewChat(false);
        }
        renderChatMessages();
      }
    };

    // Desktop sidebar clicks
    el.navBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Mobile nav clicks
    el.mobileNavBtns.forEach(btn => {
      btn.addEventListener('click', () => switchView(btn.dataset.view));
    });

    // Brand logo click goes home
    el.btnBrandLogo.addEventListener('click', () => switchView('home'));

    // Mobile sidebar toggle
    el.btnMobileMenu.addEventListener('click', openMobileSidebar);
    el.mobileBackdrop.addEventListener('click', closeMobileSidebar);

    // Quick cycle theme
    el.btnThemeQuickCycle.addEventListener('click', cycleTheme);
  }

  function openMobileSidebar() {
    el.sidebar.classList.add('mobile-open');
    el.mobileBackdrop.classList.add('active');
  }

  function closeMobileSidebar() {
    el.sidebar.classList.remove('mobile-open');
    el.mobileBackdrop.classList.remove('active');
  }

  // --- 8. MY TUNE ENGINE ---
  function setupMyTune() {
    // Populate form with stored values
    el.tuneCustomInstructions.value = state.tune.customInstructions || '';
    updateActiveTuneUI(state.tune.style || 'natural');

    // Style card selection
    el.tuneStylesGrid.addEventListener('click', (e) => {
      const card = e.target.closest('.tune-card');
      if (!card) return;
      const selectedStyle = card.dataset.style;
      state.tune.style = selectedStyle;
      updateActiveTuneUI(selectedStyle);
    });

    // Preset chips
    el.presetChips.forEach(chip => {
      chip.addEventListener('click', () => {
        const textToAppend = chip.dataset.append;
        const current = el.tuneCustomInstructions.value.trim();
        if (current) {
          el.tuneCustomInstructions.value = `${current} ${textToAppend}`;
        } else {
          el.tuneCustomInstructions.value = textToAppend;
        }
        el.tuneCustomInstructions.focus();
      });
    });

    // Save preferences
    el.btnSaveTune.addEventListener('click', () => {
      state.tune.customInstructions = el.tuneCustomInstructions.value.trim();
      localStorage.setItem(STORAGE_KEYS.TUNE, JSON.stringify(state.tune));

      el.tuneSaveStatus.textContent = 'Saved! ✓';
      setTimeout(() => { el.tuneSaveStatus.textContent = ''; }, 2500);

      showToast(`Tone preferences saved! (${capitalize(state.tune.style)}) 🌿`);
    });

    // Chat pill click navigates to Tune
    if (el.chatActiveToneBadge) {
      el.chatActiveToneBadge.addEventListener('click', () => {
        const tuneBtn = document.getElementById('nav-btn-tune');
        if (tuneBtn) tuneBtn.click();
      });
    }
  }

  function updateActiveTuneUI(style) {
    const cards = el.tuneStylesGrid.querySelectorAll('.tune-card');
    cards.forEach(card => {
      if (card.dataset.style === style) {
        card.classList.add('active');
      } else {
        card.classList.remove('active');
      }
    });

    const displayStyle = capitalize(style);
    el.activeTuneIndicator.textContent = displayStyle;
    if (el.chatActiveToneBadge) {
      el.chatActiveToneBadge.textContent = `Tone: ${displayStyle} 🌿`;
    }
  }

  // --- 9. SETTINGS SYSTEM ---
  function setupSettings() {
    // Save user name
    el.btnSaveName.addEventListener('click', () => {
      const newName = el.settingUserName.value.trim();
      if (!newName) return;
      state.userName = newName;
      localStorage.setItem(STORAGE_KEYS.USER_NAME, newName);
      renderUserProfile();
      showToast(`Display name updated to "${newName}"! 🌿`);
    });

    // Theme cards
    el.themeCards.forEach(card => {
      card.addEventListener('click', () => {
        applyTheme(card.dataset.themeName);
        showToast(`Theme changed to ${formatThemeName(card.dataset.themeName)} 🎨`);
      });
    });

    // Export all data
    el.btnExportAllData.addEventListener('click', () => {
      const exportBlob = new Blob([JSON.stringify({
        userName: state.userName,
        theme: state.theme,
        tune: state.tune,
        chats: state.chats,
        exportedAt: new Date().toISOString(),
        appName: 'VRINDA AI'
      }, null, 2)], { type: 'application/json' });

      downloadBlob(exportBlob, `vrinda-ai-backup-${formatDateForFilename(new Date())}.json`);
      showToast('All conversation data exported successfully! 📁');
    });

    // Clear all history
    el.btnClearAllHistory.addEventListener('click', () => {
      showConfirmModal({
        title: 'Clear All Chat History?',
        message: 'This will permanently delete all your saved conversations and messages. This action cannot be undone.',
        icon: '🗑️',
        onConfirm: () => {
          state.chats = [];
          state.activeChatId = null;
          saveChats();
          renderSidebarHistory();
          renderHomeRecents();
          startNewChat(false);
          showToast('All chat history cleared.');
        }
      });
    });

    // Reset preferences
    el.btnResetPreferences.addEventListener('click', () => {
      showConfirmModal({
        title: 'Reset All Preferences to Defaults?',
        message: 'This will reset your tone, theme, and custom instructions back to defaults. Your chat messages will be kept.',
        icon: '🔄',
        onConfirm: () => {
          state.theme = 'midnight-nature';
          state.tune = { style: 'natural', customInstructions: '' };
          localStorage.removeItem(STORAGE_KEYS.THEME);
          localStorage.removeItem(STORAGE_KEYS.TUNE);
          applyTheme(state.theme);
          setupMyTune();
          showToast('Preferences reset to default values. 🌿');
        }
      });
    });
  }

  // --- 10. BACKEND HEALTH CHECK ---
  async function checkBackendHealth() {
    try {
      const res = await fetch('/api/health');
      if (res.ok) {
        const data = await res.json();
        state.backendStatus.online = true;
        state.backendStatus.model = data.configuredModel || 'gemini-3.5-flash';
        el.backendHealthBadge.textContent = 'Online ✓ (Ready)';
        el.backendHealthBadge.className = 'badge-status-online';
        el.backendModelBadge.textContent = state.backendStatus.model;
        if (el.chatModelBadge) el.chatModelBadge.textContent = state.backendStatus.model;
      } else {
        throw new Error(`HTTP ${res.status}`);
      }
    } catch (err) {
      state.backendStatus.online = false;
      el.backendHealthBadge.textContent = 'Backend Offline ✗';
      el.backendHealthBadge.className = 'badge-status-offline';
    }
  }

  // --- 11. CHAT & CONVERSATION MANAGEMENT ---
  function setupChatSystem() {
    // New chat triggers
    const triggerNewChat = () => {
      startNewChat(true);
      navigateToView('chat');
    };

    el.btnChatNew.addEventListener('click', triggerNewChat);
    el.btnSidebarNewChat.addEventListener('click', triggerNewChat);
    el.btnMobileNewChat.addEventListener('click', triggerNewChat);

    // Send handlers
    el.btnChatSend.addEventListener('click', handleChatSubmit);
    el.chatMainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleChatSubmit();
      }
    });

    // Auto resize textareas
    autoResizeTextarea(el.chatMainInput);
    autoResizeTextarea(el.homeMainInput);

    // Home Input Submit
    el.homeSendBtn.addEventListener('click', handleHomeSubmit);
    el.homeMainInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleHomeSubmit();
      }
    });

    // Suggested pathway pills on Home
    el.cardPillBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const prompt = btn.dataset.prompt;
        if (!prompt) return;
        navigateToView('chat');
        startNewChat(false);
        sendUserMessage(prompt);
      });
    });

    // Home "View all in Chat" button
    if (el.btnHomeViewAllChats) {
      el.btnHomeViewAllChats.addEventListener('click', () => navigateToView('chat'));
    }

    // Rename current chat
    el.btnRenameCurrentChat.addEventListener('click', () => {
      const activeChat = getActiveChat();
      if (!activeChat) return;

      const newTitle = prompt('Enter new conversation title:', activeChat.title);
      if (newTitle && newTitle.trim()) {
        activeChat.title = newTitle.trim();
        saveChats();
        el.currentChatTitle.textContent = activeChat.title;
        renderSidebarHistory();
        renderHomeRecents();
        showToast('Conversation renamed. 🌿');
      }
    });

    // Export current chat
    el.btnExportChat.addEventListener('click', () => {
      const activeChat = getActiveChat();
      if (!activeChat || activeChat.messages.length === 0) {
        showToast('No messages to export yet.');
        return;
      }

      let markdown = `# ${activeChat.title}\n`;
      markdown += `*Conversation with VRINDA AI — ${new Date(activeChat.createdAt).toLocaleDateString()}*\n\n---\n\n`;

      for (const msg of activeChat.messages) {
        const sender = msg.role === 'user' ? (state.userName || 'User') : 'VRINDA AI';
        markdown += `### ${sender} (${new Date(msg.timestamp).toLocaleTimeString()}):\n\n${msg.content}\n\n---\n\n`;
      }

      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
      downloadBlob(blob, `${slugify(activeChat.title)}-chat.md`);
      showToast('Conversation exported as Markdown! 📄');
    });

    // Clear current chat
    if (el.btnClearChat) {
      el.btnClearChat.addEventListener('click', () => {
        const activeChat = getActiveChat();
        if (!activeChat || activeChat.messages.length === 0) return;

        showConfirmModal({
          title: 'Clear Current Conversation?',
          message: 'All messages in this conversation will be cleared.',
          icon: '🧹',
          onConfirm: () => {
            activeChat.messages = [];
            saveChats();
            renderChatMessages();
            showToast('Conversation cleared.');
          }
        });
      });
    }
  }

  function getActiveChat() {
    if (!state.activeChatId) return null;
    return state.chats.find(c => c.id === state.activeChatId) || null;
  }

  function startNewChat(focusInput = true) {
    const newChatId = 'chat_' + Date.now();
    const newChat = {
      id: newChatId,
      title: 'New Conversation',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      messages: []
    };

    state.chats.unshift(newChat);
    state.activeChatId = newChatId;
    saveChats();

    el.currentChatTitle.textContent = newChat.title;
    renderSidebarHistory();
    renderChatMessages();

    if (focusInput) {
      setTimeout(() => el.chatMainInput.focus(), 100);
    }
    return newChat;
  }

  function saveChats() {
    localStorage.setItem(STORAGE_KEYS.CHATS, JSON.stringify(state.chats));
    localStorage.setItem(STORAGE_KEYS.ACTIVE_CHAT_ID, state.activeChatId || '');
    el.sidebarChatCount.textContent = state.chats.length;
  }

  function handleHomeSubmit() {
    const text = el.homeMainInput.value.trim();
    if (!text) return;

    el.homeMainInput.value = '';
    el.homeMainInput.style.height = 'auto';

    navigateToView('chat');
    startNewChat(false);
    sendUserMessage(text);
  }

  function handleChatSubmit() {
    if (state.isLoading) return;
    const text = el.chatMainInput.value.trim();
    if (!text) return;

    el.chatMainInput.value = '';
    el.chatMainInput.style.height = 'auto';

    sendUserMessage(text);
  }

  async function sendUserMessage(text, options = {}) {
    let chat = getActiveChat();
    if (!chat) {
      chat = startNewChat(false);
    }

    const activeMode = options.mode || chat.mode || null;
    if (options.mode) {
      chat.mode = options.mode;
    }

    // Set title on first message
    if (chat.messages.length === 0 && !options.isRetry) {
      chat.title = generateChatTitle(text);
      el.currentChatTitle.textContent = chat.title;
    }

    // Add user message to history
    if (!options.isRetry) {
      const userMsg = {
        id: 'msg_' + Date.now(),
        role: 'user',
        content: text,
        timestamp: new Date().toISOString()
      };
      chat.messages.push(userMsg);
      chat.updatedAt = new Date().toISOString();
      saveChats();
      renderChatMessages();
    }

    // Show Thinking indicator
    state.isLoading = true;
    el.btnChatSend.disabled = true;
    showThinkingIndicator();

    try {
      // Build conversation history payload
      const historyPayload = chat.messages
        .filter(m => !m.isError)
        .slice(-12) // Send last 12 messages for rich context
        .map(m => ({
          role: m.role === 'user' ? 'user' : 'model',
          content: m.content
        }));

      // Make API Request to backend
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          history: historyPayload.slice(0, -1), // Previous turns
          tune: state.tune,
          userName: state.userName || 'Shiv',
          mode: activeMode
        })
      });

      const data = await response.json();
      removeThinkingIndicator();

      if (response.ok && data.success && data.reply) {
        const aiMsg = {
          id: 'msg_' + Date.now(),
          role: 'model',
          content: data.reply,
          timestamp: data.timestamp || new Date().toISOString(),
          modelUsed: data.modelUsed || 'Gemini',
          mode: activeMode
        };

        chat.messages.push(aiMsg);
        chat.updatedAt = new Date().toISOString();
        saveChats();
        renderSidebarHistory();
        renderChatMessages();
      } else {
        // Display clear error bubble
        const errorMsg = {
          id: 'msg_' + Date.now(),
          role: 'model',
          content: data.error || 'Unable to generate response from Gemini at this time.',
          details: data.details,
          isError: true,
          failedPrompt: text,
          timestamp: new Date().toISOString()
        };

        chat.messages.push(errorMsg);
        saveChats();
        renderChatMessages();
        showToast('Error generating AI response.', 'error');
      }
    } catch (err) {
      removeThinkingIndicator();
      const networkErrorMsg = {
        id: 'msg_' + Date.now(),
        role: 'model',
        content: 'Network connection error. Is the VRINDA server running on port 3000?',
        details: err.message,
        isError: true,
        failedPrompt: text,
        timestamp: new Date().toISOString()
      };
      chat.messages.push(networkErrorMsg);
      saveChats();
      renderChatMessages();
      showToast('Connection error.', 'error');
    } finally {
      state.isLoading = false;
      el.btnChatSend.disabled = false;
      setTimeout(() => el.chatMainInput.focus(), 150);
    }
  }

  // --- 12. RENDERING MESSAGES & ACTIONS ---
  function renderChatMessages() {
    const chat = getActiveChat();
    el.chatMessagesContainer.innerHTML = '';

    if (!chat || chat.messages.length === 0) {
      // Empty conversation welcome state
      const emptyState = document.createElement('div');
      emptyState.className = 'empty-chat-state';
      emptyState.innerHTML = `
        <div class="empty-chat-content" style="text-align: center; max-width: 500px; margin: 60px auto; color: var(--color-text-muted);">
          <div style="width: 52px; height: 52px; margin: 0 auto 14px; border-radius: 50%; background: var(--color-accent-soft); display: flex; align-items: center; justify-content: center; color: var(--color-primary-accent);">
            <svg style="width: 28px; height: 28px;" viewBox="0 0 36 36" fill="none">
              <path d="M18 4C18 14 10 19 7 28C14 28 27 25 28 14C28 8 20.5 5.5 18 4Z" fill="currentColor"/>
            </svg>
          </div>
          <h3 style="color: var(--color-text-main); font-size: 1.25rem; font-weight: 700; margin-bottom: 6px;">How can I assist you today?</h3>
          <p style="font-size: 0.9rem; line-height: 1.5;">Ask a question, paste code to debug, or plan a schedule. Your selected tune is <strong>${capitalize(state.tune.style)}</strong>.</p>
        </div>
      `;
      el.chatMessagesContainer.appendChild(emptyState);
      return;
    }

    chat.messages.forEach(msg => {
      const row = createMessageRowElement(msg);
      el.chatMessagesContainer.appendChild(row);
    });

    scrollChatToBottom();
  }

  function createMessageRowElement(msg) {
    const row = document.createElement('div');
    row.className = `message-row ${msg.role === 'user' ? 'user' : 'ai'}`;
    row.dataset.msgId = msg.id;

    // Avatar
    const avatar = document.createElement('div');
    avatar.className = 'message-avatar';
    if (msg.role === 'user') {
      avatar.textContent = (state.userName || 'Shiv').charAt(0).toUpperCase();
    } else {
      avatar.innerHTML = `
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M18 4C18 14 10 19 7 28C14 28 27 25 28 14C28 8 20.5 5.5 18 4Z" fill="var(--color-primary-accent)"/>
        </svg>
      `;
    }

    // Body Wrapper
    const bodyWrap = document.createElement('div');
    bodyWrap.className = 'message-body-wrap';

    // Meta Header
    const metaHeader = document.createElement('div');
    metaHeader.className = 'message-meta-header';
    const senderTitle = msg.role === 'user' ? (state.userName || 'You') : 'VRINDA AI';
    const timeFormatted = new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    metaHeader.innerHTML = `
      <span class="message-sender-name">${escapeHTML(senderTitle)}</span>
      <span>${timeFormatted}</span>
    `;
    bodyWrap.appendChild(metaHeader);

    // Bubble
    const bubble = document.createElement('div');
    bubble.className = `message-bubble ${msg.isError ? 'error-bubble' : ''}`;

    if (msg.isError) {
      bubble.innerHTML = `
        <div style="font-weight: 600; margin-bottom: 4px;">⚠️ ${escapeHTML(msg.content)}</div>
        ${msg.details ? `<div style="font-size: 0.8rem; opacity: 0.85; margin-bottom: 8px;">${escapeHTML(msg.details)}</div>` : ''}
        <button class="btn-retry-msg" data-prompt="${escapeHTML(msg.failedPrompt || '')}">
          <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
          Retry
        </button>
      `;
      // Attach retry listener
      const retryBtn = bubble.querySelector('.btn-retry-msg');
      if (retryBtn) {
        retryBtn.addEventListener('click', () => {
          const prompt = retryBtn.dataset.prompt;
          if (prompt) sendUserMessage(prompt, { isRetry: true });
        });
      }
    } else if (msg.role === 'user') {
      bubble.textContent = msg.content;
    } else {
      // AI Message: Render markdown
      if (window.marked) {
        bubble.innerHTML = window.marked.parse(msg.content);
      } else {
        bubble.textContent = msg.content;
      }

      // Syntax highlighting & Copy Code button injection
      bubble.querySelectorAll('pre code').forEach(block => {
        if (window.hljs) {
          window.hljs.highlightElement(block);
        }
        wrapCodeBlockWithHeader(block);
      });
    }

    bodyWrap.appendChild(bubble);

    // AI Action Toolbar (for successful AI responses)
    if (msg.role === 'model' && !msg.isError) {
      const toolbar = createAiActionsToolbar(msg);
      bodyWrap.appendChild(toolbar);

      // Contextual Post-Answer Expert Banner (for Modes 1, 2, 3)
      const activeMode = msg.mode || (getActiveChat() && getActiveChat().mode);
      const expertBanner = createPostAnswerBanner(msg, activeMode);
      if (expertBanner) {
        bodyWrap.appendChild(expertBanner);
      }
    }

    row.appendChild(avatar);
    row.appendChild(bodyWrap);

    return row;
  }

  function wrapCodeBlockWithHeader(codeElement) {
    const pre = codeElement.parentElement;
    if (!pre || pre.dataset.wrapped) return;
    pre.dataset.wrapped = 'true';

    // Detect language class
    const langClass = Array.from(codeElement.classList).find(c => c.startsWith('language-'));
    const lang = langClass ? langClass.replace('language-', '') : 'code';

    const header = document.createElement('div');
    header.className = 'code-block-header';
    header.innerHTML = `
      <span>${escapeHTML(lang)}</span>
      <button class="btn-copy-code" title="Copy code">
        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
        <span>Copy Code</span>
      </button>
    `;

    const copyBtn = header.querySelector('.btn-copy-code');
    copyBtn.addEventListener('click', () => {
      copyToClipboard(codeElement.innerText);
      copyBtn.innerHTML = `
        <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>
        <span>✓ Copied!</span>
      `;
      setTimeout(() => {
        copyBtn.innerHTML = `
          <svg style="width:12px;height:12px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
          <span>Copy Code</span>
        `;
      }, 2000);
      showToast('Code copied to clipboard! 📋');
    });

    pre.insertBefore(header, codeElement);
  }

  function createAiActionsToolbar(msg) {
    const toolbar = document.createElement('div');
    toolbar.className = 'ai-actions-toolbar';

    // 1. Copy Response
    const btnCopy = document.createElement('button');
    btnCopy.className = 'btn-action-tool';
    btnCopy.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>
      <span>Copy</span>
    `;
    btnCopy.addEventListener('click', () => {
      copyToClipboard(msg.content);
      btnCopy.querySelector('span').textContent = '✓ Copied';
      setTimeout(() => { btnCopy.querySelector('span').textContent = 'Copy'; }, 2000);
      showToast('Response copied to clipboard! 📋');
    });
    toolbar.appendChild(btnCopy);

    // 2. Regenerate
    const btnRegen = document.createElement('button');
    btnRegen.className = 'btn-action-tool';
    btnRegen.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/></svg>
      <span>Regenerate</span>
    `;
    btnRegen.addEventListener('click', () => {
      const chat = getActiveChat();
      if (!chat) return;
      // Find the last user prompt before this message
      const msgIndex = chat.messages.findIndex(m => m.id === msg.id);
      let userPrompt = 'Explain that again';
      for (let i = msgIndex - 1; i >= 0; i--) {
        if (chat.messages[i].role === 'user') {
          userPrompt = chat.messages[i].content;
          break;
        }
      }
      sendUserMessage(userPrompt);
    });
    toolbar.appendChild(btnRegen);

    // 3. Make Shorter
    const btnShorter = document.createElement('button');
    btnShorter.className = 'btn-action-tool';
    btnShorter.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="4" y1="12" x2="20" y2="12"/><polyline points="10 6 4 12 10 18"/></svg>
      <span>Make shorter</span>
    `;
    btnShorter.addEventListener('click', () => {
      sendUserMessage('Can you provide a significantly more concise, brief version of your previous response?');
    });
    toolbar.appendChild(btnShorter);

    // 4. Explain Simply
    const btnSimpler = document.createElement('button');
    btnSimpler.className = 'btn-action-tool';
    btnSimpler.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>Explain simply</span>
    `;
    btnSimpler.addEventListener('click', () => {
      sendUserMessage('Can you explain that more simply, like I am a beginner, using an intuitive everyday analogy?');
    });
    toolbar.appendChild(btnSimpler);

    // 5. More Detailed
    const btnDetail = document.createElement('button');
    btnDetail.className = 'btn-action-tool';
    btnDetail.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
      <span>More detailed</span>
    `;
    btnDetail.addEventListener('click', () => {
      sendUserMessage('Please provide a comprehensive, detailed breakdown of that with step-by-step nuances and examples.');
    });
    toolbar.appendChild(btnDetail);

    // 6. Rewrite in My Tune
    const btnTune = document.createElement('button');
    btnTune.className = 'btn-action-tool';
    btnTune.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
      <span>Rewrite in my tune</span>
    `;
    btnTune.addEventListener('click', () => {
      sendUserMessage(`Please rewrite your previous response strictly following my preferred tone (${capitalize(state.tune.style)}).`);
    });
    toolbar.appendChild(btnTune);

    // 7. Handwritten Note Studio
    const btnHandwritten = document.createElement('button');
    btnHandwritten.className = 'btn-action-tool';
    btnHandwritten.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
      <span>Handwritten Note</span>
    `;
    btnHandwritten.addEventListener('click', () => {
      openHandwrittenStudio(msg.content, getActiveChat() ? getActiveChat().title : 'Study Notes');
    });
    toolbar.appendChild(btnHandwritten);

    // 8. Save to Offline Vault
    const btnSaveOffline = document.createElement('button');
    btnSaveOffline.className = 'btn-action-tool';
    btnSaveOffline.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
      <span>Save Offline</span>
    `;
    btnSaveOffline.addEventListener('click', () => {
      saveOfflineNote(getActiveChat() ? getActiveChat().title : 'Study Note', msg.content);
    });
    toolbar.appendChild(btnSaveOffline);

    return toolbar;
  }

  // --- 13. THINKING INDICATOR ---
  function showThinkingIndicator() {
    removeThinkingIndicator();
    const thinkingRow = document.createElement('div');
    thinkingRow.id = 'thinking-indicator-row';
    thinkingRow.className = 'message-row ai';
    thinkingRow.innerHTML = `
      <div class="message-avatar">
        <svg viewBox="0 0 36 36" fill="none">
          <path d="M18 4C18 14 10 19 7 28C14 28 27 25 28 14C28 8 20.5 5.5 18 4Z" fill="var(--color-primary-accent)"/>
        </svg>
      </div>
      <div class="message-body-wrap">
        <div class="thinking-card">
          <div class="botanical-spinner">
            <span class="spinner-leaf-dot"></span>
            <span class="spinner-leaf-dot"></span>
            <span class="spinner-leaf-dot"></span>
          </div>
          <span>VRINDA is thinking... 🌿</span>
        </div>
      </div>
    `;
    el.chatMessagesContainer.appendChild(thinkingRow);
    scrollChatToBottom();
  }

  function removeThinkingIndicator() {
    const indicator = document.getElementById('thinking-indicator-row');
    if (indicator) indicator.remove();
  }

  function scrollChatToBottom() {
    requestAnimationFrame(() => {
      el.chatMessagesContainer.scrollTop = el.chatMessagesContainer.scrollHeight;
    });
  }

  // --- 14. SIDEBAR HISTORY & HOME RECENTS ---
  function renderSidebarHistory() {
    el.sidebarHistoryList.innerHTML = '';
    el.sidebarChatCount.textContent = state.chats.length;

    if (state.chats.length === 0) {
      el.sidebarHistoryList.innerHTML = `
        <div style="font-size: 0.78rem; color: var(--color-text-faint); padding: 8px 10px;">
          No conversations yet.
        </div>
      `;
      return;
    }

    state.chats.forEach(chat => {
      const item = document.createElement('div');
      item.className = `history-item ${chat.id === state.activeChatId ? 'active' : ''}`;
      item.dataset.chatId = chat.id;

      item.innerHTML = `
        <span class="history-item-title" title="${escapeHTML(chat.title)}">${escapeHTML(chat.title)}</span>
        <div class="history-item-actions">
          <button class="btn-item-action btn-del-chat" title="Delete conversation">
            <svg style="width:13px;height:13px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
          </button>
        </div>
      `;

      // Select chat
      item.addEventListener('click', (e) => {
        if (e.target.closest('.btn-del-chat')) return;
        state.activeChatId = chat.id;
        saveChats();
        el.currentChatTitle.textContent = chat.title;
        renderSidebarHistory();
        renderChatMessages();
        navigateToView('chat');
      });

      // Delete chat
      const delBtn = item.querySelector('.btn-del-chat');
      delBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        deleteChat(chat.id);
      });

      el.sidebarHistoryList.appendChild(item);
    });
  }

  function renderHomeRecents() {
    el.homeRecentChatsList.innerHTML = '';

    const recents = state.chats.slice(0, 3);
    if (recents.length === 0) {
      el.homeRecentsContainer.style.display = 'none';
      return;
    }

    el.homeRecentsContainer.style.display = 'flex';

    recents.forEach(chat => {
      const card = document.createElement('div');
      card.className = 'recent-chat-card';
      const msgCount = chat.messages.length;
      const dateText = new Date(chat.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' });

      card.innerHTML = `
        <span class="recent-chat-title">${escapeHTML(chat.title)}</span>
        <div class="recent-chat-meta">
          <span>${msgCount} ${msgCount === 1 ? 'message' : 'messages'}</span>
          <span>•</span>
          <span>${dateText}</span>
        </div>
      `;

      card.addEventListener('click', () => {
        state.activeChatId = chat.id;
        saveChats();
        el.currentChatTitle.textContent = chat.title;
        renderSidebarHistory();
        renderChatMessages();
        navigateToView('chat');
      });

      el.homeRecentChatsList.appendChild(card);
    });
  }

  function deleteChat(chatId) {
    state.chats = state.chats.filter(c => c.id !== chatId);
    if (state.activeChatId === chatId) {
      state.activeChatId = state.chats.length > 0 ? state.chats[0].id : null;
    }
    saveChats();
    renderSidebarHistory();
    renderHomeRecents();

    if (state.activeChatId) {
      const active = getActiveChat();
      if (active) el.currentChatTitle.textContent = active.title;
    } else {
      startNewChat(false);
    }
    renderChatMessages();
    showToast('Conversation deleted.');
  }

  function navigateToView(viewName) {
    const btn = document.querySelector(`.nav-item[data-view="${viewName}"]`);
    if (btn) btn.click();
  }

  // --- 15. MODALS & TOAST NOTIFICATIONS ---
  let activeConfirmCallback = null;

  function setupModalsAndToasts() {
    el.btnConfirmCancel.addEventListener('click', closeConfirmModal);
    el.btnConfirmAction.addEventListener('click', () => {
      if (typeof activeConfirmCallback === 'function') {
        activeConfirmCallback();
      }
      closeConfirmModal();
    });

    el.confirmOverlay.addEventListener('click', (e) => {
      if (e.target === el.confirmOverlay) closeConfirmModal();
    });
  }

  function showConfirmModal({ title, message, icon = '⚠️', onConfirm }) {
    el.confirmModalTitle.textContent = title;
    el.confirmModalMessage.textContent = message;
    document.getElementById('confirm-modal-icon').textContent = icon;
    activeConfirmCallback = onConfirm;
    el.confirmOverlay.classList.remove('hidden');
  }

  function closeConfirmModal() {
    el.confirmOverlay.classList.add('hidden');
    activeConfirmCallback = null;
  }

  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    el.toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)';
      setTimeout(() => toast.remove(), 300);
    }, 3200);
  }

  // --- 16. UTILITY FUNCTIONS ---
  function autoResizeTextarea(textarea) {
    if (!textarea) return;
    textarea.addEventListener('input', () => {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 180)}px`;
    });
  }

  function generateChatTitle(firstMessage) {
    if (!firstMessage) return 'New Conversation';
    const clean = firstMessage.replace(/\n+/g, ' ').trim();
    return clean.length > 36 ? clean.substring(0, 36) + '...' : clean;
  }

  function copyToClipboard(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  }

  function fallbackCopy(text) {
    const temp = document.createElement('textarea');
    temp.value = text;
    temp.style.position = 'fixed';
    temp.style.left = '-9999px';
    document.body.appendChild(temp);
    temp.select();
    try {
      document.execCommand('copy');
    } catch (err) {}
    document.body.removeChild(temp);
  }

  function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  function slugify(text) {
    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  function formatDateForFilename(d) {
    return d.toISOString().slice(0, 10);
  }

  // --- 17. CONTEXTUAL POST-ANSWER EXPERT BANNERS ---
  function createPostAnswerBanner(msg, mode) {
    if (!mode) return null;

    const banner = document.createElement('div');
    banner.className = 'response-expert-banner';

    if (mode === 'syllabus') {
      banner.innerHTML = `
        <div class="banner-left">
          <span class="banner-title">Need Notes? Talk to Expert 🌿</span>
          <span class="banner-badge-free">Free to ask 🙂</span>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">Reply within 1 hour</span>
        </div>
        <div class="banner-actions">
          <button class="btn-banner-action btn-banner-notes btn-open-notes-studio">
            <span>📝 Download Handwritten Notes</span>
          </button>
          <button class="btn-banner-action btn-banner-expert btn-open-expert-modal">
            <span>Talk to Expert ↗</span>
          </button>
        </div>
      `;

      banner.querySelector('.btn-open-notes-studio').addEventListener('click', () => {
        openHandwrittenStudio(msg.content, getActiveChat() ? getActiveChat().title : 'Syllabus Study Notes');
      });

      banner.querySelector('.btn-open-expert-modal').addEventListener('click', () => {
        openExpertModal({ prioritizeGmail: false });
      });

      return banner;
    }

    if (mode === 'projects') {
      banner.innerHTML = `
        <div class="banner-left">
          <span class="banner-title">Ask Expert to Make Your Project — FREE 💻</span>
          <span class="banner-badge-free">Free to ask 🙂</span>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">Reply within 1 hour</span>
        </div>
        <div class="banner-actions">
          <a 
            href="mailto:theeesagittarius@gmail.com?subject=College%20Project%20Assistance%20-%20VRINDA%20AI" 
            target="_blank" 
            rel="noopener noreferrer" 
            class="btn-banner-action btn-banner-expert" 
            style="text-decoration:none;"
            title="Click to email theeesagittarius@gmail.com"
          >
            <svg style="width:14px;height:14px;" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
            <span>theeesagittarius@gmail.com</span>
          </a>
          <button class="btn-banner-action btn-banner-notes btn-open-expert-modal">
            <span>All Contact Options ↗</span>
          </button>
        </div>
      `;

      banner.querySelector('.btn-open-expert-modal').addEventListener('click', () => {
        openExpertModal({ prioritizeGmail: true });
      });

      return banner;
    }

    if (mode === 'career') {
      banner.innerHTML = `
        <div class="banner-left">
          <span class="banner-title">Still Confused? Talk to Expert 🧭</span>
          <span class="banner-badge-free">Free to ask 🙂</span>
          <span style="font-size:0.75rem; color:var(--color-text-muted);">Reply within 1 hour</span>
        </div>
        <div class="banner-actions">
          <button class="btn-banner-action btn-banner-expert btn-open-expert-modal">
            <span>Talk to Expert ↗</span>
          </button>
        </div>
      `;

      banner.querySelector('.btn-open-expert-modal').addEventListener('click', () => {
        openExpertModal({ prioritizeGmail: false });
      });

      return banner;
    }

    return null;
  }

  // --- 18. STUDENT MODES & PREDEFINED QUESTIONS ---
  function setupModesSystem() {
    el.predefinedQBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        const question = btn.dataset.question;
        if (!mode || !question) return;

        let enrichedPrompt = question;

        if (mode === 'syllabus') {
          const uni = document.getElementById('syllabus-uni-input')?.value.trim();
          const sub = document.getElementById('syllabus-sub-input')?.value.trim();
          const parts = [];
          if (uni) parts.push(`University/Board: ${uni}`);
          if (sub) parts.push(`Subject: ${sub}`);
          if (parts.length > 0) {
            enrichedPrompt = `${question}\n[Student Syllabus Context: ${parts.join(', ')}]`;
          }
        } else if (mode === 'projects') {
          const domain = document.getElementById('project-domain-input')?.value.trim();
          const stack = document.getElementById('project-stack-input')?.value.trim();
          const parts = [];
          if (domain) parts.push(`Domain: ${domain}`);
          if (stack) parts.push(`Tech Stack: ${stack}`);
          if (parts.length > 0) {
            enrichedPrompt = `${question}\n[Student Project Context: ${parts.join(', ')}]`;
          }
        } else if (mode === 'career') {
          const degree = document.getElementById('career-degree-input')?.value.trim();
          const skills = document.getElementById('career-skills-input')?.value.trim();
          const parts = [];
          if (degree) parts.push(`Degree & Year: ${degree}`);
          if (skills) parts.push(`Skills & Interests: ${skills}`);
          if (parts.length > 0) {
            enrichedPrompt = `${question}\n[Student Career Context: ${parts.join(', ')}]`;
          }
        }

        navigateToView('chat');
        const chat = startNewChat(false);
        chat.mode = mode;
        saveChats();
        sendUserMessage(enrichedPrompt, { mode });
      });
    });

    if (el.btnModesOpenOffline) {
      el.btnModesOpenOffline.addEventListener('click', openOfflineModal);
    }
  }

  // --- 19. EXPERT CONTACT POPUP SYSTEM ---
  function setupExpertModal() {
    if (el.btnCloseExpertModal) {
      el.btnCloseExpertModal.addEventListener('click', closeExpertModal);
    }
    if (el.expertOverlay) {
      el.expertOverlay.addEventListener('click', (e) => {
        if (e.target === el.expertOverlay) closeExpertModal();
      });
    }
  }

  function openExpertModal(options = {}) {
    const prioritizeGmail = Boolean(options.prioritizeGmail);

    if (prioritizeGmail) {
      if (el.expertGmailBtn) el.expertGmailBtn.classList.add('priority-highlight');
      if (el.gmailPriorityBadge) el.gmailPriorityBadge.classList.remove('hidden');
      if (el.expertPopupTitle) el.expertPopupTitle.textContent = 'Ask Expert to Make Your Project — FREE 💻';
      if (el.expertPopupSubtitle) el.expertPopupSubtitle.textContent = 'Gmail prioritized for college project assistance. Free to ask 🙂 • Reply within 1 hour.';
    } else {
      if (el.expertGmailBtn) el.expertGmailBtn.classList.remove('priority-highlight');
      if (el.gmailPriorityBadge) el.gmailPriorityBadge.classList.add('hidden');
      if (el.expertPopupTitle) el.expertPopupTitle.textContent = 'Talk to Our Expert 🌿';
      if (el.expertPopupSubtitle) el.expertPopupSubtitle.textContent = 'Direct, personal assistance for exam notes, college projects, and career roadmaps.';
    }

    if (el.expertOverlay) el.expertOverlay.classList.remove('hidden');
  }

  function closeExpertModal() {
    if (el.expertOverlay) el.expertOverlay.classList.add('hidden');
  }

  // --- 20. HANDWRITTEN-STYLE NOTES STUDIO ---
  let currentStudioNote = { title: '', content: '' };

  function setupHandwrittenStudio() {
    if (el.btnCloseNotesModal) {
      el.btnCloseNotesModal.addEventListener('click', closeHandwrittenStudio);
    }
    if (el.notesOverlay) {
      el.notesOverlay.addEventListener('click', (e) => {
        if (e.target === el.notesOverlay) closeHandwrittenStudio();
      });
    }
    if (el.btnDownloadNoteImage) {
      el.btnDownloadNoteImage.addEventListener('click', downloadHandwrittenPNG);
    }
    if (el.btnPrintNotePdf) {
      el.btnPrintNotePdf.addEventListener('click', printNoteAsPdf);
    }
    if (el.btnSaveNoteOffline) {
      el.btnSaveNoteOffline.addEventListener('click', () => {
        saveOfflineNote(currentStudioNote.title || 'Revision Notes', currentStudioNote.content);
      });
    }
  }

  function openHandwrittenStudio(text, title = 'Exam High-Yield Study Notes') {
    currentStudioNote = { title, content: text };

    if (el.notebookTopicHeading) {
      el.notebookTopicHeading.textContent = title;
    }
    if (el.notebookDateText) {
      el.notebookDateText.textContent = `DATE: ${new Date().toLocaleDateString('en-GB')}`;
    }

    const cleanedText = text
      .replace(/```[\s\S]*?```/g, match => match.replace(/```[a-z]*\n?/g, ''))
      .replace(/^#{1,6}\s+/gm, '• ')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/\*(.*?)\*/g, '$1');

    if (el.notebookBodyContent) {
      const lines = cleanedText.split('\n').filter(l => l.trim().length > 0);
      el.notebookBodyContent.innerHTML = lines.map(line => `<p>${escapeHTML(line)}</p>`).join('');
    }

    if (el.notesOverlay) el.notesOverlay.classList.remove('hidden');
  }

  function closeHandwrittenStudio() {
    if (el.notesOverlay) el.notesOverlay.classList.add('hidden');
  }

  function downloadHandwrittenPNG() {
    const title = currentStudioNote.title || 'VRINDA Study Notes';
    const rawContent = currentStudioNote.content || '';

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const width = 850;
    const paddingLeft = 90;
    const paddingRight = 40;
    const contentWidth = width - paddingLeft - paddingRight;
    const lineHeight = 32;

    ctx.font = '22px "Caveat", "Kalam", cursive, sans-serif';

    const paragraphs = rawContent
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^#{1,6}\s+/gm, '')
      .split('\n');

    const wrappedLines = [];
    paragraphs.forEach(para => {
      const trimmed = para.trim();
      if (!trimmed) {
        wrappedLines.push('');
        return;
      }
      const words = trimmed.split(' ');
      let currentLine = '';
      for (const word of words) {
        const testLine = currentLine ? `${currentLine} ${word}` : word;
        const metrics = ctx.measureText(testLine);
        if (metrics.width > contentWidth && currentLine) {
          wrappedLines.push(currentLine);
          currentLine = word;
        } else {
          currentLine = testLine;
        }
      }
      if (currentLine) wrappedLines.push(currentLine);
    });

    const headerHeight = 150;
    const totalLines = Math.max(wrappedLines.length, 25);
    const height = Math.max(headerHeight + totalLines * lineHeight + 80, 1100);

    canvas.width = width;
    canvas.height = height;

    // Background paper
    ctx.fillStyle = '#fdfdf9';
    ctx.fillRect(0, 0, width, height);

    // Horizontal ruled lines
    ctx.strokeStyle = '#d2dff0';
    ctx.lineWidth = 1;
    for (let y = headerHeight; y < height - 30; y += lineHeight) {
      ctx.beginPath();
      ctx.moveTo(30, y);
      ctx.lineTo(width - 30, y);
      ctx.stroke();
    }

    // Vertical margin line
    ctx.strokeStyle = '#fca5a5';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(70, 0);
    ctx.lineTo(70, height);
    ctx.stroke();

    // Top Header Block
    ctx.fillStyle = '#64748b';
    ctx.font = '13px sans-serif';
    ctx.fillText('VRINDA AI • EXAM REVISION NOTES', 80, 42);
    ctx.fillText(`DATE: ${new Date().toLocaleDateString('en-GB')}`, width - 180, 42);

    // Topic Heading
    ctx.fillStyle = '#0f172a';
    ctx.font = 'bold 28px "Caveat", "Kalam", cursive, sans-serif';
    ctx.fillText(title.length > 40 ? title.substring(0, 40) + '...' : title, 80, 85);

    // Handwritten text
    ctx.fillStyle = '#1e3a8a';
    ctx.font = '22px "Caveat", "Kalam", cursive, sans-serif';

    let currentY = headerHeight + 24;
    wrappedLines.forEach(line => {
      if (line) {
        ctx.fillText(line, paddingLeft, currentY);
      }
      currentY += lineHeight;
    });

    // Footer Watermark
    ctx.fillStyle = 'rgba(46, 125, 50, 0.35)';
    ctx.font = '13px sans-serif';
    ctx.fillText('Generated with VRINDA AI — Your Personal AI Companion', width / 2 - 170, height - 20);

    canvas.toBlob(blob => {
      if (blob) {
        downloadBlob(blob, `vrinda-notes-${slugify(title)}.png`);
        showToast('Realistic handwritten note downloaded! 📝');
      }
    }, 'image/png');
  }

  function printNoteAsPdf() {
    window.print();
  }

  // --- 21. OFFLINE STUDY VAULT & POMODORO TIMER ---
  function setupOfflineVault() {
    if (el.btnCloseOfflineModal) {
      el.btnCloseOfflineModal.addEventListener('click', closeOfflineModal);
    }
    if (el.offlineOverlay) {
      el.offlineOverlay.addEventListener('click', (e) => {
        if (e.target === el.offlineOverlay) closeOfflineModal();
      });
    }

    el.btnViewPreloaded.forEach(btn => {
      btn.addEventListener('click', () => {
        const type = btn.dataset.cheat;
        if (type === 'last-day') {
          openHandwrittenStudio(
            `EXAM LAST-DAY SURVIVAL BLUEPRINT:\n\n` +
            `1. THE 80/20 RULE: Focus on the 20% of high-weightage topics that drive 80% of exam marks.\n` +
            `2. FORMULA & DIAGRAM RUN-THROUGH: Dedicate the first 2 hours exclusively to drawing diagrams and memorizing core equations from memory.\n` +
            `3. PREVIOUS 5-YEAR QUESTION REVIEW: 60-70% of university questions are repeated themes. Solve all 5-mark and 10-mark repetitive questions.\n` +
            `4. NO NEW TOPICS: Avoid starting completely unfamiliar chapters in the final 12 hours. Consolidate what you already know.\n` +
            `5. POWER NAP & HYDRATION: Minimum 6 hours sleep ensures recall accuracy and prevents exam-hall brain freeze.\n\n` +
            `Need specific help? Reach out via Telegram: https://t.me/Hystarboy or Gmail: theeesagittarius@gmail.com (Free to ask 🙂)!`,
            'Exam Last-Day Survival Blueprint'
          );
        } else if (type === 'project-template') {
          openHandwrittenStudio(
            `STANDARD 8-SECTION COLLEGE PROJECT REPORT TEMPLATE:\n\n` +
            `SECTION 1: ABSTRACT & EXECUTIVE SUMMARY (150-250 words)\n` +
            `SECTION 2: INTRODUCTION & PROBLEM STATEMENT (Real-world challenge, existing gap)\n` +
            `SECTION 3: LITERATURE SURVEY (Comparison table of 3-5 existing research papers/tools)\n` +
            `SECTION 4: SYSTEM ARCHITECTURE & DATA FLOW (Block diagrams, DFD Level 0 & 1, UML diagrams)\n` +
            `SECTION 5: TECHNOLOGY STACK JUSTIFICATION (Frontend, Backend, Database, Cloud hosting)\n` +
            `SECTION 6: MODULE IMPLEMENTATION & ALGORITHMS (Key code snippets, flowcharts, API endpoints)\n` +
            `SECTION 7: TESTING & RESULTS (Screenshots, test cases, latency & accuracy benchmarks)\n` +
            `SECTION 8: CONCLUSION & FUTURE SCOPE (Summary of achievements, proposed upgrades)\n\n` +
            `Need expert help building your project? Email: theeesagittarius@gmail.com (Free to ask 🙂)!`,
            'College Project 8-Section Master Template'
          );
        }
      });
    });

    renderOfflineNotes();
    initPomodoroTimer();
  }

  function getOfflineNotes() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEYS.OFFLINE_NOTES)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveOfflineNote(title, content) {
    const notes = getOfflineNotes();
    const newNote = {
      id: 'note_' + Date.now(),
      title: title || 'Revision Note',
      content: content || '',
      date: new Date().toLocaleDateString('en-GB')
    };
    notes.unshift(newNote);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_NOTES, JSON.stringify(notes));
    renderOfflineNotes();
    showToast('Saved to Offline Study Vault! 💾');
  }

  function deleteOfflineNote(id) {
    let notes = getOfflineNotes();
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(STORAGE_KEYS.OFFLINE_NOTES, JSON.stringify(notes));
    renderOfflineNotes();
    showToast('Note deleted from offline vault.');
  }

  function renderOfflineNotes() {
    if (!el.offlineNotesContainer) return;
    const notes = getOfflineNotes();
    el.offlineNotesContainer.innerHTML = '';
    if (el.offlineNotesCount) {
      el.offlineNotesCount.textContent = `${notes.length} Saved`;
    }

    if (notes.length === 0) {
      el.offlineNotesContainer.innerHTML = `
        <div style="font-size:0.84rem; color:var(--color-text-muted); padding:14px; grid-column: 1 / -1; text-align:center;">
          No offline notes saved yet. Click "Save Offline" on any AI response or handwritten studio to study without internet! 🌿
        </div>
      `;
      return;
    }

    notes.forEach(note => {
      const card = document.createElement('div');
      card.className = 'offline-note-item';
      const snippet = note.content.length > 130 ? note.content.substring(0, 130) + '...' : note.content;

      card.innerHTML = `
        <div class="offline-note-top">
          <span class="offline-note-title">${escapeHTML(note.title)}</span>
          <span class="pill-mini">${escapeHTML(note.date)}</span>
        </div>
        <p class="offline-note-snippet">${escapeHTML(snippet)}</p>
        <div class="offline-note-actions">
          <button class="btn-offline-mini btn-view-saved">Open in Studio 📝</button>
          <button class="btn-offline-mini btn-del-saved" style="color:var(--color-danger);" title="Delete note">🗑️</button>
        </div>
      `;

      card.querySelector('.btn-view-saved').addEventListener('click', () => {
        openHandwrittenStudio(note.content, note.title);
      });

      card.querySelector('.btn-del-saved').addEventListener('click', () => {
        deleteOfflineNote(note.id);
      });

      el.offlineNotesContainer.appendChild(card);
    });
  }

  function openOfflineModal() {
    renderOfflineNotes();
    if (el.offlineOverlay) el.offlineOverlay.classList.remove('hidden');
  }

  function closeOfflineModal() {
    if (el.offlineOverlay) el.offlineOverlay.classList.add('hidden');
  }

  // --- Offline Pomodoro Timer State & Logic ---
  let timerInterval = null;
  let timerSecondsLeft = 25 * 60;
  let isTimerRunning = false;

  function initPomodoroTimer() {
    updateTimerDisplay();

    if (el.btnTimerStartToggle) {
      el.btnTimerStartToggle.addEventListener('click', toggleTimer);
    }
    if (el.btnTimerReset) {
      el.btnTimerReset.addEventListener('click', resetTimer);
    }
  }

  function toggleTimer() {
    if (isTimerRunning) {
      clearInterval(timerInterval);
      timerInterval = null;
      isTimerRunning = false;
      el.btnTimerStartToggle.textContent = 'Resume Focus';
      el.btnTimerStartToggle.classList.remove('btn-timer-pause');
      el.btnTimerStartToggle.classList.add('btn-timer-start');
      showToast('Focus timer paused.');
    } else {
      isTimerRunning = true;
      el.btnTimerStartToggle.textContent = 'Pause';
      el.btnTimerStartToggle.classList.remove('btn-timer-start');
      el.btnTimerStartToggle.classList.add('btn-timer-pause');
      showToast('25-minute offline focus session started! 🌿');

      timerInterval = setInterval(() => {
        if (timerSecondsLeft > 0) {
          timerSecondsLeft--;
          updateTimerDisplay();
        } else {
          clearInterval(timerInterval);
          timerInterval = null;
          isTimerRunning = false;
          el.btnTimerStartToggle.textContent = 'Start Focus';
          showToast('Pomodoro completed! Take a 5-minute break. 🌿', 'success');
        }
      }, 1000);
    }
  }

  function resetTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
    isTimerRunning = false;
    timerSecondsLeft = 25 * 60;
    updateTimerDisplay();
    if (el.btnTimerStartToggle) {
      el.btnTimerStartToggle.textContent = 'Start Focus';
      el.btnTimerStartToggle.classList.remove('btn-timer-pause');
      el.btnTimerStartToggle.classList.add('btn-timer-start');
    }
  }

  function updateTimerDisplay() {
    if (!el.offlineTimerDisplay) return;
    const mins = Math.floor(timerSecondsLeft / 60);
    const secs = timerSecondsLeft % 60;
    el.offlineTimerDisplay.textContent = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Run on DOM Ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
